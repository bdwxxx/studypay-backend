import mongoose, { Document, Schema } from 'mongoose';

interface IService extends Document {
  name: string;
  priceRange: string;
  features: string[];
  popular?: boolean;
}

interface ICategory extends Document {
  category: string;
  description: string;
  services: IService[];
}

const ServiceSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  priceRange: {
    type: String,
    required: true,
  },
  features: {
    type: [String],
    required: true,
  },
  popular: {
    type: Boolean,
    default: false,
  },
});

const CategorySchema: Schema = new Schema({
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  services: [ServiceSchema],
});

export const Category = mongoose.model<ICategory>('Category', CategorySchema);
