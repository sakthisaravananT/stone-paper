# Stone Paper Scissors — 2-Player Full-Stack Application

A complete, production-grade 2-player **Stone Paper Scissors** web application built with a **React + Vite** frontend, a **Python FastAPI** backend, and **SQLAlchemy ORM** with **MySQL** database storage.

---

## 🌟 Key Features

- **Setup Screen**: Player name entry with trim validation, space checking, and distinct name enforcement.
- **Pass-the-Device Hidden Selection**: Step-by-step turn flow where Player 1's choice is immediately hidden before Player 2 makes a choice.
- **Backend Winner Calculation**: Strictly computes round winners on the FastAPI backend according to Stone Paper Scissors rules.
- **Exact 6-Round Gameplay**: Tracks scores, ties, round history, and final match outcomes.
- **Database Storage (Stage 2)**: Persists `games` and `rounds` tables in MySQL database via SQLAlchemy ORM.
- **Game History & Detailed Breakdown**: Dedicated `/history` table and `/history/:gameId` modal/page displaying complete 6-round records.
- **Dark Modern Theme**: Responsive, glassmorphism card UI with glowing player accents and micro-animations.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js 18
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Routing**: React Router DOM v6
- **Styling**: Vanilla CSS3 (Custom Design System with Dark Mode)

### Backend
- **Framework**: Python 3.10+ & FastAPI
- **ORM**: SQLAlchemy 2.0
- **Driver**: PyMySQL
- **Server**: Uvicorn

### Database
- **Primary**: MySQL Server
- **Fallback**: SQLite (Automatic local fallback for zero-configuration standalone testing)

---

## 📁 Project Structure

```
stone-paper-scissors/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChoiceButton.jsx
│   │   │   ├── ConfirmationModal.jsx
│   │   │   ├── ErrorMessage.jsx
│   │   │   ├── FinalResult.jsx
│   │   │   ├── GameDetails.jsx
│   │   │   ├── GameHistory.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── PassDeviceScreen.jsx
│   │   │   ├── PlayerSelection.jsx
│   │   │   ├── PlayerSetup.jsx
│   │   │   ├── RoundResult.jsx
│   │   │   └── ScoreBoard.jsx
│   │   ├── pages/
│   │   │   ├── Game.jsx
│   │   │   ├── GameDetailsPage.jsx
│   │   │   ├── History.jsx
│   │   │   └── Home.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   └── gameLogic.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── README.md
│
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── games.py
│   │   │   └── rounds.py
│   │   ├── crud.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── schemas.py
│   ├── .env.example
│   ├── main.py
│   ├── README.md
│   ├── requirements.txt
│   └── test_api.py
│
└── README.md
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
# MySQL Connection String Format
DATABASE_URL=mysql+pymysql://username:password@localhost:3306/stone_paper_scissors
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:8000/api
```

---

## 🚀 Setup & Execution Instructions

### 1. Database Setup (MySQL)

Create the database in MySQL:

```sql
CREATE DATABASE IF NOT EXISTS stone_paper_scissors;
```

### 2. Backend Setup (FastAPI)

Navigate to the `backend` folder:

```bash
cd backend
```

Create and activate a Python virtual environment:

```bash
# Windows
python -m venv venv
.\venv\Scripts\Activate.ps1

# Linux / macOS
python3 -m venv venv
source venv/bin/activate
```

Install requirements:

```bash
pip install -r requirements.txt
```

Run integration test suite:

```bash
python test_api.py
```

Start the FastAPI server:

```bash
uvicorn app.main:app --reload --port 8000
```

The API server will run at: `http://localhost:8000`  
Swagger documentation: `http://localhost:8000/docs`

---

### 3. Frontend Setup (React + Vite)

Open a new terminal and navigate to the `frontend` folder:

```bash
cd frontend
```

Install NPM packages:

```bash
npm install
```

Start Vite development server:

```bash
npm run dev
```

Open your browser at: `http://localhost:5173`

---

## 🎮 Game Rules & Logic

1. **Stone (🪨) beats Scissors (✂️)**
2. **Scissors (✂️) beats Paper (📄)**
3. **Paper (📄) beats Stone (🪨)**
4. **Same selection = Tie**
5. **Exact 6 Rounds**: The game ends after Round 6, calculating final scores, ties, and overall winner.


how to run :

Step 1: Run the Backend Server (FastAPI)
Open Terminal / PowerShell / Command Prompt.
Navigate to the backend folder:
powershell
cd backend
Install the required Python dependencies:
powershell
pip install -r requirements.txt
Start the FastAPI development server:
powershell
python -m uvicorn app.main:app --reload --port 8000
You will see output indicating the server is running at:
Backend API: http://localhost:8000
Interactive API Documentation (Swagger): http://localhost:8000/docs


Step 2: Run the Frontend Server (React + Vite)
Open a NEW (second) Terminal / PowerShell / Command Prompt window.
Navigate to the frontend folder:
powershell
cd frontend
Install Node packages:
powershell
npm install
Start the Vite development server:
powershell
npm run dev
You will see output indicating the app is live at:
Frontend App: http://localhost:5173
