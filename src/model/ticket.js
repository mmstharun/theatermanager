const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let ticket = new Schema({
    creation_date: { type: Date },
    customer_name: String,
    performance_title: String,
    performance_time: { type: Date },
    ticket_price: Number,
    updation_date: { type: Date }
},
    {
        timestamps: { createdAt: 'creation_date', updatedAt: 'updation_date' }
    }
)

const Tickets = mongoose.model('Tickets', ticket);

module.exports = Tickets;