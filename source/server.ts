import http from 'http';
import bodyParser from 'body-parser';
import express from 'express';
import mongoose from 'mongoose';

import logging from './config/logging';
import config from './config/config';
import profileRoute from './api/users/profile/profileRoute';
import usersDataRoute from './api/users/users/userRoute';
import tattoosRoute from './api/tattoos/tattoosRoute';
import cityRoute from './api/city/cityRoute';
import countryRoute from './api/country/countryRoute';

// @ts-ignore
import docs from 'express-mongoose-docs';
import { checkAuthToken, errorHandler } from './functions/apiHandlers';
import categoriesRoute from './api/categories/categoriesRoute';
import currencyRoute from './api/currency/currencyRoute';
import reviewsRoute from './api/reviews/reviewsRoute';
import feedRoute from './api/feed/feedRoute';
import imagesRoute from './api/images/imagesRoute';
import favoritesRoute from './api/favorites/favoritesRoute';
// import errorHandler from './errorHandling';
const NAMESPACE = 'Server';
export const app = express();

/** Connect to Mongo */
mongoose
    .connect(config.mongo.url, config.mongo.options)
    .then((result: any) => {
        logging.info(NAMESPACE, 'Mongo Connected');
    })
    .catch((error: { message: string }) => {
        logging.error(NAMESPACE, error.message, error);
    });
mongoose.connection.on('open', function () {
    // logging.info(NAMESPACE, 'db dropped');
    // mongoose.connection.dropDatabase();
});
docs(app, mongoose);

/** Log the request */
app.use((req, res, next) => {
    /** Log the req */

    logging.info(NAMESPACE, `METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);

    res.on('finish', () => {
        /** Log the res */
        logging.info(NAMESPACE, `METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`);
    });

    next();
});

/** Parse the body of the request */
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(async (req, res, next) => {
    const authed = await checkAuthToken(res, req);
    if (!authed.success) {
        return await errorHandler(res, { message: authed.message }, 405);
    }
    next();
});

/** Rules of our API */
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }

    next();
});

app.use('/api/', usersDataRoute);
app.use('/api/', profileRoute);
app.use('/api/', tattoosRoute);
app.use('/api/', categoriesRoute);
app.use('/api/', currencyRoute);
app.use('/api/', cityRoute);
app.use('/api/', countryRoute);
app.use('/api/', reviewsRoute);
app.use('/api/', feedRoute);
app.use('/api/', imagesRoute);
app.use('/api/', favoritesRoute);
app.get('/', async (req, res, next) => {
    return res.send('Hello!');
});

app.delete('/api/wipe', async (req, res, next) => {
    mongoose.connection.dropDatabase();
    return res.status(200).json({});
});

const httpServer = http.createServer(app);
console.log(config.server);
httpServer.listen(config.server.port, () => logging.info(NAMESPACE, `Server is running on http://${config.server.hostname}:${config.server.port}/`));
