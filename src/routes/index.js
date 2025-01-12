const express = require('express');

const apiRoutes = express.Router();

const ticketRoutes = require('./ticket-routes');

apiRoutes.use('/ticket', [ticketRoutes]);

module.exports = apiRoutes;