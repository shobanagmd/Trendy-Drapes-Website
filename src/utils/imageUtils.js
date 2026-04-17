import { BACKEND_URL } from "./paths";

export const formatImageUrl = (url) => {
  if (!url) return "📦";
  if (typeof url !== 'string') return "📦";
  if (url.startsWith("/uploads/")) return `${BACKEND_URL}${url}`;
  return url;
};
