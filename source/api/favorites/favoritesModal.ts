import mongoose, { Schema, Document } from 'mongoose';
import logging from '../../config/logging';

export interface IFavorites extends Document {
    name: string;
    popularity: string;
}

const FavoritesSchema: Schema = new Schema(
    {
        type: { type: Schema.Types.String, enum: ['master', 'tattoo'], required: false },
        master: { type: Schema.Types.ObjectId, ref: 'Profile', required: false },
        tattoo: { type: Schema.Types.ObjectId, ref: 'Tattoo', required: false },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: false }
    },
    {
        timestamps: false
    }
);

FavoritesSchema.post<IFavorites>('save', function () {
    logging.info('Mongo', 'Checkout the usersData we just saved: ', this);
});

export default mongoose.model<IFavorites>('Favorites', FavoritesSchema);
