const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

const rawEnv = (process.env.REACT_APP_ENV || "").trim().toLowerCase();
const isProductionEnv = rawEnv === "production";

const defaultApiBaseUrl = isProductionEnv
  ? "https://api.lernevo.com/api"
  : "https://staging-api.lernevo.com/api";

const defaultAiBaseUrl = `${defaultApiBaseUrl}/ai`;

export const API_BASE_URL = trimTrailingSlash(
  process.env.REACT_APP_API_URL || defaultApiBaseUrl
);

export const AI_API_BASE_URL = trimTrailingSlash(
  process.env.REACT_APP_AI_API_URL || defaultAiBaseUrl
);

export const APP_ENV = rawEnv || "staging";
