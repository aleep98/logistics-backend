import { Schema, model } from "mongoose";
const shipmentSchema = new Schema({
    reference: {
        type: String,
        unique: true,
        required: true,
        trim: true,
    },
    customerName: {
        type: String,
        required: true,
        trim: true,
    },
    deliveryAddress: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ["pending", "in_transit", "delivered", "cancelled"],
        default: "pending",
    },
    assignedDriver: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    assignedVehicle: {
        type: Schema.Types.ObjectId,
        ref: "Vehicle",
    },
}, {
    timestamps: true,
});
export default model("Shipment", shipmentSchema);
//# sourceMappingURL=shipment.js.map