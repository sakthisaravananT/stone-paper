from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import RoundCreate, RoundResponse
from app import crud

router = APIRouter(prefix="/api/games", tags=["Rounds"])


@router.post("/{game_id}/rounds", response_model=RoundResponse, status_code=status.HTTP_201_CREATED)
def submit_round_endpoint(game_id: int, round_data: RoundCreate, db: Session = Depends(get_db)):
    """
    Submits player choices for a round, calculates the winner on the backend,
    and returns the round summary.
    """
    round_result = crud.submit_round(db, game_id, round_data)
    return round_result
