const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

const getBackendBaseUrl = () => {
  const apiUrl = (import.meta.env.VITE_API_URL || "").trim();
  if (!apiUrl) return null;
  return apiUrl.replace(/\/api\/?$/, "").replace(/\/$/, "");
};

export const resolveAssetUrl = (value) => {
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  if (!trimmed) return trimmed;

  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  if (trimmed.startsWith("//")) {
    return trimmed;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const parsed = new URL(trimmed);
      if (
        typeof window !== "undefined" &&
        LOCAL_HOSTS.has(parsed.hostname) &&
        !LOCAL_HOSTS.has(window.location.hostname)
      ) {
        const backendUrl = getBackendBaseUrl();
        if (backendUrl) {
          return backendUrl + parsed.pathname;
        }
      }
      return parsed.toString();
    } catch {
      return trimmed;
    }
  }

  // Relative paths — prepend backend base URL in production, keep as-is for dev (Vite proxy)
  if (trimmed.startsWith("/")) {
    const backendUrl = getBackendBaseUrl();
    if (backendUrl) {
      return backendUrl + trimmed;
    }
    return trimmed;
  }

  return trimmed;
};
