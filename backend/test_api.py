import sys
import os
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app

client = TestClient(app)

def test_full_game_flow():
    # 1. Health check
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    print("[PASS] Health check passed")

    # 2. Start game
    response = client.post("/api/games", json={
        "player1_name": "Sakthi",
        "player2_name": "Arun"
    })
    assert response.status_code == 201
    game_data = response.json()
    game_id = game_data["game_id"]
    assert game_id > 0
    assert game_data["player1_name"] == "Sakthi"
    assert game_data["player2_name"] == "Arun"
    print(f"[PASS] Game created successfully with ID: {game_id}")

    # 3. Submit 6 rounds
    choices = [
        ("stone", "scissors"),   # P1 wins
        ("paper", "paper"),      # Tie
        ("scissors", "paper"),   # P1 wins
        ("stone", "paper"),      # P2 wins
        ("paper", "stone"),      # P1 wins
        ("scissors", "stone")    # P2 wins
    ]

    for round_num, (p1, p2) in enumerate(choices, 1):
        resp = client.post(f"/api/games/{game_id}/rounds", json={
            "round_number": round_num,
            "player1_choice": p1,
            "player2_choice": p2
        })
        assert resp.status_code == 201
        r_data = resp.json()
        assert r_data["round_number"] == round_num
        assert r_data["player1_choice"] == p1
        assert r_data["player2_choice"] == p2
        print(f"  [PASS] Round {round_num}: {p1} vs {p2} => {r_data['result']} ({r_data['message']})")

    # 4. Complete game
    comp_resp = client.post(f"/api/games/{game_id}/complete")
    assert comp_resp.status_code == 200
    comp_data = comp_resp.json()
    assert comp_data["player1_score"] == 3
    assert comp_data["player2_score"] == 2
    assert comp_data["ties"] == 1
    assert comp_data["winner"] == "Sakthi"
    assert len(comp_data["rounds"]) == 6
    print(f"[PASS] Game completed! Winner: {comp_data['winner']}, Score: {comp_data['player1_score']}-{comp_data['player2_score']} (Ties: {comp_data['ties']})")

    # 5. Fetch game history
    hist_resp = client.get("/api/games")
    assert hist_resp.status_code == 200
    history = hist_resp.json()
    assert len(history) >= 1
    print(f"[PASS] Game history fetched: {len(history)} record(s)")

    # 6. Fetch game detail
    detail_resp = client.get(f"/api/games/{game_id}")
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert detail["id"] == game_id
    assert len(detail["rounds"]) == 6
    print("[PASS] Game detail fetched successfully")

if __name__ == "__main__":
    test_full_game_flow()
    print("\nALL BACKEND API TESTS PASSED SUCCESSFULLY!")
