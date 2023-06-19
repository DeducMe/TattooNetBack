import express from 'express';
import controller from './countryController';

const router = express.Router();

router.get('/country', controller.getAll);
router.get('/country/init', controller.init);

export default router;
