import express from 'express';
import asyncHandler from 'express-async-handler';
import companyService from '../services/companyService';

const router = express.Router();

router.post('/post/new', asyncHandler(async (req, res) => {
    const response = await companyService.createCompany(req.body);
    res.status(response.status)
        .send(response);
}));

router.get('/get/all', asyncHandler(async (_req, res) => {
    const response = await companyService.getAllCompanies();
    res.status(response.status)
        .send(response);
}));

router.get('/get/companyOfAdmin', asyncHandler(async (req, res) => {
    const response = await companyService.getCompanyOfAdmin(req.query);
    res.status(response.status)
        .send(response);
}));

router.delete('/delete/company', asyncHandler(async (req, res) => {
    const response = await companyService.deleteCompany(req.query);
    res.status(response.status)
        .send(response);
}));

router.patch('/patch/edit', asyncHandler(async (req, res) => {
    const response = await companyService.editCompany(req.body);
    res.status(response.status)
        .send(response);
}));

export default router;
