export interface JwtPayload {
  exp?: number;
  iat?: number;
  id?: string;
  username?: string;
  role?: string;
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(atob(padded)) as JwtPayload;
  } catch {
    return null;
  }
}

/** Returns true when token is missing, malformed, or past expiry. */
export function isTokenExpired(token: string | null | undefined, skewSeconds = 0): boolean {
  if (!token) return true;

  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;

  return Date.now() >= (payload.exp - skewSeconds) * 1000;
}
