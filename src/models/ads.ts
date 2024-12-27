import { Schema, model, Document } from 'mongoose';

interface IBunnerAds extends Document {
  image?: string;
  title: string;
  description: string;
  ad_type: 'PRODUCT' | 'SHOP' | 'CATEGORY';
  product_id?: Schema.Types.ObjectId | null;
  shop_id?: Schema.Types.ObjectId | null;
  service_id?: Schema.Types.ObjectId | null;
  active?: Boolean;
}

const bunnerAdsSchema = new Schema<IBunnerAds>({

  image: {
    type: String,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  ad_type: {
    type: String,
    enum: ['PRODUCT', 'SHOP', 'CATEGORY'],
    required: true,
  },
  product_id: {
    type: Schema.Types.ObjectId,
    ref: 'Products',
    default: null,
  },
  shop_id: {
    type: Schema.Types.ObjectId,
    ref: 'Shop',
    default: null,
  },
  service_id: {
    type: Schema.Types.ObjectId,
    ref: 'Services',
    default: null,
  },
  active: {
    type: Boolean,
    default: true
  },
}, {
  timestamps: true,
});

bunnerAdsSchema.pre('save', async function (next) {
  if (this.ad_type === 'PRODUCT' && this.product_id) {
    const product = await model('Products').findById(this.product_id);
    if (product) {
      this.image = product.product_image;
    } else {
      throw new Error('Invalid product_id: Product does not exist');
    }
  }
  else if (this.ad_type === 'SHOP' && this.shop_id) {
    const shop = await model('Shop').findById(this.shop_id);
    if (shop) {
      this.image = shop.shop_image;
    } else {
      throw new Error('Invalid shop_id: Shop does not exist');
    }
  }

  else if (this.ad_type === 'CATEGORY' && this.service_id) {
    const category = await model('Services').findById(this.service_id);
    if (category) {
      this.image = category.image;
    } else {
      throw new Error('Invalid service_id: Category does not exist');
    }
  }
  next();
});

export default model<IBunnerAds>('BunnerAds', bunnerAdsSchema);
