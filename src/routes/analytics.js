const Joi = require('joi');

const Tickets = require('../model/ticket');
const Util = require('../helpers/Utility');
const { map } = require('./ticketing');

const context = "/analytics";

var months = ["Dummy", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var monthsForJs = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getAggregationQuery(type, startDate, endDate) {

    if (type === 'profit') {
        return [
            {
                $match: {
                    performance_time: { $gte: startDate, $lt: endDate }
                }
            },
            {
                $group: {
                    _id: { month: { $month: { $toDate: "$performance_time" } } },
                    total: { $sum: "$ticket_price" }
                }
            }
        ];
    } else if (type === 'visits') {
        return [
            {
                $match: {
                    performance_time: { $gte: startDate, $lt: endDate }
                }
            },
            {
                $project: {
                    month: { $month: { $toDate: "$performance_time" } },
                }
            },
            {
                $group: {
                    _id: { month: "$month" },
                    numberofbookings: { $sum: 1 }
                }
            }
        ];
    }
}

function getData(type, startDate, endDate, h) {
    if (type === 'profit') {
        let map = new Map();
        var tickets = Tickets.find({
            performance_time: { $gte: startDate, $lt: endDate }
        }).lean().exec(function (err, tickets) {
            tickets.forEach(ticket => {
                var month = monthsForJs[ticket.performance_time.getMonth()];
                if (map.has(month)) {
                    map.set(month, map.get(month) + 1);
                } else {
                    map.set(month, 1);
                }
            });
            console.log("2 " + map);
            return map;
        });
    }
}

module.exports = [

    // 1. how much money was earned by theater between 2 dates with division by months
    // example response: [{month: 'September', summaryProfit: 8000}, {month: 'October', summaryProfit: 6000}, ...]
    {
        method: "GET",
        path: context + "/profit",
        config: {
            handler: async (request, h) => {
                var called = false;
                var startDate = new Date(request.query.startDate);
                var endDate = new Date(request.query.endDate);
                var data = [];

                if (!called) {
                    try {
                        const aggregate = await Tickets.aggregate(getAggregationQuery('profit', startDate, endDate)).exec((err, result) => {
                            if (err) throw err;
                            for (val of result) {
                                data.push({
                                    month: months[val._id.month],
                                    summaryProfit: val.total
                                })
                            }
                            return h.response(data);
                        });
                    } catch (err) {
                        console.log(err);
                        return h.response(err).code(500);
                    }
                }

            },
            description: 'Get Profit month wise',
            notes: 'Responds with profit montly for given dates',
            tags: ['api'],
            validate: {
                query: {
                    startDate: Joi.date().required(),
                    endDate: Joi.date().required(),
                    method: Joi.string().optional().description('Can take either "js" or "aggregation"')
                },
            }
        }
    },



    //2. how many people visited theater between 2 dates with division by months
    // example response: [{month: 'September', summaryVisits: 800}, {month: 'October', summaryVisits: 600}, ...]
    {
        method: "GET",
        path: context + "/visits/aggregate",
        config: {
            handler: async (request, h) => {
                var startDate = new Date(request.query.startDate);
                var endDate = new Date(request.query.endDate);
                var data = [];
                try {
                    const aggregate = Tickets.aggregate(getAggregationQuery('visits', startDate, endDate)).exec((err, result) => {
                        if (err) throw err;
                        for (val of result) {
                            data.push({
                                month: months[val._id.month],
                                summaryVisits: val.numberofbookings
                            });
                        }
                        return h.response(data);
                    });
                } catch (err) {
                    console.log(err);
                    return h.response(err).code(500);
                }
            },
            description: 'Get number of Visits month wise',
            notes: 'Responds with number of visits montly for given dates',
            tags: ['api'],
            validate: {
                query: {
                    startDate: Joi.date().required(),
                    endDate: Joi.date().required()
                },
            }
        }
    },

    {
        method: "GET",
        path: context + "/visits",
        config: {
            handler: async (request, h) => {
                var startDate = new Date(request.query.startDate);
                var endDate = new Date(request.query.endDate);
                let map = new Map();

                try {
                    await Tickets.find({
                        performance_time: { $gte: startDate, $lt: endDate }
                    }).lean().exec((err, result) => {
                        if (err) throw err;
                        for (ticket of result) {
                            var month = monthsForJs[ticket.performance_time.getMonth()];
                            if (map.has(month)) {
                                map.set(month, map.get(month) + 1);
                            } else {
                                map.set(month, 1);
                            }
                        }
                        console.log(map);
                        return h.response(JSON.stringify(map));
                    });
                } catch (err) {
                    console.log(err);
                    return h.response(err).code(500);
                }
            },
            description: 'Get number of Visits month wise using JS Algo',
            notes: 'Responds with number of visits montly for given dates using JS Algo',
            tags: ['api'],
            validate: {
                query: {
                    startDate: Joi.date().required(),
                    endDate: Joi.date().required()
                },
            }
        }
    }


    // {
    //     method: "GET",
    //     path: context + "/visits",
    //     config: {
    //         handler: async (request, h) => {
    //             var startDate = new Date(request.query.startDate);
    //             var endDate = new Date(request.query.endDate);
    //             var data = [];
    //             var map = new Map();

    //             const tickets = await Tickets.find({
    //                 performance_time: { $gte: startDate, $lt: endDate }
    //             }).lean().exec((err, result) => {
    //                 result.forEach((ticket) => {
    //                     var month = monthsForJs[ticket.performance_time.getMonth()];
    //                     if (map.has(month)) {
    //                         map.set(month, map.get(month) + 1);
    //                     } else {
    //                         map.set(month, 1);
    //                     }
    //                 });
    //             });
    //         }

    //     },
    //     description: 'Get number of Visits month wise using JS Algo',
    //     notes: 'Responds with number of visits montly for given dates using JS Algo',
    //     tags: ['api'],
    //     validate: {
    //         query: {
    //             startDate: Joi.date().required(),
    //             endDate: Joi.date().required()
    //         },
    //     }
    // }


];