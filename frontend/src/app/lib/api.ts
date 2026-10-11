export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL !== undefined
    ? process.env.NEXT_PUBLIC_API_BASE_URL
    : process.env.NODE_ENV === "production"
    ? ""
    : "http://localhost:8000";
