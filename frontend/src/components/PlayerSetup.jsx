import React, { useState } from 'react';

const PlayerSetup = ({ onStartGame, isLoading }) => {
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedP1 = player1Name.trim();
    const trimmedP2 = player2Name.trim();

    if (!trimmedP1 || !trimmedP2) {
      setErrorMsg('Please enter valid names for both Player 1 and Player 2.');
      return;
    }

    if (trimmedP1.toLowerCase() === trimmedP2.toLowerCase()) {
      setErrorMsg('Player 1 and Player 2 must have distinct names.');
      return;
    }

    onStartGame(trimmedP1, trimmedP2);
  };

  return (
    <div className="card setup-card">
      <div className="setup-header">
        <div className="game-badge">STAGE 1 & 2 &bull; 2 PLAYERS</div>
        <h1 className="game-title">STONE PAPER SCISSORS</h1>
        <p className="game-subtitle">"Challenge your opponent. Win 6 rounds."</p>
      </div>

      {errorMsg && (
        <div className="validation-banner">
          <span>⚠️ {errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="setup-form">
        <div className="form-group">
          <label htmlFor="p1-name" className="input-label p1-label">
            👤 Player 1 Name
          </label>
          <input
            id="p1-name"
            type="text"
            className="input-field p1-input"
            placeholder="Enter Player 1 Name"
            value={player1Name}
            onChange={(e) => setPlayer1Name(e.target.value)}
            maxLength={30}
            disabled={isLoading}
            autoComplete="off"
          />
        </div>

        <div className="form-group">
          <label htmlFor="p2-name" className="input-label p2-label">
            👤 Player 2 Name
          </label>
          <input
            id="p2-name"
            type="text"
            className="input-field p2-input"
            placeholder="Enter Player 2 Name"
            value={player2Name}
            onChange={(e) => setPlayer2Name(e.target.value)}
            maxLength={30}
            disabled={isLoading}
            autoComplete="off"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-full btn-large"
          disabled={isLoading}
        >
          {isLoading ? '🎮 Starting Match...' : '🚀 START GAME'}
        </button>
      </form>
    </div>
  );
};

export default PlayerSetup;
