import { Schema, model, Document } from 'mongoose';
import { IPromo2 } from '../types/Promo2';

const Promo2Schema = new Schema<IPromo2>({
    name: { type: String },
    description: { type: String },
    offer: { type: String },
    price: { type: Number },
    image: { type: String },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Products',
    },
    shop: {
        type: Schema.Types.ObjectId,
        ref: 'Shop',
    },

}, { timestamps: true });

const Promo2 = model<IPromo2>('Promo2', Promo2Schema);

export default Promo2;