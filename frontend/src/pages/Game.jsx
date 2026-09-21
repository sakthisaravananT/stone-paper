import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ScoreBoard from '../components/ScoreBoard';
import PlayerSelection from '../components/PlayerSelection';
import PassDeviceScreen from '../components/PassDeviceScreen';
import RoundResult from '../components/RoundResult';
import FinalResult from '../components/FinalResult';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { gameApi } from '../services/api';

const Game = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [gameInfo, setGameInfo] = useState(() => {
    return location.state || null;
  });

  const [isLoading, setIsLoading] = useState(!location.state);
  const [error, setError] = useState(null);

  // Turn state machine: "p1_select" | "pass_device" | "p2_select" | "submitting" | "reveal" | "final_result"
  const [currentTurn, setCurrentTurn] = useState("p1_select");
  const [currentRound, setCurrentRound] = useState(1);

  const [p1Choice, setP1Choice] = useState("");
  const [p2Choice, setP2Choice] = useState("");
  const [lastRoundResult, setLastRoundResult] = useState(null);

  // Running scores
  const [scores, setScores] = useState({
    p1: 0,
    p2: 0,
    ties: 0,
  });

  // Final completed game object from backend
  const [completedGameData, setCompletedGameData] = useState(null);

  // Load game info from backend if accessed directly via URL /game/:gameId
  useEffect(() => {
    const fetchGame = async () => {
      if (!gameId) return;
      try {
        setIsLoading(true);
        const data = await gameApi.getGameDetails(gameId);
        setGameInfo({
          gameId: data.id,
          player1Name: data.player1_name,
          player2Name: data.player2_name,
        });

        // Sync existing rounds if resuming game
        if (data.rounds && data.rounds.length > 0) {
          const roundsCompleted = data.rounds.length;
          let p1S = 0, p2S = 0, tS = 0;
          data.rounds.forEach((r) => {
            if (r.result === 'player1') p1S += 1;
            else if (r.result === 'player2') p2S += 1;
            else if (r.result === 'tie') tS += 1;
          });
          setScores({ p1: p1S, p2: p2S, ties: tS });

          if (data.is_completed || roundsCompleted >= 6) {
            setCompletedGameData(data);
            setCurrentTurn("final_result");
          } else {
            setCurrentRound(roundsCompleted + 1);
            setCurrentTurn("p1_select");
          }
        }
      } catch (err) {
        console.error('Failed to fetch game details:', err);
        setError('Invalid game ID or game server unavailable.');
      } finally {
        setIsLoading(false);
      }
    };

    if (!gameInfo && gameId) {
      fetchGame();
    }
  }, [gameId, gameInfo]);

  if (isLoading) return <LoadingSpinner message="Loading match details..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => navigate('/')} />;
  if (!gameInfo) return null;

  const { player1Name, player2Name } = gameInfo;

  // STEP 1: Player 1 selects move privately
  const handleP1Select = (choice) => {
    setP1Choice(choice);
    setCurrentTurn("pass_device");
  };

  // STEP 2: Transition screen pass device
  const handleContinueToP2 = () => {
    setCurrentTurn("p2_select");
  };

  // STEP 3: Player 2 selects move privately -> submit choices to backend
  const handleP2Select = async (choice) => {
    setP2Choice(choice);
    setCurrentTurn("submitting");
    setError(null);

    try {
      // Backend calculates winner strictly
      const roundRes = await gameApi.submitRound(
        gameId,
        currentRound,
        p1Choice,
        choice
      );

      setLastRoundResult(roundRes);

      // Update live score display
      let newP1 = scores.p1;
      let newP2 = scores.p2;
      let newTies = scores.ties;

      if (roundRes.result === 'player1') newP1 += 1;
      else if (roundRes.result === 'player2') newP2 += 1;
      else if (roundRes.result === 'tie') newTies += 1;

      setScores({ p1: newP1, p2: newP2, ties: newTies });
      setCurrentTurn("reveal");
    } catch (err) {
      console.error('Failed to submit round choices:', err);
      const msg = err.response?.data?.detail || 'Failed to submit round to server.';
      setError(msg);
      setCurrentTurn("p2_select");
    }
  };

  // STEP 4: Next round or complete game after Round 6
  const handleNextRound = async () => {
    if (currentRound < 6) {
      // Move to next round
      setCurrentRound((prev) => prev + 1);
      setP1Choice('');
      setP2Choice('');
      setLastRoundResult(null);
      setCurrentTurn("p1_select");
    } else {
      // Complete game after Round 6
      setIsLoading(true);
      try {
        const finalData = await gameApi.completeGame(gameId);
        setCompletedGameData(finalData);
        setCurrentTurn("final_result");
      } catch (err) {
        console.error('Failed to complete game:', err);
        setError('Failed to finalize game records on server.');
      } finally {
        setIsLoading(false);
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
      {/* Top Header & Scoreboard */}
      {currentTurn !== "final_result" && (
        <ScoreBoard
          player1Name={player1Name}
          player2Name={player2Name}
          player1Score={scores.p1}
          player2Score={scores.p2}
          ties={scores.ties}
          currentRound={currentRound}
          maxRounds={6}
        />
      )}

      {/* STATE 1: PLAYER 1 SELECTION */}
      {currentTurn === "p1_select" && (
        <PlayerSelection
          playerName={player1Name}
          playerNumber={1}
          currentRound={currentRound}
          onSelectChoice={handleP1Select}
        />
      )}

      {/* STATE 2: PASS DEVICE SCREEN */}
      {currentTurn === "pass_device" && (
        <PassDeviceScreen
          player1Name={player1Name}
          player2Name={player2Name}
          onContinue={handleContinueToP2}
        />
      )}

      {/* STATE 3: PLAYER 2 SELECTION */}
      {currentTurn === "p2_select" && (
        <PlayerSelection
          playerName={player2Name}
          playerNumber={2}
          currentRound={currentRound}
          onSelectChoice={handleP2Select}
        />
      )}

      {/* STATE 4: SUBMITTING TO BACKEND */}
      {currentTurn === "submitting" && (
        <LoadingSpinner message="Evaluating round winner on server..." />
      )}

      {/* STATE 5: REVEAL ROUND RESULT */}
      {currentTurn === "reveal" && lastRoundResult && (
        <RoundResult
          currentRound={currentRound}
          player1Name={player1Name}
          player2Name={player2Name}
          player1Choice={p1Choice}
          player2Choice={p2Choice}
          result={lastRoundResult.result}
          onNextRound={handleNextRound}
          isFinalRound={currentRound === 6}
          isLoading={isLoading}
        />
      )}

      {/* STATE 6: FINAL RESULT (GAME COMPLETED) */}
      {currentTurn === "final_result" && completedGameData && (
        <FinalResult
          gameData={completedGameData}
          onPlayAgain={handlePlayAgain}
          onViewHistory={handleViewHistory}
        />
      )}
    </div>
  );
};

export default Game;
