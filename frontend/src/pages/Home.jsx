import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerSetup from '../components/PlayerSetup';
import ErrorMessage from '../components/ErrorMessage';
import { gameApi } from '../services/api';

const Home = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleStartGame = async (p1Name, p2Name) => {
    setIsLoading(true);
    setError(null);

    try {
      // Create new game session in backend database
      const data = await gameApi.createGame(p1Name, p2Name);
      if (data && data.game_id) {
        navigate(`/game/${data.game_id}`, {
          state: {
            gameId: data.game_id,
            player1Name: data.player1_name,
            player2Name: data.player2_name,
          },
        });
      } else {
        throw new Error('Invalid game creation response from server.');
      }
    } catch (err) {
      console.error('Failed to create game session:', err);
      const msg =
        err.response?.data?.detail ||
        err.message ||
        'Unable to connect to game server. Please ensure the backend is running.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="home-page-container">
      {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}
      <PlayerSetup onStartGame={handleStartGame} isLoading={isLoading} />
    </div>
  );
};

export default Home;
