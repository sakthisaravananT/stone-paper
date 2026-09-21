import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

export const gameApi = {
  // POST /api/games
  createGame: async (player1Name, player2Name) => {
    const response = await api.post('/games', {
      player1_name: player1Name,
      player2_name: player2Name,
    });
    return response.data;
  },

  // POST /api/games/{game_id}/rounds
  submitRound: async (gameId, roundNumber, player1Choice, player2Choice) => {
    const response = await api.post(`/games/${gameId}/rounds`, {
      round_number: roundNumber,
      player1_choice: player1Choice,
      player2_choice: player2Choice,
    });
    return response.data;
  },

  // POST /api/games/{game_id}/complete
  completeGame: async (gameId) => {
    const response = await api.post(`/games/${gameId}/complete`);
    return response.data;
  },

  // GET /api/games
  getGameHistory: async () => {
    const response = await api.get('/games');
    return response.data;
  },

  // GET /api/games/{game_id}
  getGameDetails: async (gameId) => {
    const response = await api.get(`/games/${gameId}`);
    return response.data;
  },
};

export default api;
