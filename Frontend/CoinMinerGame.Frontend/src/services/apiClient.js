import axios from "axios";

const BASE_HOST = "http://localhost:7238";

const apiClient = axios.create({
  baseURL: BASE_HOST,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const userString = localStorage.getItem("coin_miner_user");
    if (userString) {
      const user = JSON.parse(userString);
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const setupResponseInterceptor = (logoutCallback) => {
  apiClient.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response) {
        if (error.response.status === 401) {
          console.error("Unauthorized! Token may be invalid or expired.");
          logoutCallback();
        }
      }
      return Promise.reject(error);
    }
  );
};

export const api = {
  register: (username, password, confirmPassword) =>
    apiClient.post("/api/auth/register", {
      username,
      password,
      confirmPassword,
    }),
  login: (username, password) =>
    apiClient.post("/api/auth/login", { username, password }),

  getUserState: () => apiClient.get("/api/user/state"),
  getCoinHistory: () => apiClient.get("/api/user/history"),
  getLeaderboard: () => apiClient.get("/api/leaderboard"),

  mine: () => apiClient.post("/api/mine"),
  buyMachine: (machine) => apiClient.post("/api/inventory/buy", machine),
  activateBoost: (boost) => apiClient.post("/api/boost/activate", boost),
};
