import { NextFunction, Request, Response } from 'express';
import { decodeToken, errorHandler, sendBackHandler } from '../../functions/apiHandlers';
import Tattoos from './tattoosModal';

import profileModal from '../users/profile/profileModal';

const put = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { _id, name, description, categories, price, currency, image, salonId, masterId } = req.body;

        const decoded = await decodeToken(req?.headers?.authorization || '');
        if (!decoded) return errorHandler(res, { message: 'decode of auth header went wrong' }, 500);

        const profile = await profileModal.findOne({ userId: decoded.id });
        if (!profile) return errorHandler(res, { message: 'decode of auth header went wrong' }, 500);

        const tattooToUpdate = await Tattoos.findOne({ userProfileId: profile.id, _id: _id });
        if (!tattooToUpdate) return errorHandler(res, { message: 'Tattoo was not found' }, 422);

        const data = await tattooToUpdate.updateOne({ name, description, categories, price, currency, image, salonId, masterId }).exec();

        sendBackHandler(res, 'tattoos', data);
    } catch (e) {
        errorHandler(res, e);
    }
};

const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { name, description, categories, price, currency, image, salonId, masterId } = req.body;

        const decoded = await decodeToken(req?.headers?.authorization || '');
        if (!decoded) return errorHandler(res, 'decode of auth header went wrong', 500);

        //TODO check if user is associated with salon or tattoo
        //userId: decoded.id

        const data = await new Tattoos({ name, description, categories, price, currency, image, masterId, salonId }).save();

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

        //TODO check if user is associated with salon or tattoo
        //userId: decoded.id

        const foundedTattoo = await Tattoos.findOne({ _id });
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
        .populate(['type', 'categories', 'currency'])
        .exec();
    sendBackHandler(res, 'tattoos', data);
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

export default { getAll, create, put, deleteRow, getFilterVariants };
