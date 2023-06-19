import express from 'express';
import controller from './cityController';

const router = express.Router();

router.get('/city', controller.getAll);
router.get('/city/init', controller.init);

export default router;
