// ── Centralized API client with retry + timeout ──

interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function fetchWithTimeout(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { timeout = 45000, ...fetchOptions } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(new Error(`Request timed out after ${timeout}ms`)), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

async function fetchWithRetry(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { retries = 2, ...rest } = options;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, rest);
      if (response.ok) return response;

      // Don't retry client errors (4xx), only server errors (5xx)
      if (response.status < 500) {
        const data = await response.json().catch(() => ({}));
        throw new ApiError(
          data.error || `Request failed with status ${response.status}`,
          response.status
        );
      }

      lastError = new ApiError(
        `Server error (${response.status})`,
        response.status
      );
    } catch (err: any) {
      if (err instanceof ApiError && err.status < 500) throw err;
      lastError = err;
    }

    // Exponential backoff before retry
    if (attempt < retries) {
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
    }
  }

  throw lastError || new Error('Request failed after retries');
}

// ── Public API Methods ──

export async function fetchEnvironmentData(location: string) {
  const res = await fetchWithRetry(
    `/api/environment?location=${encodeURIComponent(location)}`
  );
  return res.json();
}

export async function fetchExplanation(
  location: string,
  concern: string,
  environmentData: any
) {
  const res = await fetchWithRetry('/api/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location, concern, environmentData }),
  });
  return res.json();
}

export async function fetchSimulation(params: {
  yearsInFuture: number;
  city: string;
  scenario: string;
  trajectory: string;
}) {
  const res = await fetchWithRetry('/api/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return res.json();
}

export async function fetchChatResponse(
  messages: { role: string; content: string }[],
  contextData?: any
) {
  const res = await fetchWithRetry('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, contextData }),
  });
  return res.json();
}

export async function fetchGeocode(lat: number, lon: number) {
  const res = await fetchWithRetry(
    `/api/geocode?lat=${lat}&lon=${lon}`
  );
  return res.json();
}

export async function fetchHistory(lat: number, lon: number) {
  const res = await fetchWithRetry(
    `/api/history?lat=${lat}&lon=${lon}`
  );
  return res.json();
}
