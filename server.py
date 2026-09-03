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

# Persistent Storage
def get_user_history(user_id="public"):
    if not os.path.exists(HISTORY_FILE):
        return []
    try:
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data.get(user_id, [])
    except Exception:
        return []

def save_user_history(user_id, history):
    os.makedirs(DATA_DIR, exist_ok=True)
    data = {}
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
        except Exception:
            data = {}
    # Keep last 8 messages for optimal speed and context efficiency
    data[user_id] = history[-8:]
    try:
        with open(HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"[Error] writing history: {e}")

def clear_user_history(user_id="public"):
    save_user_history(user_id, [])

# High-Speed Role-Specific Context Builder with Strict Persona Separation & Multilingual Support
def build_system_context(user_id="public", role="mentor", language="English"):
    lang_clean = language.strip() if language else "English"
    if lang_clean.lower() != "english":
        lang_directive = f"""
LANGUAGE MANDATE:
You MUST formulate and write your entire response strictly in {lang_clean} (using its official native script, e.g., Devanagari for Hindi, Odia script for Odia, etc.).
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
- Otherwise, dive DIRECTLY into the answer immediately without any opening pleasantries or filler.
- Keep answers short, crisp, concise, and focused on the exact question asked."""

    if role == "guidance":
        return f"""You are the NIRDESHA AI GUIDANCE ASSISTANT.
YOUR SOLE ROLE: On-screen website guide and navigation assistant for the Nirdesha portal.

WHAT YOU ANSWER:
1. Website Navigation: Navigating tabs, 'My Courses & Tracks', Timed Quiz Engine, Revision Cards, and Profile.
2. Setting Milestones: The 20-day target and 365-day milestone wheel, 14-day streak, and continuity benefits.
3. 52-Week Learning Heatmap: How the annual grid tracks daily activity and what cell colors mean.
4. Settings & Account: Editing profile info, avatar uploads, theme switching (System / Bright / Dark), and portal languages.

STRICT BOUNDARY:
- DO NOT provide academic study guidance, formula derivations, mathematical proofs, or cadre exam tutoring.
- If asked a study/formula question, reply: "I am your Nirdesha Website Guidance Assistant for website features and navigation. For in-depth statistical coaching, formulas, and cadre exam preparation, please visit the dedicated AI Study Mentor in the Public Learning Dashboard."

STRICT NO-ASTERISK RULE:
- ABSOLUTELY DO NOT USE ANY ASTERISK SYMBOLS (*) IN YOUR RESPONSE.
- NEVER use bold markdown with asterisks like **text**. Use clean plain text.
- NEVER use asterisks for bullet points like * item. Use numbers (1., 2., 3.) or hyphens (- ).

{no_intro_rule}
{lang_directive}"""

    else:
        # role == "mentor"
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
{lang_directive}"""
# Fast Stream Generator
def stream_gemini(messages, system_instruction, api_key, model="gemini-3.5-flash-lite"):
    candidate_models = [model]
    for m in ["gemini-3.5-flash-lite", "gemini-3.5-flash"]:
        if m not in candidate_models:
            candidate_models.append(m)

    contents = []
    # Include up to last 6 messages
    for msg in messages[-6:]:
        role = "user" if msg["sender"] == "user" else "model"
        contents.append({
            "role": role,
            "parts": [{"text": msg["text"]}]
        })

    payload = {
        "system_instruction": {"parts": [{"text": system_instruction}]},
        "contents": contents,
        "generationConfig": {
            "temperature": 0.5,
            "maxOutputTokens": 400,
            "topP": 0.95
        }
    }
    req_data = json.dumps(payload).encode("utf-8")

    for current_model in candidate_models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{current_model}:streamGenerateContent?alt=sse&key={api_key}"
        req = urllib.request.Request(url, data=req_data, headers={"Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=12) as resp:
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
                                    if "ABSOLUTELY DO NOT USE ANY ASTERISK" in system_instruction:
                                        chunk = chunk.replace("*", "")
                                    yield chunk
                return
        except Exception as e:
            print(f"[{current_model} stream error]: {e}, trying next model...")
            continue

    yield "Apologies Officer Raman, temporary latency detected. Please try asking again."

# Non-streaming fallback
def call_gemini_api(messages, system_instruction, api_key, model="gemini-3.5-flash-lite"):
    full_text = []
    for chunk in stream_gemini(messages, system_instruction, api_key, model):
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
                "model": config.get("GEMINI_MODEL", "gemini-3.5-flash-lite"),
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
            model = config.get("GEMINI_MODEL", "gemini-3.5-flash-lite")

            if not api_key:
                self.send_json(200, {"reply": "Please paste your GEMINI_API_KEY in the .env file."})
                return

            history = get_user_history(session_key)
            history.append({"sender": "user", "text": user_message})
            system_instruction = build_system_context(user_id, role, language)

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
                for chunk in stream_gemini(history, system_instruction, api_key, model):
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
            model = config.get("GEMINI_MODEL", "gemini-3.5-flash-lite")

            if not api_key:
                self.send_json(200, {"reply": "Please paste your GEMINI_API_KEY in the .env file.", "status": "offline"})
                return

            history = get_user_history(session_key)
            history.append({"sender": "user", "text": user_message})
            system_instruction = build_system_context(user_id, role, language)

            bot_reply = call_gemini_api(history, system_instruction, api_key, model)
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
