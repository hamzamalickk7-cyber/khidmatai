import axios from "axios";

export const khidmatAiAxiosApiClient = axios.create({
  baseURL: typeof window === "undefined" ? process.env.NEXT_PUBLIC_BACKEND_API_URL : "/backend-api",
  withCredentials: true,
  timeout: 15_000,
  headers: { Accept: "application/json" },
});

khidmatAiAxiosApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error?.message;
    if (typeof message === "string") error.message = message;
    return Promise.reject(error);
  },
);
