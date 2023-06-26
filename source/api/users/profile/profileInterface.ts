import { Document, Schema } from 'mongoose';
import Currency from '../../currency/currencyInterface';

export default interface Profile extends Document {
    currencySet: Schema.Types.ObjectId & Currency;
    name: Schema.Types.String;
    avatar: Schema.Types.String;
    masterId?: Schema.Types.ObjectId;
    userId: string;
    type: Schema.Types.String;
}
