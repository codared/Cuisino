export const safeJson = async (res) => {
  const contentType = res.headers.get("Content-Type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  } else {
    const text = await res.text(); // capture and log for debugging
    console.warn("Non-JSON response detected:", text);
    throw new Error("Server cold start or misconfigured response");
  }
};

export const fetchWithRetry = async (
  url,
  options = {},
  retries = 3,
  delay = 1500
) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      // const data = await safeJson(res);
      // if (data) return data;
      return await safeJson(res);
    } catch (err) {
      if (attempt === retries) throw err; // Last attempt, throw error
      console.warn(
        `Fetch attempt ${attempt} failed for ${url}: ${err.message}`
      );
      await new Promise((r) => setTimeout(r, delay)); // wait before retrying
    }
  }
};
