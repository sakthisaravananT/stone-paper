/**
 * Game logic utility functions for 2-Player Stone Paper Scissors.
 */

// Choice definitions with emojis and labels
export const CHOICES = [
  { id: "stone", label: "Stone", emoji: "🪨" },
  { id: "paper", label: "Paper", emoji: "📄" },
  { id: "scissors", label: "Scissors", emoji: "✂️" },
];

/**
 * Determines the round winner based on standard Stone Paper Scissors rules.
 * 
 * Rules:
 * - Stone beats Scissors
 * - Scissors beats Paper
 * - Paper beats Stone
 * - Same selection = Tie
 * 
 * @param {string} player1Choice - "stone", "paper", or "scissors"
 * @param {string} player2Choice - "stone", "paper", or "scissors"
 * @returns {"player1" | "player2" | "tie"}
 */
export function determineWinner(player1Choice, player2Choice) {
  if (!player1Choice || !player2Choice) return null;

  const p1 = player1Choice.toLowerCase();
  const p2 = player2Choice.toLowerCase();

  if (p1 === p2) {
    return "tie";
  }

  if (
    (p1 === "stone" && p2 === "scissors") ||
    (p1 === "scissors" && p2 === "paper") ||
    (p1 === "paper" && p2 === "stone")
  ) {
    return "player1";
  }

  return "player2";
}

/**
 * Returns helper details for a given choice key.
 * @param {string} choiceKey 
 * @returns {{ label: string, emoji: string }}
 */
export function getChoiceMetadata(choiceKey) {
  if (!choiceKey) return { label: "-", emoji: "❓" };
  const choice = CHOICES.find((c) => c.id === choiceKey.toLowerCase());
  return choice || { label: choiceKey, emoji: "❓" };
}

/**
 * Determines the overall match winner name based on scores.
 * @param {number} p1Score 
 * @param {number} p2Score 
 * @param {string} p1Name 
 * @param {string} p2Name 
 * @returns {string} - Winner name or "Match Draw"
 */
export function calculateOverallWinner(p1Score, p2Score, p1Name = "Player 1", p2Name = "Player 2") {
  if (p1Score > p2Score) return p1Name;
  if (p2Score > p1Score) return p2Name;
  return "Match Draw";
}

/**
 * Formats a winner display string for round or final match.
 */
export function getWinnerBadge(winner, p1Name, p2Name) {
  if (winner === "player1") return { text: `${p1Name} Wins`, class: "p1-win", emoji: "🏆" };
  if (winner === "player2") return { text: `${p2Name} Wins`, class: "p2-win", emoji: "🏆" };
  if (winner === "tie" || winner === "Match Draw") return { text: "Match Draw / Tie", class: "tie-win", emoji: "🤝" };
  if (winner === p1Name) return { text: `${p1Name} Wins`, class: "p1-win", emoji: "🏆" };
  if (winner === p2Name) return { text: `${p2Name} Wins`, class: "p2-win", emoji: "🏆" };
  return { text: "Match Draw", class: "tie-win", emoji: "🤝" };
}
