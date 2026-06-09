import crypto from 'crypto';

export const ADMIN_COOKIE_NAME = 'dankov_admin_session';

const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

function getAdminUsername() {
  return process.env.ADMIN_USERNAME || 'admin';
}

function getAdminPassword() {
  return (
    process.env.ADMIN_PASSWORD ||
    process.env.ADMIN_TOKEN ||
    process.env.CASES_ADMIN_TOKEN ||
    ''
  );
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || getAdminPassword();
}

function base64Url(value) {
  return Buffer.from(value).toString('base64url');
}

function signPayload(payload) {
  return crypto
    .createHmac('sha256', getSessionSecret())
    .update(payload)
    .digest('base64url');
}

function safeEqual(left = '', right = '') {
  const leftHash = crypto
    .createHash('sha256')
    .update(String(left))
    .digest();

  const rightHash = crypto
    .createHash('sha256')
    .update(String(right))
    .digest();

  return crypto.timingSafeEqual(leftHash, rightHash);
}

function parseCookies(header = '') {
  return String(header)
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const separator = part.indexOf('=');

      if (separator === -1) {
        return cookies;
      }

      const key = decodeURIComponent(part.slice(0, separator));
      const value = decodeURIComponent(part.slice(separator + 1));

      cookies[key] = value;

      return cookies;
    }, {});
}

function getTokenFromRequest(req) {
  const cookies = parseCookies(req.get('cookie') || '');

  if (cookies[ADMIN_COOKIE_NAME]) {
    return cookies[ADMIN_COOKIE_NAME];
  }

  const authorization = req.get('authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);

  return match?.[1] || '';
}

function getAdminCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: SESSION_TTL_MS,
    path: '/',
  };
}

function getAdminClearCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
  };
}

export function isAdminConfigured() {
  return Boolean(getAdminPassword() && getSessionSecret());
}

export function verifyAdminCredentials(username = '', password = '') {
  const expectedPassword = getAdminPassword();

  if (!expectedPassword) {
    return false;
  }

  return (
    safeEqual(username, getAdminUsername()) &&
    safeEqual(password, expectedPassword)
  );
}

export function createAdminSession(username = getAdminUsername()) {
  const now = Date.now();

  const payload = base64Url(
    JSON.stringify({
      sub: username,
      iat: now,
      exp: now + SESSION_TTL_MS,
      nonce: crypto.randomUUID(),
    })
  );

  return `${payload}.${signPayload(payload)}`;
}

export function readAdminSession(req) {
  const token = getTokenFromRequest(req);

  if (!token || !isAdminConfigured()) {
    return null;
  }

  const [payload, signature] = token.split('.');

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(payload);

  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const data = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8')
    );

    if (!data?.sub || data.sub !== getAdminUsername()) {
      return null;
    }

    if (!data.exp || Date.now() > data.exp) {
      return null;
    }

    return {
      username: data.sub,
      expiresAt: new Date(data.exp),
    };
  } catch {
    return null;
  }
}

export function setAdminCookie(res, token) {
  res.cookie(
    ADMIN_COOKIE_NAME,
    token,
    getAdminCookieOptions()
  );
}

export function clearAdminCookie(res) {
  res.clearCookie(
    ADMIN_COOKIE_NAME,
    getAdminClearCookieOptions()
  );
}

export function requireAdmin(req, res, next) {
  const session = readAdminSession(req);

  if (!session) {
    return res.status(401).json({
      success: false,
      message: 'Необходим е администраторски вход.',
    });
  }

  req.admin = session;
  next();
}