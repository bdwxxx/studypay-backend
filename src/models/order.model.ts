import mongoose, { Document, Schema } from 'mongoose';

interface IOrder extends Document {
  user: mongoose.Schema.Types.ObjectId;
  telegram: string;
  detailedDescription: string;
  price: number;
  status: string;
  admin?: mongoose.Types.ObjectId;
  close: boolean;
  category: mongoose.Schema.Types.ObjectId; // Связь с категорией
  service: string; // Название услуги
  createdAt?: Date;
  updatedAt?: Date;
}

const OrderSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    telegram: {
      type: String,
      required: true,
    },
    detailedDescription: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    close: {
      type: Boolean,
      default: false,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category', // Указание ссылки на модель Category
      required: true,
    },
    service: {
      type: String, // Название услуги
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>('Order', OrderSchema);
