import express from 'express';
import controller from './profileController';

const router = express.Router();

router.get('/profile', controller.get);
router.post('/profile/search', controller.search);

router.put('/profile/currency', controller.setCurrency);
router.put('/profile', controller.put);

export default router;
