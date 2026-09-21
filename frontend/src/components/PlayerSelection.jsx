import React from 'react';
import ChoiceButton from './ChoiceButton';
import { CHOICES } from '../utils/gameLogic';

const PlayerSelection = ({ playerName, playerNumber = 1, currentRound = 1, onSelectChoice }) => {
  const badgeClass = playerNumber === 1 ? 'p1-badge' : 'p2-badge';
  const nameColor = playerNumber === 1 ? 'var(--player1-color)' : 'var(--player2-color)';

  return (
    <div className="card turn-card">
      <div className={`turn-badge ${badgeClass}`}>
        ROUND {currentRound} OF 6 &bull; PLAYER {playerNumber} TURN
      </div>
      <h2 style={{ color: nameColor, margin: '0.75rem 0 0.25rem' }}>
        👤 {playerName} — Make Your Choice
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
        Select your move privately.
      </p>

      <div className="choices-grid">
        {CHOICES.map((choice) => (
          <ChoiceButton
            key={`p${playerNumber}-${choice.id}`}
            choice={choice}
            playerNumber={playerNumber}
            onSelect={onSelectChoice}
          />
        ))}
      </div>
    </div>
  );
};

export default PlayerSelection;
