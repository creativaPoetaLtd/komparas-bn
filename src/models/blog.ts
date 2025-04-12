import mongoose, { Document, Schema } from 'mongoose';

interface IComment {
  name: string;
  email: string;
  comment: string;
}

interface IBlog extends Document {
  title: string;
  blogImage: string;
  content: string;
  contentPhotos: string[];
  comments: IComment[];
}

const blogSchema: Schema = new Schema({
  title: { type: String, required: true },
  blogImage: { type: String, required: true },
  content: { type: String, required: true },
  contentPhotos: { type: [String], required: true },
  comments: { type: [{ name: String, email: String, comment: String }], required: false },
});

export const Blog = mongoose.model<IBlog>('Blog', blogSchema);
