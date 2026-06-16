const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { env } = require('../config/env');
const fs = require('node:fs/promises');
const path = require('node:path');

const dataDir = path.resolve(__dirname, '..', '..', 'data');
const usersStorePath = path.join(dataDir, 'users.json');
const SALT_ROUNDS = 10;

function parseUsers(rawUsers) {
  if (!rawUsers) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawUsers);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (user) =>
          user?.id &&
          user?.username &&
          (user?.passwordHash || user?.password),
      )
      .map((user) => ({
        id: String(user.id),
        username: String(user.username),
        passwordHash: user.passwordHash ? String(user.passwordHash) : undefined,
        password: user.password ? String(user.password) : undefined,
        displayName: String(user.displayName || user.username),
      }));
  } catch {
    return [];
  }
}

function isBcryptHash(value) {
  return typeof value === 'string' && value.startsWith('$2');
}

async function migrateLegacyUsers(users) {
  let changed = false;

  const migratedUsers = await Promise.all(
    users.map(async (user) => {
      if (user.password && !user.passwordHash) {
        changed = true;
        return {
          ...user,
          passwordHash: await bcrypt.hash(user.password, SALT_ROUNDS),
          password: undefined,
        };
      }

      if (user.passwordHash && !isBcryptHash(user.passwordHash) && !user.password) {
        changed = true;
        return {
          ...user,
          password: user.passwordHash,
          passwordHash: undefined,
        };
      }

      return user;
    }),
  );

  if (changed) {
    const cleanedUsers = migratedUsers.map((user) => {
      if (user.password === undefined) {
        const { password, ...rest } = user;
        return rest;
      }

      return user;
    });

    await writeUsers(cleanedUsers);
    return cleanedUsers;
  }

  return users;
}

let cachedUsers = null;

async function ensureUsersStore() {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(usersStorePath);
  } catch {
    const initialUsers = parseUsers(env.authUsers);

    if (initialUsers.length === 0) {
      initialUsers.push({
        id: 'demo-user',
        username: 'demo',
        passwordHash: await bcrypt.hash('demo123', SALT_ROUNDS),
        displayName: 'Demo User',
      });
    }

    await fs.writeFile(usersStorePath, JSON.stringify(initialUsers, null, 2), 'utf8');
  }
}

async function readUsers() {
  if (cachedUsers) {
    return cachedUsers;
  }

  await ensureUsersStore();
  const content = await fs.readFile(usersStorePath, 'utf8');

  try {
    const parsed = JSON.parse(content || '[]');
    cachedUsers = Array.isArray(parsed) ? parsed : [];
  } catch {
    cachedUsers = [];
  }

  cachedUsers = await migrateLegacyUsers(cachedUsers);

  return cachedUsers;
}

async function writeUsers(users) {
  cachedUsers = users;
  await fs.writeFile(usersStorePath, JSON.stringify(users, null, 2), 'utf8');
}

function sanitizeUser(user) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
  };
}

function sanitizeUsername(username) {
  return String(username || '')
    .trim()
    .toLowerCase();
}

function sanitizeDisplayName(displayName, username) {
  return String(displayName || username || '')
    .trim()
    .replace(/\s+/g, ' ');
}

async function login(username, password) {
  const normalizedUsername = sanitizeUsername(username);
  const normalizedPassword = String(password || '').trim();

  const users = await readUsers();

  const userIndex = users.findIndex((entry) => entry.username === normalizedUsername);

  if (userIndex < 0) {
    return null;
  }

  const user = users[userIndex];
  let isValid = false;

  if (user.passwordHash) {
    isValid = await bcrypt.compare(normalizedPassword, user.passwordHash);
  } else if (user.password) {
    // Legacy compatibility for old plain-text records.
    isValid = user.password === normalizedPassword;

    if (isValid) {
      user.passwordHash = await bcrypt.hash(normalizedPassword, SALT_ROUNDS);
      delete user.password;
      users[userIndex] = user;
      await writeUsers(users);
    }
  }

  if (!isValid) {
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

async function register(username, password, displayName) {
  const normalizedUsername = sanitizeUsername(username);
  const normalizedPassword = String(password || '').trim();
  const normalizedDisplayName = sanitizeDisplayName(displayName, normalizedUsername);

  if (!normalizedUsername || !normalizedPassword) {
    throw new Error('Usuario y contrasena son requeridos.');
  }

  if (normalizedUsername.length < 3) {
    throw new Error('El usuario debe tener al menos 3 caracteres.');
  }

  if (normalizedPassword.length < 6) {
    throw new Error('La contrasena debe tener al menos 6 caracteres.');
  }

  const users = await readUsers();
  const existingUser = users.find((entry) => entry.username === normalizedUsername);

  if (existingUser) {
    throw new Error('Ese usuario ya existe.');
  }

  const user = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    username: normalizedUsername,
    passwordHash: await bcrypt.hash(normalizedPassword, SALT_ROUNDS),
    displayName: normalizedDisplayName || normalizedUsername,
  };

  await writeUsers([...users, user]);

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
  register,
  verifyToken,
};
