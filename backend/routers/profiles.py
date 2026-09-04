"""
Employee profile API endpoints:
"""

from __future__ import annotations

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy import select

from sqlalchemy.orm import (
    Session,
    joinedload,
)

from ..database import get_db

from ..models import (
    EmployeeProfile,
    Role,
)

from ..schemas import (
    EmployeeProfileOut,
    EmployeeProfileUpdate,
)


router = APIRouter(

    prefix="/api/profile",
    tags=["Profile"],

)


# ---------------------------------------------------------------------------
# BASE PROFILE QUERY
# ---------------------------------------------------------------------------

def profile_query():

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


# ---------------------------------------------------------------------------
# GET PROFILE BY ID
# ---------------------------------------------------------------------------

@router.get(
    "/{employee_id}",
    response_model=EmployeeProfileOut,
)
def get_profile(
    employee_id: int,
    db: Session = Depends(get_db),
):

    employee = db.scalar(

        profile_query()

        .where(

            EmployeeProfile.id
            == employee_id

        )

    )

    if employee is None:

        raise HTTPException(

            status_code=404,
            detail="Employee profile not found.",

        )

    return employee


# ---------------------------------------------------------------------------
# GET PROFILE BY EMPLOYEE CODE
# ---------------------------------------------------------------------------

@router.get(
    "/by-code/{employee_code}",
    response_model=EmployeeProfileOut,
)
def get_profile_by_code(
    employee_code: str,
    db: Session = Depends(get_db),
):

    employee = db.scalar(

        profile_query()

        .where(

            EmployeeProfile.employee_code
            == employee_code

        )

    )

    if employee is None:

        raise HTTPException(

            status_code=404,
            detail="Employee profile not found.",

        )

    return employee


# ---------------------------------------------------------------------------
# UPDATE PROFILE
# ---------------------------------------------------------------------------

@router.put(
    "/{employee_id}",
    response_model=EmployeeProfileOut,
)
def update_profile(
    employee_id: int,
    payload: EmployeeProfileUpdate,
    db: Session = Depends(get_db),
):

    employee = db.get(

        EmployeeProfile,
        employee_id,

    )

    if employee is None:

        raise HTTPException(

            status_code=404,
            detail="Employee profile not found.",

        )

    update_data = payload.model_dump(
        exclude_unset=True
    )

    current_role_code = (
        update_data.pop(
            "current_role_code",
            None,
        )
    )

    target_role_code = (
        update_data.pop(
            "target_role_code",
            None,
        )
    )

    # Update normal profile fields.

    for field, value in (
        update_data.items()
    ):

        setattr(
            employee,
            field,
            value,
        )

    # Update current role.

    if current_role_code is not None:

        role = db.scalar(

            select(Role)

            .where(

                Role.code
                == current_role_code

            )

        )

        if role is None:

            raise HTTPException(

                status_code=400,

                detail=(
                    "Unknown current_role_code: "
                    f"{current_role_code}"
                ),

            )

        employee.current_role_id = (
            role.id
        )

    # Update target role.

    if target_role_code is not None:

        role = db.scalar(

            select(Role)

            .where(

                Role.code
                == target_role_code

            )

        )

        if role is None:

            raise HTTPException(

                status_code=400,

                detail=(
                    "Unknown target_role_code: "
                    f"{target_role_code}"
                ),

            )

        employee.target_role_id = (
            role.id
        )

    db.commit()

    # Reload relationships.

    employee = db.scalar(

        profile_query()

        .where(

            EmployeeProfile.id
            == employee_id

        )

    )

    return employee