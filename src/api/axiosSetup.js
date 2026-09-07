import axios from "axios";

let interceptorId = null;

export function setupAxiosInterceptors(logoutUser) {
  // Remove previous interceptor if one exists
  if (interceptorId !== null) {
    axios.interceptors.response.eject(interceptorId);
  }

  interceptorId = axios.interceptors.response.use(
    (response) => response,

    (error) => {
      const requestUrl = error.config?.url || "";

      const isAuthEndpoint =
        requestUrl.includes("/auth/login") ||
        requestUrl.includes("/auth/signup") ||
        requestUrl.includes("/auth/account-recovery") ||
        requestUrl.includes("/auth/reset-password");

      if (error.response?.status === 401 && !isAuthEndpoint) {
        logoutUser(false);
      }

      return Promise.reject(error);
    }
  );
}