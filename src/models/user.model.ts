import mongoose, { Document, Schema } from 'mongoose';

/**
 * Интерфейс для данных о покупке AI инструмента
 */
interface IAIPurchase {
  /**
   * Дата покупки AI инструмента
   */
  purchaseDate: Date;

  /**
   * Количество дней, на которые действует покупка
   */
  daysValid: number;

  /**
   * Количество сделанных запросов
   */
  requestsMade: number;
}

interface IUser extends Document {
  user: string;
  telegram: string;
  passwordHash: string;
  role: 'user' | 'admin' | 'owner';
  isVerified: boolean;
  aiAccess?: boolean;
  aiPurchase?: IAIPurchase; // Вложенный объект для данных о покупке AI инструмента
  createdAt?: Date;
  updatedAt?: Date;
}

const AIPurchaseSchema: Schema<IAIPurchase> = new Schema({
  purchaseDate: {
    type: Date,
    required: true,
  },
  daysValid: {
    type: Number,
    required: true,
  },
  requestsMade: {
    type: Number,
    required: true,
    default: 0,
  },
});

const UserSchema: Schema<IUser> = new Schema(
  {
    user: {
      type: String,
      required: true,
      unique: true,
    },
    telegram: {
      type: String,
      required: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'owner'],
      default: 'user',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    aiAccess: {
      type: Boolean,
      required: false,
      default: false,
    },
    aiPurchase: {
      type: AIPurchaseSchema,
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
