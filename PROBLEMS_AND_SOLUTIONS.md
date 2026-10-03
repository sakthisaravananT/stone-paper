# Problems Faced & Solutions Guide

**Project**: Stone Paper Scissors — 2-Player Full-Stack Web Application  
**Tech Stack**: React (Vite) + FastAPI (Python) + AWS EC2 (Ubuntu 22.04) + AWS RDS (MySQL 8.0) + Nginx  

---

## 📌 Executive Summary

During the development and production deployment of this application, several technical challenges arose across **state management**, **data persistence**, and **AWS cloud infrastructure**. This document explains in simple, clear English what each problem was and exactly how we solved it.

---

## Part 1: Application Logic & State Management Problems

### Problem 1: Fragmented State with Multiple `useState` Hooks
- **What was the issue?**  
  The game required tracking player turns, private selections, round counts, live scores, round outcomes, and server communication. Managing this with 10 separate `useState` hooks caused scattered state updates, potential race conditions, and difficult debugging.
- **How we solved it:**  
  We replaced `useState` with React's **`useReducer`**. We centralized all game state into a single reducer function governed by clear, predictable actions (`FETCH_GAME_START`, `GAME_SYNCED`, `P1_SELECT`, `SUBMIT_ROUND_SUCCESS`, `NEXT_ROUND`). This made state transitions atomic, structured, and easy to maintain.

---

### Problem 2: Score Reset to 0 on Browser Refresh Mid-Game
- **What was the issue?**  
  When a player refreshed the browser (`F5`) in the middle of a match (e.g., at Round 3), the app preserved the player names from the browser history, but reset the scores to `0-0` and round back to `1`. When the player tried to submit a move, the backend rejected it because Round 1 was already completed in the database.
- **How we solved it:**  
  We updated the component lifecycle to **always fetch current game details from the database (`GET /api/games/:id`)** whenever the page loads or refreshes. The reducer calculates the cumulative scores from already saved rounds and advances the game to the next unplayed round (`rounds.length + 1`), ensuring the game survives page reloads without losing progress.

---

### Problem 3: Silent LocalStorage Fallback Hiding Backend Failures
- **What was the issue?**  
  The frontend `api.js` had a fallback mechanism that automatically saved games to browser `localStorage` whenever an API call failed. This hid server outages, network errors, and database connection issues from the user and caused client data to drift away from the real RDS database.
- **How we solved it:**  
  We **completely removed the `localStorage` fallback** from `api.js`. When the backend fails, the Axios error is thrown directly to the UI. The app now displays a clear `ErrorMessage` banner with a "Retry" button, ensuring full transparency and database integrity.

---

## Part 2: AWS EC2 & RDS Deployment Problems

### Problem 4: AWS RDS Database Connection Timeout (Port 3306)
- **What was the issue?**  
  The FastAPI backend on EC2 could not communicate with the MySQL RDS instance, causing `500 Internal Server Error` with `Can't connect to MySQL server (timed out)`.
- **How we solved it:**  
  We edited the **RDS Security Group inbound rules** to allow TCP traffic on port `3306` specifically from the **EC2 Security Group ID (`sg-xxxxxxxx`)**. This allowed secure communication between EC2 and RDS without exposing the database to the public internet.

---

### Problem 5: MySQL 8 Authentication Error (`caching_sha2_password`)
- **What was the issue?**  
  MySQL 8.0 on RDS uses the `caching_sha2_password` authentication plugin by default. When the Python backend attempted to connect, it crashed with:  
  `RuntimeError: 'cryptography' package is required for sha256_password or caching_sha2_password auth methods`.
- **How we solved it:**  
  We installed and pinned the **`cryptography`** package (`pip install cryptography`) in the backend virtual environment, allowing `pymysql` to perform the necessary RSA public key handshake.

---

### Problem 6: Vite Build Process Killed by Linux Kernel (Out of Memory / Exit 137)
- **What was the issue?**  
  Running `npm run build` on the AWS Free Tier `t2.micro` EC2 instance crashed with `Killed` (Linux exit code 137). The instance only has 1 GB of physical RAM, which was exhausted by the Node.js bundler.
- **How we solved it:**  
  We allocated and enabled a **2 GB Linux swap file (`/swapfile`)** on EC2 storage. This provided extra virtual memory headroom, enabling the React frontend build to finish smoothly without crashing.

---

### Problem 7: React Router SPA 404 Error on Browser Page Refresh
- **What was the issue?**  
  Directly accessing or refreshing client-side routes (like `/history` or `/game/1`) returned Nginx's default `404 Not Found`, because Nginx looked for a physical file or directory on disk that did not exist.
- **How we solved it:**  
  We added the **`try_files $uri $uri/ /index.html;`** directive to the Nginx server block. This instructs Nginx to serve `index.html` for any route, allowing React Router to handle client-side routing.

---

### Problem 8: CORS Errors and Direct Port 8000 Public Exposure
- **What was the issue?**  
  Initially, the frontend was attempting to call the backend directly on port 8000 (`http://<IP>:8000/api`), requiring port 8000 to be open to the internet and triggering browser CORS pre-flight warnings.
- **How we solved it:**  
  We configured **Nginx as a reverse proxy** forwarding `/api/` requests internally to `http://127.0.0.1:8000/api/` and closed public access to port 8000 in the security group. Both frontend and backend are now served seamlessly under a single origin on Port 80.

---

## Part 3: Why We Chose Our Refresh Approach (Design Rationale)

1. **Database as the Single Source of Truth**:  
   Every round choice and winner is persisted in MySQL immediately after submission. Fetching state from `GET /api/games/:id` guarantees the UI never displays mismatched or stale data.
2. **Resilience Across Devices & Tabs**:  
   Because the state is keyed by the route parameter `/game/:gameId` in the database, users can refresh, reopen closed tabs, or switch devices and resume right where they left off.
3. **Clean Resumption with `useReducer`**:  
   When reloading, the reducer atomically computes the running score from database rounds and starts the next unplayed round (`rounds.length + 1`) at `p1_select`, preventing duplicate round submissions.
4. **No Hidden State Drift**:  
   By avoiding `localStorage`, we prevent data loss when a user clears their browser cache and ensure true server errors are surfaced rather than silently masked.
