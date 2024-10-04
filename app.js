const express = require('express');
const mongodb = require('./db/connection');
const app = express();

const port = process.env.PORT || 3000;

app
  .use(express.json()) //JSON parsing
  // Used for Swagger/Rest API calls
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
  .use('/', require('./routes'));


mongodb.initDb((err) => {
  if (err) {
    console.log(err);
  } else {
    app.listen(port);
    console.log(`Connected to DB and listening on ${port}`);
  }
});
