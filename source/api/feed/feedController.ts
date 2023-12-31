import { NextFunction, Request, Response } from 'express';
import { decodeToken, errorHandler, sendBackHandler } from '../../functions/apiHandlers';
import profileModal from '../users/profile/profileModal';
import tattoosModal from '../tattoos/tattoosModal';

const get = async (req: Request, res: Response, next: NextFunction) => {
    const decoded = await decodeToken(req?.headers?.authorization || '');
    if (!decoded) return errorHandler(res, 'decode of auth header went wrong', 500);

    const masters = await profileModal.find({ type: 'master' }).populate('avatar').exec();

    const tattoos = await tattoosModal
        .find({ masterProfile: { $in: masters.map((item) => item._id) } })
        .populate([
            'images',
            'reviews',
            {
                path: 'reviews',
                populate: {
                    path: 'images'
                }
            }
        ])
        .exec();

    const data = masters.map((item) => {
        return { master: item, tattoos: tattoos.filter((el) => `${el.masterProfile._id}` === `${item._id}`) };
    });

    console.log(data.length);

    sendBackHandler(res, 'feed', data);
};

export default { get };
