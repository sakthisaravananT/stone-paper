import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Game from './pages/Game';
import History from './pages/History';
import GameDetailsPage from './pages/GameDetailsPage';

function App() {
  return (
    <div className="app-layout">
      <Navbar />

      <main className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/game/:gameId" element={<Game />} />
          <Route path="/history" element={<History />} />
          <Route path="/history/:gameId" element={<GameDetailsPage />} />
        </Routes>
      </main>

      <footer className="footer">
        <p>Stone Paper Scissors 2-Player Game &bull; Built with React & FastAPI</p>
      </footer>
    </div>
  );
}

export default App;
