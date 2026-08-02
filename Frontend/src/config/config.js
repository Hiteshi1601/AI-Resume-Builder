const AUTH_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const API_KEY = import.meta.env.VITE_STRAPI_API_KEY;
const GEMENI_API_KEY = import.meta.env.VITE_GEMENI_API_KEY;
let VITE_APP_URL = import.meta.env.VITE_APP_URL;

if (
  !VITE_APP_URL ||
  (typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1" &&
    VITE_APP_URL.includes("localhost"))
) {
  VITE_APP_URL = "https://ai-resume-builder-backend.onrender.com/";
}

if (!VITE_APP_URL.endsWith("/")) {
  VITE_APP_URL += "/";
}

export { AUTH_KEY, API_KEY, GEMENI_API_KEY, VITE_APP_URL };
