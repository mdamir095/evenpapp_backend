// Centralized API base URL for your frontend
// Uses Vite's environment variable if available, otherwise falls back to localhost

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:10030/api/v1/";
export const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:10030/uploads/profile/";
