import axios from "axios";

const defaultApiBaseUrl =
  typeof window !== "undefined"
    ? `${window.location.origin}/api/`
    : "http://localhost:8000/api/";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export const setAuthSession = (sessionId) => {
  if (sessionId) {
    api.defaults.headers.common["X-Session-Id"] = sessionId;
    return;
  }
  delete api.defaults.headers.common["X-Session-Id"];
};

export const startSession = async (name, location, password = "") =>
  api.post("start-session/", { name, location, password });

export const sendMessage = async (sessionId, message, name) =>
  api.post("chat/", {
    conversation_id: sessionId,
    message,
    name,
  });

export const getHistory = async (sessionId, name) =>
  api.get(`conversations/${sessionId}/`, {
    params: { name },
  });

export const createConversation = async (name) => api.post("conversations/", { name });

export const getPortfolio = async () => api.get("portfolio/");
export const getProjectInfo = async () => api.get("project-info/");
export const getContent = async (key) => api.get(`content/${key}/`);
export const getMetrics = async () => api.get("metrics/");
export const trackEvent = async (payload) => api.post("events/", payload);
export const getAdminSessions = async () => api.get("admin/sessions/");
export const getAdminAnalytics = async () => api.get("admin/analytics/");
export const searchAdminData = async (query) =>
  api.get("admin/search/", {
    params: { query },
  });
export const getAdminHistory = async (sessionId) => api.get(`admin/history/${sessionId}/`);
export const getUserJourney = async (sessionId) => api.get(`admin/user-journey/${sessionId}/`);
export const getAdmins = async () => api.get("superadmin/admins/");
export const addAdmin = async (payload) => api.post("superadmin/add-admin/", payload);
export const removeAdmin = async (adminId) => api.delete(`superadmin/remove-admin/${adminId}/`);
export const updateContent = async (payload) =>
  api.post("superadmin/update-content/", payload);

export const getAIConfig = async () => api.get("superadmin/ai-config/");
export const updateAIConfig = async (payload) =>
  api.post("superadmin/update-ai-config/", payload);
export const getHeatmap = async () => api.get("superadmin/heatmap/");
export const getSystemHealth = async () => api.get("superadmin/system-health/");
