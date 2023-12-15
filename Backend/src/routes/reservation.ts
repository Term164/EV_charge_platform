import express from 'express';
import asyncHandler from 'express-async-handler';
import reservationService from '../services/reservationService';

const router = express.Router();

router.get('/get/all', asyncHandler(async (req, res) => {
    const response = await reservationService.getAllReservations(req.body);
    res.status(response.status)
        .send(response);
}));

router.get('/get/reservation', asyncHandler(async (req, res) => {
    const response = await reservationService.getSpecificReservation(req.body);
    res.status(response.status)
        .send(response);
}));

router.patch('/patch/edit', asyncHandler(async (req, res) => {
    const response = await reservationService.editReservation(req.body);
    res.status(response.status)
        .send(response);
}));

router.delete('/delete/cancel', asyncHandler(async (req, res) => {
    const response = await reservationService.cancelReservation(req.body);
    res.status(response.status)
        .send(response);
}));

router.post('/post/new', asyncHandler(async (req, res) => {
    const response = await reservationService.createReservation(req.body);
    res.status(response.status)
        .send(response);
}));

router.get('/get/availableTypesForReservation', asyncHandler(async (req, res) => {
    const response = await reservationService.getAllAvailableChargingTypesAtBuildingForPerson(req.body);
    res.status(response.status)
        .send(response);
}));

export default router;
