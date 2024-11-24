import { Schema, model, Document } from 'mongoose';


interface IServices extends Document {
    service_name: string;
    service_description: string;
    image: string;
}

const servicesSchema = new Schema<IServices>({
    service_name: {
        type: String,
        required: true,
    },
    service_description: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
}, {
    timestamps: true,
});

export default model<IServices>('Services', servicesSchema);