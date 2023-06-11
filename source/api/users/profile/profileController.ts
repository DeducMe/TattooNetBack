import { NextFunction, Request, Response } from 'express';
import { decodeToken, errorHandler, sendBackHandler } from '../../../functions/apiHandlers';
import Profile from './profileModal';
import profileModal from './profileModal';

const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const decoded = await decodeToken(req?.headers?.authorization || '');

        if (!decoded) {
            return errorHandler(res, 'decode of auth header went wrong', 500);
        }

        let user = await profileModal.findOne({ userId: decoded.id }).populate(['currencySet']).exec();

        if (!user) return errorHandler(res, 'Profile not found', 500);

        return sendBackHandler(res, 'profile', user);
    } catch (e) {
        return errorHandler(res, e);
    }
};

const put = async (req: Request, res: Response, next: NextFunction) => {
    const decoded = await decodeToken(req?.headers?.authorization || '');
    if (!decoded) return errorHandler(res, 'decode of auth header went wrong', 500);

    await Profile.findOneAndUpdate(
        { userId: decoded.id },
        { ...req.body },
        {
            returnOriginal: false
        }
    );
    sendBackHandler(res, 'profile', true);
};

const setCurrency = async (req: Request, res: Response, next: NextFunction) => {
    const decoded = await decodeToken(req?.headers?.authorization || '');
    if (!decoded) return errorHandler(res, 'decode of auth header went wrong', 500);

    await Profile.findOneAndUpdate(
        { userId: decoded.id },
        { currencySet: req.body.currency },
        {
            returnOriginal: false
        }
    );
    sendBackHandler(res, 'profile', true);
};

export default { get, put, setCurrency };
