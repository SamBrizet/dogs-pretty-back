const jwt = require('jsonwebtoken');
const { env } = require('../config/env');

function parseUsers(rawUsers) {
  if (!rawUsers) {
    return [
      {
        id: 'demo-user',
        username: 'demo',
        password: 'demo123',
        displayName: 'Demo User',
      },
    ];
  }

  try {
    const parsed = JSON.parse(rawUsers);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter((user) => user?.id && user?.username && user?.password)
      .map((user) => ({
        id: String(user.id),
        username: String(user.username),
        password: String(user.password),
        displayName: String(user.displayName || user.username),
      }));
  } catch {
    return [];
  }
}

const users = parseUsers(env.authUsers);

function sanitizeUser(user) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
  };
}

function login(username, password) {
  const normalizedUsername = String(username || '').trim();
  const normalizedPassword = String(password || '').trim();

  const user = users.find(
    (entry) =>
      entry.username === normalizedUsername && entry.password === normalizedPassword,
  );

  if (!user) {
    return null;
  }

  const safeUser = sanitizeUser(user);

  const token = jwt.sign(safeUser, env.authSecret, {
    expiresIn: '7d',
  });

  return {
    token,
    user: safeUser,
  };
}

function verifyToken(token) {
  return jwt.verify(token, env.authSecret);
}

module.exports = {
  login,
  verifyToken,
};
