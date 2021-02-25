const mongoose = require('mongoose');
const Hapi = require('hapi');

var ticketing = require('./routes/ticketing');
var analytics = require('./routes/analytics');

const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');

let MONGO_USERNAME = "manager";
let MONGO_HOSTNAME = "localhost";
let MONGO_PASSWORD = "Man@115";
let MONGO_PORT = "27017";
let MONGO_DB = "ticketmanager";
let HOSTNAME = "localhost";
let PORT = "3000";

const server = new Hapi.Server();

server.connection(
    { "host": `${HOSTNAME}`, "port": `${PORT}` }
)

// const {
//     MONGO_USERNAME,
//     MONGO_PASSWORD,
//     MONGO_HOSTNAME,
//     MONGO_PORT,
//     MONGO_DB
// } = process.env;

const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 10000,
    // read about this
    useFindAndModify: false
};

const swaggerOptions = {
    info: {
        title: 'Ticketing API Documentation',
        version: '0.0.1',
    }
};

const url = `mongodb://${MONGO_USERNAME}:${encodeURIComponent(MONGO_PASSWORD)}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=ticketmanager`;

mongoose.connect(url, mongoOptions).then(function () {
    console.log('MongoDB is connected');
})
    .catch(function (err) {
        console.log(err);
    });

server.register([
    Inert,
    Vision,
    {
        'register': HapiSwagger,
        'options': swaggerOptions
    }], (err) => {
        server.start((err) => {
            if (err) {
                console.log(err);
            } else {
                console.log('Server running at:', server.info.uri);
            }
            server.route(ticketing);
            server.route(analytics);

        })
    });