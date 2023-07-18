import mongoose, { Schema } from 'mongoose';
import logging from '../../../config/logging';
import Profile from './profileInterface';
import { pointSchema } from '../../city/cityModal';

const ProfileSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, required: true },
        name: { type: Schema.Types.String, required: false },
        type: { type: Schema.Types.String, required: false, enum: ['master', 'user'] },
        address: { type: Schema.Types.String, required: false },
        location: {
            type: pointSchema
        },
        avatar: { type: Schema.Types.String, required: false },
        currencySet: { type: Schema.Types.ObjectId, ref: 'Currency', required: false },
        total: { type: Schema.Types.Number, required: false },
        rating: { type: Schema.Types.Number, default: 0 }
    },
    {
        timestamps: false
    }
);
ProfileSchema.post<Profile>('save', function () {
    logging.info('Mongo', 'Checkout the Profile we just saved: ', this);
});

export default mongoose.model<Profile>('Profile', ProfileSchema);
