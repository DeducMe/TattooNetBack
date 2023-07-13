const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const MONGO_OPTIONS = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    socketTimeoutMS: 30000,
    keepAlive: true,
    poolSize: 50,
    autoIndex: false,
    retryWrites: false
};

export const JWT_SECRET_TOKEN = 'YOUR JWT SECRET TOKEN';

const MONGO_USERNAME = process.env.MONGO_USERNAME || 'admin';
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || 'mongoPass';
const MONGO_HOST = process.env.MONGO_URL || `mongoHost`;

const MONGO_URL = 'full mongo URL';

const MONGO = {
    host: MONGO_HOST,
    password: MONGO_PASSWORD,
    username: MONGO_USERNAME,
    options: MONGO_OPTIONS,
    url: MONGO_URL
};

const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME || 'localhost';
const SERVER_PORT = process.env.SERVER_PORT || process.env.PORT || 3000;

const SERVER = {
    hostname: SERVER_HOSTNAME,
    port: Number(SERVER_PORT)
};

const config = {
    mongo: MONGO,
    server: SERVER
};

export default config;
