# LexiMem — AI Contract Lifecycle & Precedent Intelligence Agent

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-cyan.svg)](https://reactjs.org/)
[![Groq](https://img.shields.io/badge/LLM-Groq%20Llama%203.3-orange.svg)](https://groq.com/)
[![Hindsight](https://img.shields.io/badge/Memory-Hindsight%20Engine-purple.svg)](https://hindsight.vectorize.io/)

> **LexiMem** is an enterprise-grade AI-powered Legal Contract Lifecycle and Precedent Intelligence platform. Designed for in-house legal departments, general counsels, and procurement managers, LexiMem manages agreements from intake to execution with a central innovation: **The Precedent Memory Engine**.

---

## 🌟 The Central Innovation: Precedent Memory Engine

Unlike static CLMs or standard vector search wrappers, LexiMem features an autonomous **Precedent Memory Engine** powered by **Hindsight** (`vectorize-io/hindsight`).

- **Learns from Qualified Human Decisions**: Remembers lawyer-approved clause alternatives, confirmed concessions, and rejected counterparty language.
- **Strict Non-Hallucination Safety Rule**: Never automatically treats raw AI-generated suggestions as approved legal precedents.
- **Evidence-Backed Recall**: When a new contract is uploaded, LexiMem executes a 4-way parallel search (semantic vector, BM25 keyword matching, entity graph topology, and temporal reasoning) to recall relevant organizational precedents, redline wording differences, and suggest validated alternatives.

---

## 🤖 Modular Multi-Agent Architecture

LexiMem is powered by an orchestrator coordinating eight specialized agents:

1. **Agent 1 — Contract Intake Agent**: Parses raw extracted text, identifies parties, dates, values, and flags missing terms without inventing information.
2. **Agent 2 — Clause Analysis Agent**: Categorizes contract clauses and identifies critical legal, operational, and financial risks.
3. **Agent 3 — Precedent Retrieval Agent**: Queries Hindsight memory banks to match historical decisions and calculate similarity scores.
4. **Agent 4 — Contract Comparison Agent**: Generates clause-level redlines between contract versions (e.g. v1 vs v2).
5. **Agent 5 — Negotiation Assistant Agent**: Renders side-by-side comparisons (*Original Clause vs AI Suggestion vs Approved Precedent*) with trade-off explanations.
6. **Agent 6 — Obligation Agent**: Tracks deliverables, payment terms, and advance written non-renewal notice horizons (90, 60, 30, and 7 days).
7. **Agent 7 — Workflow Agent**: Evaluates risk scores and contract values to smart-route agreements to appropriate legal reviewers.
8. **Agent 8 — Memory Learning Agent**: Retains confirmed human-lawyer decisions in Hindsight and MongoDB with complete provenance tracking.

---

## 🛠️ Technology Stack

- **Frontend**: React.js with Vite, Tailwind CSS, React Router, Recharts, Lucide React icons, Axios.
- **Backend**: Node.js, Express.js, REST APIs, Mongoose, JWT authentication, Role-based access control (RBAC).
- **Database**: MongoDB (Atlas or local MongoDB, with auto-embedded fallback for zero-setup execution).
- **AI Inference**: Groq API (`llama-3.3-70b-versatile`) with internal legal heuristic engine fallback.
- **Persistent Memory**: Hindsight (`vectorize-io/hindsight`) with dual MongoDB synchronization.
- **Document Processing**: PyMuPDF (`fitz`), `python-docx`, with built-in scanned document OCR detection.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)
- Python (3.10+)
- Git

### 2. Installation
From the root directory of the workspace, run:

```bash
# Install root, backend, and frontend dependencies
npm run install:all
```

### 3. Environment Configuration
Copy `.env.example` to `server/.env`:

```bash
cp .env.example server/.env
```

Configure your secrets as desired:
- `GROQ_API_KEY`: *(Optional)* Your Groq API key from [Groq Console](https://console.groq.com/).
- `HINDSIGHT_BASE_URL`: `https://api.hindsight.vectorize.io` or `http://localhost:8888`.
- `HINDSIGHT_API_KEY`: *(Optional)* Your Hindsight Cloud key.

*(Note: If API keys are not supplied, LexiMem runs its high-precision legal intelligence engine and local synchronized precedent store out of the box with zero crashes).*

### 4. Seed Demonstration Data
The backend automatically seeds demonstration records on first run, or you can run:

```bash
npm run seed
```

### 5. Launch Application
Start the entire platform (frontend and backend) with a single command:

```bash
npm run dev
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend REST API**: [http://localhost:5000/api](http://localhost:5000/api)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 👥 Pre-Configured Demo Accounts

Use the **1-Click Demo Persona Switcher** on the login page or in the top navigation bar:

| Persona | Email | Password | Role & Permissions |
| :--- | :--- | :--- | :--- |
| **Legal Counsel / Lawyer** | `lawyer@leximem.com` | `LexiMemLawyer2026!` | Review contracts, approve/reject clauses, commit precedents to Hindsight, grant sign-off |
| **Administrator** | `admin@leximem.com` | `LexiMemAdmin2026!` | Configure policies, view full immutable audit logs, manage users |
| **Contract Employee** | `employee@leximem.com` | `LexiMemEmployee2026!` | Submit agreements, view assigned obligations, track review progress |

---

## 🧪 Required End-to-End Demonstration Scenario

To verify the core innovation (**Precedent Memory changing subsequent reviews**):

1. **Ingest First Contract**:
   - Go to **Upload Contract** (`/upload`).
   - Download or upload `Sample_Contract_1_Vendor_Agreement_Unlimited_Liability.pdf` (available directly in the sample panel).
   - Observe that Section 8.1 is flagged as **Critical Risk (Unlimited Liability)**.
   - Precedent Engine states: *"No prior approved precedent on file for this category."*
2. **Lawyer Negotiation & Approval**:
   - Click **"Negotiate Clause"**.
   - Review the 3-way side-by-side comparison.
   - Click **"Approve & Save to Precedent Memory"**.
   - Verified decision is committed to Hindsight Persistent Memory and MongoDB.
3. **Ingest Second Contract**:
   - Upload `Sample_Contract_2_Vendor_Agreement_Followup.pdf` (also containing uncapped liability).
   - The AI **immediately recalls the earlier approved precedent** (94% similarity)!
   - Displays approved 12-month cap language, decision rationale, difference analysis, and source contract link.
   - Demonstrates how persistent memory optimizes contract review cycles.

---

## 📤 Step-by-Step: Pushing from VS Code to GitHub

Follow these steps to push this project into your personal Git repository.

### Method 1: Using the VS Code Terminal (Recommended)

1. **Create a New Repository on GitHub**:
   - Open [github.com/new](https://github.com/new) in your browser.
   - Enter Repository Name (e.g., `LexiMem-AI-Agent`).
   - Set visibility to **Public** or **Private**.
   - **Do NOT** initialize with a README, .gitignore, or license (these already exist in the project).
   - Click **"Create repository"** and copy the HTTPS URL (e.g., `https://github.com/<your-username>/LexiMem-AI-Agent.git`).

2. **Open Terminal in VS Code**:
   - In VS Code, press `` Ctrl + ` `` (or select **Terminal > New Terminal** from the top menu).

3. **Stage All Project Files**:
   ```bash
   git add .
   ```

4. **Create Initial Commit**:
   ```bash
   git commit -m "feat: complete LexiMem AI Contract Lifecycle & Precedent Intelligence platform"
   ```

5. **Set the Main Branch**:
   ```bash
   git branch -M main
   ```

6. **Add Your Remote Repository**:
   *(Replace with your actual GitHub repository URL)*:
   ```bash
   git remote add origin https://github.com/<your-username>/LexiMem-AI-Agent.git
   ```

7. **Push Code to GitHub**:
   ```bash
   git push -u origin main
   ```

---

### Method 2: Using the VS Code Graphical Interface (GUI)

1. Open VS Code and open this folder (`LexiMem Ai agent`).
2. Click the **Source Control** icon on the left sidebar (or press `Ctrl + Shift + G`).
3. You will see all staged/untracked files.
4. Type a commit message in the top message box (e.g. `feat: initial LexiMem release`).
5. Click the checkmark **Commit** button (or press `Ctrl + Enter`).
6. Click the blue **"Publish Branch"** button.
7. Select **"Publish to GitHub public repository"** or **"Publish to GitHub private repository"**.
8. VS Code will automatically connect to your GitHub account and push the entire project!

---

## 📁 Repository Structure

```
LexiMem/
├── client/                     # Vite + React 18 + Tailwind CSS frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components (Badges, Navbar, Sidebar)
│   │   ├── context/            # AuthContext, RBAC & Demo Persona Switcher
│   │   ├── pages/              # 14 Full Application Pages
│   │   └── services/           # Axios API Client
├── server/                     # Node.js + Express backend
│   ├── src/
│   │   ├── agents/             # 8 Modular AI Agents + Agent Orchestrator
│   │   ├── config/             # Database connection & Env configuration
│   │   ├── controllers/        # REST controllers for all modules
│   │   ├── integrations/       # Hindsight Client, Groq Client, Document Processor
│   │   ├── middleware/         # Auth, Upload, Audit Logger, Error Handler
│   │   ├── models/             # Mongoose schemas (Contracts, Precedents, Risks, etc.)
│   │   ├── routes/             # REST route definitions
│   │   ├── services/           # Business logic & workflows
│   │   └── utils/              # Seed data & demo generators
│   └── uploads/                # Preserved original contract documents
├── document-processor/         # Python PyMuPDF & python-docx extraction microservice
├── sample-data/                # Pre-generated sample PDF & DOCX contracts for testing
├── docs/                       # Architecture, Setup, API, and Demo walkthrough guides
├── .env.example                # Sample environment configuration
├── package.json                # Root package configuration with concurrent dev runner
└── README.md                   # Project documentation
```

---

## ⚖️ Legal Disclaimer

LexiMem is an AI-assisted contract review and organizational precedent intelligence tool designed to assist qualified attorneys and procurement professionals. AI risk scores and suggested wordings do not constitute formal legal counsel. All legal recommendations require human review and sign-off before contract execution.
