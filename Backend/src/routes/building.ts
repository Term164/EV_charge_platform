import express from 'express';
import asyncHandler from 'express-async-handler';
import buildingService from '../services/buildingService';

const router = express.Router();

router.get('/get/all', asyncHandler(async (_req, res) => {
    const response = await buildingService.getAllBuildings();
    res.status(response.status)
        .send(response);
}));

router.get('/get/companyOwned', asyncHandler(async (req, res) => {
    const response = await buildingService.getAllBuildingsOwnedByCompany(req.body);
    res.status(response.status)
        .send(response);
}));

router.post('/post/new', asyncHandler(async (req, res) => {
    const response = await buildingService.createBuilding(req.body);
    res.status(response.status)
        .send(response);
}));

router.patch('/patch/edit', asyncHandler(async (req, res) => {
    const response = await buildingService.editBuilding(req.body);
    res.status(response.status)
        .send(response);
}));

router.delete('/delete/building', asyncHandler(async (req, res) => {
    const response = await buildingService.deleteBuilding(req.body);
    res.status(response.status)
        .send(response);
}));

router.post('/post/assignCompany', asyncHandler(async (req, res) => {
    const response = await buildingService.assignCompany(req.body);
    res.status(response.status)
        .send(response);
}));

router.get('/get/assignedCompanies', asyncHandler(async (req, res) => {
    const response = await buildingService.getAllCompaniesAssignedToBuilding(req.body);
    res.status(response.status)
        .send(response);
}));


export default router;