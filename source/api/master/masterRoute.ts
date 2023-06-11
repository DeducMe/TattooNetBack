import express from 'express';
import controller from './masterController';

const router = express.Router();

router.post('/master', controller.create);
router.post('/master/list', controller.getAll);
router.delete('/master/delete', controller.deleteRow);

export default router;
