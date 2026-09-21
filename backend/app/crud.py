from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models import Game, Round
from app.schemas import GameCreate, RoundCreate


def calculate_round_winner(p1_choice: str, p2_choice: str) -> str:
    """
    Calculates the round winner according to:
    - Stone beats Scissors
    - Scissors beats Paper
    - Paper beats Stone
    - Same choice = Tie
    """
    c1 = p1_choice.lower().strip()
    c2 = p2_choice.lower().strip()

    if c1 == c2:
        return "tie"

    wins_map = {
        "stone": "scissors",
        "scissors": "paper",
        "paper": "stone"
    }

    if wins_map.get(c1) == c2:
        return "player1"
    else:
        return "player2"


def create_game(db: Session, game_data: GameCreate) -> Game:
    """Creates a new game session in the database."""
    db_game = Game(
        player1_name=game_data.player1_name,
        player2_name=game_data.player2_name,
        player1_score=0,
        player2_score=0,
        ties=0,
        winner=None,
        is_completed=0
    )
    db.add(db_game)
    db.commit()
    db.refresh(db_game)
    return db_game


def submit_round(db: Session, game_id: int, round_data: RoundCreate) -> dict:
    """
    Processes round choices, determines winner on backend, and persists round record.
    """
    db_game = db.query(Game).filter(Game.id == game_id).first()
    if not db_game:
        raise HTTPException(status_code=404, detail=f"Game with ID {game_id} not found.")

    if db_game.is_completed == 1:
        raise HTTPException(status_code=400, detail="This game has already been completed.")

    # Check for duplicate round number for this game
    existing_round = db.query(Round).filter(
        Round.game_id == game_id,
        Round.round_number == round_data.round_number
    ).first()
    if existing_round:
        raise HTTPException(
            status_code=400,
            detail=f"Round {round_data.round_number} has already been submitted for game #{game_id}."
        )

    # Calculate winner strictly on backend
    result = calculate_round_winner(round_data.player1_choice, round_data.player2_choice)

    db_round = Round(
        game_id=game_id,
        round_number=round_data.round_number,
        player1_choice=round_data.player1_choice,
        player2_choice=round_data.player2_choice,
        result=result
    )
    db.add(db_round)
    db.commit()
    db.refresh(db_round)

    if result == "player1":
        msg = f"{db_game.player1_name} Wins"
    elif result == "player2":
        msg = f"{db_game.player2_name} Wins"
    else:
        msg = "Tie"

    return {
        "id": db_round.id,
        "game_id": db_round.game_id,
        "round_number": db_round.round_number,
        "player1_choice": db_round.player1_choice,
        "player2_choice": db_round.player2_choice,
        "result": result,
        "message": msg,
        "created_at": db_round.created_at
    }


def complete_game(db: Session, game_id: int) -> Game:
    """
    Calculates final score (player1 score, player2 score, ties), overall winner,
    and updates game record status to completed.
    """
    db_game = db.query(Game).filter(Game.id == game_id).first()
    if not db_game:
        raise HTTPException(status_code=404, detail=f"Game with ID {game_id} not found.")

    rounds = db.query(Round).filter(Round.game_id == game_id).all()
    
    p1_score = 0
    p2_score = 0
    ties = 0

    for r in rounds:
        if r.result == "player1":
            p1_score += 1
        elif r.result == "player2":
            p2_score += 1
        elif r.result == "tie":
            ties += 1

    if p1_score > p2_score:
        overall_winner = db_game.player1_name
    elif p2_score > p1_score:
        overall_winner = db_game.player2_name
    else:
        overall_winner = "Tie"

    db_game.player1_score = p1_score
    db_game.player2_score = p2_score
    db_game.ties = ties
    db_game.winner = overall_winner
    db_game.is_completed = 1

    db.commit()
    db.refresh(db_game)
    return db_game


def get_games(db: Session) -> list[Game]:
    """Retrieves all completed games ordered by creation date descending."""
    return db.query(Game).filter(Game.is_completed == 1).order_by(Game.created_at.desc()).all()


def get_game_by_id(db: Session, game_id: int) -> Game:
    """Retrieves single game by ID along with its rounds."""
    db_game = db.query(Game).filter(Game.id == game_id).first()
    if not db_game:
        raise HTTPException(status_code=404, detail=f"Game with ID {game_id} not found.")
    return db_game
