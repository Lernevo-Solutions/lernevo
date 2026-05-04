const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

const rawEnv = (process.env.REACT_APP_ENV || "").trim().toLowerCase();
const isProductionEnv = rawEnv === "production";
const hostname =
  typeof window !== "undefined" ? window.location.hostname.toLowerCase() : "";
const isLocalHost =
  hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
const localApiBaseUrl = "http://127.0.0.1:8000/api";
const productionApiBaseUrl =
  "https://lernevo-backend-237359549871.us-central1.run.app/api";

const defaultApiBaseUrl = isLocalHost
  ? localApiBaseUrl
  : isProductionEnv
  ? productionApiBaseUrl
  : "https://staging-api.lernevo.com/api";

const defaultAiBaseUrl = `${defaultApiBaseUrl}/ai`;

export const API_BASE_URL = trimTrailingSlash(
  process.env.REACT_APP_API_URL || defaultApiBaseUrl
);

export const AI_API_BASE_URL = trimTrailingSlash(
  process.env.REACT_APP_AI_API_URL || defaultAiBaseUrl
);

export const APP_ENV = rawEnv || "staging";
