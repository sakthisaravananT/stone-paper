from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Game(Base):
    __tablename__ = "games"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    player1_name = Column(String(100), nullable=False)
    player2_name = Column(String(100), nullable=False)
    player1_score = Column(Integer, default=0, nullable=False)
    player2_score = Column(Integer, default=0, nullable=False)
    ties = Column(Integer, default=0, nullable=False)
    winner = Column(String(100), nullable=True)
    is_completed = Column(Integer, default=0, nullable=False)  # 0: in-progress, 1: completed
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    rounds = relationship("Round", back_populates="game", cascade="all, delete-orphan", order_by="Round.round_number")


class Round(Base):
    __tablename__ = "rounds"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    game_id = Column(Integer, ForeignKey("games.id", ondelete="CASCADE"), nullable=False)
    round_number = Column(Integer, nullable=False)
    player1_choice = Column(String(20), nullable=False)
    player2_choice = Column(String(20), nullable=False)
    result = Column(String(50), nullable=False)  # "player1", "player2", or "tie"
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    game = relationship("Game", back_populates="rounds")
