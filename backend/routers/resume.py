#Resume/service-record parsing and human-confirmation API.

from __future__ import annotations

from datetime import (
    datetime,
    timezone,
)

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)

from sqlalchemy import select

from sqlalchemy.orm import (
    Session,
    joinedload,
)

from ..database import get_db

from ..models import (
    EmployeeProfile,
    Skill,
    SkillEvidence,
)

from ..phase2_models import (
    ResumeAnalysis,
)

from ..phase2_schemas import (
    ResumeConfirmRequest,
    ResumeConfirmResponse,
    ResumeParseResponse,
)

from ..services.competency_engine import (
    get_competency_snapshot,
    recalculate_skill,
)

from ..services.file_extractor import (
    ExtractionError,
    extract_text,
)

from ..services.resume_parser import (
    parse_resume,
)


router = APIRouter(

    prefix="/api/resume",

    tags=[
        "Phase 2 - Resume Intelligence"
    ],

)


def _profile_query():

    return (

        select(
            EmployeeProfile
        )

        .options(

            joinedload(
                EmployeeProfile.department
            ),

            joinedload(
                EmployeeProfile.current_role
            ),

            joinedload(
                EmployeeProfile.target_role
            ),

        )

    )


@router.post(
    "/parse",
    response_model=ResumeParseResponse,
)
async def parse_resume_upload(

    employee_id: int = Form(...),

    file: UploadFile = File(...),

    db: Session = Depends(
        get_db
    ),

):

    employee = db.get(

        EmployeeProfile,
        employee_id,

    )


    if employee is None:

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
            or "resume.pdf",

            content,

            purpose="resume",

        )

    except ExtractionError as exc:

        raise HTTPException(

            status_code=422,
            detail=str(exc),

        ) from exc


    parsed, mode = parse_resume(

        db,
        text,

    )


    analysis = ResumeAnalysis(

        employee_id=
            employee_id,

        filename=
            file.filename
            or "resume",

        content_type=
            file.content_type,

        extracted_text=
            text,

        parsed_json=
            parsed,

        parser_mode=
            mode,

        status=
            "pending_review",

    )


    db.add(
        analysis
    )

    db.commit()

    db.refresh(
        analysis
    )


    return {

        "analysis_id":
            analysis.id,

        "employee_id":
            employee_id,

        "filename":
            analysis.filename,

        "parser_mode":
            mode,

        "status":
            analysis.status,

        "profile":
            parsed.get(
                "profile",
                {},
            ),

        "skills":
            parsed.get(
                "skills",
                [],
            ),

        "warnings":
            parsed.get(
                "warnings",
                [],
            ),

        "preview":
            text[:700],

    }


@router.post(
    "/{analysis_id}/confirm",
    response_model=ResumeConfirmResponse,
)
def confirm_resume_analysis(

    analysis_id: int,

    payload: ResumeConfirmRequest,

    db: Session = Depends(
        get_db
    ),

):

    analysis = db.get(

        ResumeAnalysis,
        analysis_id,

    )


    if analysis is None:

        raise HTTPException(

            status_code=404,

            detail=(
                "Resume analysis not found."
            ),

        )


    employee = db.get(

        EmployeeProfile,
        analysis.employee_id,

    )


    if employee is None:

        raise HTTPException(

            status_code=404,

            detail=(
                "Employee profile not found."
            ),

        )


    if analysis.status == "confirmed":

        profile = db.scalar(

            _profile_query()

            .where(

                EmployeeProfile.id
                == employee.id

            )

        )


        return {

            "analysis_id":
                analysis.id,

            "status":
                analysis.status,

            "profile":
                profile,

            "competency":
                get_competency_snapshot(

                    db,
                    employee.id,

                ),

            "evidence_added":
                0,

        }


    allowed_fields = {

        "name",
        "email",
        "designation",
        "division",
        "cadre",
        "ministry",
        "station",
        "education",
        "experience_years",

    }


    for (
        field,
        value,
    ) in payload.profile.items():

        if (
            field not in allowed_fields
            or value in (
                None,
                "",
            )
        ):

            continue


        if field == "experience_years":

            try:

                value = max(

                    0.0,

                    min(
                        60.0,
                        float(value),
                    ),

                )

            except (
                TypeError,
                ValueError,
            ):

                continue


        if field == "email":

            duplicate = db.scalar(

                select(
                    EmployeeProfile
                )

                .where(

                    EmployeeProfile.email
                    == str(value),

                    EmployeeProfile.id
                    != employee.id,

                )

            )


            if duplicate:

                raise HTTPException(

                    status_code=409,

                    detail=(
                        "That email is already used "
                        "by another employee profile."
                    ),

                )


        setattr(

            employee,
            field,
            value,

        )


    evidence_added = 0

    touched_skill_ids: set[
        int
    ] = set()


    for accepted in payload.skills:

        code = (

            accepted
            .skill_code
            .strip()
            .upper()

        )


        skill = db.scalar(

            select(Skill)

            .where(

                Skill.code
                == code,

                Skill.active.is_(
                    True
                ),

            )

        )


        if not skill:

            continue


        source_ref = (

            f"resume-analysis-"
            f"{analysis.id}-"
            f"{code}"

        )


        existing = db.scalar(

            select(
                SkillEvidence
            )

            .where(

                SkillEvidence.employee_id
                == employee.id,

                SkillEvidence.skill_id
                == skill.id,

                SkillEvidence.source_ref
                == source_ref,

            )

        )


        if existing:

            continue


        db.add(

            SkillEvidence(

                employee_id=
                    employee.id,

                skill_id=
                    skill.id,

                evidence_type=
                    "self_assessment",

                score=
                    float(
                        accepted.score
                    ),

                source=
                    "resume_confirmed",

                source_ref=
                    source_ref,

                notes=(
                    "Human-confirmed resume/service-record "
                    "skill mention. Preliminary evidence only."
                ),

                metadata_json={

                    "analysis_id":
                        analysis.id,

                    "evidence":
                        accepted.evidence,

                },

                recorded_at=
                    datetime.now(
                        timezone.utc
                    ),

            )

        )


        evidence_added += 1

        touched_skill_ids.add(
            skill.id
        )


    analysis.status = (
        "confirmed"
    )

    analysis.confirmed_at = (
        datetime.now(
            timezone.utc
        )
    )


    db.flush()


    for skill_id in touched_skill_ids:

        recalculate_skill(

            db,
            employee.id,
            skill_id,

        )


    db.commit()


    profile = db.scalar(

        _profile_query()

        .where(

            EmployeeProfile.id
            == employee.id

        )

    )


    return {

        "analysis_id":
            analysis.id,

        "status":
            analysis.status,

        "profile":
            profile,

        "competency":
            get_competency_snapshot(

                db,
                employee.id,

            ),

        "evidence_added":
            evidence_added,

    }


@router.get(
    "/{analysis_id}",
    response_model=ResumeParseResponse,
)
def get_resume_analysis(

    analysis_id: int,

    db: Session = Depends(
        get_db
    ),

):

    analysis = db.get(

        ResumeAnalysis,
        analysis_id,

    )


    if analysis is None:

        raise HTTPException(

            status_code=404,

            detail=(
                "Resume analysis not found."
            ),

        )


    parsed = (
        analysis.parsed_json
        or {}
    )


    return {

        "analysis_id":
            analysis.id,

        "employee_id":
            analysis.employee_id,

        "filename":
            analysis.filename,

        "parser_mode":
            analysis.parser_mode,

        "status":
            analysis.status,

        "profile":
            parsed.get(
                "profile",
                {},
            ),

        "skills":
            parsed.get(
                "skills",
                [],
            ),

        "warnings":
            parsed.get(
                "warnings",
                [],
            ),

        "preview":
            analysis
            .extracted_text[:700],

    }