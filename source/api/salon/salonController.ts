import { NextFunction, Request, Response } from 'express';
import { decodeToken, errorHandler, sendBackHandler } from '../../functions/apiHandlers';
import Salon from './salonModal';

const put = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { _id, name, description, images, masters, address, categories, price } = req.body;

        const decoded = await decodeToken(req?.headers?.authorization || '');
        if (!decoded) return errorHandler(res, { message: 'decode of auth header went wrong' }, 500);

        const salonToUpdate = await Salon.findOne({ userId: decoded.id, _id });
        if (!salonToUpdate) return errorHandler(res, { message: 'Salon was not found' }, 422);

        const data = await salonToUpdate.updateOne({ name, description, images, masters, address, categories, price }).exec();

        sendBackHandler(res, 'salon', data);
    } catch (e) {
        errorHandler(res, e);
    }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { name, description, images, masters, address, categories, price } = req.body;

        const decoded = await decodeToken(req?.headers?.authorization || '');
        if (!decoded) return errorHandler(res, 'decode of auth header went wrong', 500);

        const data = await new Salon({ name, description, images, masters, address, categories, price, userId: decoded.id }).save();

        sendBackHandler(res, 'salon', data);
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

        const foundedSalon = await Salon.findOne({ _id, userId: decoded.id });
        if (!foundedSalon) return errorHandler(res, { message: `Cant find salon ` }, 422);

        await foundedSalon.deleteOne();

        sendBackHandler(res, 'salon', true);
    } catch (e) {
        errorHandler(res, e);
    }
};

const getAll = async (req: Request, res: Response, next: NextFunction) => {
    let { filters } = req.body;

    const decoded = await decodeToken(req?.headers?.authorization || '');
    if (!decoded) return errorHandler(res, 'decode of auth header went wrong', 500);

    const data = await Salon.find({ userId: decoded.id }).exec();
    sendBackHandler(res, 'salon', data);
};

export default { getAll, create, put, deleteRow };
