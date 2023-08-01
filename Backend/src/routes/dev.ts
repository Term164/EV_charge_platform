import express from 'express';

const router = express.Router();

router.get('/ping', (_req, res) => {
    res.send({"success":"pong"});
});

export default router;