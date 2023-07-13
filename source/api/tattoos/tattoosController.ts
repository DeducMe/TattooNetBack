import { NextFunction, Request, Response } from 'express';
import { decodeToken, errorHandler, sendBackHandler } from '../../functions/apiHandlers';
import Tattoos, { ITattoos } from './tattoosModal';

import profileModal from '../users/profile/profileModal';
import reviewsModal from '../reviews/reviewsModal';

const put = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { _id, name, description, categories, price, currency, image, userProfileId } = req.body;

        const decoded = await decodeToken(req?.headers?.authorization || '');
        if (!decoded) return errorHandler(res, { message: 'decode of auth header went wrong' }, 500);

        const profile = await profileModal.findOne({ userId: decoded.id });
        if (!profile) return errorHandler(res, { message: 'decode of auth header went wrong' }, 500);

        const tattooToUpdate = await Tattoos.findOne({ masterProfile: profile.id, _id: _id });
        if (!tattooToUpdate) return errorHandler(res, { message: 'Tattoo was not found' }, 422);

        const data = await tattooToUpdate.updateOne({ name, description, categories, price, currency, image, userProfileId, masterProfile: profile._id }).exec();

        sendBackHandler(res, 'tattoos', data);
    } catch (e) {
        errorHandler(res, e);
    }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { name, description, categories, price, currency, images, userProfileId, masterProfile, type } = req.body;

        const decoded = await decodeToken(req?.headers?.authorization || '');
        if (!decoded) return errorHandler(res, 'decode of auth header went wrong', 500);

        //TODO check if user is associated with tattoo
        //userId: decoded.id

        if (!masterProfile) {
            const profile = await profileModal.findOne({ userId: decoded.id });
            if (!profile) return errorHandler(res, { message: 'decode of auth header went wrong' }, 500);

            if (`${profile?.type}` !== 'master') return errorHandler(res, { message: 'You arent a master' }, 500);

            masterProfile = profile._id;
        }

        const data = await new Tattoos({ name, description, categories, price, currency, images, type, masterProfile, userProfileId }).save();

        sendBackHandler(res, 'tattoos', data);
    } catch (e) {
        errorHandler(res, e);
    }
};

const deleteRow = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { _id } = req.body;

        if (!_id) return errorHandler(res, { message: `_id is not passed` }, 422);

        const decoded = await decodeToken(req?.headers?.authorization || '');
        if (!decoded) return errorHandler(res, { message: 'decode of auth header went wrong' }, 500);

        const review = await reviewsModal.findOne({ tattooId: _id });
        if (review) return errorHandler(res, { message: 'You cant delete tattoo with reviews, please contact our support' }, 422);

        const profile = await profileModal.findOne({ userId: decoded.id });
        if (!profile) return errorHandler(res, { message: 'decode of auth header went wrong' }, 500);

        const foundedTattoo = await Tattoos.findOne({ _id, masterProfile: profile.id });
        if (!foundedTattoo) return errorHandler(res, { message: `Cant find tattoo ` }, 422);

        await foundedTattoo.deleteOne();

        sendBackHandler(res, 'tattoos', true);
    } catch (e) {
        errorHandler(res, e);
    }
};

const getAll = async (req: Request, res: Response, next: NextFunction) => {
    let { filters } = req.body;

    const decoded = await decodeToken(req?.headers?.authorization || '');
    if (!decoded) return errorHandler(res, 'decode of auth header went wrong', 500);

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

    const data = await Tattoos.find({ ...additionalFilters })
        .populate(['categories', 'currency', 'reviews'])
        .exec();
    sendBackHandler(res, 'tattoos', data);
};

const getMasterTattoos = async (req: Request, res: Response, next: NextFunction) => {
    let { id } = req.body;
    if (!id) return errorHandler(res, 'No id passed', 422);

    const decoded = await decodeToken(req?.headers?.authorization || '');
    if (!decoded) return errorHandler(res, 'decode of auth header went wrong', 500);

    const result: { portfolio: ITattoos[]; available: ITattoos[] } = {
        portfolio: [],
        available: []
    };

    const data = await Tattoos.find({ masterProfile: id }).populate(['categories', 'currency', 'masterProfile', 'reviews']).exec();
    data.forEach((item) => {
        if (`${item.type}` === 'available') return result.available.push(item);
        if (`${item.type}` === 'completed') return result.portfolio.push(item);
    });

    sendBackHandler(res, 'tattoos', result);
};

const getFilterVariants = async (req: Request, res: Response, next: NextFunction) => {
    const decoded = await decodeToken(req?.headers?.authorization || '');
    if (!decoded) return errorHandler(res, 'decode of auth header went wrong', 500);

    const tattoos = await Tattoos.find().sort({ price: -1 });
    if (!tattoos) return errorHandler(res, { message: `error while looking for tattoos or no tattoos` }, 500);
    if (!tattoos?.length) return errorHandler(res, { message: `no tattoos to filter` }, 500);

    const maxPrice = tattoos[0].price;
    const minPrice = tattoos.at(-1)?.price;

    const categories: string[] = [];

    tattoos.forEach((item) => {
        item.categories?.forEach((item) => {
            !categories.includes(`${item}`) && categories.push(`${item}`);
        });
    });
    const data = {
        minPrice,
        maxPrice,
        categories
    };
    sendBackHandler(res, 'tattoos', data);
};

export default { getAll, getMasterTattoos, create, put, deleteRow, getFilterVariants };
