const routes = require('express').Router();

routes.use('/transactions', require('./transactions'));
routes.use('/', require('./swagger'));
routes.get('/', (req, res) => {
  res.send('Welcome to Budgeting with Tiffany Voorhees');
});

module.exports = routes;
