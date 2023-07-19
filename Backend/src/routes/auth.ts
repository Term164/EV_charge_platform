import express from 'express';
import register from '../services/register';
import asyncHanlder from 'express-async-handler';
import authService from '../services/authService';

const router = express.Router();

router.post('/login', asyncHanlder( async (req, res) => {
    const response = await authService.login(req.body);
    res.status(response.status)
        .send(response.data);
}));

router.post('/register/step1', asyncHanlder(async (req, res) => {
    const response = await register.firstStep(req.body);
    res.status(response.status)
        .send(response.data);
}));

router.get('/register/step2/:id/:token', asyncHanlder(async (req, res) => {
    const response = await register.secondStep(req.params);
    res.status(response.status)
        .send(response.data);
}));

router.post('/logout', (_req, res) => {
    res.send('Logout user from the platform');
});

export default router;