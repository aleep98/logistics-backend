// O que corrigir:
// validar status default
// garantir que assignedDriver e assignedVehicle são referências válidas
// evitar conflitos de duplicidade de referência
// adicionar index se necessário
// O que fazer:
// manter as enums e default
// criar validações extras no controller, não só no schema
// validar no update se o motorista é driver
// verificar se o veículo ainda está disponível
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