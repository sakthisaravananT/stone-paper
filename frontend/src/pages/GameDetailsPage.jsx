import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GameDetails from '../components/GameDetails';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { gameApi } from '../services/api';

const GameDetailsPage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGame = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await gameApi.getGameDetails(gameId);
        setGame(data);
      } catch (err) {
        console.error('Failed to load game details:', err);
        setError(`Match #${gameId} not found or server is offline.`);
      } finally {
        setIsLoading(false);
      }
    };

    if (gameId) {
      fetchGame();
    }
  }, [gameId]);

  if (isLoading) return <LoadingSpinner message="Loading match details..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => navigate('/history')} />;

  return (
    <div className="game-details-page-container">
      <button
        type="button"
        className="btn btn-secondary mb-4"
        onClick={() => navigate('/history')}
      >
        ⬅️ Back to Game History
      </button>

      {game && (
        <GameDetails game={game} onClose={() => navigate('/history')} />
      )}
    </div>
  );
};

export default GameDetailsPage;
