import { Schema, model } from "mongoose";
const vehicleSchema = new Schema({
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
}, {
    timestamps: true,
});
export default model("Vehicle", vehicleSchema);
//# sourceMappingURL=vehicle.js.map