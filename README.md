# Nirdesha

Competency-intelligence and personalized learning guidance platform for SIH/MoSPI-aligned training workflows.

For full background, see [docs/PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md).

Before contributing, read AI_MEMORY.md for current project status and .github/copilot-instructions.md for the rules every AI/human contributor follows in this repo.

---

## Backend Services (FastAPI & Gemini AI)

Backend service for the **Competency Intelligence System** integrated with **iGOT Karmayogi** for Smart India Hackathon (SIH).

This backend calculates employee competency gaps based on required proficiency levels and generates dynamic quizzes using the Google Gemini API with automatic fallback protection.

### Features

- **Competency Gap Analysis (`/gaps/{employee_id}`)**:
  - Compares employee current competency ratings against role requirements.
  - Automatically computes gaps for targeted training and upskilling.
- **AI-Powered Quiz Generation (`/generate-quiz`)**:
  - Automatically generates 3 tailored multiple-choice questions from learning text/materials using Gemini.
  - **Zero-Crash Architecture**: Uses model fallbacks and built-in fallback quiz generation if the API times out, hits rate limits, or is unavailable.
- **CORS Enabled**: Ready to connect with frontend web applications on any port.

---

### Setup & Installation

#### 1. Create and activate a virtual environment
- **Windows (PowerShell):**
  ```powershell
  python -m venv venv
  .\venv\Scripts\Activate.ps1
  ```
- **macOS / Linux:**
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```

#### 2. Install dependencies
```bash
pip install -r requirements.txt
```

#### 3. Configure Environment Variables
Copy the template `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your Gemini API key in `.env`:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

#### 4. Run the Server
```bash
uvicorn main:app --reload --port 8000
```
The server will start at `http://127.0.0.1:8000`.

---

### API Endpoints

#### 1. Health Check
- **Endpoint**: `GET /`
- **Response**:
  ```json
  {
    "status": "healthy",
    "message": "Nirdesha backend is alive",
    "gemini_configured": true
  }
  ```

#### 2. Get Employee Competency Gaps
- **Endpoint**: `GET /gaps/{employee_id}`
- **Example**: `GET /gaps/RAHUL001`
- **Response**:
  ```json
  {
    "employee": "Rahul Sharma",
    "skills": [
      { "skill": "Statistics", "current": 4, "required": 3, "gap": 0 },
      { "skill": "Python", "current": 2, "required": 3, "gap": 1 },
      { "skill": "SQL", "current": 2, "required": 3, "gap": 1 },
      { "skill": "GIS", "current": 1, "required": 2, "gap": 1 }
    ]
  }
  ```

#### 3. Generate Quiz from Content
- **Endpoint**: `POST /generate-quiz`
- **Body**:
  ```json
  {
    "text": "Module content or topic description here..."
  }
  ```
- **Response**:
  ```json
  {
    "quiz": [
      {
        "question": "What is the primary focus of...",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correct_index": 0
      }
    ],
    "source": "ai_generated"
  }
  ```
