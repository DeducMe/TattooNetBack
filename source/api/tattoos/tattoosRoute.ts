import express from 'express';
import controller from './tattoosController';

const router = express.Router();

router.post('/tattoos', controller.create);
router.post('/tattoos/list', controller.getAll);
router.delete('/tattoos/delete', controller.deleteRow);
router.get('/tattoos/filters', controller.getFilterVariants);

export default router;
