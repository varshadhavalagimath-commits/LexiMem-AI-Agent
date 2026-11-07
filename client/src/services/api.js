import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('leximem_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Interceptor for 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('leximem_token');
      localStorage.removeItem('leximem_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const contractAPI = {
  getContracts: (params) => api.get('/contracts', { params }),
  getContract: (id) => api.get(`/contracts/${id}`),
  uploadContract: (formData) => api.post('/contracts/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadVersion: (id, formData) => api.post(`/contracts/${id}/version`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateContract: (id, updates) => api.patch(`/contracts/${id}`, updates),
  archiveContract: (id) => api.delete(`/contracts/${id}`),
  downloadContractUrl: (id) => `/api/contracts/${id}/download`,
};

export const analysisAPI = {
  triggerAnalysis: (contractId) => api.post(`/analysis/${contractId}`),
  getContractAnalysis: (contractId) => api.get(`/analysis/${contractId}`),
  getRisks: (contractId, params) => api.get(`/analysis/${contractId}/risks`, { params }),
};

export const precedentAPI = {
  getPrecedents: (params) => api.get('/precedents', { params }),
  searchPrecedents: (payload) => api.post('/precedents/search', payload),
  recallForClause: (payload) => api.post('/precedents/recall', payload),
  commitPrecedent: (data) => api.post('/precedents', data),
  supersedePrecedent: (id, data) => api.post(`/precedents/${id}/supersede`, data),
  recordFeedback: (id, feedback) => api.post(`/precedents/${id}/feedback`, feedback),
  getMemoryDashboard: () => api.get('/precedents/dashboard'),
};

export const negotiationAPI = {
  getNegotiation: (contractId, clauseId) => api.get(`/negotiations/${contractId}${clauseId ? `?clauseId=${clauseId}` : ''}`),
  regenerateSuggestion: (id) => api.post(`/negotiations/${id}/suggest`),
  addCounterproposal: (id, data) => api.post(`/negotiations/${id}/counterproposal`, data),
  finalizeDecision: (id, data) => api.post(`/negotiations/${id}/finalize`, data),
};

export const approvalAPI = {
  getApprovals: () => api.get('/approvals'),
  approveContract: (id, data) => api.post(`/approvals/${id}/approve`, data),
  rejectContract: (id, data) => api.post(`/approvals/${id}/reject`, data),
  requestChanges: (id, data) => api.post(`/approvals/${id}/request-changes`, data),
};

export const obligationAPI = {
  getObligations: (params) => api.get('/obligations', { params }),
  createObligation: (data) => api.post('/obligations', data),
  updateObligation: (id, updates) => api.patch(`/obligations/${id}`, updates),
  getRenewalAlerts: () => api.get('/obligations/renewals'),
};

export const policyAPI = {
  getPolicies: () => api.get('/policies'),
  createPolicy: (data) => api.post('/policies', data),
  updatePolicy: (id, updates) => api.patch(`/policies/${id}`, updates),
  checkCompliance: (contractId) => api.get(`/policies/compliance/${contractId}`),
};

export const reportAPI = {
  getOverview: () => api.get('/reports/overview'),
  getRiskReport: () => api.get('/reports/risks'),
  getRenewalReport: () => api.get('/reports/renewals'),
  exportCsvUrl: (type = 'contracts') => `/api/reports/export-csv?type=${type}`,
};

export const auditAPI = {
  getAuditLogs: (params) => api.get('/audit', { params }),
};

export default api;
