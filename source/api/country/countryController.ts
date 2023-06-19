import { NextFunction, Request, Response } from 'express';
import { decodeToken, errorHandler, sendBackHandler } from '../../functions/apiHandlers';
import Country from './countryModal';
import Countries from '../../common/countries.json';

const init = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await Country.collection.drop();

        for (let index = 0; index < Countries.features.length; index++) {
            const item = Countries.features[index];
            let { ADMIN, ISO_A3 } = item.properties;
            // let counter = 0;
            // console.log(item.geometry.coordinates);
            // const centerLocation = item.geometry.coordinates.reduce(
            //     (acc: any[], item: any[]) => {
            //         item.forEach((i: any[]) => {
            //             i.forEach((j: any[]) => {
            //                 acc[0] += j[0] || i[0];
            //                 acc[1] += j[1] || i[1];
            //                 counter += 1;
            //             });
            //         });
            //     },
            //     [0, 0]
            // );

            // centerLocation[0] = centerLocation[0] / counter;
            // centerLocation[1] = centerLocation[1] / counter;
            // const geometryCenter = {
            //     type: 'Point',
            //     coordinates: centerLocation
            // };

            await Country.replaceOne({ name: ADMIN }, { name: ADMIN, ISO: ISO_A3, geometryLocation: item.geometry.type === 'Polygon' ? [item.geometry] : item.geometry }, { upsert: true });
        }

        await Country.collection.dropIndexes();
        await Country.collection.createIndex({ 'geometryLocation.geometry': '2dsphere' });

        sendBackHandler(res, 'country', true);
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

    const data = await Country.find({}).select('-geometryLocation').exec();

    sendBackHandler(res, 'country', data);
};

export default { getAll, init };
