import { Schema, model, Document } from 'mongoose';

interface ICompanyAds extends Document {
  image?: string;
  name: string;
  url: string;
  title:string;
}

const bunnerAdsSchema = new Schema<ICompanyAds>({
  image: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  title:{
    type:String,
    required:true
  }
 
}, {
  timestamps: true,
});

export default model<ICompanyAds>('CompanyAds', bunnerAdsSchema);
