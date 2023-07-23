import mongoose, { ObjectId, Schema } from 'mongoose';
import logging from '../../config/logging';
import Currency from '../currency/currencyInterface';

export interface IImages {
    _id: ObjectId;
    name: string;
    description: string;
    imageObject: {
        data: Buffer;
        contentType: string;
    };
}

const ImagesSchema: Schema = new Schema(
    {
        name: { type: Schema.Types.String, required: false },
        description: { type: Schema.Types.String, required: false },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
        imageObject: [
            {
                data: Schema.Types.Buffer,
                contentType: Schema.Types.String
            }
        ]
    },
    {
        timestamps: true
    }
);

ImagesSchema.post<IImages>('save', function () {
    logging.info('Mongo', 'Checkout the usersData we just saved: ', this);
});

export default mongoose.model<IImages>('Images', ImagesSchema);
