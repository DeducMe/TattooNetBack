import express from 'express';
import controller from './tattoosController';
import multer from 'multer';
import { fileFilter, storage } from '../images/imagesRoute';
const multerUpload = multer({ storage, fileFilter });

const router = express.Router();

router.post('/tattoos', multerUpload.any(), controller.create);
router.post('/tattoos/list', controller.getAll);
router.delete('/tattoos/delete', controller.deleteRow);
router.get('/tattoos/filters', controller.getFilterVariants);
router.post('/tattoos/master', controller.getMasterTattoos);

export default router;
