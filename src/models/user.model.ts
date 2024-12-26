import mongoose, { Document, Schema, Model } from "mongoose";

interface IUser extends Document {
  user: string;
  telegram: string;
  passwordHash: string;
  role: "user" | "admin" | "owner";
  isVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

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
      enum: ["user", "admin", "owner"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default User;
