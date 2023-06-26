import express from 'express';

const router = express.Router();

router.post('/login', (_req, res) => {
    res.send('User sign in.');
});

router.post('/register/step1', (_req, res) => {
    res.send('First step of user registration.');
});

router.post('/register/step2', (_req, res) => {
    res.send('Second step of user registration.');
});

router.post('/logout', (_req, res) => {
    res.send('Logout user from the platform');
});

export default router;