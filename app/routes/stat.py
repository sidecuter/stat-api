from fastapi import Depends, APIRouter, Response, Body, Request
from app.database import get_db
from app.schemas import *
from app.methods import *
from app.state import *

router = APIRouter(
    prefix="/api/stat"
)


@router.put(
    "/site",
    response_model=status.Status,
    responses={
        500: {
            'model': status.Status,
            'description': "Server side error",
            'content': {
                "application/json": {
                    "example": {"status": "Some error"}
                }
            }
        },
        404: {
            'model': status.Status,
            'description': "Item not found",
            'content': {
                "application/json": {
                    "example": {"status": "User not found"}
                }
            }
        },
        200: {
            'model': Status,
            "description": "Status of adding new object to db"
        }
    }
)
async def add_site_stat(response: Response, data: SiteStat = Body(), db: Session = Depends(get_db)):
    answer, status_code = await insert_site_stat(db, data)
    response.status_code = status_code
    return answer


@router.put(
    "/select-aud",
    response_model=Status,
    responses={
        500: {
            'model': Status,
            'description': "Server side error",
            'content': {
                "application/json": {
                    "example": {"status": "Some error"}
                }
            }
        },
        404: {
            'model': Status,
            'description': "Item not found",
            'content': {
                "application/json": {
                    "example": {"status": "Auditory not found"}
                }
            }
        },
        200: {
            'model': Status,
            "description": "Status of adding new object to db"
        },
        429: {
            'model': Status,
            "description": "Too many requests",
            'content': {
                "application/json": {
                    "example": {"status": "Too many requests for this user within one second"}
                }
            }
        }
    }
)
async def add_selected_aud(
        request: Request,
        response: Response,
        data: SelectedAuditory = Body(),
        db: Session = Depends(get_db),
):
    state = request.app.state
    if check_user(state, data.user_id) < 1:
        response.status_code = 429
        return Status(status="Too many requests for this user within one second")
    answer, status_code = await insert_aud_selection(db, data)
    response.status_code = status_code
    return answer