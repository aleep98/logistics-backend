import { Schema, model, Document } from "mongoose";

export interface IVehicle extends Document {
  plate: string;
  vehicleModel: string;
  capacity: number;
  year: number;
 }

 const vehicleSchema = new Schema<IVehicle>({
    plate: { type: String, required: true, unique: true },
    vehicleModel: { type: String, required: true },
    capacity: { type: Number, required: true },
    year: { type: Number, required: true },
  },
  { timestamps: true 
 })

 export default model<IVehicle>("Vehicle", vehicleSchema);