const API_BASE_URL = "http://localhost:5000/api";

const apiService = {
  // Overlay endpoints
  async getOverlays(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/overlays?${queryString}`);
    if (!response.ok) throw new Error("Failed to fetch overlays");
    return response.json();
  },

  async createOverlay(overlayData) {
    const response = await fetch(`${API_BASE_URL}/overlays`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(overlayData),
    });
    if (!response.ok) throw new Error("Failed to create overlay");
    return response.json();
  },

  async updateOverlay(id, overlayData) {
    const response = await fetch(`${API_BASE_URL}/overlays/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(overlayData),
    });
    if (!response.ok) throw new Error("Failed to update overlay");
    return response.json();
  },

  async deleteOverlay(id) {
    const response = await fetch(`${API_BASE_URL}/overlays/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete overlay");
    return response.json();
  },

  // Stream endpoints
  async validateStream(rtspUrl) {
    const response = await fetch(`${API_BASE_URL}/streams/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rtspUrl }),
    });
    if (!response.ok) throw new Error("Failed to validate stream");
    return response.json();
  },

  async startStream(streamId, rtspUrl, settings = {}) {
    const response = await fetch(`${API_BASE_URL}/streams/${streamId}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rtspUrl, settings }),
    });
    if (!response.ok) throw new Error("Failed to start stream");
    return response.json();
  },

  async getStreamStatus(streamId) {
    const response = await fetch(`${API_BASE_URL}/streams/${streamId}/status`);
    if (!response.ok) throw new Error("Failed to get stream status");
    return response.json();
  },

  // Settings endpoints
  async getSettings() {
    const response = await fetch(`${API_BASE_URL}/settings`);
    if (!response.ok) throw new Error("Failed to fetch settings");
    return response.json();
  },

  async updateSettings(settings) {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (!response.ok) throw new Error("Failed to update settings");
    return response.json();
  },

  // Analytics endpoints
  async getAnalytics() {
    const response = await fetch(`${API_BASE_URL}/analytics/overview`);
    if (!response.ok) throw new Error("Failed to fetch analytics");
    return response.json();
  },
};

export default apiService;
export { API_BASE_URL };
