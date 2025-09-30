import { Router } from "express";
import mongoose from "mongoose";
import Shipment, { IShipment } from "../models/shipment.js";
import { authMiddleware, AuthRequest } from "../middlewares/token.js";
import User from "../models/User.js";
import Vehicle from "../models/vehicle.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";


const router = Router();

router.get("/", asyncHandler(async (req, res) => {
    const shipments = await Shipment.find()
      .populate("assignedDriver", "name email")
      .populate("assignedVehicle", "plate vehicleModel");
    res.status(200).json(shipments);
}));

router.post("/", asyncHandler(async (req, res) => {
    const { reference, customerName, deliveryAddress } = req.body;

    if (!reference || !customerName || !deliveryAddress) {
      return res.status(400).json({ error: "Reference, customerName, and deliveryAddress are required." });
    }

    const existingShipment = await Shipment.findOne({ reference });
    if (existingShipment) {
      return res.status(409).json({ error: "A shipment with this reference already exists." });
    }

    const newShipment = new Shipment({
      reference,
      customerName,
      deliveryAddress,
    });

    await newShipment.save();

    await newShipment.populate([
        { path: "assignedDriver", select: "name email" },
        { path: "assignedVehicle", select: "plate vehicleModel" }]);

    res.status(201).json(newShipment);
}));


router.get("/:id", asyncHandler(async (req, res) => {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid shipment ID format." });
        }

        const shipment = await Shipment.findById(id)
            .populate("assignedDriver", "name email")
            .populate("assignedVehicle", "plate vehicleModel");

        if (!shipment) {
            return res.status(404).json({ error: "Shipment not found." });
        }

        res.status(200).json(shipment);
}));


router.put("/:id", asyncHandler(async (req: AuthRequest, res) => {
        const { id } = req.params;
        const { customerName, deliveryAddress, status, assignedDriver, assignedVehicle } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid shipment ID format." });
        }

        const updateData: Partial<IShipment> = {};

        // Build the update object with provided fields
        if (customerName) updateData.customerName = customerName;
        if (deliveryAddress) updateData.deliveryAddress = deliveryAddress;
        
        if (status) {
            const allowedStatus: IShipment["status"][] = ["pending", "in_transit", "delivered", "cancelled"];
            if (!allowedStatus.includes(status)) {
                return res.status(400).json({ error: `Invalid status. Must be one of: ${allowedStatus.join(", ")}` });
            }
            updateData.status = status;
        }

        if (assignedDriver) {
            const driverExists = await User.findOne({ _id: assignedDriver, role: 'driver' });
            if (!driverExists) {
                return res.status(404).json({ error: "Assigned driver not found or is not a valid driver." });
            }
            updateData.assignedDriver = assignedDriver;
        }

        if (assignedVehicle) {
            const vehicleExists = await Vehicle.findById(assignedVehicle);
            if (!vehicleExists) {
                return res.status(404).json({ error: "Assigned vehicle not found." });
            }
            updateData.assignedVehicle = assignedVehicle;
        }

        const updatedShipment = await Shipment.findByIdAndUpdate(id, { $set: updateData }, { new: true })
            .populate("assignedDriver", "name email")
            .populate("assignedVehicle", "plate vehicleModel");

        if (!updatedShipment) {
            return res.status(404).json({ error: "Shipment not found." });
        }

        res.status(200).json(updatedShipment);
}));


router.delete("/:id", asyncHandler(async (req, res) => {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid shipment ID format." });
        }

        const deletedShipment = await Shipment.findByIdAndDelete(id);

        if (!deletedShipment) {
            return res.status(404).json({ error: "Shipment not found." });
        }

        res.status(200).json({ message: "Shipment deleted successfully." });
}));

export default router;