import express from 'express';
import controller from './reviewsController';

const router = express.Router();

router.post('/reviews', controller.completeReview);
router.post('/reviews/master', controller.getReviewsByMaster);

export default router;
