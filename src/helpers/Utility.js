const Tickets = require('../model/ticket');

module.exports.getResult = function getResult(ticket) {
    var responseTicket = {
        tin: ticket._id,
        creation_date: ticket.creation_date.toLocaleString(),
        customer_name: ticket.customer_name,
        performance_title: ticket.performance_title,
        performance_time: ticket.performance_time.toLocaleString(),
        ticket_price: ticket.ticket_price
    };
    return responseTicket;
}

module.exports.getResults = function getResults(tickets) {
    var responseTickets = [];
    tickets.forEach(ticket => {
        responseTickets.push(this.getResult(ticket));
    });
    return responseTickets;
}