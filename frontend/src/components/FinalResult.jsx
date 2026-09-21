import React from 'react';
import { getChoiceMetadata, getWinnerBadge } from '../utils/gameLogic';

const FinalResult = ({ gameData, onPlayAgain, onViewHistory }) => {
  if (!gameData) return null;

  const {
    player1_name,
    player2_name,
    player1_score,
    player2_score,
    ties,
    winner,
    rounds = [],
  } = gameData;

  const winnerInfo = getWinnerBadge(winner, player1_name, player2_name);

  return (
    <div className="card final-result-card">
      <div className="final-header text-center">
        <div className="status-badge-completed">🎉 GAME COMPLETED</div>
        <h1 className="final-title">Final Score</h1>
      </div>

      {/* Main Winner Banner */}
      <div className={`final-winner-box ${winnerInfo.class}`}>
        <span className="trophy-emoji">{winnerInfo.emoji}</span>
        <div className="winner-details">
          <span className="winner-title-sm">WINNER</span>
          <h2 className="winner-name">
            {winner === 'Tie' || winner === 'Match Draw' ? 'Match Draw!' : winner}
          </h2>
        </div>
      </div>

      {/* Score overview cards */}
      <div className="final-scores-grid">
        <div className="final-score-card p1-final">
          <span className="p-label p1-color">{player1_name}</span>
          <span className="p-score p1-color">{player1_score}</span>
        </div>

        <div className="final-score-card tie-final">
          <span className="p-label tie-color">TIES</span>
          <span className="p-score tie-color">{ties}</span>
        </div>

        <div className="final-score-card p2-final">
          <span className="p-label p2-color">{player2_name}</span>
          <span className="p-score p2-color">{player2_score}</span>
        </div>
      </div>

      {/* All 6 Round Breakdown List */}
      <div className="round-breakdown-section">
        <h3 className="section-title">📊 6-Round Match Breakdown</h3>
        <div className="rounds-history-list">
          {rounds.map((r, idx) => {
            const p1M = getChoiceMetadata(r.player1_choice);
            const p2M = getChoiceMetadata(r.player2_choice);
            let roundOutcome = 'Tie';
            if (r.result === 'player1') roundOutcome = `${player1_name} Wins`;
            else if (r.result === 'player2') roundOutcome = `${player2_name} Wins`;
            else if (r.result === 'tie') roundOutcome = 'Tie';

            return (
              <div key={r.id || idx} className="round-history-item">
                <div className="round-item-num">Round {r.round_number}</div>
                <div className="round-item-choices">
                  <span className="p1-choice">
                    {p1M.emoji} {p1M.label}
                  </span>
                  <span className="vs-dim">vs</span>
                  <span className="p2-choice">
                    {p2M.emoji} {p2M.label}
                  </span>
                </div>
                <div className="round-item-outcome">
                  {roundOutcome}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="final-actions-grid">
        <button
          type="button"
          className="btn btn-primary btn-large"
          onClick={onPlayAgain}
        >
          🔄 PLAY AGAIN
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-large"
          onClick={onViewHistory}
        >
          📜 VIEW GAME HISTORY
        </button>
      </div>
    </div>
  );
};

export default FinalResult;
