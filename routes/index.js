const routes = require('express').Router();
const homeController = require('../controllers/home');

routes.use('/', require('./auth'));
routes.use('/', require('./swagger'));
routes.use('/transactions', require('./transactions'));

routes.get('/', (req, res) => {
  homeController.buildHome(req,res);
});

module.exports = routes;
