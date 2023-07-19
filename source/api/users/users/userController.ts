import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { decodeToken, errorHandler, sendBackHandler } from '../../../functions/apiHandlers';
import User from './userModal';
import Profile from '../profile/profileModal';
import Countries from '../../../common/countries.json';

import bcrypt from 'bcrypt';
import jsonWebToken from 'jsonwebtoken';
import { JWT_SECRET_TOKEN } from '../../../config/config';
import profileModal from '../profile/profileModal';

const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { login, password, name } = req.body;

        const stringifiedPass = password.toString();
        if (stringifiedPass < 4) {
            return errorHandler(res, { message: 'Password should contain at least four characters' }, 422);
        }
        const userExist = await User.findOne({ login }).exec();
        if (userExist) return errorHandler(res, { message: 'This login is already registered' }, 422);

        const user = new User({
            login,
            password: bcrypt.hashSync(stringifiedPass, 10)
        });

        const profile = new Profile({
            userId: user._id,
            name,
            email: login,
            type: 'user'
        });

        console.log({ id: user._id, login: user.login });

        const token = jsonWebToken.sign({ id: user._id, login: user.login }, JWT_SECRET_TOKEN);

        await user.save();
        await profile.save();

        sendBackHandler(res, 'token', token);
    } catch (e) {
        errorHandler(res, e);
    }
};

const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { login, password } = req.body;

        const stringifiedPass = password.toString();
        if (stringifiedPass < 4) {
            return errorHandler(res, { message: 'Password should contain at least four characters' }, 422);
        }

        const user = await User.findOne({ login }).exec();
        if (!user) return errorHandler(res, { message: 'User not found, try other login' }, 422);

        try {
            const passwordCompare = await bcrypt.compareSync(stringifiedPass, user.password);
            console.log(stringifiedPass, user.password);

            if (!passwordCompare) return errorHandler(res, { message: 'Password is wrong, try again' }, 422);
        } catch (e) {
            return errorHandler(res, e);
        }

        console.log({ id: user._id, login: user.login });

        const token = jsonWebToken.sign({ id: user._id, login: user.login }, JWT_SECRET_TOKEN);
        sendBackHandler(res, 'token', token);
    } catch (e) {
        errorHandler(res, e);
    }
};

const updateUserLocation = async (req: Request, res: Response, next: NextFunction) => {
    let { userLocation, country } = req.body;
    const decoded = await decodeToken(req?.headers?.authorization || '');
    if (!decoded) return errorHandler(res, 'decode of auth header went wrong', 500);
    if (!country) return errorHandler(res, 'country param is required', 405);

    const countryPolygon = Countries.features.find((item: any) => {
        const props = item.properties;
        return props.ADMIN.toLowerCase() === country.toLowerCase() || props.ISO_A3.toLowerCase() === country.toLowerCase();
    });

    console.log(countryPolygon);
    if (!countryPolygon) return errorHandler(res, 'No country has been found', 405);
    const data = await profileModal
        .findOneAndUpdate(
            { userId: decoded.id },
            { userLocation, country },
            {
                returnOriginal: false
            }
        )
        .exec();

    sendBackHandler(res, 'users', data);
};
const getUser = async (req: Request, res: Response, next: NextFunction) => {
    let { ids } = req.body;
    const data = await User.find({ _id: { $in: ids } }).exec();
    sendBackHandler(res, 'users', data);
};

const getAll = async (req: Request, res: Response, next: NextFunction) => {
    const data = await User.find().exec();
    sendBackHandler(res, 'users', data);
};

export default { create, login, getAll, getUser, updateUserLocation };
