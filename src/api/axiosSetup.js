// import axios from "axios";

// export function setupAxiosInterceptors(logoutUser) {
//   axios.interceptors.response.use(
//     (response) => response,
//     (error) => {
//       const requestUrl = error.config?.url || "";

//       const isAuthEndpoint =
//         requestUrl.includes("/auth/login") ||
//         requestUrl.includes("/auth/signup") ||
//         requestUrl.includes("/auth/account-recovery");

//       // Redirect only if it's NOT a login/signup request
//       if (error.response?.status === 401 && !isAuthEndpoint) {
//         logoutUser();
//         window.location.href = "/login";
//       }

//       return Promise.reject(error);
//     },
//   );
// }

import axios from "axios";

export function setupAxiosInterceptors(logoutUser) {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const requestUrl = error.config?.url || "";

      const isAuthEndpoint =
        requestUrl.includes("/auth/login") ||
        requestUrl.includes("/auth/signup") ||
        requestUrl.includes("/auth/account-recovery");

      // ✅ Don't logout for reset password API
      const isResetPasswordEndpoint = requestUrl.includes(
        "/auth/reset-password",
      );

      if (
        error.response?.status === 401 &&
        !isAuthEndpoint &&
        !isResetPasswordEndpoint
      ) {
        logoutUser();
        window.location.href = "/login";
      }

      return Promise.reject(error);
    },
  );
}
