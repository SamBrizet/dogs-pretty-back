const express = require('express');
const cors = require('cors');
const { env } = require('./config/env');
const galleryRoutes = require('./routes/galleryRoutes');

const app = express();

app.use(cors({ origin: env.frontendOrigin }));
app.use(express.json());
app.use(galleryRoutes);

module.exports = app;
