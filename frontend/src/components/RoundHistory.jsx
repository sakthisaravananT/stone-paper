import React from 'react';
import { getChoiceMetadata } from '../utils/gameLogic';

/**
 * Component to display a table of all 6 rounds with selections and round winners.
 */
const RoundHistory = ({ rounds = [], p1Name = 'Player 1', p2Name = 'Player 2' }) => {
  if (!rounds || rounds.length === 0) return null;

  const getResultTag = (winnerKey) => {
    if (winnerKey === 'player1') {
      return <span className="result-tag p1">{p1Name}</span>;
    }
    if (winnerKey === 'player2') {
      return <span className="result-tag p2">{p2Name}</span>;
    }
    return <span className="result-tag tie">Tie</span>;
  };

  return (
    <div className="table-responsive">
      <table className="summary-table">
        <thead>
          <tr>
            <th>Round</th>
            <th>{p1Name} Choice</th>
            <th>{p2Name} Choice</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {rounds.map((r, index) => {
            const p1Meta = getChoiceMetadata(r.player1Choice);
            const p2Meta = getChoiceMetadata(r.player2Choice);
            return (
              <tr key={index}>
                <td><strong>#{r.round || index + 1}</strong></td>
                <td>
                  <span>{p1Meta.emoji} {p1Meta.label}</span>
                </td>
                <td>
                  <span>{p2Meta.emoji} {p2Meta.label}</span>
                </td>
                <td>{getResultTag(r.winner)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default RoundHistory;
