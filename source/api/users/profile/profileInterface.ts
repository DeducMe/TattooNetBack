import { Document, Schema } from 'mongoose';
import Currency from '../../currency/currencyInterface';

export default interface Profile extends Document {
    rating: number;
    currencySet: Schema.Types.ObjectId & Currency;
    name: string;
    avatar: string;
    userId: string;
    type: string;
}
