# Stone Paper Scissors — Backend API

FastAPI backend built with Python, SQLAlchemy ORM, and MySQL database integration.

## Features

- **Game Session Management**: Initialize game sessions for 2 players.
- **Backend Winner Calculation**: Strictly computes round winner on backend according to game rules.
- **MySQL Database Integration**: Stores `games` and `rounds` tables using SQLAlchemy ORM.
- **Game History & Breakdown**: REST API endpoints to fetch match history and individual 6-round breakdowns.

## Project Structure

```
backend/
├── app/
│   ├── routes/
│   │   ├── games.py
│   │   └── rounds.py
│   ├── __init__.py
│   ├── crud.py
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   └── schemas.py
├── .env.example
├── main.py
├── README.md
└── requirements.txt
```

## Setup Instructions

### 1. Prerequisites
- Python 3.10+
- MySQL Server (optional for primary DB; automatic SQLite fallback enabled for standalone local testing)

### 2. Environment Setup

Create a virtual environment and activate it:

```bash
python -m venv venv

# On Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# On Linux/macOS
source venv/bin/activate
```

Install requirements:

```bash
pip install -r requirements.txt
```

### 3. Database Configuration

Copy `.env.example` to `.env` and set your MySQL connection string:

```env
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/stone_paper_scissors
```

Ensure the MySQL database `stone_paper_scissors` is created:

```sql
CREATE DATABASE IF NOT EXISTS stone_paper_scissors;
```

### 4. Running the Server

Start the development server with Uvicorn:

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at: `http://localhost:8000`
Interactive Swagger API docs: `http://localhost:8000/docs`
