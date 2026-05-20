// ──────────────────────────────────────────────
// WasteBridge API Service — complete & corrected
// ──────────────────────────────────────────────

const API_BASE = 'http://localhost:8000';

function getToken() {
  return localStorage.getItem('wb_token');
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(method, path, { body, isForm = false } = {}) {
  const headers = { ...authHeaders() };
  const opts = { method, headers };

  if (body && isForm) {
    opts.body = body; // FormData — browser sets content-type with boundary
  } else if (body) {
    headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${path}`, opts);

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const err = await res.json();
      // FastAPI validation errors have a different shape
      if (err.detail && Array.isArray(err.detail)) {
        detail = err.detail.map(e => e.msg).join(', ');
      } else {
        detail = err.detail || detail;
      }
    } catch { /* ignore parse errors */ }
    throw new Error(detail);
  }

  if (res.status === 204) return null;
  return res.json();
}

// ──────────────────────────────────────────────
// Auth
// ──────────────────────────────────────────────

export async function loginUser(email, password) {
  // FastAPI OAuth2PasswordRequestForm expects form-urlencoded
  const formData = new URLSearchParams();
  formData.append('username', email); // FastAPI OAuth2 uses 'username' field
  formData.append('password', password);

  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData,
  });

  if (!res.ok) {
    let detail = 'Invalid email or password';
    try {
      const err = await res.json();
      detail = err.detail || detail;
    } catch { /* ignore */ }
    throw new Error(detail);
  }

  return res.json(); // { access_token, token_type, role, user_id }
}

export async function registerGenerator(data) {
  return request('POST', '/api/auth/register/generator', { body: data });
}

export async function registerOperator(data) {
  return request('POST', '/api/auth/register/operator', { body: data });
}

export async function fetchCurrentUser() {
  return request('GET', '/api/auth/me');
}

// ──────────────────────────────────────────────
// Generator Profile
// ──────────────────────────────────────────────

export async function fetchGeneratorProfile() {
  return request('GET', '/api/generator/profile');
}

export async function updateGeneratorProfile(data) {
  return request('PUT', '/api/generator/profile', { body: data });
}

export async function uploadGeneratorLogo(file) {
  const formData = new FormData();
  formData.append('file', file);
  return request('POST', '/api/generator/profile/logo', { body: formData, isForm: true });
}

// ──────────────────────────────────────────────
// Operators (Browse Companies)
// ──────────────────────────────────────────────

export async function fetchOperators(filters = {}) {
  const params = new URLSearchParams();
  if (filters.waste_type) params.append('waste_type', filters.waste_type);
  // Only send city if not "All"
  if (filters.city && filters.city !== 'All') params.append('city', filters.city);
  // Only send min_rating if not "all"
  if (filters.min_rating && filters.min_rating !== 'all') params.append('min_rating', filters.min_rating);
  if (filters.pricing_model) params.append('pricing_model', filters.pricing_model);

  const qs = params.toString();
  return request('GET', `/api/operators${qs ? '?' + qs : ''}`);
}

export async function fetchOperatorById(operatorId) {
  return request('GET', `/api/operators/${operatorId}`);
}

// ──────────────────────────────────────────────
// Waste Logs
// ──────────────────────────────────────────────

export async function createWasteLog(data) {
  return request('POST', '/api/waste-logs', { body: data });
}

export async function fetchWasteLogs() {
  return request('GET', '/api/waste-logs');
}

export async function fetchWasteLogById(logId) {
  return request('GET', `/api/waste-logs/${logId}`);
}

export async function uploadWastePhoto(logId, file) {
  const formData = new FormData();
  formData.append('file', file);
  return request('POST', `/api/waste-logs/${logId}/photo`, { body: formData, isForm: true });
}

// ──────────────────────────────────────────────
// Pickups
// ──────────────────────────────────────────────

export async function createPickupRequest(data) {
  return request('POST', '/api/pickups', { body: data });
}

export async function fetchPickups(filters = {}) {
  const params = new URLSearchParams();
  // Backend accepts: status, operator_id, date_range
  if (filters.status && filters.status !== 'All') params.append('status', filters.status);
  if (filters.operator_id) params.append('operator_id', filters.operator_id);
  if (filters.date_range && filters.date_range !== 'all') params.append('date_range', filters.date_range);

  const qs = params.toString();
  return request('GET', `/api/pickups${qs ? '?' + qs : ''}`);
}

export async function fetchPickupById(requestId) {
  return request('GET', `/api/pickups/${requestId}`);
}

export async function updatePickup(requestId, data) {
  return request('PUT', `/api/pickups/${requestId}`, { body: data });
}

export async function cancelPickup(requestId) {
  return request('DELETE', `/api/pickups/${requestId}`);
}

// ──────────────────────────────────────────────
// Dashboard Stats  (/api/pickups/stats)
// ──────────────────────────────────────────────

export async function fetchDashboardStats() {
  return request('GET', '/api/pickups/stats');
}

// ──────────────────────────────────────────────
// Compliance Reports
// ──────────────────────────────────────────────

export async function generateReport(data) {
  return request('POST', '/api/reports', {
    body: {
      report_type: data.report_type,
      selected_period: data.selected_period || null,
    },
  });
}

export async function emailReport(data) {
  return request('POST', '/api/reports/email', {
    body: {
      report_type: data.report_type || 'monthly',
      selected_period: data.selected_period || null,
      regulator_email: data.regulator_email,
    },
  });
}

export async function fetchReports() {
  return request('GET', '/api/reports');
}

// ──────────────────────────────────────────────
// Operator
// ──────────────────────────────────────────────

export async function fetchOperatorPickups(status = null) {
  const qs = status ? `?status=${status}` : '';
  return request('GET', `/api/operator/pickups${qs}`);
}

export async function acceptPickup(pickupId) {
  return request('PUT', `/api/operator/pickups/${pickupId}/accept`);
}

export async function declinePickup(pickupId) {
  return request('PUT', `/api/operator/pickups/${pickupId}/decline`);
}


export async function completePickup(pickupId) {
  return request('PUT', `/api/operator/pickups/${pickupId}/complete`);
}

export async function fetchOperatorStats() {
  return request('GET', '/api/operator/stats');
}

export async function fetchOperatorEarnings() {
  return request('GET', '/api/operator/earnings');
}