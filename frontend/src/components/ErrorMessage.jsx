import React from 'react';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="error-card">
      <div className="error-icon">⚠️</div>
      <div className="error-content">
        <h4>An error occurred</h4>
        <p>{message || 'Something went wrong. Please try again.'}</p>
      </div>
      {onRetry && (
        <button type="button" className="btn btn-secondary" onClick={onRetry}>
          🔄 Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
