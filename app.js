const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20');
const cors = require('cors');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/db');

// Load Config
dotenv.config({ path: './config/config.env' });

// Passport Config
require('./config/passport')(passport);

connectDB();

const PORT = process.env.PORT || 3000;

app
  .use(express.json()) //JSON parsing
  //this is the basic express session({..}) initialization
  .use(
    session({
      secret: 'keyboard cat',
      resave: false,
      saveUninitialized: true,
      store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    })
  )
  // init passport on every route call
  .use(passport.initialize())
  .use(passport.session())
  // Used for Swagger/Rest API calls & allows passport to use "express-session"
  .use((req, res, next) => {
    //Header options to work with swagger
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Z-Key'
    );
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );
    next();
  })
  .use(cors({ methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'] }))
  .use(cors({ origin: '*' }))
  .use('/', require('./routes'));

app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);
