import axios from "axios";
import { refreshClient } from "./refreshClient";
export const axiosClient = axios.create({
  baseURL: "/next-api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
let isRefreshing = false;
const useAuthStore = require("../store/auth.store").useAuthStore; // tránh circular dependency
let failedQueue: {
  resolve: (value?: any) => void;
  reject: (error: any) => void;
}[] = [];
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // tránh loop refresh
    if (originalRequest._retry) {
      return Promise.reject(error);
    }
    const isUnauthorized = error.response?.status === 401;
    const isAuthEndpoint =
      typeof originalRequest?.url === "string" &&
      (originalRequest.url.includes("/auth/login") ||
        originalRequest.url.includes("/auth/register"));
    // const isTokenExpired = error.response?.data?.error === "Access token expired";
    // console.log("istokenexpired:", isTokenExpired)
    if (isUnauthorized && !isAuthEndpoint) {
      //  nếu đang refresh → queue lại request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => resolve(axiosClient(originalRequest)),
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      try {
        // refresh token bằng client riêng (KHÔNG interceptor)
        await refreshClient.post("/auth/refresh");

        processQueue(null);

        // retry request cũ
        return axiosClient(originalRequest);
      } catch (err) {
        processQueue(err, null);

        // logout global
        useAuthStore.getState().clearAuth();

        window.location.href = "/login";

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);