import express from 'express';
import asyncHanlder from 'express-async-handler';
import assignAdminService from '../services/assignAdminService';
import assignEmployeeService from '../services/assignEmployeeService';
import userService from '../services/userService';

const router = express.Router();

router.post('/post/assignBadmin', asyncHanlder( async (req, res) => {
    const response = await assignAdminService.assignBadmin(req.body);
    res.status(response.status)
        .send(response.data);
}));

router.post('/post/assignCadmin', asyncHanlder( async (req, res) => {
    const response = await assignAdminService.assignCadmin(req.body);
    res.status(response.status)
        .send(response.data);
}));

router.post('/post/assignCompany', asyncHanlder( async (req, res) => {
    const response = await assignEmployeeService.assignToCompany(req.body);
    res.status(response.status)
        .send(response.data);
}));

router.post('/post/assignBuilding', asyncHanlder( async (req, res) => {
    const response = await assignEmployeeService.assignToBuilding(req.body);
    res.status(response.status)
        .send(response.data);
}));

router.get('/get/buildingAdmins', asyncHanlder( async (_req, res) => {
    const response = await userService.getBuildingAdmins();
    res.status(response.status)
        .send(response.data);
}));

router.get('/get/companyAdmins', asyncHanlder( async (_req, res) => {
    const response = await userService.getCompanyAdmins();
    res.status(response.status)
        .send(response.data);
}));

router.get('/get/assignedBadmins', asyncHanlder( async (req, res) => {
    const response = await userService.getAssignedBuildingAdmins(req.body);
    res.status(response.status)
        .send(response.data);
}));

router.get('/get/assignedCadmins', asyncHanlder( async (req, res) => {
    const response = await userService.getAssignedCompanyAdmins(req.body);
    res.status(response.status)
        .send(response.data);
}));

router.delete('/delete/account', asyncHanlder( async (req, res) => {
    const response = await userService.deleteAccount(req.body);
    res.status(response.status)
        .send(response.data);
}));

router.delete('/delete/building_access', asyncHanlder(async (req, res) => {
    const response = await userService.deleteBuildingAccess(req.body);
    res.status(response.status)
        .send(response.data);
}));

router.delete('/delete/badmin', asyncHanlder( async (req, res) => {
    const response = await userService.deleteBuildingAdmin(req.body);
    res.status(response.status)
        .send(response.data);
}));

router.delete('/delete/cadmin', asyncHanlder( async (req, res) => {
    const response = await userService.deleteCompanyAdmin(req.body);
    res.status(response.status)
        .send(response.data);
}));

router.patch('/patch/editProfile', asyncHanlder( async (req, res) => {
    const response = await userService.editUserProfile(req.body);
    res.status(response.status)
        .send(response.data);
}));

export default router;