import { Schema, model, Document, Types } from "mongoose";

export interface IShipment extends Document {
  reference: string;
  customerName: string;
  deliveryAddress: string;
  status: "pending" | "in_transit" | "delivered" | "cancelled";
  assignedDriver?: Types.ObjectId;
  assignedVehicle?: Types.ObjectId;
}

const shipmentSchema = new Schema<IShipment>(
  {
    reference: { type: String, unique: true, required: true },
    customerName: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    status: { type: String, enum: ["pending", "in_transit", "delivered", "cancelled"], default: "pending" },
    assignedDriver: { type: Schema.Types.ObjectId, ref: "User" },
    assignedVehicle: { type: Schema.Types.ObjectId, ref: "Vehicle" },

  },
  
  { timestamps: true }
);

export default model<IShipment>("Shipment", shipmentSchema);
