const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      window.localStorage.setItem("access_token", token);
    } else {
      window.localStorage.removeItem("access_token");
    }
  }
}

export function getAccessToken() {
  if (accessToken) return accessToken;
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem("access_token");
    if (stored) {
      accessToken = stored;
      return stored;
    }
  }
  return null;
}

async function request(path, options = {}) {
  const token = getAccessToken();
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const auditsApi = {
  list: () => request("/audits"),
  detail: (id) => request(`/audits/${id}`),
  create: (payload) => request("/audits", { method: "POST", body: JSON.stringify(payload) }),
  update: (id, payload) => request(`/audits/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  upsertStep: (id, payload) => request(`/audits/${id}/steps`, { method: "POST", body: JSON.stringify(payload) }),
  addFinding: (id, payload) => request(`/audits/${id}/findings`, { method: "POST", body: JSON.stringify(payload) }),
  addEvidence: (auditId, findingId, payload) =>
    request(`/audits/${auditId}/findings/${findingId}/evidence`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  dashboard: () => request("/audits/dashboard/summary"),
  upsertModuleStatus: (auditId, payload) =>
    request(`/audits/${auditId}/modules`, { method: "POST", body: JSON.stringify(payload) }),
};

export const lookupsApi = {
  bppSteps: () => request("/lookups/bpp-steps"),
  worldBank: () => request("/lookups/world-bank-steps"),
  complianceOptions: () => request("/lookups/compliance-options"),
  severityOptions: () => request("/lookups/severity-options"),
  monitoringFocus: () => request("/lookups/monitoring-focus"),
  modules: () => request("/lookups/modules"),
};

export const authApi = {
  register: (payload) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  login: ({ email, password }) =>
    request("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        username: email,
        password,
        scope: "",
      }),
    }),
  me: () => request("/auth/me"),
};

export const requirementsApi = {
  create: (auditId, payload) =>
    request(`/audits/${auditId}/requirements/`, {
      method: "POST",
      body: payload,
    }),
};

export const stakeholdersApi = {
  create: (auditId, payload) =>
    request(`/audits/${auditId}/stakeholders/`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    }),
};

export { API_BASE_URL };
