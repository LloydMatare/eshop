function parseCookies(header: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx > 0) {
      cookies[part.substring(0, idx).trim()] = decodeURIComponent(part.substring(idx + 1).trim());
    }
  }
  return cookies;
}

function getSessionToken(cookies: Record<string, string>): string | undefined {
  if (cookies["__session"]) return cookies["__session"];
  for (const key of Object.keys(cookies)) {
    if (key.startsWith("__session_")) return cookies[key];
  }
}

export async function authFromRequest(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const cookies = parseCookies(cookieHeader);
  const sessionToken = getSessionToken(cookies);

  if (!sessionToken) {
    throw new Error("No session token");
  }

  const payload = JSON.parse(Buffer.from(sessionToken.split(".")[1], "base64url").toString());
  const userId = payload.sub as string;
  if (!userId) {
    throw new Error("No user ID in session token");
  }

  return { userId, sessionClaims: payload };
}
