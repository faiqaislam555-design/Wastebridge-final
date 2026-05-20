# WasteBridge — Full Stack Project

## Quick Start

### 1. Start the Backend

```bash
cd wastebridge-backend

# First time only — create virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

pip install -r requirements.txt

# Seed the database with sample operators + test generator
python seed.py

# Start the API server
uvicorn app.main:app --reload
```

Backend runs at: http://localhost:8000
API docs at:     http://localhost:8000/docs


---

### 2. Start the Frontend

```bash
# In the project root (where package.json is)
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

---

## Fixes Applied (Frontend → Backend Alignment)

| File | Fix |
|------|-----|
| `src/components/ProtectedRoute.jsx` | Added `loading` state check to prevent redirect flash before auth resolves |
| `src/context/AuthContext.jsx` | Correct user shape `{ id, full_name, email, role }` from `/api/auth/me` |
| `src/services/api.js` | Cleaned filter params — no longer sends `city=All` or `min_rating=all` to backend |
| `src/dashboard/pages/DashboardHome.jsx` | Activity feed built from real pickup data; stat cards use actual backend field names |
| `src/dashboard/pages/PickupHistory.jsx` | Fixed field mapping: `operator_profile_id` (not `operator_id`), `certificate_file` (not `certificate`), added Confirmed/Pending status badges |
| `src/dashboard/pages/ComplianceReports.jsx` | Removed auto-POST on render (was creating DB records on every page visit); added Generate button; shows past reports list |
| `src/dashboard/pages/GeneratorProfile.jsx` | Fetches `/api/auth/me` + `/api/generator/profile` together; correct field names (`institution_name`, `phone_number`); logo URL built correctly |
| `src/dashboard/pages/RequestPickup.jsx` | Replaced `alert()` with success state + redirect; company fields use backend shape (`company_name`, `logo_letter`, `service_types`); date min set to today |

