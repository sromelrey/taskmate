// Utility functions for authentication (not server actions)

export function getSessionIdFromCookies(
  cookieHeader: string | null
): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  return cookies["taskmate-session"] || null;
}
