import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <header className="navbar-header">
      <div className="navbar-brand">
        <NavLink to="/" className="brand-link">
          <span className="brand-icon">🪨📄✂️</span>
          <span className="brand-text">STONE PAPER SCISSORS</span>
        </NavLink>
      </div>
      <nav className="navbar-links">
        <NavLink
          to="/"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          🎮 New Game
        </NavLink>
        <NavLink
          to="/history"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          📜 Game History
        </NavLink>
      </nav>
    </header>
  );
};

export default Navbar;
