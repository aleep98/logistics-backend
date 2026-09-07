import { Router } from "express";
import mongoose from "mongoose";
import Shipment from "../models/shipment.js";
import Vehicle from "../models/vehicle.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { authMiddleware } from "../middlewares/token.js";
const router = Router();
router.post("/", authMiddleware(["admin", "dispatcher"]), asyncHandler(async (req, res) => {
    const { plate, vehicleModel, capacity, year } = req.body;
    const missingFields = [];
    if (!plate || typeof plate !== "string" || plate.trim() === "")
        missingFields.push("plate");
    if (!vehicleModel || typeof vehicleModel !== "string" || vehicleModel.trim() === "")
        missingFields.push("vehicleModel");
    if (year == null)
        missingFields.push("year");
    if (capacity == null)
        missingFields.push("capacity");
    if (missingFields.length > 0) {
        return res.status(400).json({
            error: `The following fields are required: ${missingFields.join(", ")}.`,
        });
    }
    const normalizedPlate = plate.trim().toUpperCase();
    const existingVehicle = await Vehicle.findOne({ plate: normalizedPlate });
    if (existingVehicle) {
        return res.status(409).json({ error: "Vehicle with this plate already registered." });
    }
    const newVehicle = new Vehicle({
        plate: normalizedPlate,
        vehicleModel: vehicleModel.trim(),
        capacity,
        year,
    });
    await newVehicle.save();
    return res.status(201).json(newVehicle);
}));
router.get("/", authMiddleware(["admin", "dispatcher"]), asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 5));
    const sort = req.query.sort || "vehicleModel";
    const order = req.query.order === "desc" ? "desc" : "asc";
    const validSortFields = ["vehicleModel", "plate", "year", "capacity", "createdAt"];
    const finalSort = validSortFields.includes(sort) ? sort : "vehicleModel";
    const skip = (page - 1) * limit;
    const sortOptions = {
        [finalSort]: order === "desc" ? -1 : 1,
    };
    const [vehicles, totalVehicles] = await Promise.all([
        Vehicle.find({}).sort(sortOptions).skip(skip).limit(limit),
        Vehicle.countDocuments(),
    ]);
    return res.status(200).json({
        data: vehicles,
        total: totalVehicles,
        page,
        limit,
    });
}));
router.put("/:id", authMiddleware(["admin", "dispatcher"]), asyncHandler(async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { plate, vehicleModel, capacity, year } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid vehicle ID format." });
    }
    const updateData = {};
    if (plate)
        updateData.plate = plate.trim().toUpperCase();
    if (vehicleModel != null) {
        if (typeof vehicleModel !== "string" || vehicleModel.trim() === "") {
            return res.status(400).json({ error: "vehicleModel cannot be empty." });
        }
        updateData.vehicleModel = vehicleModel.trim();
    }
    if (year != null)
        updateData.year = year;
    if (capacity != null)
        updateData.capacity = capacity;
    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: "No fields to update provided." });
    }
    const updatedVehicle = await Vehicle.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
    if (!updatedVehicle) {
        return res.status(404).json({ error: "Vehicle not found." });
    }
    return res.status(200).json(updatedVehicle);
}));
router.delete("/:id", authMiddleware(["admin"]), asyncHandler(async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid vehicle ID format." });
    }
    const shipmentWithVehicle = await Shipment.findOne({ assignedVehicle: id });
    if (shipmentWithVehicle) {
        return res.status(400).json({
            error: "Cannot delete vehicle because it is assigned to a shipment.",
        });
    }
    const deletedVehicle = await Vehicle.findByIdAndDelete(id);
    if (!deletedVehicle) {
        return res.status(404).json({ error: "Vehicle not found." });
    }
    return res.status(200).json(deletedVehicle);
}));
export default router;
//# sourceMappingURL=vehicles.js.map