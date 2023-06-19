import mongoose, { Schema } from 'mongoose';
import logging from '../../config/logging';
import { multiPolygonSchema, pointSchema, polygonSchema } from '../city/cityModal';

export interface ICountry extends Document {
    name: string;
    ISO: string;
    geometryLocation?: {
        type: 'MultiPolygon';
        coordinates: Number[][][][];
    };
}

const CountrySchema: Schema = new Schema(
    {
        name: { type: Schema.Types.String, required: false },
        ISO: { type: Schema.Types.String, required: false },
        centerLocation: { type: pointSchema, required: false },
        geometryLocation: {
            type: multiPolygonSchema
        }
    },
    {
        timestamps: false
    }
);

CountrySchema.post<ICountry>('save', function () {
    logging.info('Mongo', 'Checkout the usersData we just saved: ', this);
});

export default mongoose.model<ICountry>('Country', CountrySchema);
