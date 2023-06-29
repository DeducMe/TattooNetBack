import express from 'express';
import controller from './feedController';

const router = express.Router();

router.get('/feed', controller.get);

export default router;
