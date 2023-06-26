import express from 'express';

const router = express.Router();

router.post('/post/new', (_req, res) => {
    res.send('Create new company');
});

router.get('/get/all', (_req, res) => {
    res.send('Get all companies');
});

router.post('/patch/edit', (_req, res) => {
    res.send('Edit company details');
});

router.post('/delete/company', (_req, res) => {
    res.send('Delete company from database');
});

export default router;