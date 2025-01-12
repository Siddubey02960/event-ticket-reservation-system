const { v4: uuidv4 } = require('uuid');
const { events } = require('../const/event')
// In-memory storage for reservations
const reservations = [];
let seatCounter = 1;

// Utility to generate a unique seat number
const nextSeat = () => `S${seatCounter++}`;

// to book new ticket considering any user can book only one ticket for an event
const reserveTicket =  async (req, res) => {
        const { name, email, event_date } = req.body;

        if (!name || !email || !event_date) {
            return res.status(400).json({ message: 'email, name and event date are required.' });
        }

        // check if event exists or not
       const event = events.filter(event => event.eventDate === event_date);;
       
        if (!event.length) {
         return res.status(404).json({ message: 'No event found on the specified date.' });
        }

        // check if user has a ticket for that event or not.
        const userInEvent = reservations.filter(elem => elem.email === email && elem.event_date === event_date && elem.event_name === event.event_name);

        if(userInEvent.length > 0){
          return res.status(404).json({ message: 'User already has a ticket for the event.' });
        }

        const seatNumber = nextSeat();

        const newReservation = {
          id: uuidv4(),
          name,
          email,
          seat: seatNumber,
          event_date: event_date,
          artist: event.artist,
          event_name: event.name,
          fromTime: event.fromTime,
          toTime: event.toTime,
        };

        reservations.push(newReservation);

        return res.status(201).json({ message: 'Your ticket is booked successful!', reservation_data: newReservation });
    }

// to get list of tickets for a user
const getTickets = async(req, res) => {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }

        const userReservations = reservations.filter((elem) => elem.email === email);

        if (userReservations.length === 0) {
            return res.status(404).json({ message: 'No tickets found for this user.' });
        }

        return res.json({ ticket_data: userReservations[0], message: "Ticket data fetch succesfully."});
    }
    
// to get list of users based on event details
const getAudience = async(req, res) => {
         const { event_date } = req.query;

        if (!event_date) {
            return res.status(400).json({ message: 'Event date is required.' });
        }

        const audience = reservations.filter(elem => elem.event_date === event_date ) || [];

        return res.json({
          message: "Audience list",
          audience: audience
        });

    }

// to cancel existing reservation
    const cancelTicket = async(req, res) => {

        const { email, event_date} = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }
        if(!event_date){
           return res.status(400).json({ message: 'Event date is required.' });
        }

         // Find reservations for the given email and event_date
        const userReservationIndex = reservations.findIndex(
           (event) => event.email === email && event.event_date === event_date
         );

        if (userReservationIndex === -1) {
            return res.status(404).json({ message: 'No reservation found for the provided email and event date.' });
        }

        // Remove the reservation from the array
        const removedReservation = reservations.splice(userReservationIndex, 1)[0];

        return res.json({
            message: 'Reservation cancelled successfully.',
            cancelled_reservation: removedReservation,
        });
    }

// to update seat number of ticket
   const updateTicket = async(req, res) => {
        const { email, event_date, seat_number } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }

        if(!event_date){
           return res.status(400).json({ message: 'Event date is required.' });
        }

        if (!seat_number) {
            return res.status(400).json({ message: 'Seat number is required.' });
        }

         const userReservationIndex = reservations.findIndex(
           (event) => event.email === email && event.event_date === event_date
         );

        if (userReservationIndex === -1) {
            return res.status(404).json({ message: 'No reservation found for the provided email and event date.' });
        }

        reservations[userReservationIndex].seat = seat_number;

        res.json({ message: 'Reservation modified successfully.', modified_ticket: reservations[userReservationIndex]});
    }


module.exports= {
  reserveTicket,
  getTickets,
  getAudience,
  cancelTicket,
  updateTicket
}