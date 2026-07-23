export interface PingResult {
  success: boolean;
  statusCode: number | null;
  responseTimeMs: number;
  cause?: string;
}

export async function pingUrl(url: string, timeoutMs = 10000): Promise<PingResult> {
  const start = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    const responseTimeMs = Date.now() - start;

    return {
      success: res.status < 400,
      statusCode: res.status,
      responseTimeMs,
      cause: res.status >= 400 ? `HTTP ${res.status}` : undefined,
    };
  } catch (err: any) {
    clearTimeout(timeout);
    const responseTimeMs = Date.now() - start;
    return {
      success: false,
      statusCode: null,
      responseTimeMs,
      cause: err.name === 'AbortError' ? 'Timeout' : 'Connection failed',
    };
  }
}