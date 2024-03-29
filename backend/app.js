const express = require('express');
// const bodyParser = require('body-parser');
const helmet = require('helmet');
const mongoose = require('mongoose');

const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');
const path = require('path');

require('dotenv').config()

const app = express();

mongoose.connect(`mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@${process.env.MONGO_DB_ACCESS}`,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(express.json());

  app.use(helmet({
    crossOriginResourcePolicy: false // Pour ne pas avoir de soucis sur l'affichage des images
  }));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// app.use(bodyParser.json());

app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;