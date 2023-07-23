import express from 'express';
import controller from './profileController';
import { fileFilter, storage } from '../../images/imagesRoute';

const router = express.Router();

router.get('/profile', controller.get);
router.post('/profile/search', controller.search);

router.put('/profile/currency', controller.setCurrency);
const multer = require('multer');

const multerUpload = multer({ storage: storage, fileFilter: fileFilter });

router.route('/profile').post(multerUpload.single('image'), controller.put);

export default router;
