import { Schema, model, Document } from 'mongoose';

interface IBunnerAds extends Document {
  image?: string;
  title: string;
  description: string;
  ad_type: 'PRODUCT' | 'SHOP' | 'CATEGORY';
  product_id?: Schema.Types.ObjectId | null;
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
}, {
  timestamps: true,
});

// Pre-save hook to ensure the image is derived from the product when ad_type is 'PRODUCT'
bunnerAdsSchema.pre('save', async function (next) {
  if (this.ad_type === 'PRODUCT' && this.product_id) {
    const product = await model('Products').findById(this.product_id);
    if (product) {
      this.image = product.product_image;
    } else {
      throw new Error('Invalid product_id: Product does not exist');
    }
  }
  next();
});

export default model<IBunnerAds>('BunnerAds', bunnerAdsSchema);
