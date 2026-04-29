const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

const rawEnv = (process.env.REACT_APP_ENV || "").trim().toLowerCase();
const isProductionEnv = rawEnv === "production";
const productionApiBaseUrl =
  "https://lernevo-backend-237359549871.us-central1.run.app/api";

const defaultApiBaseUrl = isProductionEnv
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
