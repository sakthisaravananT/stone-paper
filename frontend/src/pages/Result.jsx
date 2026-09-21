import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RoundHistory from '../components/RoundHistory';
import { calculateOverallWinner, getWinnerBadge } from '../utils/gameLogic';

/**
 * Final Result screen displayed after completing all 6 rounds.
 */
const Result = ({ completedGame, onPlayAgain }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!completedGame) {
      navigate('/', { replace: true });
    }
  }, [completedGame, navigate]);

  if (!completedGame) return null;

  const {
    player1,
    player2,
    player1Score,
    player2Score,
    ties,
    winner,
    rounds = []
  } = completedGame;

  const winnerInfo = getWinnerBadge(winner, player1, player2);

  const handlePlayAgainClick = () => {
    onPlayAgain();
    navigate('/');
  };

  return (
    <div className="card result-container" style={{ maxWidth: '800px', margin: '1.5rem auto' }}>
      <h1 className="game-over-title">🎯 GAME OVER</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
        Completed 6 Rounds Match
      </p>

      {/* Winner Banner */}
      <div className="winner-banner">
        <div className="winner-banner-text">
          <span>{winnerInfo.emoji}</span>
          <span>{winnerInfo.text}!</span>
        </div>
      </div>

      {/* Scores Overview */}
      <div className="scores-overview">
        <div className="score-overview-box" style={{ borderColor: 'var(--player1-border)' }}>
          <div style={{ color: 'var(--player1-color)', fontWeight: 600, fontSize: '0.9rem' }}>
            {player1}
          </div>
          <div className="score-overview-val" style={{ color: 'var(--player1-color)' }}>
            {player1Score}
          </div>
        </div>

        <div className="score-overview-box" style={{ borderColor: 'var(--tie-border)' }}>
          <div style={{ color: 'var(--tie-color)', fontWeight: 600, fontSize: '0.9rem' }}>
            Ties
          </div>
          <div className="score-overview-val" style={{ color: 'var(--tie-color)' }}>
            {ties}
          </div>
        </div>

        <div className="score-overview-box" style={{ borderColor: 'var(--player2-border)' }}>
          <div style={{ color: 'var(--player2-color)', fontWeight: 600, fontSize: '0.9rem' }}>
            {player2}
          </div>
          <div className="score-overview-val" style={{ color: 'var(--player2-color)' }}>
            {player2Score}
          </div>
        </div>
      </div>

      {/* Round Breakdown Table */}
      <div style={{ textAlign: 'left', marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
          📋 Round Summary
        </h3>
        <RoundHistory rounds={rounds} p1Name={player1} p2Name={player2} />
      </div>

      {/* Action Buttons */}
      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handlePlayAgainClick}
          style={{ minWidth: '200px' }}
        >
          🔄 Play Again
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/history')}
        >
          📜 View History
        </button>
      </div>
    </div>
  );
};

export default Result;
