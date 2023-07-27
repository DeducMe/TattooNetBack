import { NextFunction, Request, Response } from 'express';
import { decodeToken, errorHandler, sendBackHandler } from '../../../functions/apiHandlers';
import profileModal from './profileModal';
import Profile from './profileInterface';
import { createImage } from '../../images/imagesController';

const get = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const decoded = await decodeToken(req?.headers?.authorization || '');

        if (!decoded) {
            return errorHandler(res, 'decode of auth header went wrong', 500);
        }

        let user = await profileModal.findOne({ userId: decoded.id }).populate(['currencySet', 'avatar']).exec();

        if (!user) return errorHandler(res, 'Profile not found', 500);

        return sendBackHandler(res, 'profile', user);
    } catch (e) {
        return errorHandler(res, e);
    }
};

const put = async (req: Request | any, res: Response, next: NextFunction) => {
    const decoded = await decodeToken(req?.headers?.authorization || '');
    if (!decoded) return errorHandler(res, 'decode of auth header went wrong', 500);

    const { ...props } = req.body;
    const avatar = req.file;
    //@ts-ignore
    console.log(req.body, req.file);

    let avatarId;
    const toModify = props;

    if (avatar)
        try {
            avatarId = await createImage({ file: avatar });
            toModify.avatar = avatarId;
        } catch {
            return errorHandler(res, 'something wrong with image', 422);
        }

    await profileModal.findOneAndUpdate({ userId: decoded.id }, toModify, {
        returnOriginal: false
    });
    sendBackHandler(res, 'profile', true);
};

const search = async (req: Request, res: Response, next: NextFunction) => {
    const decoded = await decodeToken(req?.headers?.authorization || '');
    if (!decoded) return errorHandler(res, 'decode of auth header went wrong', 500);

    let { query, _id } = req.body;

    const additionalFilters: any = {};

    if (typeof query === 'string') {
        const regex = new RegExp(query, 'i');

        additionalFilters.name = regex;
    }

    if (_id) {
        additionalFilters._id = _id;
    }

    let result: Profile | Profile[] | any;
    if (!_id) result = await profileModal.find(additionalFilters).populate('avatar');
    else {
        result = await profileModal.findOne(additionalFilters).populate('avatar');
    }

    sendBackHandler(res, 'profile', result);
};

const setCurrency = async (req: Request, res: Response, next: NextFunction) => {
    const decoded = await decodeToken(req?.headers?.authorization || '');
    if (!decoded) return errorHandler(res, 'decode of auth header went wrong', 500);

    await profileModal.findOneAndUpdate(
        { userId: decoded.id },
        { currencySet: req.body.currency },
        {
            returnOriginal: false
        }
    );
    sendBackHandler(res, 'profile', true);
};

export default { search, get, put, setCurrency };
