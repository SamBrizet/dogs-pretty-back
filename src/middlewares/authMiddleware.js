const { verifyToken } = require('../services/authService');

function parseBearerToken(authorizationHeader) {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
}

function optionalAuth(req, _res, next) {
  const token = parseBearerToken(req.headers.authorization);

  if (!token) {
    req.user = null;
    next();
    return;
  }

  try {
    req.user = verifyToken(token);
  } catch {
    req.user = null;
  }

  next();
}

function requireAuth(req, res, next) {
  const token = parseBearerToken(req.headers.authorization);

  if (!token) {
    res.status(401).json({ message: 'Debes iniciar sesion.' });
    return;
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ message: 'Sesion invalida o expirada.' });
  }
}

module.exports = {
  optionalAuth,
  requireAuth,
};
