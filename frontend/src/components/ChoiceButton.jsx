import React from 'react';

const ChoiceButton = ({ choice, playerNumber = 1, onSelect, isDisabled = false }) => {
  const pClass = playerNumber === 1 ? 'choice-btn-p1' : 'choice-btn-p2';

  return (
    <button
      type="button"
      className={`choice-btn ${pClass}`}
      onClick={() => onSelect(choice.id)}
      disabled={isDisabled}
      aria-label={`Select ${choice.label}`}
    >
      <span className="choice-emoji">{choice.emoji}</span>
      <span className="choice-label">{choice.label.toUpperCase()}</span>
    </button>
  );
};

export default ChoiceButton;
