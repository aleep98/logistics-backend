import { Router } from 'express';
import mongoose from 'mongoose';
import Shipment from '../models/shipment.js';
import Vehicle, { IVehicle } from '../models/vehicle.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

const router = Router();

router.post('/', asyncHandler(async (req, res) => {
    const { plate, vehicleModel, capacity, year } = req.body;

    const missingFields = [];
    if (!plate || typeof plate !== 'string' || plate.trim() === '') missingFields.push('plate');
    if (!vehicleModel || typeof vehicleModel !== 'string' || vehicleModel.trim() === '') missingFields.push('vehicleModel');
    if (year == null) missingFields.push('year');
    if (capacity == null) missingFields.push('capacity');

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `The following fields are required: ${missingFields.join(', ')}.` 
      });
    }

    const existingVehicle = await Vehicle.findOne({ plate });
    if (existingVehicle) {
      return res.status(409).json({ error: 'Vehicle with this plate already registered.' });
    }

    const newVehicle = new Vehicle({ plate, vehicleModel, capacity, year });

    await newVehicle.save();

    res.status(201).json(newVehicle);
}));


router.get('/', asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const sort = (req.query.sort as string) || 'model'; // Campo padrão para ordenação
    const order = (req.query.order as string) || 'asc'; // Direção padrão

    // 2. Calcula o número de documentos a serem pulados (skip)
    const skip = (page - 1) * limit;

    // 3. Cria o objeto de ordenação para o Mongoose
    const sortOptions: { [key: string]: 1 | -1 } = { [sort]: order === 'desc' ? -1 : 1 };

    // 4. Executa as consultas de busca e contagem em paralelo para mais eficiência
    const [vehicles, totalVehicles] = await Promise.all([
        Vehicle.find({}).sort(sortOptions).skip(skip).limit(limit),
        Vehicle.countDocuments()
    ]);

    res.status(200).json({
        data: vehicles,
        total: totalVehicles,
    });
}));




router.put('/:id', asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { plate, vehicleModel, capacity, year } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid vehicle ID format.' });
        }

        const updateData: Partial<IVehicle> = {};
        if (plate) updateData.plate = plate;
        if (vehicleModel != null) {
            if (typeof vehicleModel !== 'string' || vehicleModel.trim() === '') {
                return res.status(400).json({ error: 'vehicleModel cannot be empty.' });
            }
            updateData.vehicleModel = vehicleModel;
        }
        if (year != null) updateData.year = year;
        if (capacity != null) updateData.capacity = capacity;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'No fields to update provided.' });
        }

        const updatedVehicle = await Vehicle.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });

        if (!updatedVehicle) {
            return res.status(404).json({ error: 'Vehicle not found.' });
        }

        res.status(200).json(updatedVehicle);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
        const { id } = req.params;

        // Log para depuração: mostra o ID recebido no console do backend
        console.log(`[DEBUG] Attempting to delete vehicle with ID: ${id}`);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid vehicle ID format.' });
        }

        const shipmentWithVehicle = await Shipment.findOne({ assignedVehicle: id });
        if (shipmentWithVehicle) {
            return res.status(400)
                .json({ error: 'Cannot delete vehicle because it is assigned to a shipment.' });
        }

        const deletedVehicle = await Vehicle.findByIdAndDelete(id);

        if (!deletedVehicle) {
            return res.status(404).json({ error: 'Vehicle not found.' });
        }

        res.status(200).json(deletedVehicle);
}));

export default router;