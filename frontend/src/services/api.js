import axios from 'axios';
import { determineWinner, calculateOverallWinner } from '../utils/gameLogic';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 3000,
});

// Helper for local storage simulation (for static hosts like GitHub Pages)
const getLocalGames = () => {
  try {
    return JSON.parse(localStorage.getItem('sps_games') || '[]');
  } catch {
    return [];
  }
};

const saveLocalGames = (games) => {
  try {
    localStorage.setItem('sps_games', JSON.stringify(games));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
};

export const gameApi = {
  // POST /api/games
  createGame: async (player1Name, player2Name) => {
    try {
      const response = await api.post('/games', {
        player1_name: player1Name,
        player2_name: player2Name,
      });
      return response.data;
    } catch (err) {
      if (!err.response) {
        // Backend is not reachable (e.g. GitHub Pages static demo)
        const id = Date.now();
        const fallbackGame = {
          id: id,
          game_id: id,
          player1_name: player1Name,
          player2_name: player2Name,
          player1_score: 0,
          player2_score: 0,
          ties: 0,
          winner: 'In Progress',
          is_completed: false,
          created_at: new Date().toISOString(),
          rounds: [],
        };
        const list = getLocalGames();
        list.unshift(fallbackGame);
        saveLocalGames(list);
        return fallbackGame;
      }
      throw err;
    }
  },

  // POST /api/games/{game_id}/rounds
  submitRound: async (gameId, roundNumber, player1Choice, player2Choice) => {
    try {
      const response = await api.post(`/games/${gameId}/rounds`, {
        round_number: roundNumber,
        player1_choice: player1Choice,
        player2_choice: player2Choice,
      });
      return response.data;
    } catch (err) {
      if (!err.response) {
        const list = getLocalGames();
        const game = list.find((g) => String(g.id) === String(gameId));
        const res = determineWinner(player1Choice, player2Choice);

        const newRound = {
          id: Date.now(),
          game_id: Number(gameId),
          round_number: roundNumber,
          player1_choice: player1Choice,
          player2_choice: player2Choice,
          result: res,
          created_at: new Date().toISOString(),
        };

        if (game) {
          game.rounds = game.rounds || [];
          game.rounds.push(newRound);
          if (res === 'player1') game.player1_score += 1;
          else if (res === 'player2') game.player2_score += 1;
          else if (res === 'tie') game.ties += 1;
          saveLocalGames(list);
        }

        return newRound;
      }
      throw err;
    }
  },

  // POST /api/games/{game_id}/complete
  completeGame: async (gameId) => {
    try {
      const response = await api.post(`/games/${gameId}/complete`);
      return response.data;
    } catch (err) {
      if (!err.response) {
        const list = getLocalGames();
        const game = list.find((g) => String(g.id) === String(gameId));
        if (game) {
          game.is_completed = true;
          game.winner = calculateOverallWinner(
            game.player1_score,
            game.player2_score,
            game.player1_name,
            game.player2_name
          );
          saveLocalGames(list);
          return game;
        }
      }
      throw err;
    }
  },

  // GET /api/games
  getGameHistory: async () => {
    try {
      const response = await api.get('/games');
      return response.data;
    } catch (err) {
      if (!err.response) {
        return getLocalGames();
      }
      throw err;
    }
  },

  // GET /api/games/{game_id}
  getGameDetails: async (gameId) => {
    try {
      const response = await api.get(`/games/${gameId}`);
      return response.data;
    } catch (err) {
      if (!err.response) {
        const list = getLocalGames();
        const game = list.find((g) => String(g.id) === String(gameId));
        if (game) return game;
      }
      throw err;
    }
  },
};

export default api;
