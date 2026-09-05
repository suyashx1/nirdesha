#Learning-material upload and AI quiz generation API

from __future__ import annotations

import hashlib
import math

from pathlib import Path

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db

from ..models import (
    EmployeeProfile,
)

from ..phase2_models import (
    GeneratedQuiz,
    LearningMaterial,
)

from ..phase2_schemas import (
    GeneratedQuizOut,
    MaterialOut,
    QuizGenerateRequest,
)

from ..services.file_extractor import (
    ExtractionError,
    extract_text,
)

from ..services.quiz_generator import (
    generate_quiz,
)


router = APIRouter(

    prefix="/api/materials",

    tags=[
        "Phase 2 - Learning Materials & AI Quiz"
    ],

)


def _material_payload(
    material: LearningMaterial,
) -> dict:

    return {

        "id":
            material.id,

        "employee_id":
            material.employee_id,

        "filename":
            material.filename,

        "title":
            material.title,

        "content_type":
            material.content_type,

        "word_count":
            material.word_count,

        "created_at":
            material.created_at,

        "preview":
            material
            .text_content[:700],

    }


@router.post(
    "/upload",
    response_model=MaterialOut,
    status_code=201,
)
async def upload_material(

    employee_id: int = Form(...),

    title: str | None = Form(
        default=None
    ),

    file: UploadFile = File(...),

    db: Session = Depends(
        get_db
    ),

):

    if db.get(
        EmployeeProfile,
        employee_id,
    ) is None:

        raise HTTPException(

            status_code=404,

            detail=(
                "Employee profile not found."
            ),

        )


    content = await file.read()


    try:

        text = extract_text(

            file.filename
            or "learning-material.pdf",

            content,

            purpose="learning",

        )

    except ExtractionError as exc:

        raise HTTPException(

            status_code=422,
            detail=str(exc),

        ) from exc


    digest = hashlib.sha256(

        text.encode(
            "utf-8"
        )

    ).hexdigest()


    clean_title = (

        title

        or Path(
            file.filename
            or "Learning Material"
        ).stem

    ).strip()[:255]


    if not clean_title:

        clean_title = (
            "Learning Material"
        )


    material = LearningMaterial(

        employee_id=
            employee_id,

        filename=
            file.filename
            or "learning-material",

        title=
            clean_title,

        content_type=
            file.content_type,

        text_content=
            text,

        text_hash=
            digest,

        word_count=
            len(
                text.split()
            ),

    )


    db.add(
        material
    )

    db.commit()

    db.refresh(
        material
    )


    return _material_payload(
        material
    )


@router.get(
    "",
    response_model=list[MaterialOut],
)
def list_materials(

    employee_id: int = 1,

    db: Session = Depends(
        get_db
    ),

):

    materials = db.scalars(

        select(
            LearningMaterial
        )

        .where(

            LearningMaterial.employee_id
            == employee_id

        )

        .order_by(

            LearningMaterial
            .created_at
            .desc()

        )

    ).all()


    return [

        _material_payload(
            material
        )

        for material
        in materials

    ]


@router.post(
    "/{material_id}/generate-quiz",
    response_model=GeneratedQuizOut,
    status_code=201,
)
def generate_material_quiz(

    material_id: int,

    payload: QuizGenerateRequest,

    db: Session = Depends(
        get_db
    ),

):

    material = db.get(

        LearningMaterial,
        material_id,

    )


    if material is None:

        raise HTTPException(

            status_code=404,

            detail=(
                "Learning material not found."
            ),

        )


    try:

        quiz, mode = generate_quiz(

            db,

            material.text_content,

            material.title,

            material.filename,

            count=
                payload.question_count,

            difficulty=
                payload.difficulty,

            skill_code=
                payload.skill_code,

            question_time=
                payload.question_time_seconds,

        )

    except ValueError as exc:

        raise HTTPException(

            status_code=422,
            detail=str(exc),

        ) from exc


    quiz[
        "materialId"
    ] = material.id


    generated = GeneratedQuiz(

        quiz_uid=
            quiz["id"],

        employee_id=
            material.employee_id,

        material_id=
            material.id,

        title=
            quiz["title"],

        topic=
            quiz["topic"],

        skill_code=
            quiz["skillCode"],

        difficulty=
            quiz["difficulty"],

        generator_mode=
            mode,

        questions_json=
            quiz["questions"],

    )


    db.add(
        generated
    )

    db.commit()


    return quiz


@router.get(
    "/{material_id}/quizzes",
    response_model=list[
        GeneratedQuizOut
    ],
)
def list_generated_quizzes(

    material_id: int,

    db: Session = Depends(
        get_db
    ),

):

    material = db.get(

        LearningMaterial,
        material_id,

    )


    if material is None:

        raise HTTPException(

            status_code=404,

            detail=(
                "Learning material not found."
            ),

        )


    rows = db.scalars(

        select(
            GeneratedQuiz
        )

        .where(

            GeneratedQuiz.material_id
            == material_id

        )

        .order_by(

            GeneratedQuiz
            .created_at
            .desc()

        )

    ).all()


    output = []


    for row in rows:

        question_time = (

            row.questions_json[
                0
            ].get(
                "allocatedSeconds",
                45,
            )

            if row.questions_json

            else 45

        )


        output.append({

            "id":
                row.quiz_uid,

            "title":
                row.title,

            "topic":
                row.topic,

            "mode":
                "Uploaded Material",

            "format":
                "Multiple Choice (MCQ)",

            "focus":
                "Source-Grounded Competency Check",

            "difficulty":
                row.difficulty,

            "skillCode":
                row.skill_code,

            "materialId":
                row.material_id,

            "sourceFile":
                material.filename,

            "generatorMode":
                row.generator_mode,

            "timerMode":
                "per_question",

            "questionTime":
                question_time,

            "totalExamMinutes":
                max(

                    1,

                    math.ceil(

                        question_time
                        * len(
                            row.questions_json
                        )
                        / 60

                    ),

                ),

            "isNew":
                False,

            "createdAt":
                int(
                    row.created_at.timestamp()
                    * 1000
                ),

            "questions":
                row.questions_json,

        })


    return output