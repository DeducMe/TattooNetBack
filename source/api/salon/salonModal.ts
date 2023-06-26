import mongoose, { Schema } from 'mongoose';
import logging from '../../config/logging';
import Currency from '../currency/currencyInterface';

export interface ISalon extends Document {
    currency: Schema.Types.ObjectId & Currency;
    name: string;
    categories?: Schema.Types.ObjectId[];
    price: number;
    image: string;
    description: Schema.Types.String;
    masterProfileId: Schema.Types.ObjectId;
    salonId: Schema.Types.ObjectId;
    address: Schema.Types.ObjectId;
}

const SalonSchema: Schema = new Schema(
    {
        name: { type: Schema.Types.String, required: false },
        description: { type: Schema.Types.String, required: false },
        images: [{ type: Schema.Types.String, required: false }],
        masters: [{ type: Schema.Types.ObjectId, ref: 'Master', required: false }],
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
        address: { type: Schema.Types.String, required: false },
        categories: [{ type: Schema.Types.ObjectId, ref: 'Categories', required: false }],
        price: { type: Schema.Types.Number, required: false }
    },
    {
        timestamps: true
    }
);

SalonSchema.post<ISalon>('save', function () {
    logging.info('Mongo', 'Checkout the usersData we just saved: ', this);
});

export default mongoose.model<ISalon>('Salon', SalonSchema);
