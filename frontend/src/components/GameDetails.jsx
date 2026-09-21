import React from 'react';
import { getChoiceMetadata, getWinnerBadge } from '../utils/gameLogic';

const GameDetails = ({ game, onClose }) => {
  if (!game) return null;

  const {
    id,
    player1_name,
    player2_name,
    player1_score,
    player2_score,
    ties,
    winner,
    created_at,
    rounds = [],
  } = game;

  const winnerBadge = getWinnerBadge(winner, player1_name, player2_name);
  const formattedDate = created_at
    ? new Date(created_at).toLocaleString('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'N/A';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-box">
            <h3>🎮 Match #{id} Details</h3>
            <span className="modal-subtitle">{formattedDate}</span>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>

        <div className="modal-body">
          {/* Winner Banner */}
          <div className={`details-winner-banner ${winnerBadge.class}`}>
            <span>{winnerBadge.emoji}</span>
            <span>
              {winner === 'Tie' || winner === 'Match Draw'
                ? 'Match Draw / Tie'
                : `Winner: ${winner}`}
            </span>
          </div>

          {/* Scores Breakdown */}
          <div className="details-scores-row">
            <div className="score-pillar p1-pillar">
              <span className="pillar-name p1-color">{player1_name}</span>
              <span className="pillar-value p1-color">{player1_score}</span>
            </div>
            <div className="score-pillar tie-pillar">
              <span className="pillar-name tie-color">Ties</span>
              <span className="pillar-value tie-color">{ties}</span>
            </div>
            <div className="score-pillar p2-pillar">
              <span className="pillar-name p2-color">{player2_name}</span>
              <span className="pillar-value p2-color">{player2_score}</span>
            </div>
          </div>

          {/* 6 Rounds Details Table */}
          <h4 className="details-section-heading">Round Results ({rounds.length} Rounds)</h4>
          <div className="details-rounds-list">
            {rounds.map((r, idx) => {
              const p1Meta = getChoiceMetadata(r.player1_choice);
              const p2Meta = getChoiceMetadata(r.player2_choice);
              let rOutcome = 'Tie';
              if (r.result === 'player1') rOutcome = `${player1_name} Wins`;
              else if (r.result === 'player2') rOutcome = `${player2_name} Wins`;

              return (
                <div key={r.id || idx} className="details-round-card">
                  <div className="d-round-badge">Round {r.round_number}</div>
                  <div className="d-choices-row">
                    <span className="d-choice p1-color">
                      {p1Meta.emoji} {player1_name}: <strong>{p1Meta.label}</strong>
                    </span>
                    <span className="d-vs">VS</span>
                    <span className="d-choice p2-color">
                      {p2Meta.emoji} {player2_name}: <strong>{p2Meta.label}</strong>
                    </span>
                  </div>
                  <div className="d-result-tag">
                    {rOutcome}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameDetails;
