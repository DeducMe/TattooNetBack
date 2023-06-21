import { NextFunction, Request, Response } from 'express';
import { decodeToken, errorHandler, sendBackHandler } from '../../functions/apiHandlers';
import Country from './countryModal';
import Countries from '../../common/countries.json';
import CountriesWithFlags from '../../common/country-by-flag.json';
import cityModal from '../city/cityModal';

const init = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await Country.collection.drop();

        for (let index = 0; index < Countries.features.length; index++) {
            const item = Countries.features[index];
            let { ADMIN, ISO_A3 } = item.properties;
            const countryWithFlag = CountriesWithFlags.find((item) => item.country === ADMIN || item.code === ISO_A3);

            if (!countryWithFlag) continue;
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
            let citiesFound;
            try {
                citiesFound = await cityModal.findOne({
                    geometryLocation: {
                        $geoIntersects: {
                            $geometry: {
                                type: item.geometry.type,
                                coordinates: item.geometry.coordinates.map((i: any[]) => {
                                    return i.map((j) => {
                                        if (typeof j[0] === 'number') {
                                            return [j[0] >= 180 ? 180 : j[0] <= -180 ? -180 : j[0], j[1] >= 90 ? 90 : j[1] <= -90 ? 90 : j[1]];
                                        } else {
                                            return j.map((k: any[]) => [k[0] >= 180 ? 180 : k[0] <= -180 ? -180 : k[0], k[1] >= 90 ? 90 : k[1] <= -90 ? 90 : k[1]]);
                                        }
                                    });
                                })
                            }
                        }
                    }
                });
            } catch (e) {
                console.log(ADMIN, 'ERR');
                continue;
            }

            if (!citiesFound) {
                console.log('bigGeo/no city found', ADMIN, item.geometry.type);
                continue;
            }
            console.log('normalGeo', ADMIN);

            const country = await Country.replaceOne(
                { name: ADMIN },
                {
                    name: ADMIN,
                    ISO: ISO_A3,
                    geometryLocation: item.geometry.type === 'Polygon' ? [item.geometry] : item.geometry,
                    code: countryWithFlag?.code,
                    emoji: countryWithFlag?.emoji,
                    unicode: countryWithFlag?.unicode,
                    image: countryWithFlag?.image,
                    dial_code: countryWithFlag?.dial_code
                },
                { upsert: true }
            );

            try {
                if (country?.upserted?.[0]?._id) {
                    await cityModal.updateMany(
                        {
                            geometryLocation: {
                                $geoIntersects: {
                                    $geometry: {
                                        type: item.geometry.type,
                                        coordinates: item.geometry.coordinates.map((i: any[]) => {
                                            return i.map((j) => {
                                                if (typeof j[0] === 'number') {
                                                    return [j[0] >= 180 ? 180 : j[0] <= -180 ? -180 : j[0], j[1] >= 90 ? 90 : j[1] <= -90 ? 90 : j[1]];
                                                } else {
                                                    return j.map((k: any[]) => [k[0] >= 180 ? 180 : k[0] <= -180 ? -180 : k[0], k[1] >= 90 ? 90 : k[1] <= -90 ? 90 : k[1]]);
                                                }
                                            });
                                        })
                                    }
                                }
                            }
                        },
                        { country: country.upserted[0]._id }
                    );
                }
            } catch (e) {
                console.log(e, ADMIN);
            }
        }

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
