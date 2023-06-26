import express from 'express';
import controller from './favoritesController';

const router = express.Router();

router.post('/favorites', controller.create);
router.get('/favorites', controller.getAll);
router.delete('/favorites', controller.remove);

export default router;
