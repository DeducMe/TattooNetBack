import { NextFunction, Request, Response } from 'express';
import { decodeToken, errorHandler, sendBackHandler } from '../../functions/apiHandlers';
import City from './cityModal';
import Cities from '../../common/cities.json';
import countryModal from '../country/countryModal';

const init = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await City.collection.drop();

        // I am 100% sure that this initialization can be done better, but uncertainty of how $geoIntersects works with multipolygon and polygon makes this my best idea. Anyway it runs just ones and still leaves some places with undefined countries.

        // Ok, so these places are are on the edge of the map and thats why they cant be found
        //https://github.com/datasets/geo-countries/blob/master/data/countries.geojson
        // Also mongo struggles to connect cities with Russia, cause it overlaps over two hemispheres. I need a way to make it work somehow or find some other solution
        //First solution is to add cities inside initCountries and merge cities and countries together in one request

        for (let index = 0; index < Cities.features.length; index++) {
            const item = Cities.features[index];
            let { NAME } = item.properties;
            NAME = NAME.toLowerCase();

            //     let country = await countryModal
            //         .findOne({
            //             geometryLocation: {
            //                 $geoIntersects: {
            //                     $geometry: item.geometry
            //                 }
            //             }
            //         })
            //         .select('-geometryLocation');

            //     //this doesnt work. Cant understand why mongo dont find some of the cities
            //     // if (!country?._id) {
            //     // console.log('trying to find further', item.geometry);
            //     // try {
            //     //     const countriesFound = await countryModal.find({
            //     //         geometryLocation: {
            //     //             $geoWithin: {
            //     //                 $geometry: {
            //     //                     ...item.geometry,

            //     //                     crs: {
            //     //                         type: 'name',
            //     //                         properties: { name: 'urn:x-mongodb:crs:strictwinding:EPSG:4326' }
            //     //                     }
            //     //                 }
            //     //             }
            //     //         }
            //     //     });

            //     //     country = null;

            //     //     console.log(countriesFound.map((item) => item.name));
            //     // } catch (e) {
            //     //     console.log(e, 'err');
            //     // }
            //     // }
            console.log(NAME);
            await City.replaceOne({ name: NAME }, { name: NAME.charAt(0).toUpperCase() + NAME.slice(1), geometryLocation: item.geometry, country: null }, { upsert: true });
        }

        sendBackHandler(res, 'city', true);
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

    const data = await City.find({})
        .select('-geometryLocation')
        .populate({
            path: 'country',
            select: { name: 1, ISO: 1, code: 1, emoji: 1, unicode: 1, image: 1, dial_code: 1 }
        })
        .exec();

    sendBackHandler(res, 'city', data);
};

export default { getAll, init };
