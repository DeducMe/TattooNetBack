import mongoose, { Schema } from 'mongoose';
import logging from '../../config/logging';
import Currency from '../currency/currencyInterface';

export interface ICity extends Document {
    name: string;
    geometryLocation?: {
        type: 'Polygon';
        coordinates: Number[][][];
    };
    multipolygonGeometryLocation?: {
        type: 'MultiPolygon';
        coordinates: Number[][][][];
    };
    country: Schema.Types.ObjectId;
}

export const pointSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Point'],
        required: true
    },
    coordinates: {
        type: [Number],
        required: true
    }
});

export const polygonSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['Polygon'],
        required: true
    },
    coordinates: {
        type: [[[Number]]], // Array of arrays of arrays of numbers
        required: true
    }
});

export const multiPolygonSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['MultiPolygon'],
        required: true
    },
    coordinates: {
        type: [[[[Number]]]], // Array of arrays of arrays of numbers
        required: true
    }
});

const CitySchema: Schema = new Schema(
    {
        name: { type: Schema.Types.String, required: false },
        country: { type: Schema.Types.ObjectId, ref: 'Country', required: false },
        geometryLocation: {
            type: polygonSchema
        },
        multipolygonGeometryLocation: {
            type: multiPolygonSchema
        }
    },
    {
        timestamps: true
    }
);

CitySchema.post<ICity>('save', function () {
    logging.info('Mongo', 'Checkout the usersData we just saved: ', this);
});

export default mongoose.model<ICity>('City', CitySchema);
