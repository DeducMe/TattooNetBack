import mongoose, { ObjectId, Schema } from 'mongoose';
import logging from '../../config/logging';
import Currency from '../currency/currencyInterface';

export interface IReviews {
    _id: ObjectId;
    rating: number;
    text: string;
    images: string[];
    tattooId: Schema.Types.ObjectId;
}

const ReviewsSchema: Schema = new Schema(
    {
        rating: { type: Schema.Types.Number, required: false },
        text: { type: Schema.Types.String, required: false },
        images: [{ type: Schema.Types.ObjectId, required: false }],
        tattooId: { type: Schema.Types.ObjectId, ref: 'Tattoo', required: false },
        masterProfile: { type: Schema.Types.ObjectId, ref: 'Profile', required: false },
        userProfileId: { type: Schema.Types.ObjectId, ref: 'Profile', required: false }
    },
    {
        timestamps: true
    }
);

ReviewsSchema.post<IReviews>('save', function () {
    logging.info('Mongo', 'Checkout the usersData we just saved: ', this);
});

export default mongoose.model<IReviews>('Reviews', ReviewsSchema);
