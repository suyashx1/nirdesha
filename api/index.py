#!/usr/bin/env python3
"""
Nirdesha AI Engine — Vercel Serverless Function
================================================
Handles /api/chat, /api/chat/stream, /api/history, /api/health
Powered by Google Gemini (gemini-3.5-flash-lite / gemini-3.6-flash / gemini-3.1-flash-lite)
Compatible with Vercel Python Runtime and local BaseHTTPRequestHandler
"""

import os
import sys
import json
import urllib.request
import urllib.error
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# Candidate models confirmed active on Google Generative Language API
CANDIDATE_MODELS = [
    "gemini-3.5-flash-lite",
    "gemini-3.6-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest"
]

def get_api_key():
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if key:
        return key
    # Try reading .env file if present locally
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    env_path = os.path.join(base_dir, ".env")
    if os.path.exists(env_path):
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("GEMINI_API_KEY="):
                        val = line.split("=", 1)[1].strip().strip("'\"")
                        if val:
                            return val
        except Exception:
            pass
    return ""

# In-Memory Cache for serverless instance lifecycle
_HISTORY_CACHE = {}

def get_user_history(user_id="public"):
    return _HISTORY_CACHE.get(user_id, [])

def save_user_history(user_id, history):
    _HISTORY_CACHE[user_id] = history[-10:]

def build_system_context(user_id="public", role="mentor", language="English", personalization=None):
    lang_clean = language.strip() if language else "English"
    if lang_clean.lower() != "english":
        lang_directive = f"""
LANGUAGE MANDATE:
You MUST formulate and write your entire response strictly in {lang_clean} (using its official native script).
- Use simple, everyday, clear language that anyone can easily understand.
- Translate all concepts and technical terms into intuitive, natural {lang_clean}.
- Do NOT reply in English unless specifically instructed by the user."""
    else:
        lang_directive = """
LANGUAGE MANDATE:
- Respond in simple, clear, easy-to-understand English.
- If the user writes or speaks to you in Hindi, Odia, or any other regional language, match their language and reply in that language using simple, accessible words."""

    no_intro_rule = """
CRITICAL CONVERSATIONAL RULES:
- NEVER introduce yourself or announce who you are (NEVER say "Hello Officer Raman, I am your...", "Namaste! As your AI...", or "Welcome to Nirdesha...").
- ONLY greet if the user explicitly greets you (e.g. if the user says "hello", "hi", "namaste", reply with a brief "Hello Officer Raman" or "Namaste!").
- Otherwise, dive DIRECTLY into the answer immediately without any opening pleasantries or filler."""

    if role == "guidance":
        return f"""You are the NIRDESHA AI GUIDANCE ASSISTANT.
YOUR SOLE ROLE: On-screen website guide and navigation assistant for the Nirdesha portal.

CRITICAL LENGTH RULE FOR GUIDANCE:
- TALK SHORT. POINT-TO-POINT ONLY.
- Maximum 2 to 3 concise bullet points.
- No asterisks (*), use clean dashes (-) for bullets.
- Never give introductory self-announcements unless explicitly greeted.

WHAT YOU ALWAYS ANSWER (ALL WEBSITE & PORTAL FEATURES):
1. Website Features, Metrics & Cards:
   - "Competitive Skill Ratings (Per-Domain Elo)": Explain that it is Nirdesha's rating system evaluating test accuracy, latency, and question difficulty across specific statistical domains to measure cadre readiness.
   - "Cadre Benchmarks & Targets": Promotion targets, JSO baseline, and SSO 85% proficiency thresholds.
   - "52-Week Learning Consistency Heatmap": Daily activity grid, streak continuity, and color intensities.
   - "14-Day Streak & Milestone Wheel": 20-day target, 365-day milestone wheel, and streak rewards.
   - "My Courses, Tracks & Timed Quizzes": Course arrangement, syllabus tracking, timed assessment engine.
   - "Theme, Settings, Profile & Language": Theme switcher (Light/Dark/System), profile editing, avatar uploads, and multilingual controls.
   - "Admin Portal, Column Sorting & PDF Drop": Navigating user tables, search filters, permission toggles, and syllabus document extraction.
2. Selected On-Screen Text & Terms:
   - When asked about ANY text, feature, button, or sentence selected on the website, ALWAYS explain its meaning, context, and role on the Nirdesha portal in 2 to 3 concise bullet points.

STRICT BOUNDARY (OUT OF CONTEXT ONLY):
- ONLY redirect if the question is a pure academic textbook derivation or homework request with zero relation to the website (for example: "Derive Horvitz-Thompson variance step by step" or "Prove Central Limit Theorem"): "For in-depth mathematical proofs and statistical theory, please visit the dedicated AI Study Mentor in the Public Learning Dashboard."
- If the question asks about ANY website feature, metric, score, card, or on-screen term (such as Elo ratings, heatmaps, streaks, benchmarks), ALWAYS answer it directly.

{no_intro_rule}
{lang_directive}"""

    else:
        # role == "mentor"
        persona_rules = []
        if personalization and isinstance(personalization, dict):
            fmt = personalization.get("format", "detailed")
            length = personalization.get("length", "standard")
            tone = personalization.get("tone", "mentor")
            inc_math = personalization.get("includeMath", True)
            inc_nss = personalization.get("includeFieldExamples", True)
            inc_exam = personalization.get("includeExamTips", True)

            if fmt == "table":
                persona_rules.append("MANDATORY OUTPUT FORMAT: Format your answer primarily using clean Markdown pipe tables comparing concepts, metrics, formulas, or cases.")
            elif fmt == "bullets":
                persona_rules.append("MANDATORY OUTPUT FORMAT: Format your entire answer using organized, crisp bullet points (dashes or asterisks) with bold lead keywords.")
            elif fmt == "numbered":
                persona_rules.append("MANDATORY OUTPUT FORMAT: Format your answer as sequential numbered steps (1., 2., 3., etc.).")
            elif fmt == "notes":
                persona_rules.append("MANDATORY OUTPUT FORMAT: Format your response as high-yield 'Trainee Revision Notes' with distinct sections: Definition, Key Formula, Exam Rule, and Memory Mnemonics.")
            else:
                persona_rules.append("MANDATORY OUTPUT FORMAT: Provide a comprehensive, structured academic explanation with clear subheadings, formulas, and conceptual breakdown.")

            if length == "concise":
                persona_rules.append("STRICT LENGTH CONSTRAINT: Keep your entire response concise and under 90 words.")
            elif length == "standard":
                persona_rules.append("LENGTH CONSTRAINT: Keep your response well-balanced (approx. 180 to 250 words).")
            elif length == "comprehensive":
                persona_rules.append("LENGTH DIRECTIVE: Provide an extensive, thorough, in-depth deep dive with complete conceptual background.")

            if tone == "formal":
                persona_rules.append("TONE & VOICE: Use a strictly formal, authoritative MoSPI statistical cadre administrative tone.")
            elif tone == "mentor":
                persona_rules.append("TONE & VOICE: Use an encouraging, patient pedagogical tutor mentor tone.")
            elif tone == "direct":
                persona_rules.append("TONE & VOICE: Direct, no-nonsense, straight to the point.")
            elif tone == "simplified":
                persona_rules.append("TONE & VOICE: Use simplified everyday language, intuitive real-world analogies, and explain any technical terms in plain words.")

            if inc_math:
                persona_rules.append("MATH INSTRUCTION: Always provide explicit mathematical notation and LaTeX equations ($...$ for inline, $$...$$ for display).")
            if inc_nss:
                persona_rules.append("PRACTICAL CONTEXT: Include practical NSS / MoSPI field survey application examples (e.g. FSU/SSU sampling, multipliers).")
            if inc_exam:
                persona_rules.append("EXAM FOCUS: Include a dedicated 'SSO Exam Tip' or 'Common Exam Trap' callout.")

        persona_block = "\n- ".join(persona_rules)
        persona_directive = f"\nUSER PERSONALIZATION PREFERENCES:\n- {persona_block}\n" if persona_block else ""

        return f"""You are the NIRDESHA PERSONAL AI LEARNING MENTOR.
YOUR SOLE ROLE:
Personalized learning support for an employee in India's Official Statistical System (MoSPI).

WHAT YOU ANSWER:
1. Statistical theory, survey methods, national accounts, price statistics and related Official Statistics concepts.
2. Technical competencies such as Python, SQL, GIS, data visualization and responsible data handling.
3. Questions about competency gaps, target-role readiness (JSO to SSO), and recommended learning sequence.
4. Practice formulas and calculation drills.

{no_intro_rule}
{lang_directive}
{persona_directive}"""

def stream_gemini(messages, system_instruction, api_key, role="mentor"):
    contents = []
    for msg in messages[-6:]:
        role_type = "user" if msg.get("sender") == "user" else "model"
        contents.append({
            "role": role_type,
            "parts": [{"text": msg.get("text", "")}]
        })

    max_tokens = 4096 if role == "mentor" else 250

    for current_model in CANDIDATE_MODELS:
        gen_config = {
            "temperature": 0.35,
            "maxOutputTokens": max_tokens,
            "topP": 0.95
        }
        if "3.7" in current_model or "3.5" in current_model:
            gen_config["thinkingConfig"] = {"thinkingBudget": 0}

        payload = {
            "system_instruction": {"parts": [{"text": system_instruction}]},
            "contents": contents,
            "generationConfig": gen_config
        }
        req_data = json.dumps(payload).encode("utf-8")
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{current_model}:streamGenerateContent?alt=sse&key={api_key}"
        req = urllib.request.Request(url, data=req_data, headers={"Content-Type": "application/json"})
        try:
            has_yielded = False
            with urllib.request.urlopen(req, timeout=30) as resp:
                for line in resp:
                    line_str = line.decode("utf-8").strip()
                    if line_str.startswith("data: "):
                        data_json = json.loads(line_str[6:])
                        candidates = data_json.get("candidates", [])
                        if candidates and "content" in candidates[0]:
                            parts = candidates[0]["content"].get("parts", [])
                            for p in parts:
                                chunk = p.get("text", "")
                                if chunk:
                                    has_yielded = True
                                    yield chunk
            if has_yielded:
                return
        except Exception:
            continue

    yield "Apologies, temporary network latency detected. Please try asking again."

def call_gemini_api(messages, system_instruction, api_key, role="mentor"):
    contents = []
    for msg in messages[-6:]:
        role_type = "user" if msg.get("sender") == "user" else "model"
        contents.append({
            "role": role_type,
            "parts": [{"text": msg.get("text", "")}]
        })

    max_tokens = 2048 if role == "mentor" else 300

    for current_model in CANDIDATE_MODELS:
        gen_config = {
            "temperature": 0.35,
            "maxOutputTokens": max_tokens,
            "topP": 0.95
        }
        if "3.7" in current_model or "3.5" in current_model:
            gen_config["thinkingConfig"] = {"thinkingBudget": 0}

        payload = {
            "system_instruction": {"parts": [{"text": system_instruction}]},
            "contents": contents,
            "generationConfig": gen_config
        }
        req_data = json.dumps(payload).encode("utf-8")
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{current_model}:generateContent?key={api_key}"
        req = urllib.request.Request(url, data=req_data, headers={"Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=12) as resp:
                data_json = json.loads(resp.read().decode("utf-8"))
                candidates = data_json.get("candidates", [])
                if candidates and "content" in candidates[0]:
                    parts = candidates[0]["content"].get("parts", [])
                    full_text = "".join([p.get("text", "") for p in parts if p.get("text")])
                    if full_text.strip():
                        return full_text
        except Exception:
            continue

    return "Apologies, temporary network latency detected. Please try asking again."

class handler(BaseHTTPRequestHandler):
    def _send_cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")

    def _send_json(self, status, data):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self._send_cors()
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")
        qs = parse_qs(parsed.query)

        if path.endswith("/health"):
            self._send_json(200, {
                "status": "online",
                "service": "Nirdesha AI Engine",
                "platform": "Vercel Serverless",
                "models": CANDIDATE_MODELS
            })
            return

        if path.endswith("/history"):
            user_id = qs.get("user_id", ["public"])[0]
            self._send_json(200, {
                "user_id": user_id,
                "history": get_user_history(user_id)
            })
            return

        # Fallback profile/competency mock so frontend doesn't error when port 8001 is not running
        if "/api/profile" in path:
            self._send_json(200, {
                "id": 1,
                "full_name": "S. K. Raman",
                "employee_code": "SSS-2024-8891",
                "designation": "Junior Statistical Officer (JSO)",
                "department": "National Accounts Division (NAD), MoSPI",
                "overall_competency_score": 78.4,
                "verified": True
            })
            return

        if "/api/competency" in path:
            self._send_json(200, {
                "employee_id": 1,
                "overall_score": 78.4,
                "competencies": [
                    {"name": "Survey Sampling & Multi-Stage Estimation", "score": 88.0, "status": "Proficient"},
                    {"name": "Index Numbers & Price Statistics", "score": 82.5, "status": "Proficient"},
                    {"name": "National Accounts & Macroeconomic Deflators", "score": 68.0, "status": "Needs Review"},
                    {"name": "Data Protection & DPDP Act 2023", "score": 75.0, "status": "Competent"}
                ]
            })
            return

        self._send_json(200, {
            "status": "online",
            "service": "Nirdesha AI LLM Engine",
            "platform": "Vercel",
            "usage": "POST /api/chat or POST /api/chat/stream"
        })

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")

        try:
            content_length = int(self.headers.get("Content-Length", 0))
            body_bytes = self.rfile.read(content_length) if content_length > 0 else b"{}"
            payload = json.loads(body_bytes.decode("utf-8")) if body_bytes else {}
        except Exception:
            payload = {}

        # 1. History Management
        if path.endswith("/history"):
            user_id = payload.get("user_id", "public")
            action = payload.get("action", "")
            if action == "clear":
                save_user_history(user_id, [])
                self._send_json(200, {"status": "cleared", "user_id": user_id})
                return
            self._send_json(200, {"history": get_user_history(user_id)})
            return

        user_id = payload.get("user_id", "public")
        user_message = payload.get("message", "").strip()
        role = payload.get("role", "mentor")
        language = payload.get("language", "English")
        personalization = payload.get("personalization", {})
        session_key = f"{user_id}_{role}"

        api_key = get_api_key()
        if not api_key:
            self._send_json(200, {
                "reply": "Please configure GEMINI_API_KEY in Vercel Environment Variables.",
                "status": "no_key"
            })
            return

        # 2. Ultra-Fast SSE Stream Generator (/api/chat/stream or /api?stream=1 or {"stream": true})
        if path.endswith("/stream") or payload.get("stream") is True or "stream" in qs:
            history = get_user_history(session_key)
            history.append({"sender": "user", "text": user_message})
            system_instruction = build_system_context(user_id, role, language, personalization)

            self.send_response(200)
            self.send_header("Content-Type", "text/event-stream; charset=utf-8")
            self.send_header("Cache-Control", "no-cache, no-transform")
            self.send_header("Connection", "keep-alive")
            self.send_header("X-Accel-Buffering", "no")
            self._send_cors()
            self.end_headers()

            full_reply = []
            try:
                for chunk in stream_gemini(history, system_instruction, api_key, role=role):
                    full_reply.append(chunk)
                    chunk_payload = json.dumps({"chunk": chunk})
                    msg = f"data: {chunk_payload}\n\n".encode("utf-8")
                    self.wfile.write(msg)
                    self.wfile.flush()

                self.wfile.write(b"data: [DONE]\n\n")
                self.wfile.flush()
            except Exception as e:
                try:
                    err_msg = json.dumps({"chunk": f" [Network Interruption: {str(e)[:50]}]"})
                    self.wfile.write(f"data: {err_msg}\n\n".encode("utf-8"))
                    self.wfile.write(b"data: [DONE]\n\n")
                    self.wfile.flush()
                except Exception:
                    pass

            complete_text = "".join(full_reply)
            history.append({"sender": "bot", "text": complete_text})
            save_user_history(session_key, history)
            return

        try:
            # 3. Standard JSON Response (/api/chat)
            history = get_user_history(session_key)
            history.append({"sender": "user", "text": user_message})
            system_instruction = build_system_context(user_id, role, language, personalization)

            bot_reply = call_gemini_api(history, system_instruction, api_key, role=role)
            history.append({"sender": "bot", "text": bot_reply})
            save_user_history(session_key, history)

            self._send_json(200, {
                "reply": bot_reply,
                "status": "success"
            })
        except Exception as e:
            self._send_json(200, {
                "reply": f"Service temporarily busy. Please try asking again. ({str(e)[:60]})",
                "status": "error"
            })
