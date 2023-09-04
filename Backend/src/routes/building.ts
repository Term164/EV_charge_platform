import express from 'express';
import asyncHanlder from 'express-async-handler';
import buildingService from '../services/buildingService';

const router = express.Router();

router.get('/get/all', asyncHanlder(async (_req, res) => {
    const response = await buildingService.getAllBuildings();
    res.status(response.status)
        .send(response.data);
}));

router.get('/get/companyOwned', asyncHanlder(async (req, res) => {
    const response = await buildingService.getAllBuildingsOwnedByCompany(req.body);
    res.status(response.status)
        .send(response.data);
}));

router.post('/post/new', asyncHanlder(async (req, res) => {
    const response = await buildingService.createBuilding(req.body);
    res.status(response.status)
        .send(response.data);
}));

router.patch('/patch/edit', asyncHanlder(async (req, res) => {
    const response = await buildingService.editBuilding(req.body);
    res.status(response.status)
        .send(response.data);
}));

router.delete('/delete/building', asyncHanlder(async (req, res) => {
    const response = await buildingService.deleteBuilding(req.body);
    res.status(response.status)
        .send(response.data);
}));

router.post('/post/assignCompany', asyncHanlder(async (req, res) => {
    const response = await buildingService.assignCompany(req.body);
    res.status(response.status)
        .send(response.data);
}));

router.get('/get/assignedCompanies', asyncHanlder(async (req, res) => {
    const response = await buildingService.getAllCompaniesAssignedToBuilding(req.body);
    res.status(response.status)
        .send(response.data);
}));


export default router;