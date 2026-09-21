import React from 'react';
import { getChoiceMetadata, getWinnerBadge } from '../utils/gameLogic';

const RoundResult = ({
  currentRound,
  player1Name,
  player2Name,
  player1Choice,
  player2Choice,
  result,
  onNextRound,
  isFinalRound = false,
  isLoading = false,
}) => {
  const p1Meta = getChoiceMetadata(player1Choice);
  const p2Meta = getChoiceMetadata(player2Choice);
  const winnerBadge = getWinnerBadge(result, player1Name, player2Name);

  return (
    <div className="card round-result-card">
      <div className="result-header">
        <span className="result-round-tag">ROUND {currentRound} RESULT</span>
      </div>

      <div className="choices-summary">
        <div className="choice-display p1-choice-box">
          <span className="choice-display-emoji">{p1Meta.emoji}</span>
          <span className="choice-display-player p1-color">{player1Name}</span>
          <span className="choice-display-name">{p1Meta.label.toUpperCase()}</span>
        </div>

        <div className="vs-circle">VS</div>

        <div className="choice-display p2-choice-box">
          <span className="choice-display-emoji">{p2Meta.emoji}</span>
          <span className="choice-display-player p2-color">{player2Name}</span>
          <span className="choice-display-name">{p2Meta.label.toUpperCase()}</span>
        </div>
      </div>

      <div className="winner-announcement-container">
        <div className={`winner-announce ${winnerBadge.class}`}>
          <span className="announce-emoji">{winnerBadge.emoji}</span>
          <span className="announce-text">
            {result === 'tie' || result === 'Match Draw'
              ? 'Round Ended in a Tie!'
              : `${result === 'player1' || result === player1Name ? player1Name : player2Name} Wins This Round!`}
          </span>
        </div>
      </div>

      <div className="action-footer">
        <button
          type="button"
          className="btn btn-primary btn-full btn-large"
          onClick={onNextRound}
          disabled={isLoading}
        >
          {isLoading
            ? 'Processing...'
            : isFinalRound
            ? '🏆 VIEW FINAL RESULT'
            : '➡️ NEXT ROUND'}
        </button>
      </div>
    </div>
  );
};

export default RoundResult;
