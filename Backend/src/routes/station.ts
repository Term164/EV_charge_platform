import express from 'express';
import asyncHandler from 'express-async-handler';
import stationService from '../services/chargingStationService';
import chargingTypeService from '../services/chargingTypeService';
import chargingConnectorService from '../services/chargingConnectorService';

const router = express.Router();

router.post('/post/new', asyncHandler(async (req, res) => {
    const response = await stationService.createStation(req.body);
    res.status(response.status)
        .send(response);
}));

router.patch('/patch/edit', asyncHandler(async (req, res) => {
    const response = await stationService.editStation(req.body);
    res.status(response.status)
        .send(response);
}));

router.get('/get/all', asyncHandler(async (req, res) => {
    const response = await stationService.getAllStations(req.query);
    res.status(response.status)
        .send(response);
}));

router.get('/get/allAvailable', asyncHandler(async (req, res) => {
    const response = await stationService.getAllAvailableStations(req.query);
    res.status(response.status)
        .send(response);
}));

router.get('/get/availabilityPercentage', asyncHandler(async (req, res) => {
    const response = await stationService.getAvailabilityPercentage(req.query);
    res.status(response.status)
        .send(response);
}));

router.post('/post/assignCompany', asyncHandler(async (req, res) => {
    const response = await stationService.assignCompany(req.body);
    res.status(response.status)
        .send(response);
}));

router.delete('/delete/station', asyncHandler(async (req, res) => {
    const response = await stationService.deleteStation(req.query);
    res.status(response.status)
        .send(response);
}));

// ==================== SUB GROUP "CHARGING CONNECTORS" ====================

router.post('/connector/post/new', asyncHandler(async (req, res) => {
    const response = await chargingConnectorService.addChargingConnector(req.body);
    res.status(response.status)
        .send(response);
}));

router.delete('/connector/delete/connector', asyncHandler(async (req, res) => {
    const response = await chargingConnectorService.deleteChargingConnector(req.query);
    res.status(response.status)
        .send(response);
}));

router.patch('/connector/patch/edit', asyncHandler(async (req, res) => {
    const response = await chargingConnectorService.editChargingConnector(req.body);
    res.status(response.status)
        .send(response);
}));

// ==================== SUB GROUP "CHARGING TYPE" ====================

router.post('/type/post/new', asyncHandler(async (req, res) => {
    const response = await chargingTypeService.createChargingType(req.body);
    res.status(response.status)
        .send(response);
}));

router.get('/type/get/all', asyncHandler(async (_req, res) => {
    const response = await chargingTypeService.getAllChargingTypes();
    res.status(response.status)
        .send(response);
}));

router.delete('/type/delete/type', asyncHandler(async (req, res) => {
    const response = await chargingTypeService.deleteChargingType(req.query);
    res.status(response.status)
        .send(response);
}));

router.patch('/type/patch/edit', asyncHandler(async (req, res) => {
    const response = await chargingTypeService.editChargingType(req.body);
    res.status(response.status)
        .send(response);
}));

export default router;