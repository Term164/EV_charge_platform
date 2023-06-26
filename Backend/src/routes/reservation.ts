import express from 'express';

const router = express.Router();

router.get('/get/all', (_req, res) => {
    res.send('Get all reservations for a specific user');
});

router.post('/patch/edit', (_req, res) => {
    res.send('Editing a reservation');
});

router.post('/delete/cancel', (_req, res) => {
    res.send('Cancel a reservation');
});

router.post('/post/new', (_req, res) => {
    res.send('Create a new reservation');
});

router.get('/get/stationType', (_req, res) => {
    res.send('Get station type.');
});


export default router;