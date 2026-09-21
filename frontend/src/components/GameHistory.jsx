import React from 'react';
import { getWinnerBadge } from '../utils/gameLogic';

const GameHistory = ({ games = [], onSelectGame, onStartNewGame }) => {
  if (!games || games.length === 0) {
    return (
      <div className="card empty-history text-center">
        <div className="empty-icon">🎮</div>
        <h3>No Game History Found</h3>
        <p className="empty-subtitle">
          Play a 6-round match with a friend to record your scores in MySQL database!
        </p>
        <button
          type="button"
          className="btn btn-primary btn-large"
          onClick={onStartNewGame}
        >
          🚀 Start New Game
        </button>
      </div>
    );
  }

  return (
    <div className="history-table-container">
      {/* Desktop Table View */}
      <table className="history-table">
        <thead>
          <tr>
            <th>Game #</th>
            <th>Player 1</th>
            <th>Player 2</th>
            <th>Score (P1 - P2 - Ties)</th>
            <th>Winner</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game, idx) => {
            const winnerBadge = getWinnerBadge(
              game.winner,
              game.player1_name,
              game.player2_name
            );
            const dateStr = game.created_at
              ? new Date(game.created_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'N/A';

            return (
              <tr key={game.id || idx} className="history-row" onClick={() => onSelectGame(game.id)}>
                <td className="game-id-cell">Game #{game.id}</td>
                <td className="p1-cell">{game.player1_name}</td>
                <td className="p2-cell">{game.player2_name}</td>
                <td className="score-cell">
                  <span className="p1-color">{game.player1_score}</span> -{' '}
                  <span className="p2-color">{game.player2_score}</span>{' '}
                  <span className="ties-dim">({game.ties} ties)</span>
                </td>
                <td>
                  <span className={`winner-pill ${winnerBadge.class}`}>
                    {winnerBadge.emoji} {game.winner}
                  </span>
                </td>
                <td className="date-cell">{dateStr}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectGame(game.id);
                    }}
                  >
                    🔍 Details
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Mobile Card List View */}
      <div className="mobile-history-cards">
        {games.map((game, idx) => {
          const winnerBadge = getWinnerBadge(
            game.winner,
            game.player1_name,
            game.player2_name
          );
          const dateStr = game.created_at
            ? new Date(game.created_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : 'N/A';

          return (
            <div
              key={`m-${game.id || idx}`}
              className="history-mobile-card"
              onClick={() => onSelectGame(game.id)}
            >
              <div className="mobile-card-header">
                <span className="mobile-game-id">Game #{game.id}</span>
                <span className="mobile-date">{dateStr}</span>
              </div>
              <div className="mobile-players">
                <span className="p1-color">{game.player1_name} ({game.player1_score})</span>
                <span className="vs-tag">VS</span>
                <span className="p2-color">{game.player2_name} ({game.player2_score})</span>
              </div>
              <div className="mobile-card-footer">
                <span className={`winner-pill ${winnerBadge.class}`}>
                  🏆 {game.winner}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectGame(game.id);
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GameHistory;
