export function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function isExpired(token) {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now;
}

export function extractRole(token) {
  const payload = parseJwt(token);
  console.log("JWT payload:", payload);  // 👈 debug
  if (!payload) return null;

  if (Array.isArray(payload.roles) && payload.roles.length) {
    return payload.roles[0];
  }

  if (typeof payload.roles === 'string') {
    const cleaned = payload.roles.replace(/[\[\]\s]/g, '');
    return cleaned; // → "INSTRUCTOR"
  }

  return null;
}
