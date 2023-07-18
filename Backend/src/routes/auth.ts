import express from 'express';
import register from '../services/register';
import asyncHanlder from 'express-async-handler';

function getHTTPResponseCode(serverResponse: string): number {
    if (serverResponse === "Failed") return 400;
    else if (serverResponse === "Success") return 200;
    else throw new Error('No server reponse strings match the expected output.');
}

const router = express.Router();

router.post('/login', (_req, res) => {
    res.send('User sign in.');
});

router.post('/register/step1', asyncHanlder(async (req, res) => {
    const responseBody = await register.firstStep(req.body);
    res.status(getHTTPResponseCode(Object.keys(responseBody).at(0) as string))
        .send(responseBody);
}));

router.get('/register/step2/:id/:token', asyncHanlder(async (req, res) => {
    const responseBody = await register.secondStep(req.params);
    res.status(getHTTPResponseCode(Object.keys(responseBody).at(0) as string))
        .send(responseBody);
}));

router.post('/logout', (_req, res) => {
    res.send('Logout user from the platform');
});

export default router;