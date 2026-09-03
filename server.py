#!/usr/bin/env python3
"""
Nirdesha AI LLM Backend Server (High-Performance Streaming Edition)
===================================================================
- Ultra-low latency inference with gemini-3.5-flash-lite (~1s total response).
- Server-Sent Events (SSE) streaming (/api/chat/stream) for real-time word output.
- Concise, high-density officer cadre context for rapid token generation.
- Automatic multi-model fallback cascade (gemini-3.5-flash-lite -> gemini-3.5-flash).
- Persistent conversation memory across logins.
"""

import os
import sys
import json
import urllib.request
import urllib.error
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# Set UTF-8 encoding on Windows console
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if sys.stderr and hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_FILE = os.path.join(BASE_DIR, ".env")
DATA_DIR = os.path.join(BASE_DIR, "data")
HISTORY_FILE = os.path.join(DATA_DIR, "chat_history.json")

def load_env():
    config = {
        "GEMINI_API_KEY": "",
        "GEMINI_MODEL": "gemini-3.5-flash-lite",
        "SERVER_PORT": "8000"
    }
    if os.path.exists(ENV_FILE):
        with open(ENV_FILE, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    config[key.strip()] = val.strip().strip("'\"")
    for k in config:
        if k in os.environ:
            config[k] = os.environ[k]
    return config

CONFIG = load_env()

# In-Memory Cache with Optional Startup Seed
_MEMORY_HISTORY = {}

def get_user_history(user_id="public"):
    if user_id in _MEMORY_HISTORY:
        return _MEMORY_HISTORY[user_id]
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                _MEMORY_HISTORY[user_id] = data.get(user_id, [])
                return _MEMORY_HISTORY[user_id]
        except Exception:
            pass
    _MEMORY_HISTORY[user_id] = []
    return _MEMORY_HISTORY[user_id]

def save_user_history(user_id, history):
    # Keep last 10 messages in memory
    _MEMORY_HISTORY[user_id] = history[-10:]

def clear_user_history(user_id="public"):
    _MEMORY_HISTORY[user_id] = []

# High-Speed Role-Specific Context Builder with Persona Separation & Length Control
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

            # 1. Format Directive
            if fmt == "table":
                persona_rules.append("MANDATORY OUTPUT FORMAT: Format your answer primarily using clean Markdown pipe tables comparing concepts, metrics, formulas, or cases.")
            elif fmt == "bullets":
                persona_rules.append("MANDATORY OUTPUT FORMAT: Format your entire answer using organized, crisp bullet points (dashes or asterisks) with bold lead keywords. Avoid long essay paragraphs.")
            elif fmt == "numbered":
                persona_rules.append("MANDATORY OUTPUT FORMAT: Format your answer as sequential numbered steps (1., 2., 3., etc.), breaking down the logic or method step-by-step.")
            elif fmt == "notes":
                persona_rules.append("MANDATORY OUTPUT FORMAT: Format your response as high-yield 'Trainee Revision Notes' with distinct sections: Definition, Key Formula, Exam Rule, and Memory Mnemonics.")
            else: # detailed
                persona_rules.append("MANDATORY OUTPUT FORMAT: Provide a comprehensive, structured academic explanation with clear subheadings, formulas, and conceptual breakdown.")

            # 2. Length Directive
            if length == "concise":
                persona_rules.append("STRICT LENGTH CONSTRAINT: Keep your entire response concise and under 90 words. Give only high-yield essentials with zero filler.")
            elif length == "standard":
                persona_rules.append("LENGTH CONSTRAINT: Keep your response well-balanced (approx. 180 to 250 words), focused and directly addressing the prompt.")
            elif length == "comprehensive":
                persona_rules.append("LENGTH DIRECTIVE: Provide an extensive, thorough, in-depth deep dive with complete conceptual background and proofs.")

            # 3. Tone Directive
            if tone == "formal":
                persona_rules.append("TONE & VOICE: Use a strictly formal, authoritative MoSPI statistical cadre administrative tone. Official, precise, and professional.")
            elif tone == "mentor":
                persona_rules.append("TONE & VOICE: Use an encouraging, patient, pedagogical tutor mentor tone focused on helping the officer understand and master the concept.")
            elif tone == "direct":
                persona_rules.append("TONE & VOICE: Direct, no-nonsense, straight to the point. Focus strictly on examination scoring criteria with zero small talk.")
            elif tone == "simplified":
                persona_rules.append("TONE & VOICE: Use simplified everyday language, intuitive real-world analogies, and explain any technical terms in plain words.")

            # 4. Content Enhancers
            if inc_math:
                persona_rules.append("MATH INSTRUCTION: Always provide explicit mathematical notation and LaTeX equations ($...$ for inline, $$...$$ for display equations).")
            if inc_nss:
                persona_rules.append("PRACTICAL CONTEXT: Include practical NSS / MoSPI field survey application examples (e.g. FSU/SSU sampling, village/block multipliers).")
            if inc_exam:
                persona_rules.append("EXAM FOCUS: Include a dedicated 'SSO Exam Tip' or 'Common Exam Trap' callout to help the officer pass cadre promotion examinations.")

        persona_block = "\n- ".join(persona_rules)
        persona_directive = f"\nUSER PERSONALIZATION PREFERENCES (MANDATORY TO FOLLOW):\n- {persona_block}\n" if persona_block else ""

        return f"""You are the NIRDESHA AI STUDY MENTOR.
YOUR SOLE ROLE: Academic tutor for Officer S. K. Raman (JSO) for MoSPI statistical examinations, NSSTA curriculum, and SSO promotion benchmarks.

OFFICER CONTEXT:
- Officer: S. K. Raman (Junior Statistical Officer, SSS Cadre, NSSO Field Operations Division).
- Streak: 14-day study streak (70% toward 20-day target).
- Focus Gap: Macroeconomic Deflators (1,385 Elo - 68%, 17% below 85% SSO benchmark).
- Core Formulas: Horvitz-Thompson Y_HT = Sum(y_i / pi_i); CPI modified Laspeyres base 2012; GDP Deflator = (Nominal/Real)*100; DPDP Act 2023 Sec 8.

WHAT YOU ANSWER:
1. Statistical Theory & Survey Sampling Design (SRS, Stratified multi-stage, Horvitz-Thompson).
2. National Accounts & Deflators (CPI vs GDP deflator, supply-use tables, price relatives).
3. Closing Officer Raman's 17% gap in Macro Deflators for his Senior Statistical Officer promotion.
4. Python for statistics and DPDP Act compliance.

STRICT BOUNDARY:
- DO NOT answer website navigation, UI troubleshooting, or portal settings questions.
- If asked website questions, reply: "I am your dedicated AI Study Mentor for statistical theory and exam preparation. For help with navigating website features, settings, arranging courses, or setting your milestone streak, please ask the Nirdesha AI Guidance Companion on the bottom-right corner of your screen."

{no_intro_rule}
{lang_directive}
{persona_directive}"""

# Ultra-Fast Stream Generator with Smart Cascading & No Mid-Stream Cutoff
def stream_gemini(messages, system_instruction, api_key, model="gemini-3.1-flash-lite", role="mentor"):
    candidate_models = ["gemini-3.1-flash-lite", "gemini-flash-latest", "gemini-3.7-flash", "gemini-3.5-flash"]
    if model in candidate_models:
        candidate_models.remove(model)
        candidate_models.insert(0, model)

    contents = []
    for msg in messages[-6:]:
        role_type = "user" if msg["sender"] == "user" else "model"
        contents.append({
            "role": role_type,
            "parts": [{"text": msg["text"]}]
        })

    # Length Control:
    # Mentor is completely unrestricted (4096 tokens) to prevent ever cutting off in mid-stream
    # Guidance is short point-to-point (220 tokens)
    max_tokens = 4096 if role == "mentor" else 220

    for current_model in candidate_models:
        gen_config = {
            "temperature": 0.35,
            "maxOutputTokens": max_tokens,
            "topP": 0.95
        }
        # Add thinkingConfig only to models that support it to prevent HTTP 400
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
            with urllib.request.urlopen(req, timeout=45) as resp:
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
        except Exception as e:
            print(f"[{current_model} stream error]: {e}, falling over to next model...")
            continue

    yield "Apologies, temporary network latency detected. Please try asking again."

# Non-streaming fallback
def call_gemini_api(messages, system_instruction, api_key, model="gemini-3.5-flash", role="mentor"):
    full_text = []
    for chunk in stream_gemini(messages, system_instruction, api_key, model, role):
        full_text.append(chunk)
    return "".join(full_text)

# Request Handler
class NirdeshaAPIHandler(BaseHTTPRequestHandler):
    def send_json(self, status_code, data):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Connection", "close")
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Connection", "close")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)

        if path == "/api/health":
            config = load_env()
            has_key = bool(config.get("GEMINI_API_KEY", "").strip())
            resp = {
                "status": "healthy",
                "gemini_api_configured": has_key,
                "model": config.get("GEMINI_MODEL", "gemini-3.1-flash-lite"),
                "streaming_supported": True,
                "message": "Nirdesha Ultra-Fast AI Server is running." if has_key else "Add GEMINI_API_KEY to .env"
            }
            self.send_json(200, resp)
            return

        if path == "/api/chat/history":
            user_id = query.get("user_id", ["public"])[0]
            history = get_user_history(user_id)
            self.send_json(200, {"user_id": user_id, "history": history})
            return
        # Static File Serving
        clean_path = path.lstrip("/\\")
        if not clean_path:
            clean_path = "main.html"

        file_path = os.path.normpath(os.path.join(BASE_DIR, clean_path))
        # Security check: must remain inside BASE_DIR
        if file_path.startswith(BASE_DIR) and os.path.isfile(file_path):
            ext = os.path.splitext(file_path)[1].lower()
            mime_types = {
                ".html": "text/html; charset=utf-8",
                ".css": "text/css; charset=utf-8",
                ".js": "application/javascript; charset=utf-8",
                ".json": "application/json; charset=utf-8",
                ".svg": "image/svg+xml",
                ".png": "image/png",
                ".jpg": "image/jpeg",
                ".jpeg": "image/jpeg",
                ".ico": "image/x-icon",
                ".woff2": "font/woff2",
                ".woff": "font/woff"
            }
            content_type = mime_types.get(ext, "application/octet-stream")
            try:
                with open(file_path, "rb") as f:
                    content = f.read()
                self.send_response(200)
                self.send_header("Content-Type", content_type)
                self.send_header("Content-Length", str(len(content)))
                self.send_header("Access-Control-Allow-Origin", "*")
                self.send_header("Connection", "close")
                self.end_headers()
                self.wfile.write(content)
                return
            except Exception as e:
                print(f"[Error serving {clean_path}]: {e}")

        self.send_json(404, {"error": "Not Found"})

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        content_len = int(self.headers.get("Content-Length", 0))
        post_body = self.rfile.read(content_len).decode("utf-8") if content_len > 0 else "{}"
        try:
            payload = json.loads(post_body)
        except Exception:
            payload = {}

        if path == "/api/chat/clear":
            user_id = payload.get("user_id", "public")
            role = payload.get("role", "mentor")
            clear_user_history(f"{user_id}_{role}")
            clear_user_history(user_id)
            self.send_json(200, {"status": "cleared", "user_id": user_id})
            return

        # 1. High-Speed SSE Streaming Chat (/api/chat/stream)
        if path == "/api/chat/stream":
            user_id = payload.get("user_id", "public")
            user_message = payload.get("message", "").strip()
            role = payload.get("role", "mentor") # "mentor" or "guidance"
            language = payload.get("language", "English")
            session_key = f"{user_id}_{role}"

            if not user_message:
                self.send_json(400, {"error": "Empty message"})
                return

            config = load_env()
            api_key = config.get("GEMINI_API_KEY", "").strip()
            model = config.get("GEMINI_MODEL", "gemini-3.1-flash-lite")

            if not api_key:
                self.send_json(200, {"reply": "Please paste your GEMINI_API_KEY in the .env file."})
                return

            personalization = payload.get("personalization", {})
            history = get_user_history(session_key)
            history.append({"sender": "user", "text": user_message})
            system_instruction = build_system_context(user_id, role, language, personalization)

            # Start SSE Stream
            self.send_response(200)
            self.send_header("Content-Type", "text/event-stream; charset=utf-8")
            self.send_header("Cache-Control", "no-cache")
            self.send_header("Connection", "keep-alive")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.end_headers()

            full_reply = []
            try:
                for chunk in stream_gemini(history, system_instruction, api_key, model, role):
                    full_reply.append(chunk)
                    sse_line = f"data: {json.dumps({'chunk': chunk})}\n\n"
                    self.wfile.write(sse_line.encode("utf-8"))
                    self.wfile.flush()
                
                # Signal completion
                self.wfile.write(b"data: [DONE]\n\n")
                self.wfile.flush()
            except Exception as e:
                print(f"[Streaming Error]: {e}")

            # Save completed reply into persistent history
            final_text = "".join(full_reply)
            if final_text:
                history.append({"sender": "bot", "text": final_text})
                save_user_history(session_key, history)
            return

        # 2. Standard Fast REST Chat (/api/chat)
        if path == "/api/chat":
            user_id = payload.get("user_id", "public")
            user_message = payload.get("message", "").strip()
            role = payload.get("role", "mentor") # "mentor" or "guidance"
            language = payload.get("language", "English")
            session_key = f"{user_id}_{role}"

            if not user_message:
                self.send_json(400, {"error": "Empty message"})
                return

            config = load_env()
            api_key = config.get("GEMINI_API_KEY", "").strip()
            model = config.get("GEMINI_MODEL", "gemini-3.1-flash-lite")

            if not api_key:
                self.send_json(200, {"reply": "Please paste your GEMINI_API_KEY in the .env file.", "status": "offline"})
                return

            history = get_user_history(session_key)
            history.append({"sender": "user", "text": user_message})
            system_instruction = build_system_context(user_id, role, language)

            bot_reply = call_gemini_api(history, system_instruction, api_key, model, role)
            history.append({"sender": "bot", "text": bot_reply})
            save_user_history(user_id, history)

            self.send_json(200, {
                "reply": bot_reply,
                "user_id": user_id,
                "model": model,
                "status": "success"
            })
            return

        self.send_json(404, {"error": "Not Found"})

def run_server():
    config = load_env()
    port = int(config.get("SERVER_PORT", "8000"))
    server_address = ("127.0.0.1", port)
    httpd = ThreadingHTTPServer(server_address, NirdeshaAPIHandler)
    print("=" * 70)
    print(" [*] NIRDESHA ULTRA-FAST STREAMING AI SERVER")
    print("=" * 70)
    print(f" * Server running on: http://127.0.0.1:{port}")
    print(f" * Ultra-Fast Model: {config.get('GEMINI_MODEL', 'gemini-3.5-flash-lite')} (~1.0s latency)")
    print(f" * Real-Time Stream: Enabled via /api/chat/stream (SSE)")
    print("=" * 70)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.server_close()

if __name__ == "__main__":
    run_server()
