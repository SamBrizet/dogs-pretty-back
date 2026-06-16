const { login } = require('../services/authService');

function loginUser(req, res) {
  const username = req.body?.username;
  const password = req.body?.password;

  if (!username || !password) {
    res.status(400).json({ message: 'Usuario y contrasena son requeridos.' });
    return;
  }

  const result = login(username, password);

  if (!result) {
    res.status(401).json({ message: 'Credenciales invalidas.' });
    return;
  }

  res.json(result);
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
  me,
};
