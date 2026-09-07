import { Router } from "express";
import mongoose from "mongoose";
import Shipment, { IShipment } from "../models/shipment.js";
import { authMiddleware, AuthRequest } from "../middlewares/token.js";
import User from "../models/User.js";
import Vehicle from "../models/vehicle.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

const router = Router();

router.get(
  "/",
  authMiddleware(["admin", "dispatcher", "driver"]),
  asyncHandler(async (req, res) => {
    const shipments = await Shipment.find()
      .populate("assignedDriver", "name email role")
      .populate("assignedVehicle", "plate vehicleModel");

    return res.status(200).json(shipments);
  })
);

router.post(
  "/",
  authMiddleware(["admin", "dispatcher"]),
  asyncHandler(async (req, res) => {
    const { reference, customerName, deliveryAddress } = req.body;

    if (!reference || !customerName || !deliveryAddress) {
      return res.status(400).json({
        error: "Reference, customerName, and deliveryAddress are required.",
      });
    }

    const existingShipment = await Shipment.findOne({ reference });
    if (existingShipment) {
      return res.status(409).json({
        error: "A shipment with this reference already exists.",
      });
    }

    const newShipment = new Shipment({
      reference: String(reference).trim(),
      customerName: String(customerName).trim(),
      deliveryAddress: String(deliveryAddress).trim(),
    });

    await newShipment.save();

    await newShipment.populate([
      { path: "assignedDriver", select: "name email role" },
      { path: "assignedVehicle", select: "plate vehicleModel" },
    ]);

    return res.status(201).json(newShipment);
  })
);

router.get(
  "/:id",
  authMiddleware(["admin", "dispatcher", "driver"]),
  asyncHandler(async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid shipment ID format." });
    }

    const shipment = await Shipment.findById(id)
      .populate("assignedDriver", "name email role")
      .populate("assignedVehicle", "plate vehicleModel");

    if (!shipment) {
      return res.status(404).json({ error: "Shipment not found." });
    }

    return res.status(200).json(shipment);
  })
);

router.put(
  "/:id",
  authMiddleware(["admin", "dispatcher"]),
  asyncHandler(async (req: AuthRequest, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { customerName, deliveryAddress, status, assignedDriver, assignedVehicle } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid shipment ID format." });
    }

    const updateData: Partial<IShipment> = {};

    if (customerName) updateData.customerName = customerName.trim();
    if (deliveryAddress) updateData.deliveryAddress = deliveryAddress.trim();

    if (status) {
      const allowedStatus: IShipment["status"][] = ["pending", "in_transit", "delivered", "cancelled"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          error: `Invalid status. Must be one of: ${allowedStatus.join(", ")}`,
        });
      }
      updateData.status = status;
    }

    if (assignedDriver) {
      const driverExists = await User.findOne({ _id: assignedDriver, role: "driver" });
      if (!driverExists) {
        return res.status(404).json({
          error: "Assigned driver not found or is not a valid driver.",
        });
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

    const updatedShipment = await Shipment.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    )
      .populate("assignedDriver", "name email role")
      .populate("assignedVehicle", "plate vehicleModel");

    if (!updatedShipment) {
      return res.status(404).json({ error: "Shipment not found." });
    }

    return res.status(200).json(updatedShipment);
  })
);

router.delete(
  "/:id",
  authMiddleware(["admin"]),
  asyncHandler(async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid shipment ID format." });
    }

    const deletedShipment = await Shipment.findByIdAndDelete(id);
    if (!deletedShipment) {
      return res.status(404).json({ error: "Shipment not found." });
    }

    return res.status(200).json({ message: "Shipment deleted successfully." });
  })
);

export default router;
