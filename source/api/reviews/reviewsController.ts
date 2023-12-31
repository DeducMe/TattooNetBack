import { NextFunction, Request, Response } from 'express';
import { decodeToken, errorHandler, sendBackHandler } from '../../functions/apiHandlers';
import Reviews, { IReviews } from './reviewsModal';

import profileModal from '../users/profile/profileModal';
import tattoosModal from '../tattoos/tattoosModal';
import { ObjectId } from 'mongoose';
import reviewsModal from './reviewsModal';
import { getImagesFromReqFiles } from '../../functions/common';

const completeReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { _id, reviewText, starRating } = req.body;

        const decoded = await decodeToken(req?.headers?.authorization || '');
        if (!decoded) return errorHandler(res, { message: 'decode of auth header went wrong' }, 500);

        const profile = await profileModal.findOne({ userId: decoded.id });
        if (!profile) return errorHandler(res, { message: 'decode of auth header went wrong' }, 500);

        const isMaster = profile.type === 'master';

        const filters: { _id: string; masterProfile?: ObjectId } = {
            _id
        };

        if (isMaster) filters.masterProfile = profile._id;

        //@ts-ignore
        const TattooToUpdate = await tattoosModal.findOne(filters);
        if (!TattooToUpdate) return errorHandler(res, { message: 'Tattoo was not found' }, 422);

        let body = {};

        let images: { originalname: string; mimetype: string }[] = [];

        if (req.files)
            try {
                images = await getImagesFromReqFiles(req.files);
            } catch {
                return errorHandler(res, 'something wrong with image', 422);
            }
        if (isMaster) {
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

        if (!isMaster) {
            data = await new Reviews(body).save();
            console.log(body, 'ALO');

            const reviews = await reviewsModal.find({ masterProfile: TattooToUpdate.masterProfile });

            const rating = Number(
                (
                    reviews.reduce((acc, item) => {
                        return (acc += item.rating || 0);
                    }, 0) / reviews.length
                ).toFixed(2)
            );

            console.log(data?._id, 'test');

            await profileModal.findOneAndUpdate({ _id: TattooToUpdate.masterProfile }, { rating });
        }
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

        let data = await reviewsModal.find({ masterProfile: _id }).populate(['tattooId', 'images']).exec();

        sendBackHandler(res, 'reviews', data);
    } catch (e) {
        errorHandler(res, e);
    }
};

export default { completeReview, getReviewsByMaster };
