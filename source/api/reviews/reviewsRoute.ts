import express from 'express';
import controller from './reviewsController';
import multer from 'multer';
import { fileFilter, storage } from '../images/imagesRoute';
const multerUpload = multer({ storage, fileFilter });

const router = express.Router();

router.post('/reviews', multerUpload.single('image'), controller.completeReview);
router.post('/reviews/master', controller.getReviewsByMaster);

export default router;
