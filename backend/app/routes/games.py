from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas import (
    GameCreate,
    GameCreateResponse,
    GameSummary,
    GameDetailResponse
)
from app import crud

router = APIRouter(prefix="/api/games", tags=["Games"])


@router.post("", response_model=GameCreateResponse, status_code=status.HTTP_201_CREATED)
def create_game_endpoint(game_data: GameCreate, db: Session = Depends(get_db)):
    """
    Creates a new game session with Player 1 and Player 2 names.
    Returns the generated game_id.
    """
    new_game = crud.create_game(db, game_data)
    return GameCreateResponse(
        game_id=new_game.id,
        player1_name=new_game.player1_name,
        player2_name=new_game.player2_name
    )


@router.get("", response_model=List[GameSummary])
def get_game_history_endpoint(db: Session = Depends(get_db)):
    """
    Retrieves history of all completed 6-round matches.
    """
    games = crud.get_games(db)
    return games


@router.get("/{game_id}", response_model=GameDetailResponse)
def get_game_details_endpoint(game_id: int, db: Session = Depends(get_db)):
    """
    Retrieves full record for a specific game including all round choices and results.
    """
    game = crud.get_game_by_id(db, game_id)
    return game


@router.post("/{game_id}/complete", response_model=GameDetailResponse)
def complete_game_endpoint(game_id: int, db: Session = Depends(get_db)):
    """
    Finalizes the game, computes overall score, ties, and winner, and records completion.
    """
    game = crud.complete_game(db, game_id)
    return game
