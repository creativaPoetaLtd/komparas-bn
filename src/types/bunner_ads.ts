import { Document } from 'mongoose';

export interface IBunnerAds extends Document {
    image: string;
    title: string;
    description: string;
    ad_type: 'PRODUCT' | 'SHOP'| 'CATEGORY';
    product_id?: number | null;
}
