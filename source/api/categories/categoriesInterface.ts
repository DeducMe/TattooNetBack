import { Document, Schema } from 'mongoose';

export default interface Categories extends Document {
    name: string;
    popularity: string;
}
