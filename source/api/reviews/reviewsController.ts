import { NextFunction, Request, Response } from 'express';
import { decodeToken, errorHandler, sendBackHandler } from '../../functions/apiHandlers';
import Reviews, { IReviews } from './reviewsModal';

import profileModal from '../users/profile/profileModal';
import tattoosModal from '../tattoos/tattoosModal';
import { ObjectId } from 'mongoose';
import reviewsModal from './reviewsModal';

const completeReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { _id, reviewText, userProfileId, images, starRating } = req.body;

        const decoded = await decodeToken(req?.headers?.authorization || '');
        if (!decoded) return errorHandler(res, { message: 'decode of auth header went wrong' }, 500);

        const profile = await profileModal.findOne({ userId: decoded.id });
        if (!profile) return errorHandler(res, { message: 'decode of auth header went wrong' }, 500);

        const isMaster = profile.type === 'master';

        const filters: { _id: string; masterProfile?: ObjectId } = {
            _id
        };
        if (isMaster) filters.masterProfile = profile._id;

        const TattooToUpdate = await tattoosModal.findOne(filters);
        if (!TattooToUpdate) return errorHandler(res, { message: 'Tattoo was not found' }, 422);

        let body = {};

        if (!userProfileId) {
            body = {
                completedByMaster: true,
                masterProfile: TattooToUpdate.masterProfile
            };
        } else {
            body = {
                completedByUser: true,
                text: reviewText,
                rating: starRating,
                images,
                userProfileId: profile.id,
                masterProfile: TattooToUpdate.masterProfile
            };
        }

        let data: IReviews | undefined;

        if (!isMaster) data = await new Reviews(body).save();

        await TattooToUpdate.updateOne({
            type: isMaster ? 'completed' : TattooToUpdate.type,
            reviews: data ? (TattooToUpdate.reviews.filter((item) => item !== data?._id) || []).concat([data._id]) : TattooToUpdate.reviews
        }).exec();

        sendBackHandler(res, 'reviews', data);
    } catch (e) {
        errorHandler(res, e);
    }
};

const getReviewsByMaster = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { _id } = req.body;

        const profile = await profileModal.findOne({ _id });
        if (!profile) return errorHandler(res, { message: 'Cant find that master' }, 422);

        let data = await reviewsModal.find({ masterProfile: _id }).populate('tattooId').exec();

        sendBackHandler(res, 'reviews', data);
    } catch (e) {
        errorHandler(res, e);
    }
};

export default { completeReview, getReviewsByMaster };
