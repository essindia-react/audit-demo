const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
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

export { API_BASE_URL };
