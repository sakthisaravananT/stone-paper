import React from 'react';

const ScoreBoard = ({
  player1Name,
  player2Name,
  player1Score = 0,
  player2Score = 0,
  ties = 0,
  currentRound = 1,
  maxRounds = 6,
}) => {
  return (
    <div className="scoreboard-card">
      <div className="scoreboard-header">
        <div className="game-small-title">STONE PAPER SCISSORS</div>
        <div className="round-badge">
          Round {currentRound} / {maxRounds}
        </div>
      </div>

      <div className="scoreboard-main">
        <div className="player-score-box p1-box">
          <span className="player-name p1-color">👤 {player1Name || 'Player 1'}</span>
          <span className="player-score p1-color">{player1Score}</span>
        </div>

        <div className="tie-score-box">
          <span className="tie-label">Ties</span>
          <span className="tie-score">{ties}</span>
        </div>

        <div className="player-score-box p2-box">
          <span className="player-name p2-color">👤 {player2Name || 'Player 2'}</span>
          <span className="player-score p2-color">{player2Score}</span>
        </div>
      </div>
    </div>
  );
};

export default ScoreBoard;
