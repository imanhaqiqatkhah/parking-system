import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// اضافه کردن interceptor برای لاگ کردن درخواست‌ها
apiClient.interceptors.request.use(
  (config) => {
    console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// اضافه کردن interceptor برای لاگ کردن پاسخ‌ها
apiClient.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error("❌ API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  },
);

// ✅ تعریف صحیح متدها
const api = {
  // Vehicles
  getParkedVehicles() {
    return apiClient.get("/vehicles/parked");
  },

  vehicleEntry(data) {
    return apiClient.post("/vehicles/entry", data);
  },

  vehicleExit(data) {
    return apiClient.post("/vehicles/exit", data);
  },

  getStats() {
    return apiClient.get("/vehicles/stats");
  },

  getHistory(limit = 50) {
    return apiClient.get(`/vehicles/history?limit=${limit}`);
  },

  searchVehicles(query) {
    return apiClient.get(`/vehicles/search?q=${encodeURIComponent(query)}`);
  },

  // ✅ آپلود عکس - مخصوص form-data
  uploadEntryImage(formData) {
    return apiClient.post("/upload/entry", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  uploadExitImage(formData) {
    return apiClient.post("/upload/exit", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // ✅ متد عمومی برای هر درخواست
  get(url) {
    return apiClient.get(url);
  },

  post(url, data, config = {}) {
    return apiClient.post(url, data, config);
  },

  put(url, data, config = {}) {
    return apiClient.put(url, data, config);
  },

  delete(url, config = {}) {
    return apiClient.delete(url, config);
  },

  getDailyRevenue(days = 7) {
    return apiClient.get(`/vehicles/daily-revenue?days=${days}`);
  },
};

export default api;
