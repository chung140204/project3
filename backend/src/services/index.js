// Services will be exported from here
const TaxService = require('./TaxService');
const OrderService = require('./OrderService');
const AuthService = require('./AuthService');

module.exports = {
  TaxService,
  OrderService,
  AuthService
};

