const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Tiffany Voorhees - Budget API',
    description: 'Budgeting',
  },
  host: 'localhost:3000',
  schemes: ['http', 'https'],
};

const outputFile = './swagger-output.json';
const routes = ['./routes/index.js'];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen(outputFile, routes, doc);
