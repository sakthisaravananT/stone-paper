import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GameHistory from '../components/GameHistory';
import GameDetails from '../components/GameDetails';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { gameApi } from '../services/api';

const History = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await gameApi.getGameHistory();
      setGames(data || []);
    } catch (err) {
      console.error('Failed to fetch game history:', err);
      setError('Unable to load game history from server. Ensure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSelectGame = async (gameId) => {
    setIsDetailsLoading(true);
    try {
      const gameDetails = await gameApi.getGameDetails(gameId);
      setSelectedGame(gameDetails);
    } catch (err) {
      console.error('Failed to fetch game details:', err);
      alert('Could not fetch details for this game.');
    } finally {
      setIsDetailsLoading(false);
    }
  };

  return (
    <div className="history-page-container">
      <div className="history-page-header">
        <div>
          <h1 className="history-title">📜 Game History</h1>
          <p className="history-subtitle">
            All completed 6-round matches stored in database
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={fetchHistory}
          disabled={isLoading}
        >
          🔄 Refresh
        </button>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Fetching game history from database..." />
      ) : error ? (
        <ErrorMessage message={error} onRetry={fetchHistory} />
      ) : (
        <GameHistory
          games={games}
          onSelectGame={handleSelectGame}
          onStartNewGame={() => navigate('/')}
        />
      )}

      {/* Game Details Modal */}
      {isDetailsLoading && <LoadingSpinner message="Loading match breakdown..." />}
      {selectedGame && (
        <GameDetails
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
        />
      )}
    </div>
  );
};

export default History;
