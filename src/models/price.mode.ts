import mongoose, { Document, Schema } from 'mongoose';

interface IPrice extends Document {
  service: string;
  price: number;
  description?: string;
}

const PriceSchema: Schema = new Schema(
  {
    service: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IPrice>('Price', PriceSchema);
