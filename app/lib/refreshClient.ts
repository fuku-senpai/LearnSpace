import axios from "axios";

export const refreshClient = axios.create({
  baseURL: "/next-api",
  withCredentials: true,
});