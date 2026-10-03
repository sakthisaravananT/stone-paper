import React, { useReducer, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ScoreBoard from '../components/ScoreBoard';
import PlayerSelection from '../components/PlayerSelection';
import PassDeviceScreen from '../components/PassDeviceScreen';
import RoundResult from '../components/RoundResult';
import FinalResult from '../components/FinalResult';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { gameApi } from '../services/api';

// Initial state factory using optional location.state
const getInitialState = (locationState) => ({
  gameInfo: locationState
    ? {
        gameId: locationState.gameId,
        player1Name: locationState.player1Name,
        player2Name: locationState.player2Name,
      }
    : null,
  isLoading: true,
  error: null,
  // Turn state machine: "p1_select" | "pass_device" | "p2_select" | "submitting" | "reveal" | "final_result"
  currentTurn: 'p1_select',
  currentRound: 1,
  p1Choice: '',
  p2Choice: '',
  lastRoundResult: null,
  scores: {
    p1: 0,
    p2: 0,
    ties: 0,
  },
  completedGameData: null,
});

function gameReducer(state, action) {
  switch (action.type) {
    case 'FETCH_GAME_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'GAME_SYNCED': {
      const { gameData, completedData, isCompleted } = action.payload;
      const rounds = gameData.rounds || [];
      let p1 = 0;
      let p2 = 0;
      let ties = 0;

      rounds.forEach((r) => {
        if (r.result === 'player1') p1 += 1;
        else if (r.result === 'player2') p2 += 1;
        else if (r.result === 'tie') ties += 1;
      });

      const gameInfo = {
        gameId: gameData.id,
        player1Name: gameData.player1_name,
        player2Name: gameData.player2_name,
      };

      if (isCompleted || rounds.length >= 6) {
        return {
          ...state,
          gameInfo,
          scores: { p1, p2, ties },
          currentRound: 6,
          currentTurn: 'final_result',
          completedGameData: completedData || gameData,
          isLoading: false,
          error: null,
        };
      }

      return {
        ...state,
        gameInfo,
        scores: { p1, p2, ties },
        currentRound: rounds.length + 1,
        currentTurn: 'p1_select',
        p1Choice: '',
        p2Choice: '',
        lastRoundResult: null,
        completedGameData: null,
        isLoading: false,
        error: null,
      };
    }

    case 'FETCH_GAME_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case 'P1_SELECT':
      return {
        ...state,
        p1Choice: action.payload,
        currentTurn: 'pass_device',
      };

    case 'CONTINUE_TO_P2':
      return {
        ...state,
        currentTurn: 'p2_select',
      };

    case 'SUBMIT_ROUND_START':
      return {
        ...state,
        p2Choice: action.payload,
        currentTurn: 'submitting',
        error: null,
      };

    case 'SUBMIT_ROUND_SUCCESS': {
      const roundRes = action.payload;
      let newP1 = state.scores.p1;
      let newP2 = state.scores.p2;
      let newTies = state.scores.ties;

      if (roundRes.result === 'player1') newP1 += 1;
      else if (roundRes.result === 'player2') newP2 += 1;
      else if (roundRes.result === 'tie') newTies += 1;

      return {
        ...state,
        scores: { p1: newP1, p2: newP2, ties: newTies },
        lastRoundResult: roundRes,
        currentTurn: 'reveal',
        isLoading: false,
        error: null,
      };
    }

    case 'SUBMIT_ROUND_ERROR':
      return {
        ...state,
        currentTurn: 'p2_select',
        error: action.payload,
      };

    case 'NEXT_ROUND':
      return {
        ...state,
        currentRound: state.currentRound + 1,
        p1Choice: '',
        p2Choice: '',
        lastRoundResult: null,
        currentTurn: 'p1_select',
      };

    case 'FINALIZE_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'FINALIZE_SUCCESS':
      return {
        ...state,
        completedGameData: action.payload,
        currentTurn: 'final_result',
        isLoading: false,
        error: null,
      };

    case 'FINALIZE_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

const Game = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [state, dispatch] = useReducer(gameReducer, location.state, getInitialState);

  // Sync game state from backend on mount or when gameId changes
  useEffect(() => {
    let isMounted = true;

    const syncGameState = async () => {
      if (!gameId) return;
      dispatch({ type: 'FETCH_GAME_START' });

      try {
        const data = await gameApi.getGameDetails(gameId);
        if (!isMounted) return;

        const rounds = data.rounds || [];
        const roundsCompleted = rounds.length;
        const isCompleted = Boolean(data.is_completed || roundsCompleted >= 6);

        let completedData = null;
        if (isCompleted) {
          if (data.is_completed) {
            completedData = data;
          } else {
            completedData = await gameApi.completeGame(gameId);
          }
        }

        if (!isMounted) return;

        dispatch({
          type: 'GAME_SYNCED',
          payload: {
            gameData: data,
            completedData,
            isCompleted,
          },
        });
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to sync game state:', err);
        const msg =
          err.response?.data?.detail ||
          err.message ||
          'Unable to load game details from server.';
        dispatch({ type: 'FETCH_GAME_ERROR', payload: msg });
      }
    };

    syncGameState();

    return () => {
      isMounted = false;
    };
  }, [gameId]);

  if (state.isLoading && !state.gameInfo) {
    return <LoadingSpinner message="Loading match details..." />;
  }

  if (state.error && !state.gameInfo) {
    return <ErrorMessage message={state.error} onRetry={() => navigate('/')} />;
  }

  if (!state.gameInfo) {
    return null;
  }

  const { player1Name, player2Name } = state.gameInfo;

  // STEP 1: Player 1 selects move privately
  const handleP1Select = (choice) => {
    dispatch({ type: 'P1_SELECT', payload: choice });
  };

  // STEP 2: Transition screen pass device
  const handleContinueToP2 = () => {
    dispatch({ type: 'CONTINUE_TO_P2' });
  };

  // STEP 3: Player 2 selects move privately -> submit choices to backend
  const handleP2Select = async (choice) => {
    dispatch({ type: 'SUBMIT_ROUND_START', payload: choice });

    try {
      // Backend calculates winner strictly
      const roundRes = await gameApi.submitRound(
        gameId,
        state.currentRound,
        state.p1Choice,
        choice
      );

      dispatch({ type: 'SUBMIT_ROUND_SUCCESS', payload: roundRes });
    } catch (err) {
      console.error('Failed to submit round choices:', err);
      const msg =
        err.response?.data?.detail ||
        err.message ||
        'Failed to submit round to server.';
      dispatch({ type: 'SUBMIT_ROUND_ERROR', payload: msg });
    }
  };

  // STEP 4: Next round or complete game after Round 6
  const handleNextRound = async () => {
    if (state.currentRound < 6) {
      // Move to next round
      dispatch({ type: 'NEXT_ROUND' });
    } else {
      // Complete game after Round 6
      dispatch({ type: 'FINALIZE_START' });
      try {
        const finalData = await gameApi.completeGame(gameId);
        dispatch({ type: 'FINALIZE_SUCCESS', payload: finalData });
      } catch (err) {
        console.error('Failed to complete game:', err);
        const msg =
          err.response?.data?.detail ||
          err.message ||
          'Failed to finalize game records on server.';
        dispatch({ type: 'FINALIZE_ERROR', payload: msg });
      }
    }
  };

  const handlePlayAgain = () => {
    navigate('/');
  };

  const handleViewHistory = () => {
    navigate('/history');
  };

  return (
    <div className="game-screen-container">
      {state.error && (
        <ErrorMessage
          message={state.error}
          onRetry={() => dispatch({ type: 'CLEAR_ERROR' })}
        />
      )}

      {/* Top Header & Scoreboard */}
      {state.currentTurn !== 'final_result' && (
        <ScoreBoard
          player1Name={player1Name}
          player2Name={player2Name}
          player1Score={state.scores.p1}
          player2Score={state.scores.p2}
          ties={state.scores.ties}
          currentRound={state.currentRound}
          maxRounds={6}
        />
      )}

      {/* STATE 1: PLAYER 1 SELECTION */}
      {state.currentTurn === 'p1_select' && (
        <PlayerSelection
          playerName={player1Name}
          playerNumber={1}
          currentRound={state.currentRound}
          onSelectChoice={handleP1Select}
        />
      )}

      {/* STATE 2: PASS DEVICE SCREEN */}
      {state.currentTurn === 'pass_device' && (
        <PassDeviceScreen
          player1Name={player1Name}
          player2Name={player2Name}
          onContinue={handleContinueToP2}
        />
      )}

      {/* STATE 3: PLAYER 2 SELECTION */}
      {state.currentTurn === 'p2_select' && (
        <PlayerSelection
          playerName={player2Name}
          playerNumber={2}
          currentRound={state.currentRound}
          onSelectChoice={handleP2Select}
        />
      )}

      {/* STATE 4: SUBMITTING TO BACKEND */}
      {state.currentTurn === 'submitting' && (
        <LoadingSpinner message="Evaluating round winner on server..." />
      )}

      {/* STATE 5: REVEAL ROUND RESULT */}
      {state.currentTurn === 'reveal' && state.lastRoundResult && (
        <RoundResult
          currentRound={state.currentRound}
          player1Name={player1Name}
          player2Name={player2Name}
          player1Choice={state.p1Choice}
          player2Choice={state.p2Choice}
          result={state.lastRoundResult.result}
          onNextRound={handleNextRound}
          isFinalRound={state.currentRound === 6}
          isLoading={state.isLoading}
        />
      )}

      {/* STATE 6: FINAL RESULT (GAME COMPLETED) */}
      {state.currentTurn === 'final_result' && state.completedGameData && (
        <FinalResult
          gameData={state.completedGameData}
          onPlayAgain={handlePlayAgain}
          onViewHistory={handleViewHistory}
        />
      )}
    </div>
  );
};

export default Game;
