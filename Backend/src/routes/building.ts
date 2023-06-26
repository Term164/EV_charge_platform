import express from 'express';

const router = express.Router();

router.get('/get/all', (_req, res) => {
    res.send('Get all buildings');
});

router.get('/get/companyOwned', (_req, res) => {
    res.send('Get all buildings in witch the company operates');
});

router.post('/post/new', (_req, res) => {
    res.send('Create new building');
});

router.post('/patch/edit', (_req, res) => {
    res.send('Editing building data');
});

router.post('/delete/building', (_req, res) => {
    res.send('Remove building from database');
});

router.post('/post/assignCompany', (_req, res) => {
    res.send('Add company to the building');
});

router.get('/get/assignedCompanies', (_req, res) => {
    res.send('Companies that are registered to a specific building');
});


export default router;