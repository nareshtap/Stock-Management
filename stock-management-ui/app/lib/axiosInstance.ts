import axios from "axios";

/**
 * Creates an Axios instance configured with the base URL and default headers.
 * This Axios instance will be used for making API requests throughout the application.
 * 
 * @returns {AxiosInstance} Configured Axios instance for API calls.
 */
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
