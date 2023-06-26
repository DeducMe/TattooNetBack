import { NextFunction, Request, Response } from 'express';
import { decodeToken, errorHandler, sendBackHandler } from '../../functions/apiHandlers';
import Favorites from './favoritesModal';

const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { type, master, tattoo } = req.body;

        const favorites = new Favorites({ type, master, tattoo });

        const data = await favorites.save();

        sendBackHandler(res, 'favorites', data);
    } catch (e) {
        errorHandler(res, e);
    }
};

const remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { _id } = req.body;

        if (!_id) return errorHandler(res, { message: `_id is not passed` }, 422);
        // check existance of a coin

        const decoded = await decodeToken(req?.headers?.authorization || '');
        if (!decoded) return errorHandler(res, { message: 'decode of auth header went wrong' }, 500);

        const foundedFavorite = await Favorites.findOne({ _id, userId: decoded.id });
        if (!foundedFavorite) return errorHandler(res, { message: `Cant find master ` }, 422);

        await foundedFavorite.deleteOne();

        sendBackHandler(res, 'favorites', true);
    } catch (e) {
        errorHandler(res, e);
    }
};

const getAll = async (req: Request, res: Response, next: NextFunction) => {
    const data = await Favorites.find().populate(['master', 'tattoo']).exec();
    sendBackHandler(res, 'favorites', data);
};

export default { getAll, create, remove };
