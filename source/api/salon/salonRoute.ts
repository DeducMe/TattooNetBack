import express from 'express';
import controller from './salonController';

const router = express.Router();

router.post('/salon', controller.create);
router.post('/salon/list', controller.getAll);
router.delete('/salon/delete', controller.deleteRow);

export default router;
