import express from 'express';
import asyncHandler from 'express-async-handler';
import assignAdminService from '../services/assignAdminService';
import assignEmployeeService from '../services/assignEmployeeService';
import userService from '../services/userService';
import { UploadedFile } from 'express-fileupload';

const router = express.Router();

router.post('/post/assignBadmin', asyncHandler( async (req, res) => {
    const response = await assignAdminService.assignBadmin(req.body);
    res.status(response.status)
        .send(response);
}));

router.post('/post/assignCadmin', asyncHandler( async (req, res) => {
    const response = await assignAdminService.assignCadmin(req.body);
    res.status(response.status)
        .send(response);
}));

router.post('/post/assignCompany', asyncHandler( async (req, res) => {
    const response = await assignEmployeeService.assignToCompany(req.body);
    res.status(response.status)
        .send(response);
}));

router.post('/post/assignBuilding', asyncHandler( async (req, res) => {
    const response = await assignEmployeeService.assignToBuilding(req.body);
    res.status(response.status)
        .send(response);
}));

router.get('/get/buildingAdmins', asyncHandler( async (_req, res) => {
    const response = await userService.getBuildingAdmins();
    res.status(response.status)
        .send(response);
}));

router.get('/get/companyAdmins', asyncHandler( async (_req, res) => {
    const response = await userService.getCompanyAdmins();
    res.status(response.status)
        .send(response);
}));

router.get('/get/assignedBadmins', asyncHandler( async (req, res) => {
    const response = await userService.getAssignedBuildingAdmins(req.body);
    res.status(response.status)
        .send(response);
}));

router.get('/get/assignedCadmins', asyncHandler( async (req, res) => {
    const response = await userService.getAssignedCompanyAdmins(req.body);
    res.status(response.status)
        .send(response);
}));

router.delete('/delete/account', asyncHandler( async (req, res) => {
    const response = await userService.deleteAccount(req.body);
    res.status(response.status)
        .send(response);
}));

router.delete('/delete/building_access', asyncHandler(async (req, res) => {
    const response = await userService.deleteBuildingAccess(req.body);
    res.status(response.status)
        .send(response);
}));

router.delete('/delete/badmin', asyncHandler( async (req, res) => {
    const response = await userService.deleteBuildingAdmin(req.body);
    res.status(response.status)
        .send(response);
}));

router.delete('/delete/cadmin', asyncHandler( async (req, res) => {
    const response = await userService.deleteCompanyAdmin(req.body);
    res.status(response.status)
        .send(response);
}));


router.patch('/patch/editProfile', asyncHandler( async (req, res) => {
    if (req.files != null) {
        const image = req.files?.file as UploadedFile;
        req.body.profile_picture = image.data;
    }
    const response = await userService.editUserProfile(req.body);
    res.status(response.status)
        .send(response);
}));

router.get('/get/profile', asyncHandler( async (req, res) => {
    const response = await userService.getUserProfile(req.headers);
    res.status(response.status)
        .send(response);
}));

router.get('/get/users', asyncHandler( async (_req, res) => {
    const response = await userService.getAllUsers();
    res.status(response.status)
        .send(response);
}));

router.get('/get/role', asyncHandler( async (req, res) => {
    const response = await userService.getRolesOfUser(req.query);
    res.status(response.status)
        .send(response);
}));

router.get('/get/companyUsers', asyncHandler( async (req, res) => {
    const response = await userService.getCompanyUsers(req.query);
    res.status(response.status)
        .send(response);
}));

router.get('/get/assignedBuildingAccesses', asyncHandler( async (req, res) => {
    const response = await userService.getAssignedBuildingAccesses(req.query);
    res.status(response.status)
        .send(response);
}));

export default router;