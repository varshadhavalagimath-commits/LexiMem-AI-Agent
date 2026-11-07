# LexiMem — REST API Documentation

Base URL: `http://localhost:5000/api`

All protected endpoints require the HTTP header:
```http
Authorization: Bearer <jwt_token>
```

---

## 1. Authentication (`/api/auth`)

### `POST /api/auth/register`
Creates a new user and organization.
- **Body**:
  ```json
  {
    "name": "Jane Doe, Esq.",
    "email": "jane@company.com",
    "password": "Password123!",
    "role": "lawyer",
    "organizationName": "Acme Corp"
  }
  ```
- **Response**: `201 Created` with JWT token and user profile object.

### `POST /api/auth/login`
Authenticates existing user and issues JWT.
- **Body**:
  ```json
  {
    "email": "lawyer@leximem.com",
    "password": "LexiMemLawyer2026!"
  }
  ```
- **Response**: `200 OK` with token and user object.

### `GET /api/auth/me`
Returns current authenticated user and organization settings.
- **Protected**: Yes

---

## 2. Contracts Repository (`/api/contracts`)

### `POST /api/contracts/upload`
Uploads and processes a PDF or DOCX contract document through the multi-agent pipeline.
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `document`: File (PDF or DOCX, max 25MB)
  - `title`: String (optional)
  - `contractType`: `Vendor Agreement` | `NDA` | `Service Agreement` | `Software Licensing Agreement` | `Employment Agreement` | ...
  - `counterparty`: String (optional)
  - `jurisdiction`: String (optional)
  - `value`: Number (optional)
  - `tags`: String or Array
- **Response**: `201 Created` with contract, extracted clauses, risk findings, and obligations.

### `POST /api/contracts/:id/version`
Uploads a revised contract version (e.g. v2) and generates clause-level redline diffs.
- **Content-Type**: `multipart/form-data`
- **Fields**: `document` (File), `changeSummary` (String)

### `GET /api/contracts`
Queries contract repository with pagination, search, and filtering.
- **Query Parameters**:
  - `search`: Search text across titles, counterparties, tags
  - `contractType`: Filter by agreement type
  - `status`: Filter by lifecycle status (`Active`, `Under Review`, `Negotiation`, etc.)
  - `riskLevel`: `Critical`, `High`, `Medium`, `Low`
  - `page`: Page number (default: 1)
  - `limit`: Records per page (default: 10)

### `GET /api/contracts/:id`
Retrieves full contract dossier: metadata, extracted clauses, risk findings, obligations, versions, and audit history.

### `PATCH /api/contracts/:id`
Updates contract metadata or lifecycle state.

### `GET /api/contracts/:id/download`
Downloads the original preserved contract document file from disk.

### `DELETE /api/contracts/:id`
Archives a contract record. Protected to `admin` and `lawyer`.

---

## 3. Precedent Intelligence & Memory (`/api/precedents` & `/api/memory`)

### `GET /api/precedents`
Returns all organization precedents with filtering by category, decision, and jurisdiction.

### `POST /api/precedents`
Commits a lawyer-verified decision into Hindsight persistent memory bank and MongoDB.
- **Protected**: `admin`, `lawyer`
- **Body**:
  ```json
  {
    "contractId": "651a...",
    "contractTitle": "CloudFlow Agreement",
    "contractType": "Vendor Agreement",
    "clauseCategory": "Liability",
    "originalClause": "Neither party shall be subject to limitation of liability...",
    "finalApprovedClause": "Total aggregate liability shall be capped at 12 months fees...",
    "decision": "approved",
    "reason": "Enforce corporate liability ceiling policy PO-2024-01.",
    "jurisdiction": "Delaware, USA"
  }
  ```

### `POST /api/precedents/recall`
Queries Hindsight persistent memory bank using 4-way parallel search strategy for a given clause text and category.
- **Body**:
  ```json
  {
    "clauseText": "Liability shall be unlimited...",
    "category": "Liability",
    "contractType": "Vendor Agreement",
    "jurisdiction": "Delaware, USA"
  }
  ```

### `POST /api/precedents/:id/feedback`
Records lawyer feedback (`useful`, `not_relevant`, `incorrect`, `needs_review`) to refine neural relevance ranking.

### `POST /api/precedents/:id/supersede`
Marks an outdated precedent as superseded when corporate legal policy is updated.

### `GET /api/precedents/dashboard`
Returns Hindsight memory engine connection status, total stored precedents, decision distribution, and recent updates.

---

## 4. Negotiation Assistant (`/api/negotiations`)

### `GET /api/negotiations/:contractId?clauseId=...`
Fetches or initializes the 3-way negotiation workspace for a specific clause.

### `POST /api/negotiations/:id/suggest`
Re-runs Negotiation Agent to generate alternative counterproposal wording.

### `POST /api/negotiations/:id/counterproposal`
Records a draft counterproposal with attorney notes.

### `POST /api/negotiations/:id/finalize`
Accepts or rejects the negotiated clause and automatically commits approved language into Precedent Memory.

---

## 5. Lifecycle Approvals (`/api/approvals`)

### `GET /api/approvals`
Returns contracts pending sign-off and historical approval decisions.

### `POST /api/approvals/:id/approve`
Grants formal legal sign-off and transitions contract status to `Approved`. Protected to `admin` and `lawyer`.

### `POST /api/approvals/:id/reject`
Rejects contract and marks status as `Terminated`.

### `POST /api/approvals/:id/request-changes`
Flags contract for counterparty amendments (`Changes Requested`).

---

## 6. Obligations & Renewals (`/api/obligations`)

### `GET /api/obligations`
Queries contractual deliverables and payment deadlines. Synchronizes overdue statuses.

### `PATCH /api/obligations/:id`
Updates obligation status (`completed`, `in_progress`) or completion notes.

### `GET /api/obligations/renewals`
Returns approaching renewals categorized by urgency (90, 60, 30, 7 days) and calculates advance non-renewal notice deadlines.

---

## 7. Reports & Auditing (`/api/reports` & `/api/audit`)

### `GET /api/reports/overview`
Returns real-time dashboard KPIs, Recharts datasets, and recent activity timeline.

### `GET /api/reports/export-csv?type=contracts|precedents`
Generates and downloads audit-ready CSV reports.

### `GET /api/audit`
Returns paginated, immutable audit logs with filter by action and resource type.
