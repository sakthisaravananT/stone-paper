import React from 'react';

const PassDeviceScreen = ({ player1Name, player2Name, onContinue }) => {
  return (
    <div className="card pass-card">
      <div className="status-badge-success">
        ✓ CHOICE LOCKED & HIDDEN
      </div>
      <h2 className="pass-title">
        📱 Pass the device to {player2Name}
      </h2>
      <p className="pass-text">
        <strong>{player1Name}</strong> has made their choice.
        Please hand the device to <strong>{player2Name}</strong> without revealing the selected option.
      </p>

      <button
        type="button"
        className="btn btn-primary btn-full btn-large"
        onClick={onContinue}
      >
        ➡️ Continue to {player2Name}'s Turn
      </button>
    </div>
  );
};

export default PassDeviceScreen;
