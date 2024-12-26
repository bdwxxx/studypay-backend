import mongoose, { Document, Schema, Model } from "mongoose";

interface ITelegram extends Document {
  chatId: number;
  telegram: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const TelegramSchema: Schema<ITelegram> = new Schema(
  {
    chatId: {
      type: Number,
      required: true,
    },
    telegram: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const TelegramModel: Model<ITelegram> = mongoose.model<ITelegram>("Telegram", TelegramSchema);

export default TelegramModel;
