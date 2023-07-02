import express from 'express';
import register from '../services/register';
import asyncHanlder from 'express-async-handler';

const router = express.Router();

router.post('/login', (_req, res) => {
    res.send('User sign in.');
});

router.post('/register/step1', asyncHanlder(async (req, res) => {
    const responseBody = await register.firstStep(req.body);
    res.send(responseBody);
}));

router.post('/register/step2', (_req, res) => {
    res.send('Second step of user registration.');
});

router.post('/logout', (_req, res) => {
    res.send('Logout user from the platform');
});

export default router;