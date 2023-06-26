import express from 'express';

const router = express.Router();

router.post('/post/new', (_req, res) => {
    res.send('Adding a new charging station and the building it resides in');
});

router.post('/patch/edit', (_req, res) => {
    res.send('Editing a charging station details');
});

router.get('/get/all', (_req, res) => {
    res.send('Get all charging stations');
});

router.get('/get/allAvailalbe', (_req, res) => {
    res.send('Get all charging stations that are available for a certain user');
});

router.post('/post/assignCompany', (_req, res) => {
    res.send('Assign a station to a company');
});

router.post('/delete/station', (_req, res) => {
    res.send('Delete station from the database');
});


export default router;