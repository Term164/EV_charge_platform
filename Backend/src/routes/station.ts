import express from 'express';
import asyncHanlder from 'express-async-handler';
import stationService from '../services/chargingStationService';
import chargingTypeService from '../services/chargingTypeService';
import chargingConnectorService from '../services/chargingConnectorService';

const router = express.Router();

router.post('/post/new', asyncHanlder(async (req, res) => {
    const response = await stationService.createStation(req.body);
    res.status(response.status)
        .send(response);
}));

router.patch('/patch/edit', asyncHanlder(async (req, res) => {
    const response = await stationService.editStation(req.body);
    res.status(response.status)
        .send(response);
}));

router.get('/get/all', asyncHanlder(async (req, res) => {
    const response = await stationService.getAllStations(req.body);
    res.status(response.status)
        .send(response);
}));

router.get('/get/allAvailable', asyncHanlder(async (req, res) => {
    const response = await stationService.getAllAvailableStations(req.body);
    res.status(response.status)
        .send(response);
}));

router.post('/post/assignCompany', asyncHanlder(async (req, res) => {
    const response = await stationService.assignCompany(req.body);
    res.status(response.status)
        .send(response);
}));

router.delete('/delete/station', asyncHanlder(async (req, res) => {
    const response = await stationService.deleteStation(req.body);
    res.status(response.status)
        .send(response);
}));

// ==================== SUB GROUP "CHARGING CONNECTORS" ====================

router.post('/connector/post/new', asyncHanlder(async (req, res) => {
    const response = await chargingConnectorService.addChargingConnector(req.body);
    res.status(response.status)
        .send(response);
}));

router.delete('/connector/delete/connector', asyncHanlder(async (req, res) => {
    const response = await chargingConnectorService.deleteChargingConnector(req.body);
    res.status(response.status)
        .send(response);
}));

router.patch('/connector/patch/edit', asyncHanlder(async (req, res) => {
    const response = await chargingConnectorService.editChargingConnector(req.body);
    res.status(response.status)
        .send(response);
}));

// ==================== SUB GROUP "CHARGING TYPE" ====================

router.post('/type/post/new', asyncHanlder(async (req, res) => {
    const response = await chargingTypeService.createChargingType(req.body);
    res.status(response.status)
        .send(response);
}));

router.get('/type/get/all', asyncHanlder(async (_req, res) => {
    const response = await chargingTypeService.getAllChargingTypes();
    res.status(response.status)
        .send(response);
}));

router.delete('/type/delete/type', asyncHanlder(async (req, res) => {
    const response = await chargingTypeService.deleteChargingType(req.body);
    res.status(response.status)
        .send(response);
}));

router.patch('/type/patch/edit', asyncHanlder(async (req, res) => {
    const response = await chargingTypeService.editChargingType(req.body);
    res.status(response.status)
        .send(response);
}));

export default router;