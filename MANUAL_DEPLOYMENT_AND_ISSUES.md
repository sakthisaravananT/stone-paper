# AWS EC2 & RDS Manual Deployment Guide & Troubleshooting Report

**Project**: Stone Paper Scissors — 2-Player Full-Stack Web Application  
**Author**: Sakthi Saravanan T  
**Architecture**: React (Vite) + FastAPI (Python) + AWS EC2 (Ubuntu 22.04 LTS) + AWS RDS (MySQL 8.0) + Nginx (Reverse Proxy & Static Web Server) + Systemd (Daemon Process Manager)

---

## 📑 Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites & AWS Services Used](#2-prerequisites--aws-services-used)
3. [Step 1: AWS RDS (MySQL) Provisioning & Security](#step-1-aws-rds-mysql-provisioning--security)
4. [Step 2: AWS EC2 Instance Provisioning & Security Groups](#step-2-aws-ec2-instance-provisioning--security-groups)
5. [Step 3: EC2 Base Server Setup & Swap Memory](#step-3-ec2-base-server-setup--swap-memory)
6. [Step 4: Database Verification & Schema Initialization](#step-4-database-verification--schema-initialization)
7. [Step 5: FastAPI Backend Deployment (Systemd Service)](#step-5-fastapi-backend-deployment-systemd-service)
8. [Step 6: React Frontend Build & Nginx Web Server Setup](#step-6-react-frontend-build--nginx-web-server-setup)
9. [Step 7: Verification & Health Checks](#step-7-verification--health-checks)
10. [Comprehensive Issues Faced & Troubleshooting Log](#comprehensive-issues-faced--troubleshooting-log)
    - [Issue 1: RDS Connection Timeout / Host Unreachable](#issue-1-rds-connection-timeout--host-unreachable)
    - [Issue 2: MySQL 8 Authentication Plugin Incompatibility](#issue-2-mysql-8-authentication-plugin-incompatibility)
    - [Issue 3: Node.js / Vite Build Process Killed (OOM Error on t2.micro)](#issue-3-nodejs--vite-build-process-killed-oom-error-on-t2micro)
    - [Issue 4: React Router SPA 404 Not Found on Page Refresh](#issue-4-react-router-spa-404-not-found-on-page-refresh)
    - [Issue 5: CORS Errors and Port 8000 Exposure](#issue-5-cors-errors-and-port-8000-exposure)
    - [Issue 6: SSH Session Disconnect Kills Backend Process](#issue-6-ssh-session-disconnect-kills-backend-process)
    - [Issue 7: MySQL Idle Connection Dropping (MySQL Server Has Gone Away)](#issue-7-mysql-idle-connection-dropping-mysql-server-has-gone-away)
11. [Summary of 5 Core Deployment Problems & Fixes](#11-summary-of-5-core-deployment-problems--fixes)
12. [Game State Persistence & Refresh Approach](#12-game-state-persistence--refresh-approach)

---

## 1. Architecture Overview

Unlike PaaS/serverless hosting platforms (such as AWS Amplify, Vercel, or Netlify) that abstract away infrastructure, this deployment is built directly on physical cloud virtual machines (AWS EC2) and managed database instances (AWS RDS).

```
                      ┌──────────────────────────────────────────────┐
                      │              Client Browser                  │
                      └──────────────────────┬───────────────────────┘
                                             │ HTTP (Port 80)
                                             ▼
┌────────────────────────────────────── AWS EC2 (Ubuntu 22.04) ───────────────────────────────────┐
│                                                                                                 │
│   ┌─────────────────────────────────────────────────────────────────────────────────────────┐   │
│   │                                       Nginx (Port 80)                                   │   │
│   │  - Serves static React production bundle for frontend routes (/)                        │   │
│   │  - Reverse-proxies /api/ requests to internal FastAPI backend                           │   │
│   └────────────────────────┬───────────────────────────────────────┬────────────────────────┘   │
│                            │                                       │                            │
│                 Static Files (try_files)              Proxy Pass to http://127.0.0.1:8000       │
│                            ▼                                       ▼                            │
│           ┌─────────────────────────────────┐   ┌─────────────────────────────────────────┐     │
│           │       /var/www/sps/dist         │   │       FastAPI Backend (Uvicorn)         │     │
│           │      (React + Vite SPA)         │   │      Managed by Systemd Daemon          │     │
│           └─────────────────────────────────┘   └────────────────────┬────────────────────┘     │
│                                                                      │                          │
└──────────────────────────────────────────────────────────────────────┼──────────────────────────┘
                                                                       │ SQLAlchemy ORM
                                                                       │ (Port 3306)
                                                                       ▼
┌────────────────────────────────────── AWS RDS (MySQL 8.0) ──────────────────────────────────────┐
│                                                                                                 │
│   - DB Instance: sps-mysql-db                                                                   │
│   - Database: stone_paper_scissors                                                              │
│   - Security: Restricted to EC2 Security Group Only                                             │
│                                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Prerequisites & AWS Services Used

| Service | Configuration / Specs | Purpose |
| :--- | :--- | :--- |
| **AWS EC2** | Ubuntu 22.04 LTS, `t2.micro` or `t3.micro` | Hosts Nginx, React static files, and FastAPI backend service |
| **AWS RDS** | MySQL 8.0, `db.t3.micro` (Free Tier eligible) | Persistent relational database storing `games` and `rounds` |
| **AWS VPC & SGs** | Default VPC with custom Security Groups | Network isolation & firewall rules between client, EC2, and RDS |
| **Nginx** | Reverse Proxy & Web Server | Serves React build, handles SPA client routing, routes `/api/` |
| **Systemd** | Linux Service Manager | Keeps FastAPI/Uvicorn running 24/7 as background daemon |

---

## Step 1: AWS RDS (MySQL) Provisioning & Security

### 1.1 Create RDS Subnet Group & Instance
1. Go to **AWS Console** -> **RDS** -> **Databases** -> **Create database**.
2. Select **Standard create**.
3. Engine: **MySQL** (Community Edition, Version 8.0.x).
4. Templates: **Free Tier**.
5. Settings:
   - **DB instance identifier**: `sps-mysql-db`
   - **Master username**: `admin`
   - **Master password**: `<StrongSecurePassword123!>`
6. Instance configuration:
   - Instance class: `db.t3.micro` or `db.t2.micro` (1 vCPU, 1 GB RAM).
   - Storage: 20 GB gp2/gp3.
7. Connectivity:
   - **VPC**: Default VPC (ensure EC2 instance will be in the same VPC).
   - **Public access**: **No** (Secured; only accessible from within VPC).
   - **VPC security group**: Choose **Create new** -> Name: `rds-sps-sg`.
8. Additional Configuration:
   - **Initial database name**: `stone_paper_scissors`
9. Click **Create database** (takes 5-10 minutes to become *Available*).

### 1.2 Note the RDS Endpoint
Once created, click on `sps-mysql-db` and copy the **Endpoint**:
```
sps-mysql-db.cxxxxxxxx.ap-south-1.rds.amazonaws.com
```

---

## Step 2: AWS EC2 Instance Provisioning & Security Groups

### 2.1 Launch EC2 Instance
1. Go to **AWS Console** -> **EC2** -> **Launch Instance**.
2. Name: `sps-production-ec2`.
3. AMI: **Ubuntu Server 22.04 LTS (HVM), SSD Volume Type**.
4. Instance type: `t2.micro` or `t3.micro` (Free tier eligible).
5. Key pair: Create or select existing key pair (`sps-key.pem`).
6. Network settings:
   - VPC: Same VPC as RDS instance.
   - Auto-assign public IP: **Enable**.
   - Create Security Group: `ec2-sps-sg`.
   - Inbound Firewall Rules:
     - **SSH (Port 22)**: Source `My IP` (for secure administration).
     - **HTTP (Port 80)**: Source `Anywhere (0.0.0.0/0)` (public web access).
     - **HTTPS (Port 443)**: Source `Anywhere (0.0.0.0/0)` (optional SSL).
7. Storage: 8 GB gp3.
8. Click **Launch instance**.

### 2.2 Configure RDS Security Group to Accept EC2 Traffic
1. Go to **EC2** -> **Security Groups** -> select `rds-sps-sg`.
2. Click **Edit inbound rules** -> **Add rule**:
   - Type: **MYSQL/Aurora (3306)**
   - Source: Select **Custom** and enter the **Security Group ID of the EC2 instance** (`sg-xxxxxxxx` from `ec2-sps-sg`).
3. Click **Save rules**.
*(This guarantees only your EC2 server can talk to the database on port 3306; it is not exposed to the public internet).*

---

## Step 3: EC2 Base Server Setup & Swap Memory

### 3.1 Connect to EC2
From your local terminal:
```bash
chmod 400 sps-key.pem
ssh -i sps-key.pem ubuntu@<EC2-PUBLIC-IP>
```

### 3.2 Update System Packages
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3-pip python3-venv git nginx mysql-client
```

### 3.3 Add 2GB Swap Memory (Crucial for t2/t3.micro)
Because `t2.micro` has only 1GB RAM, compiling Node.js or running multiple Python processes can trigger the Linux Out-Of-Memory (OOM) killer. Adding a swap file prevents crashes:
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```
Verify swap:
```bash
free -h
```

### 3.4 Install Node.js 18+ (LTS)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node -v # Should display v18.x.x
```

---

## Step 4: Database Verification & Schema Initialization

### 4.1 Test Database Connection from EC2
```bash
mysql -h sps-mysql-db.cxxxxxxxx.ap-south-1.rds.amazonaws.com -u admin -p -D stone_paper_scissors
```
Enter your RDS master password. If you reach the `mysql>` prompt, connection between EC2 and RDS is active!
Exit MySQL:
```sql
exit;
```

---

## Step 5: FastAPI Backend Deployment (Systemd Service)

### 5.1 Clone Repository on EC2
```bash
cd /var/www
sudo mkdir -p sps
sudo chown -R ubuntu:ubuntu /var/www/sps
cd /var/www/sps

# Clone the project repository
git clone https://github.com/sakthisaravananT/stone-paper.git .
```

### 5.2 Set Up Python Virtual Environment & Dependencies
```bash
cd /var/www/sps/backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### 5.3 Configure Environment Variables
Create the production `.env` file:
```bash
nano /var/www/sps/backend/.env
```
Add the following content (replace credentials with your real RDS values):
```env
DATABASE_URL=mysql+pymysql://admin:StrongSecurePassword123!@sps-mysql-db.cxxxxxxxx.ap-south-1.rds.amazonaws.com:3306/stone_paper_scissors
```
Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X`).

### 5.4 Verify Database Initialization
Run a one-time test to ensure SQLAlchemy creates the `games` and `rounds` tables on RDS:
```bash
python3 -c "from app.database import Base, engine; from app import models; Base.metadata.create_all(bind=engine); print('Tables created successfully!')"
```

### 5.5 Create Systemd Service for FastAPI
Create a systemd unit file to manage FastAPI as a persistent background daemon:
```bash
sudo nano /etc/systemd/system/sps-backend.service
```
Paste the configuration:
```ini
[Unit]
Description=Stone Paper Scissors FastAPI Backend Service
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/var/www/sps/backend
EnvironmentFile=/var/www/sps/backend/.env
ExecStart=/var/www/sps/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000 --workers 2
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable sps-backend
sudo systemctl start sps-backend
```

Check service status:
```bash
sudo systemctl status sps-backend
```
Test local endpoint response:
```bash
curl http://127.0.0.1:8000/api/health
# Expected: {"status":"ok","service":"Stone Paper Scissors API","database_connected":true}
```

---

## Step 6: React Frontend Build & Nginx Web Server Setup

### 6.1 Build Frontend Production Bundle
Navigate to frontend directory:
```bash
cd /var/www/sps/frontend
```
Create production environment file pointing to relative `/api` path (handled by Nginx reverse proxy):
```bash
echo "VITE_API_URL=/api" > .env.production
```

Install dependencies and build:
```bash
npm install
npm run build
```
This generates the optimized static bundle in `/var/www/sps/frontend/dist`.

### 6.2 Configure Nginx
Create an Nginx server configuration:
```bash
sudo nano /etc/nginx/sites-available/sps
```
Paste the following production configuration:
```nginx
server {
    listen 80;
    server_name _; # Or replace with your EC2 Public DNS / Domain Name

    # Root directory for static React files
    root /var/www/sps/frontend/dist;
    index index.html;

    # Gzip Compression for fast delivery
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 1. Frontend Routing (Single Page App Fallback)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 2. Reverse Proxy for Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }

    # Static Asset Caching
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
}
```

Enable site and remove default:
```bash
sudo ln -sf /etc/nginx/sites-available/sps /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
```

Test and reload Nginx:
```bash
sudo nginx -t
# Output should say: syntax is ok / test is successful
sudo systemctl restart nginx
```

---

## Step 7: Verification & Health Checks

1. Open your browser and navigate to:
   ```
   http://<EC2-PUBLIC-IP>/
   ```
2. Verify:
   - **Frontend UI Loads**: Game Setup screen renders with custom dark theme.
   - **API Health**: Navigate to `http://<EC2-PUBLIC-IP>/api/health` -> Returns `{"status":"ok", ...}`.
   - **Gameplay**: Play a 6-round game; verify choices, scores, and round winners persist.
   - **Database Persistence**: Refresh `/history` page; game records persist and load from AWS RDS.
   - **SPA Refresh**: Refresh browser while on `/history` -> loads correctly without 404.

---

## Comprehensive Issues Faced & Troubleshooting Log

During the manual deployment on physical AWS EC2 and RDS instances, multiple infrastructure and configuration issues were diagnosed and resolved:

### Issue 1: RDS Connection Timeout / Host Unreachable
- **Symptom**:  
  When testing the backend, requests failed with `500 Internal Server Error`, and logs showed:
  ```
  sqlalchemy.exc.OperationalError: (pymysql.err.OperationalError) (2003, "Can't connect to MySQL server on 'sps-mysql-db...rds.amazonaws.com' (timed out)")
  ```
- **Root Cause**:  
  By default, AWS RDS security groups do not allow incoming traffic from external resources. Although both EC2 and RDS were in the default VPC, the RDS security group (`rds-sps-sg`) had no inbound rule allowing TCP traffic on port 3306 from the EC2 instance's security group (`ec2-sps-sg`).
- **Solution**:  
  Navigated to **AWS EC2 -> Security Groups -> rds-sps-sg**, edited inbound rules, and added:
  - Type: `MySQL/Aurora` (Port 3306)
  - Source: `Custom` -> entered the specific EC2 Security Group ID (`sg-xxxxxxxxx`).  
  This resolved the timeout while adhering to the security best practice of never exposing RDS port 3306 publicly (`0.0.0.0/0`).

---

### Issue 2: MySQL 8 Authentication Plugin Incompatibility
- **Symptom**:  
  Database connection failed with:
  ```
  RuntimeError: 'cryptography' package is required for sha256_password or caching_sha2_password auth methods
  ```
- **Root Cause**:  
  AWS RDS MySQL 8.0 defaults to the `caching_sha2_password` authentication plugin rather than the older `mysql_native_password`. The Python `pymysql` driver requires the `cryptography` library installed to handle RSA public key encryption during authentication handshakes.
- **Solution**:  
  Installed `cryptography>=41.0.0` in the virtual environment:
  ```bash
  pip install cryptography
  ```
  Ensured `cryptography` is pinned in `requirements.txt`.

---

### Issue 3: Node.js / Vite Build Process Killed (OOM Error on t2.micro)
- **Symptom**:  
  When executing `npm run build` on the EC2 instance, the terminal output abruptly ended with:
  ```
  Killed
  ELIFECYCLE Command failed with exit code 137
  ```
- **Root Cause**:  
  The AWS Free Tier instance (`t2.micro`) provides only 1 GB of physical RAM. The Vite compilation and Rollup bundler process exceeded available memory, triggering the Linux kernel Out-Of-Memory (OOM) killer (exit code 137 = 128 + 9 SIGKILL).
- **Solution**:  
  Allocated a 2 GB Linux swap file on the EC2 storage:
  ```bash
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  ```
  After activating swap, `npm run build` completed smoothly without memory exhaustion.

---

### Issue 4: React Router SPA 404 Not Found on Page Refresh
- **Symptom**:  
  Navigating to `/history` from within the app worked fine, but refreshing the browser (`F5`) or navigating directly to `http://<EC2-IP>/history` produced Nginx's default error page:
  ```
  404 Not Found (nginx/1.18.0)
  ```
- **Root Cause**:  
  Because React Router handles routing on the client side (Single Page Application), there is no physical file or directory named `/var/www/sps/frontend/dist/history`. Nginx was searching for a static file and returning 404 when it didn't exist.
- **Solution**:  
  Updated Nginx configuration `location /` to include the `try_files` directive:
  ```nginx
  location / {
      try_files $uri $uri/ /index.html;
  }
  ```
  This directs Nginx to serve `index.html` for any unmatched route, allowing client-side React Router to resolve `/history`, `/game`, etc.

---

### Issue 5: CORS Errors and Port 8000 Exposure
- **Symptom**:  
  Initially, frontend was configured to talk directly to `http://<EC2-PUBLIC-IP>:8000/api`. This required opening port 8000 to the public internet on EC2 security groups, and triggered CORS pre-flight (`OPTIONS`) warnings in the browser console.
- **Root Cause**:  
  Exposing backend ports directly increases attack surface and causes cross-origin boundary issues when protocol/ports differ.
- **Solution**:  
  1. Configured Nginx as a reverse proxy forwarding `/api/` requests internally to `http://127.0.0.1:8000/api/`.
  2. Set frontend build environment variable `VITE_API_URL=/api`.
  3. Closed public access to port 8000 in EC2 Security Group, keeping only Port 80 and 22 open. All traffic is consolidated through Port 80 with zero cross-origin issues.

---

### Issue 6: SSH Session Disconnect Kills Backend Process
- **Symptom**:  
  Running `python -m uvicorn app.main:app` in an SSH session worked while connected, but as soon as the terminal closed or SSH timed out, the backend terminated and frontend showed API network errors.
- **Root Cause**:  
  Terminal processes run as child processes of the SSH pseudo-terminal (PTS). Closing the session sends a `SIGHUP` (hangup) signal to all child processes.
- **Solution**:  
  Configured a production Linux **systemd** service (`/etc/systemd/system/sps-backend.service`). This ensures:
  - Process runs continuously in the background independent of user sessions.
  - Automatic restart on crashes (`Restart=always`, `RestartSec=5`).
  - Automatic boot on server restart (`systemctl enable sps-backend`).

---

### Issue 7: MySQL Idle Connection Dropping (MySQL Server Has Gone Away)
- **Symptom**:  
  After leaving the web app idle for several hours, making a new move or viewing history caused:
  ```
  sqlalchemy.exc.OperationalError: (pymysql.err.OperationalError) (2006, "MySQL server has gone away")
  ```
- **Root Cause**:  
  AWS RDS terminates idle TCP connections after `wait_timeout` (default 28800s, or earlier behind AWS NAT/Stateful firewall). The SQLAlchemy pool kept stale connection sockets in its pool.
- **Solution**:  
  In `backend/app/database.py`, configured SQLAlchemy engine pooling parameters:
  ```python
  engine = create_engine(
      DATABASE_URL,
      pool_recycle=3600,   # Recycle connections older than 1 hour
      pool_pre_ping=True    # Validate connection liveness before executing query
  )
  ```
  `pool_pre_ping=True` transparently reconnects any dropped connection before running queries.

---

## 8. Summary Table of AWS Commands & Cheatsheet

| Task | Command |
| :--- | :--- |
| **Check Backend Status** | `sudo systemctl status sps-backend` |
| **View Backend Logs** | `sudo journalctl -u sps-backend -f -n 50` |
| **Restart Backend** | `sudo systemctl restart sps-backend` |
| **Test Nginx Config** | `sudo nginx -t` |
| **Restart Nginx** | `sudo systemctl restart nginx` |
| **View Nginx Error Logs** | `sudo tail -f /var/log/nginx/error.log` |
| **Check Memory & Swap** | `free -h` |
| **Connect to RDS MySQL** | `mysql -h <rds-endpoint> -u admin -p -D stone_paper_scissors` |

---

## 11. Summary of 5 Core Deployment Problems & Fixes

Below is a concise breakdown of the five primary deployment challenges faced and how each was resolved:

1. **Problem: AWS RDS Connection Timeout on Port 3306**
   - **Fix**: Added an inbound firewall rule to the RDS Security Group permitting TCP traffic on port 3306 exclusively from the EC2 Security Group ID (`sg-xxxxxxxx`), keeping the database completely private from public internet traffic.

2. **Problem: MySQL 8 Authentication Plugin Incompatibility (`caching_sha2_password`)**
   - **Fix**: Installed and pinned the `cryptography` library in the Python virtual environment so `pymysql` can execute the RSA key exchange required by MySQL 8.0's default authentication scheme.

3. **Problem: Vite Build Process Killed by Linux Kernel (Out-of-Memory / Exit Code 137)**
   - **Fix**: Allocated, formatted, and mounted a 2 GB Linux swap space (`/swapfile`) on EC2 root storage, providing the virtual memory buffer needed for Node.js rollup compilation on a 1 GB `t2.micro` instance.

4. **Problem: React Router SPA 404 Not Found on Browser Page Refresh**
   - **Fix**: Configured the Nginx server location block with `try_files $uri $uri/ /index.html;`, ensuring any client-side route request falls back to `index.html` for client-side routing rather than triggering an Nginx file lookup 404.

5. **Problem: CORS Errors and Direct Port 8000 Exposure**
   - **Fix**: Configured Nginx as a reverse proxy forwarding `/api/` traffic internally to `http://127.0.0.1:8000/api/` on localhost and removed public exposure of port 8000, ensuring unified single-domain origin delivery on port 80 with zero CORS overhead.

---

## 12. Game State Persistence & Refresh Approach

### Why This Refresh Approach Was Chosen:

1. **Database as the Single Source of Truth**:
   Every completed round choice and result is immediately persisted in MySQL on the backend upon submission. Rather than keeping fragile client-side assumptions, fetching the match state directly via `GET /api/games/:id` on mount and refresh guarantees the frontend is always 100% consistent with the database.

2. **Elimination of Silent LocalStorage Fallbacks**:
   `localStorage` caching can fail, become stale, or mask real backend outages by silently saving data locally. Querying the backend directly allows true server errors to be surfaced to the user while preventing client/server state divergence.

3. **Cross-Session and Device Resilience**:
   Because game identity and progress live on the server indexed by the route parameter `/game/:gameId`, a user can refresh the browser, reopen an accidental tab close, or even switch browsers/devices and seamlessly resume the exact round and score without losing progress.

4. **Clean Deterministic State via `useReducer`**:
   Using `useReducer` provides predictable, atomic state transitions (`GAME_SYNCED`, `P1_SELECT`, `SUBMIT_ROUND_SUCCESS`, `NEXT_ROUND`). Restoring rounds from the database calculates cumulative scores and moves the player to the next unplayed round (`rounds.length + 1`) at `p1_select` in a single state update, preventing race conditions and duplicate round submissions.
