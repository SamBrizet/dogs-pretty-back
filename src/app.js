const express = require('express');
const cors = require('cors');
const { env } = require('./config/env');
const galleryRoutes = require('./routes/galleryRoutes');
const { errorMiddleware } = require('./middlewares/errorMiddleware');

const app = express();

app.use(cors({ origin: env.frontendOrigin }));
app.use(express.json());
app.use(galleryRoutes);
app.use(errorMiddleware);

module.exports = app;
