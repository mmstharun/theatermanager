const Joi = require('joi');

const Tickets = require('../model/ticket');
const Util = require('../helpers/Utility');

const context = "/booking";

module.exports = [
    {
        method: "POST",
        path: context + "/ticket",
        config: {
            handler: async (request, h) => {
                try {
                    var ticket = new Tickets(request.payload);
                    var result = await ticket.save();
                    return h.response(Util.getResult(result)).code(201);
                } catch (err) {
                    console.log(err)
                    return h.response(err).code(500);
                }
            },
            description: 'Generate new Ticket',
            notes: 'Pass Customer name, performance title, time, ticket price',
            tags: ['api'],
            validate: {
                payload: Joi.object({
                    creation_date: Joi.date().optional(),
                    customer_name: Joi.string().required(),
                    performance_title: Joi.string().required(),
                    performance_time: Joi.date().required(),
                    ticket_price: Joi.number().required()
                }),
                failAction: (req, h, err) => {
                    return err.isJoi ? h.response(err.details[0]).takeover() : h.response(err).takeover();
                }
            }
        }
    },

    {
        method: "GET",
        path: context + "/tickets",
        config: {
            handler: async (request, h) => {
                try {
                    var tickets = await Tickets.find().exec();
                    return h.response(Util.getResults(tickets));
                } catch (err) {
                    return h.response(err).code(500);
                }
            },
            description: 'Get All Tickets',
            notes: 'Responds with all booked tickets',
            tags: ['api']
        }
    },

    {
        method: "GET",
        path: context + "/ticket/{id}",
        config: {
            handler: async (request, h) => {
                try {
                    var ticket = await Tickets.findById(request.params.id).exec();
                    if (ticket === null || ticket === NaN) return h.response("Not found");
                    return h.response(Util.getResult(ticket));
                } catch (err) {
                    // TODO This error wrapping looks like not working. Need to look into another way.
                    return h.response(err).code(500);
                }
            },
            description: 'Get ticket when TIN is provided',
            notes: 'Provide TIN (Ticket Identification number) to get ticket details',
            tags: ['api']
        }
    },

    {
        method: "PUT",
        path: context + "/ticket/{id}",
        config: {
            handler: async (request, h) => {
                try {
                    var ticket = await Tickets.findByIdAndUpdate(request.params.id, request.payload, { new: true });
                    return h.response(Util.getResult(ticket));
                } catch (err) {
                    return h.response(err).code(500);
                }
            },
            description: 'Update a ticket when a TIN is given',
            notes: 'Responds with updated ticket details when a TIN is provided',
            tags: ['api'],
            validate: {
                payload: Joi.object({
                    customer_name: Joi.string().optional(),
                    performance_title: Joi.string().optional(),
                    performance_time: Joi.date().optional(),
                    ticket_price: Joi.number().optional()
                }),
                failAction: (req, h, err) => {
                    return err.isJoi ? h.response(err.details[0]).takeover() : h.response(err).takeover();
                }
            }
        }
    },

    {
        method: "DELETE",
        path: context + "/ticket/{id}",
        config: {
            handler: async (request, h) => {
                try {
                    var ticket = await Tickets.findByIdAndDelete(request.params.id);
                    return h.response(Util.getResult(ticket));
                } catch (err) {
                    return h.response(err).code(500);
                }
            },
            description: 'Removes a ticket when a TIN is given',
            notes: 'Responds with removed ticket details when a TIN is provided',
            tags: ['api']
        }
        
    }


];