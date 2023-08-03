import express from 'express';
import controller from './profileController';
import { fileFilter, storage } from '../../images/imagesRoute';
import multer from 'multer';
const multerUpload = multer({ storage: storage, fileFilter: fileFilter });

const router = express.Router();

router.get('/profile', controller.get);
router.post('/profile/search', controller.search);

router.put('/profile/currency', controller.setCurrency);

router.route('/profile').post(multerUpload.single('image'), controller.updateUserProfile);

export default router;
