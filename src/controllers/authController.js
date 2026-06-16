const { login, register } = require('../services/authService');

async function loginUser(req, res) {
  const username = req.body?.username;
  const password = req.body?.password;

  if (!username || !password) {
    res.status(400).json({ message: 'Usuario y contrasena son requeridos.' });
    return;
  }

  const result = await login(username, password);

  if (!result) {
    res.status(401).json({ message: 'Credenciales invalidas.' });
    return;
  }

  res.json(result);
}

async function registerUser(req, res) {
  const username = req.body?.username;
  const password = req.body?.password;
  const displayName = req.body?.displayName;

  if (!username || !password) {
    res.status(400).json({ message: 'Usuario y contrasena son requeridos.' });
    return;
  }

  try {
    const result = await register(username, password, displayName);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message || 'No se pudo registrar el usuario.' });
  }
}

function me(req, res) {
  if (!req.user) {
    res.status(401).json({ message: 'Debes iniciar sesion.' });
    return;
  }

  res.json({ user: req.user });
}

module.exports = {
  loginUser,
  registerUser,
  me,
};
