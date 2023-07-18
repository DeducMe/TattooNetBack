import mongoose, { Schema } from 'mongoose';
import logging from '../../config/logging';
import Currency from '../currency/currencyInterface';
import Profile from '../users/profile/profileInterface';

export interface ITattoos extends Document {
    currency: Schema.Types.ObjectId & Currency;
    name: string;
    categories?: Schema.Types.ObjectId[];
    price: number;
    description: Schema.Types.String;
    masterProfile: Schema.Types.ObjectId & Profile;
    userProfileId: Schema.Types.ObjectId;
    type: string;
    reviews: Schema.Types.ObjectId[];
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
        userProfileId: { type: Schema.Types.ObjectId, ref: 'Profile', required: false },
        masterProfile: { type: Schema.Types.ObjectId, ref: 'Profile', required: false },
        reviews: [{ type: Schema.Types.ObjectId, ref: 'Reviews', required: false }]
    },
    {
        timestamps: true
    }
);

TattoosSchema.post<ITattoos>('save', function () {
    logging.info('Mongo', 'Checkout the usersData we just saved: ', this);
});

export default mongoose.model<ITattoos>('Tattoos', TattoosSchema);
