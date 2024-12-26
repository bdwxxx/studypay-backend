import mongoose, { Document, Schema } from "mongoose";

interface IOrder extends Document {
  user: mongoose.Schema.Types.ObjectId;
  telegram: string;
  detailedDescription: string;
  price: number;
  status: string;
  admin?: mongoose.Schema.Types.ObjectId;
  close: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const OrderSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
      enum: [
        "Ожидает оплаты",
        "Оплачен",
        "В процессе выполнения",
        "На проверки",
        "Требует исправлений",
        "Готов к передаче",
        "Отменено",
        "Возврат",
        "Выполнен",
      ],
      default: "Ожидает оплаты",
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    close: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>("Order", OrderSchema);
