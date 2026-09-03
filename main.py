import os
import json
import re
import logging
from concurrent.futures import ThreadPoolExecutor, TimeoutError
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

app = FastAPI(
    title="Nirdesha Backend - Competency Intelligence System",
    version="1.0.0",
    description="Backend for SIH Competency Intelligence System with iGOT Karmayogi integration"
)

# Enable CORS for frontend integration (compatible with all frontend dev ports)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini client safely
client: Optional[genai.Client] = None
if GEMINI_API_KEY:
    try:
        client = genai.Client(api_key=GEMINI_API_KEY)
        logger.info("Gemini client successfully initialized.")
    except Exception as init_err:
        logger.warning(f"Could not initialize Gemini client: {init_err}")
else:
    logger.warning("GEMINI_API_KEY not found in environment variables. Running in fallback mode.")

# Thread pool for non-blocking execution with strict timeouts
executor = ThreadPoolExecutor(max_workers=4)

# iGOT Karmayogi Mock Employee Competency Database
EMPLOYEES = {
    "RAHUL001": {
        "name": "Rahul Sharma",
        "role": "Data Analyst",
        "department": "Public Administration",
        "skills": [
            {"skill": "Statistics", "current": 4, "required": 3},
            {"skill": "Python", "current": 2, "required": 3},
            {"skill": "SQL", "current": 2, "required": 3},
            {"skill": "GIS", "current": 1, "required": 2},
        ]
    },
    "PRIYA002": {
        "name": "Priya Nair",
        "role": "Policy Specialist",
        "department": "Rural Development",
        "skills": [
            {"skill": "Statistics", "current": 3, "required": 3},
            {"skill": "Python", "current": 1, "required": 3},
            {"skill": "SQL", "current": 3, "required": 3},
        ]
    }
}

class QuizRequest(BaseModel):
    text: str

def clean_and_parse_json(raw_text: str):
    """
    Safely extracts and parses a JSON array from raw model output,
    handling markdown blocks, conversational preamble, and whitespace.
    """
    if not raw_text or not raw_text.strip():
        return None

    # 1. Attempt regex extraction of JSON array
    array_match = re.search(r'\[\s*\{.*\}\s*\]', raw_text, re.DOTALL)
    if array_match:
        try:
            return json.loads(array_match.group(0))
        except Exception:
            pass

    # 2. Attempt markdown stripping
    cleaned = raw_text.strip()
    if "```json" in cleaned:
        cleaned = cleaned.split("```json", 1)[1]
    elif "```" in cleaned:
        cleaned = cleaned.split("```", 1)[1]

    if "```" in cleaned:
        cleaned = cleaned.split("```", 1)[0]

    try:
        return json.loads(cleaned.strip())
    except Exception:
        return None

def validate_quiz_structure(quiz) -> bool:
    """Validates that the parsed JSON matches the expected quiz format."""
    if not isinstance(quiz, list) or len(quiz) == 0:
        return False
    for item in quiz:
        if not isinstance(item, dict):
            return False
        if "question" not in item or "options" not in item or "correct_index" not in item:
            return False
        if not isinstance(item["options"], list) or len(item["options"]) < 2:
            return False
        if not isinstance(item["correct_index"], int):
            return False
    return True

def build_fallback_quiz(text: str):
    """
    Generates a reliable, context-aware fallback quiz
    whenever the AI service is unreachable, times out, or rate-limited.
    """
    snippet = text.strip()[:60] if text else "Competency Training"
    return [
        {
            "question": f"Based on the training material regarding '{snippet}...', what is the fundamental objective?",
            "options": [
                "Targeted competency enhancement and structured skill acquisition",
                "Arbitrary memorization without practical application",
                "Replacing existing operational protocols entirely",
                "Administrative compliance without performance metrics"
            ],
            "correct_index": 0
        },
        {
            "question": "How does competency mapping under iGOT Karmayogi support civil service effectiveness?",
            "options": [
                "By ignoring employee proficiency levels",
                "By identifying skill gaps to enable role-specific training pathways",
                "By automating all administrative decisions without human oversight",
                "By enforcing identical training modules regardless of role"
            ],
            "correct_index": 1
        },
        {
            "question": "What is the recommended approach after completing a competency module?",
            "options": [
                "Continuous practice, self-assessment, and periodic gap reassessment",
                "Immediate discontinuation of subject-matter engagement",
                "Exclusively theoretical review without domain practice",
                "Skipping subsequent proficiency evaluations"
            ],
            "correct_index": 0
        }
    ]

def _call_gemini_api(model_name: str, prompt: str):
    """Worker function executed inside the thread pool."""
    return client.models.generate_content(
        model=model_name,
        contents=prompt
    )

@app.get("/")
def home():
    return {
        "status": "healthy",
        "message": "Nirdesha backend is alive",
        "gemini_configured": client is not None,
        "supported_endpoints": [
            "/gaps/{employee_id}",
            "/generate-quiz"
        ]
    }

@app.get("/gaps/{employee_id}")
def get_gaps(employee_id: str):
    employee = EMPLOYEES.get(employee_id.upper()) or EMPLOYEES.get(employee_id)
    if not employee:
        return {"error": "Employee not found"}

    skills_with_gap = []
    for skill in employee["skills"]:
        gap = max(0, skill["required"] - skill["current"])
        skills_with_gap.append({
            "skill": skill["skill"],
            "current": skill["current"],
            "required": skill["required"],
            "gap": gap
        })

    return {
        "employee_id": employee_id.upper(),
        "employee": employee["name"],
        "role": employee.get("role", "Civil Servant"),
        "department": employee.get("department", "General Administration"),
        "skills": skills_with_gap
    }

@app.post("/generate-quiz")
def generate_quiz(request: QuizRequest):
    content_text = request.text.strip()
    if not content_text:
        return {
            "quiz": build_fallback_quiz("General Competency"),
            "source": "fallback",
            "notice": "Empty text provided; default competency questions returned."
        }

    # If Gemini client isn't configured, immediately return safe fallback without crashing
    if client is None:
        logger.warning("Gemini client not initialized; serving fallback quiz.")
        return {"quiz": build_fallback_quiz(content_text), "source": "fallback"}

    prompt = f"""You are an educational assessment assistant for the iGOT Karmayogi competency platform.
Generate exactly 3 high-quality multiple choice questions based strictly on the text provided below.
Each question must have exactly 4 options and a single 0-indexed correct answer.

Output ONLY a valid JSON array matching this exact schema:
[
  {{
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_index": 0
  }}
]

Text:
{content_text}"""

    # Model candidates: primary fast model followed by backup models
    candidate_models = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.1-pro-preview"]
    timeout_per_attempt = 10.0  # seconds

    for model_name in candidate_models:
        try:
            logger.info(f"Attempting quiz generation with {model_name} (timeout={timeout_per_attempt}s)...")
            future = executor.submit(_call_gemini_api, model_name, prompt)
            response = future.result(timeout=timeout_per_attempt)

            raw_text = response.text if hasattr(response, "text") and response.text else ""
            quiz = clean_and_parse_json(raw_text)

            if quiz and validate_quiz_structure(quiz):
                logger.info(f"Successfully generated quiz using {model_name}.")
                return {"quiz": quiz, "source": "ai_generated", "model": model_name}
            else:
                logger.warning(f"{model_name} produced invalid or non-JSON output.")
        except TimeoutError:
            logger.warning(f"Request to {model_name} timed out after {timeout_per_attempt}s.")
        except Exception as err:
            logger.warning(f"Error calling {model_name}: {err}")

    # Fallback if both models fail, timeout, or hit rate limits
    logger.info("AI generation failed or timed out. Gracefully returning fallback quiz.")
    return {
        "quiz": build_fallback_quiz(content_text),
        "source": "fallback"
    }