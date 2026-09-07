import { Schema, model, Document } from "mongoose";

export type UserRole = "admin" | "dispatcher" | "driver";

export interface IUser extends Document {
name: string;
email: string;
passwordHash: string;
role: UserRole;
}

const userSchema = new Schema<IUser>(
{
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "dispatcher", "driver"],
    required: true,
  },
},
{
  timestamps: true,
}
);

export default model<IUser>("User", userSchema);