const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let ticket = new Schema({
    creation_date: { type: Date, default: Date.now },
    customer_name: String,
    performance_title: String,
    performance_time: { type: Date },
    ticket_price: Number
})

const Tickets = mongoose.model('Tickets', ticket);

module.exports = Tickets;