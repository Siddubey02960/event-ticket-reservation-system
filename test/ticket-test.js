const { describe, it } = require('mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../src/app');
const { expect } = require('chai');
chai.use(chaiHttp);

const baseUrl = '/ticket';

describe('API Tests', () => {

    // Book ticket testcase
    it('should reserve a ticket for the user for an exisitng event', async () => {

      const data = {
        name: 'TestUser',
        email: "testuser@gmail.com",
        event_date: "2025-01-15",
      }
  
      const res = await chai.request(app).post(baseUrl).send(data);
      expect(res).to.have.status(201);
      expect(res.body).to.have.property('message');
      expect(res.body).to.have.property('reservation_data');
      expect(res.body.reservation_data.name).equal(data.name);
      expect(res.body.reservation_data.event_date).equal(data.event_date);
      expect(res.body.reservation_data.email).equal(data.email)
    });

   it('should reserve a ticket for the user for another exisitng event', async () => {

      const data = {
        name: 'TestUser',
        email: "testuser@gmail.com",
        event_date: "2025-01-16",
      }
  
      const res = await chai.request(app).post(baseUrl).send(data);
      expect(res).to.have.status(201);
      expect(res.body).to.have.property('message');
      expect(res.body).to.have.property('reservation_data');
      expect(res.body.reservation_data.name).equal(data.name);
      expect(res.body.reservation_data.event_date).equal(data.event_date);
      expect(res.body.reservation_data.email).equal(data.email)
    });

     it('should not reserve a ticket for the user for a non exisitng event', async () => {

      const data = {
        name: 'TestUser',
        email: " testuser-1@gmail.com",
        event_date: "2030-01-15",
      }
  
      const res = await chai.request(app).post(baseUrl).send(data);
      expect(res).to.have.status(404);
      expect(res.body).to.have.property('message');
      expect(res.body.message).equal('No event found on the specified date.');
    });

    //Get ticket testcase based on email

    it('should not get ticket for a user who has not booked a ticket', async () => {
      const res = await chai.request(app).get(`${baseUrl}?email=testuser1@gmail.com`);
      expect(res).to.have.status(404);
      expect(res.body.message).equals('No tickets found for this user.');
    });

    it('should throw validation error if email is not provided', async () => {
      const res = await chai.request(app).get(`${baseUrl}`);
      expect(res).to.have.status(400);
      expect(res.body.message).equals('Email is required.');
    });

   it('should get ticket for user who has booked ticket', async () => {
      const res = await chai.request(app).get(`${baseUrl}?email=testuser@gmail.com`);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('ticket_data');
      expect(res.body).to.have.property('message');
      expect(res.body.ticket_data.email).equal('testuser@gmail.com');
      expect(res.body.ticket_data.event_date).equal('2025-01-15');
      expect(res.body.ticket_data.name).equal('TestUser');
      expect(res.body.ticket_data.seat).equal('S1');
    });
    
  // Get list of audience along with seat
   it('should get list of user of specified event', async () => {
      const res = await chai.request(app).get(`${baseUrl}/attendees?event_date=2025-01-15`);
      expect(res).to.have.status(200);
      expect(res.body.message).equals('Audience list');
      expect(res.body.audience.length).equals(1);
      expect(res.body.audience[0].name).equals('TestUser');
      expect(res.body.audience[0].email).equals('testuser@gmail.com');
      expect(res.body.audience[0].seat).equals('S1');
    });

    it('should throw validation error if event date is not provided', async () => {
      const res = await chai.request(app).get(`${baseUrl}/attendees`);
      expect(res).to.have.status(400);
      expect(res.body.message).equals('Event date is required.');
    });


  // Change seat number api

     it('should throw validation error when event data is missing', async () => {
      let body = { "email": "testuser@gmail.com", "seat_number": "S10"}
      const res = await chai.request(app).put(baseUrl).send(body)
      expect(res).to.have.status(400);
      expect(res.body.message).equals('Event date is required.');
    });

  it('should throw validation error when email is missing', async () => {
      let body= { "event_date": "2025-01-15", "seat_number": "S10" }
      const res = await chai.request(app).put(baseUrl).send(body);
      expect(res).to.have.status(400);
      expect(res.body.message).equals('Email is required.');
    });

  it('should throw not found error if no such data is present', async () => {
      let body= { "event_date": "2026-01-15", "email": "testuser@gmail.com" }
      const res = await chai.request(app).delete(baseUrl).send(body);
      expect(res).to.have.status(404);
      expect(res.body.message).equals('No reservation found for the provided email and event date.');
    });   

  it('should throw validation error when seat number is missing', async () => {
      let body= { "event_date": "2025-01-15", "email": "testuser@gmail.com" }
      const res = await chai.request(app).put(baseUrl).send(body);
      expect(res).to.have.status(400);
      expect(res.body.message).equals('Seat number is required.');
    });  


  it('should change the reservation seat', async () => {
      let body= { "event_date": "2025-01-15", "email": "testuser@gmail.com", "seat_number": "S10" }
      const res = await chai.request(app).put(baseUrl).send(body);
      expect(res).to.have.status(200);
      expect(res.body.message).equals('Reservation modified successfully.');
      expect(res.body.modified_ticket.email).equals('testuser@gmail.com');
      expect(res.body.modified_ticket.event_date).equals('2025-01-15');
      expect(res.body.modified_ticket.seat).equals('S10');
    });

      //Cancel ticket based on event_date and email

   it('should throw validation error when event data is missing', async () => {
      let body = { "email": "testuser@gmail.com"}
      const res = await chai.request(app).delete(baseUrl).send(body)
      expect(res).to.have.status(400);
      expect(res.body.message).equals('Event date is required.');
    });

  it('should throw validation error when email is missing', async () => {
      let body= { "event_date": "2025-01-15" }
      const res = await chai.request(app).delete(baseUrl).send(body);
      expect(res).to.have.status(400);
      expect(res.body.message).equals('Email is required.');
    });

  it('should throw not found error if no such data is present', async () => {
      let body= { "event_date": "2026-01-15", "email": "testuser@gmail.com" }
      const res = await chai.request(app).delete(baseUrl).send(body);
      expect(res).to.have.status(404);
      expect(res.body.message).equals('No reservation found for the provided email and event date.');
    }); 


  it('should cancel the reservation', async () => {
      let body= { "event_date": "2025-01-15", "email": "testuser@gmail.com" }
      const res = await chai.request(app).delete(baseUrl).send(body);
      expect(res).to.have.status(200);
      expect(res.body.message).equals('Reservation cancelled successfully.');
      expect(res.body.cancelled_reservation.email).equals('testuser@gmail.com');
      expect(res.body.cancelled_reservation.event_date).equals('2025-01-15');
    });

 });