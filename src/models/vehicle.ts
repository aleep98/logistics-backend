import { Schema, model, Document } from "mongoose";

export interface IVehicle extends Document {
 plate: string;
 vehicleModel: string;
 capacity: number;
 year: number;
}

const vehicleSchema = new Schema<IVehicle>(
 {
   plate: {
     type: String,
     required: true,
     unique: true,
     uppercase: true,
     trim: true,
   },
   vehicleModel: {
     type: String,
     required: true,
     trim: true,
   },
   capacity: {
     type: Number,
     required: true,
     min: 1,
   },
   year: {
     type: Number,
     required: true,
     min: 1900,
     max: new Date().getFullYear() + 1,
   },
 },
 {
   timestamps: true,
 }
);

export default model<IVehicle>("Vehicle", vehicleSchema);