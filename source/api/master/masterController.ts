import { NextFunction, Request, Response } from 'express';
import { decodeToken, errorHandler, sendBackHandler } from '../../functions/apiHandlers';
import Master from './masterModal';

const put = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { _id, name, description, avatar, salonId, location } = req.body;

        const decoded = await decodeToken(req?.headers?.authorization || '');
        if (!decoded) return errorHandler(res, { message: 'decode of auth header went wrong' }, 500);

        const masterToUpdate = await Master.findOne({ userId: decoded.id, _id: _id });
        if (!masterToUpdate) return errorHandler(res, { message: 'Master was not found' }, 422);

        const data = await masterToUpdate.updateOne({ name, description, location, avatar, salonId }).exec();

        sendBackHandler(res, 'master', data);
    } catch (e) {
        errorHandler(res, e);
    }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { name, description, avatar, salonId } = req.body;

        const decoded = await decodeToken(req?.headers?.authorization || '');
        if (!decoded) return errorHandler(res, 'decode of auth header went wrong', 500);

        const data = await new Master({ name, description, avatar, salonId, userId: decoded.id }).save();

        sendBackHandler(res, 'master', data);
    } catch (e) {
        errorHandler(res, e);
    }
};

const deleteRow = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { _id } = req.body;

        if (!_id) return errorHandler(res, { message: `_id is not passed` }, 422);
        // check existance of a coin

        const decoded = await decodeToken(req?.headers?.authorization || '');
        if (!decoded) return errorHandler(res, { message: 'decode of auth header went wrong' }, 500);

        const foundedMaster = await Master.findOne({ _id, userId: decoded.id });
        if (!foundedMaster) return errorHandler(res, { message: `Cant find master ` }, 422);

        await foundedMaster.deleteOne();

        sendBackHandler(res, 'master', true);
    } catch (e) {
        errorHandler(res, e);
    }
};

const getAll = async (req: Request, res: Response, next: NextFunction) => {
    let { filters } = req.body;

    const additionalFilters: any = {};

    if (typeof filters?.priceMin === 'number' || typeof filters?.priceMax === 'number') {
        additionalFilters.price = {};
        if (typeof filters.priceMin === 'number') additionalFilters.price.$gte = filters?.priceMin;
        if (typeof filters.priceMax === 'number') additionalFilters.price.$lt = filters?.priceMax;
    }

    if (filters?.categories?.length) {
        additionalFilters.categories = { $in: filters.categories };
    }

    if (typeof filters?.query === 'string') {
        const regex = new RegExp(filters?.query, 'i');

        additionalFilters.name = regex;
    }

    const data = await Master.find().exec();

    sendBackHandler(res, 'master', data);
};

export default { getAll, create, put, deleteRow };
