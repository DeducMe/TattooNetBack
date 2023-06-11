import mongoose, { Schema } from 'mongoose';
import logging from '../../config/logging';
import Currency from '../currency/currencyInterface';

export interface IMaster extends Document {
    currency: Schema.Types.ObjectId & Currency;
    name: string;
    categories?: Schema.Types.ObjectId[];
    price: number;
    image: string;
    description: Schema.Types.String;
    masterId: Schema.Types.ObjectId;
    salonId: Schema.Types.ObjectId;
}

const MasterSchema: Schema = new Schema(
    {
        name: { type: Schema.Types.String, required: false },
        description: { type: Schema.Types.String, required: false },
        avatar: { type: Schema.Types.String, required: false },
        salonId: { type: Schema.Types.ObjectId, ref: 'Salon', required: false },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: false }
    },
    {
        timestamps: true
    }
);

MasterSchema.post<IMaster>('save', function () {
    logging.info('Mongo', 'Checkout the usersData we just saved: ', this);
});

export default mongoose.model<IMaster>('Master', MasterSchema);
