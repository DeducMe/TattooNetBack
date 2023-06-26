import mongoose, { Schema } from 'mongoose';
import logging from '../../config/logging';
import Currency from '../currency/currencyInterface';

export interface ITattoos extends Document {
    currency: Schema.Types.ObjectId & Currency;
    name: string;
    categories?: Schema.Types.ObjectId[];
    price: number;
    description: Schema.Types.String;
    masterProfile: Schema.Types.ObjectId;
    salonId: Schema.Types.ObjectId;
    type: Schema.Types.String;
}

const TattoosSchema: Schema = new Schema(
    {
        name: { type: Schema.Types.String, required: false },
        description: { type: Schema.Types.String, required: false },
        price: { type: Schema.Types.Number, required: false },
        type: { type: Schema.Types.String, required: false },
        images: [{ type: Schema.Types.String, required: false }],
        categories: [{ type: Schema.Types.ObjectId, ref: 'Categories', required: false }],
        currency: { type: Schema.Types.ObjectId, ref: 'Currency', required: false },
        salonId: { type: Schema.Types.ObjectId, ref: 'Salon', required: false },
        masterProfile: { type: Schema.Types.ObjectId, ref: 'Profile', required: false }
    },
    {
        timestamps: true
    }
);

TattoosSchema.post<ITattoos>('save', function () {
    logging.info('Mongo', 'Checkout the usersData we just saved: ', this);
});

export default mongoose.model<ITattoos>('Tattoos', TattoosSchema);
