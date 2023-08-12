import express from 'express';
import asyncHanlder from 'express-async-handler';
import assignAdminService from '../services/assignAdminService';

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

router.post('/post/assignCompany', (_req, res) => {
    res.send('Assign employee to company');
});

router.post('/post/assignBuilding', (_req, res) => {
    res.send('Assign employee to building');
});

router.get('/get/buildingAdmins', (_req, res) => {
    res.send('Get all building admins');
});

router.get('/get/companyAdmins', (_req, res) => {
    res.send('Get all company admins');
});

router.get('/get/assignedBadmins', (_req, res) => {
    res.send('Get all building admins for a specific building');
});

router.get('/get/assignedCadmins', (_req, res) => {
    res.send('Get all company admins for a specific company');
});

router.post('/delete/employee', (_req, res) => {
    res.send('Delete company employee');
});

router.post('/delete/badmin', (_req, res) => {
    res.send('Delete building admin account');
});

router.post('/delete/cadmin', (_req, res) => {
    res.send('Delete company admin account');
});

router.post('/patch/editProfile', (_req, res) => {
    res.send('Edit user profile');
});

export default router;