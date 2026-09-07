import axios from "axios";

export const khidmatAiAxiosApiClient = axios.create({
  baseURL: typeof window === "undefined" ? process.env.NEXT_PUBLIC_BACKEND_API_URL : "/backend-api",
  withCredentials: true,
  timeout: 15_000,
  headers: { Accept: "application/json" },
});

khidmatAiAxiosApiClient.interceptors.request.use((requestConfiguration) => {
  if (typeof window !== "undefined" && requestConfiguration.url) {
    requestConfiguration.url = requestConfiguration.url.replace(/^\/api(?=\/|$)/, "");
  }

  return requestConfiguration;
});

khidmatAiAxiosApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error?.message;
    const developmentDetails = error.response?.data?.error?.details;
    if (typeof message === "string") {
      error.message =
        process.env.NODE_ENV === "development" && typeof developmentDetails === "string"
          ? `${message} ${developmentDetails}`
          : message;
    }
    return Promise.reject(error);
  },
);
