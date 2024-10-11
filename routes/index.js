const routes = require('express').Router();

routes.use('/', require('./auth'));
routes.use('/', require('./swagger'));
routes.use('/transactions', require('./transactions'));

routes.get('/', (req, res) => {
  res.send(
    req.session.user !== undefined
      ? `${req.session.user.displayName} -- Welcome to Budgeting with Tiffany Voorhees`
      : 'Logged Out'
  );
});

module.exports = routes;
