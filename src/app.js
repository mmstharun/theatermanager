const mongoose = require('mongoose');
const Hapi = require('hapi');

var ticketing = require('./routes/ticketing');
var analytics = require('./routes/analytics');

const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');

const auth = require('./auth/authorization');

require('dotenv').config();

const server = new Hapi.Server();

const {
    MONGO_USERNAME,
    MONGO_PASSWORD,
    MONGO_HOSTNAME,
    MONGO_PORT,
    MONGO_DB,
    HOSTNAME,
    PORT
} = process.env;

server.connection(
    { "host": `${HOSTNAME}`, "port": `${PORT}` }
)

const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 10000,
    useFindAndModify: false
};

const swaggerOptions = {
    info: {
        title: 'Ticketing API Documentation',
        version: '0.0.1',
    }
};

const url = `mongodb://${MONGO_USERNAME}:${encodeURIComponent(MONGO_PASSWORD)}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=${MONGO_DB}`;

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

server.ext('onPreHandler', (request, reply) => {
    if (request.path.startsWith("/")) {
        var token = request.raw.req.headers.authorization;
        if (token === undefined) {
            return reply.response('Missing Authorization Header').code(401);
        } else {
            is_authorized = auth(token);
            if (!is_authorized) {
                return reply.response('Not Authorized').code(401);
            }
        }
        return reply.continue();
    }
});