import mongoose, { Document, Schema } from "mongoose";

interface IConfirmationCode extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  code: string;
  createdAt: Date;
}

const ConfirmationCodeSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "5m",
  },
});

const ConfirmationCodeModel = mongoose.model<IConfirmationCode>(
  "ConfirmationCode",
  ConfirmationCodeSchema
);

export default ConfirmationCodeModel;
