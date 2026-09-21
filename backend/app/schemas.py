from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime


class GameCreate(BaseModel):
    player1_name: str = Field(..., min_length=1, max_length=100)
    player2_name: str = Field(..., min_length=1, max_length=100)

    @field_validator("player1_name", "player2_name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("Player name cannot be empty or contain only spaces.")
        return trimmed


class GameCreateResponse(BaseModel):
    game_id: int
    player1_name: str
    player2_name: str

    class Config:
        from_attributes = True


class RoundCreate(BaseModel):
    round_number: int = Field(..., ge=1, le=6)
    player1_choice: str
    player2_choice: str

    @field_validator("player1_choice", "player2_choice")
    @classmethod
    def validate_choice(cls, v: str) -> str:
        choice = v.lower().strip()
        if choice not in ["stone", "paper", "scissors"]:
            raise ValueError("Choice must be one of: stone, paper, scissors.")
        return choice


class RoundResponse(BaseModel):
    id: Optional[int] = None
    game_id: Optional[int] = None
    round_number: int
    player1_choice: str
    player2_choice: str
    result: str
    message: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class GameSummary(BaseModel):
    id: int
    player1_name: str
    player2_name: str
    player1_score: int
    player2_score: int
    ties: int
    winner: str
    created_at: datetime

    class Config:
        from_attributes = True


class GameDetailResponse(BaseModel):
    id: int
    player1_name: str
    player2_name: str
    player1_score: int
    player2_score: int
    ties: int
    winner: str
    created_at: datetime
    rounds: List[RoundResponse]

    class Config:
        from_attributes = True
