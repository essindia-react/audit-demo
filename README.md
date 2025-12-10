# Procurement Audit, Monitoring & Evaluation App

Full-stack reference implementation for the Nigerian Bureau of Public Procurement (BPP) nine-step audit cycle with World Bank alignment. The stack pairs a FastAPI backend (MySQL + SQLAlchemy) with a React dashboard optimised for auditors capturing evidence, compliance status, findings, and monitoring data.

## Architecture
- **Backend**: FastAPI, SQLAlchemy 2.0, Pydantic, MySQL connector.
- **Frontend**: React 19 (Vite), modern component layout, API client + optimistic UI hints.
- **Domain model**: Audits, steps, findings, evidence items, stakeholder engagements, and monitoring snapshots.
- **Reference data**: BPP step checklist + World Bank mapping exposed via `/lookups` endpoints for use across channels (web, mobile, curriculum authoring, etc.).
- **Module catalog**: Full TOR coverage for Modules A–D (core BPP, Monitoring & Evaluation, Technical, Supporting) with per-submodule compliance tracking.

## Backend setup (Python)
1. Create a virtual environment and install dependencies:
   ```bash
   cd /workspace/backend
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
2. Configure the database connection:
   ```bash
   cp .env.example .env
   # edit DATABASE_URL to match your MySQL credentials
   ```
   Example DSN: `mysql+mysqlconnector://root:strongpass@localhost:3306/procurement_audit`
3. Create the database (one-time):
   ```sql
   CREATE DATABASE procurement_audit CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
4. Run the API (auto-creates tables when `SYNC_SCHEMA_ON_STARTUP=True`):
   ```bash
   uvicorn app.main:app --reload
   ```
   Evidence uploads default to `storage/evidence` (configurable via `EVIDENCE_STORAGE_DIR`) and are served at `GET /evidence/{filename}`.

### Key endpoints
| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/` | Health check |
| GET | `/lookups/bpp-steps` | BPP nine steps + checkpoints |
| POST | `/audits` | Create audit project |
| GET | `/audits` | List audits |
| GET | `/audits/{id}` | Audit detail (steps, findings, monitoring) |
| POST | `/audits/{id}/steps` | Upsert step compliance data |
| POST | `/audits/{id}/findings` | Add a technical/financial finding |
| POST | `/audits/{id}/findings/{finding_id}/evidence` | Attach evidence reference |
| GET | `/audits/dashboard/summary` | Portfolio KPIs for dashboard |
| POST | `/auth/register` | Create user account + issue JWT |
| POST | `/auth/login` | Exchange credentials for JWT |
| GET | `/auth/me` | Fetch current profile (requires Bearer token) |
| GET | `/audits/{id}/requirements/` | List requirement identification entries |
| POST | `/audits/{id}/requirements/` | Create requirement entry (multipart, supports evidence upload) |
| GET | `/audits/{id}/stakeholders/` | List stakeholder analysis entries |
| POST | `/audits/{id}/stakeholders/` | Create stakeholder analysis entry |
| GET | `/audits/{id}/critical-needs/` | List critical needs assessment records |
| POST | `/audits/{id}/critical-needs/` | Create critical need entry (auto critical flag) |
| GET | `/audits/{id}/specifications/` | List specification suitability/openness entries |
| POST | `/audits/{id}/specifications/` | Create specification analysis entry (flags bias) |

## Frontend setup (React)
1. Install dependencies and configure API base URL:
   ```bash
   cd /workspace/frontend
   npm install
   echo "VITE_API_BASE_URL=http://localhost:8000" > .env.local
   ```
2. Run the dev server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```

The React dashboard includes:
- Portfolio snapshot cards (audits, compliance, severity mix).
- Audit selector, creation form, and detail workspace with step updates + findings capture.
- Checklist panel mirroring the BPP nine steps + H2 monitoring/remedy module with World Bank alignment tags.
- Authentication shell with login & registration workflow (JWT stored client-side, injected into all API calls).
- Requirement Identification panel with evidence uploads; feeds future Needs Assessment reports.
- Stakeholder Analysis form capturing type/role/interest/influence for matrix outputs.
- Critical Needs Assessment scoring urgency vs importance with automatic critical tagging.
- Specification Analysis workflow with openness checklist and supplier bias alerts feeding ethical reports.

## Next steps / extensions
- Add auth (MFA, RBAC) and encrypted offline store for field devices.
- Integrate photo/file evidence storage (S3, Azure Blob) and offline sync queue.
- Add AI/ML service hooks for anomaly detection or predictive KPI drift.
- Harden logging/observability (OpenTelemetry) and automated curriculum export.

> Tip: keep the backend running when using the frontend to ensure live lookup data (BPP checklist, severity options, dashboard KPIs) is available; the UI will fall back to local reference data when the API is offline.
