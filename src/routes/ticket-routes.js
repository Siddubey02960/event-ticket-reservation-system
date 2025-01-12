const express = require('express');
const { reserveTicket, getTickets, getAudience, cancelTicket, updateTicket } = require('../controllers/ticket-controller');

const ticketRoutes = express.Router({ mergeParams: true });

// Routes
ticketRoutes.post('/', reserveTicket);
ticketRoutes.get('/', getTickets);
ticketRoutes.get('/attendees', getAudience);
ticketRoutes.delete('/', cancelTicket);
ticketRoutes.put('/', updateTicket);

module.exports = ticketRoutes;