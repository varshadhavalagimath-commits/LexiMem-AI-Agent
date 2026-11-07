# LexiMem — Setup & Installation Guide

This guide covers complete local setup, environment configuration, and startup commands for LexiMem.

---

## 1. Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **Python**: 3.10 or higher
- **Git**: Installed and in PATH
- **MongoDB**: (Optional) MongoDB Atlas URI or local `mongod`. If offline or unconfigured, LexiMem automatically starts an embedded in-memory MongoDB instance with zero manual setup!

---

## 2. Environment Variables Configuration

Copy `.env.example` to `server/.env` and optionally root `.env`:

```bash
cp .env.example server/.env
```

### Environment Parameters Reference

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Node.js backend port | `5000` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/leximem` (or Atlas URI) |
| `JWT_SECRET` | Secret key for JWT signing | `leximem_enterprise_jwt_secure_secret_key_2026` |
| `GROQ_API_KEY` | Groq inference API key | *Optional: Get key at https://console.groq.com/* |
| `GROQ_MODEL` | Configurable Groq model | `llama-3.3-70b-versatile` |
| `HINDSIGHT_BASE_URL` | Hindsight Cloud or self-hosted API URL | `https://api.hindsight.vectorize.io` or `http://localhost:8888` |
| `HINDSIGHT_API_KEY` | Hindsight API key (for Cloud) | *Optional for local/Docker* |
| `HINDSIGHT_BANK_ID` | Memory bank partition identifier | `leximem-precedents` |
| `DOC_PROCESSOR_URL`| Python microservice endpoint | `http://localhost:8000` |
| `MAX_FILE_SIZE_MB` | Maximum document upload size | `25` |

> **Note on Resilient Fallback Execution:**
> - If `GROQ_API_KEY` is not provided, LexiMem runs its built-in Legal Heuristic AI Engine so all clause analysis, risk calculations, and negotiation alternatives work seamlessly.
> - If `HINDSIGHT_API_KEY` or self-hosted Hindsight is offline, LexiMem saves precedents directly into its synchronized MongoDB Precedent Memory with local vector matching.

---

## 3. Installation

Run the unified install command from the root directory:

```bash
# 1. Install all root, server, and client dependencies
npm run install:all

# 2. Install Python document processor requirements (optional)
cd document-processor
python -m pip install -r requirements.txt
cd ..
```

---

## 4. Running the Application

### Option A: Complete Platform (Client + Server) in One Command

From the root project folder:

```bash
npm run dev
```

This starts:
- **LexiMem Backend**: `http://localhost:5000`
- **LexiMem Client UI**: `http://localhost:5173`

### Option B: Running Individual Services Separately

```bash
# Terminal 1: Backend Server
cd server
npm run dev

# Terminal 2: React Frontend
cd client
npm run dev

# Terminal 3: (Optional) Python Document Processor Microservice
cd document-processor
python -m uvicorn main:app --port 8000 --reload
```

---

## 5. Seed Demonstration Legal Records

LexiMem automatically seeds demonstration records on first server boot if the database is clean. You can also run the seed command manually at any time:

```bash
npm run seed
```

This creates:
- Organization: `Apex Global Technologies LLC`
- 3 User Roles (Admin, Lawyer, Business User)
- 4 Corporate Legal Policies (Liability caps, Mutual indemnity, Notice windows)
- 4 Precedents in Precedent Memory
- 5 Sample Contracts across various agreement types
- 4 Active Operational & Financial Obligations

---

## 6. Pre-Configured Demo Credentials

Use these credentials to sign in immediately:

| Persona | Email | Password | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **Legal Counsel / Lawyer** | `lawyer@leximem.com` | `LexiMemLawyer2026!` | Review contracts, approve/reject clauses, commit precedents to Hindsight, sign-off |
| **Administrator** | `admin@leximem.com` | `LexiMemAdmin2026!` | Configure policies, view full immutable audit logs, manage users |
| **Contract Employee** | `employee@leximem.com` | `LexiMemEmployee2026!` | Submit agreements, view assigned obligations, track review progress |

*(The UI also features a 1-Click Demo Persona Switcher in the top right navigation bar).*
