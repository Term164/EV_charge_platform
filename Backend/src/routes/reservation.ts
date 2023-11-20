import express from 'express';
import asyncHandler from 'express-async-handler';
import reservationService from '../services/reservationService';

const router = express.Router();

router.get('/get/all', (_req, res) => {
    res.send('Get all reservations for a specific user');
});

router.patch('/patch/edit', (_req, res) => {
    res.send('Editing a reservation');
});

router.delete('/delete/cancel', asyncHandler(async (req, res) => {
    const response = await reservationService.cancelReservation(req.body);
    res.status(response.status)
        .send(response);
}));

router.post('/post/new', (_req, res) => {
    res.send('Create a new reservation');
});

router.get('/get/stationType', (_req, res) => {
    res.send('Get station type.');
});

export default router;