import express from 'express';
import asyncHanlder from 'express-async-handler';
import companyService from '../services/companyService';

const router = express.Router();

router.post('/post/new', asyncHanlder(async (req, res) => {
    const response = await companyService.createCompany(req.body);
    res.status(response.status)
        .send(response.data);
}));

router.get('/get/all', asyncHanlder(async (_req, res) => {
    const response = await companyService.getAllCompanies();
    res.status(response.status)
        .send(response.data);
}));

router.delete('/delete/company', asyncHanlder(async (req, res) => {
    const response = await companyService.deleteCompany(req.body);
    res.status(response.status)
        .send(response.data);
}));

router.patch('/patch/edit', asyncHanlder(async (req, res) => {
    const response = await companyService.editCompany(req.body);
    res.status(response.status)
        .send(response.data);
}));

export default router;