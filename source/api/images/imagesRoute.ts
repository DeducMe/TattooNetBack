import express from 'express';
import controller from './imagesController';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const multer = require('multer');

export const storage = multer.diskStorage({
    destination: function (_req: any, file: any, cb: (arg0: null, arg1: any) => any) {
        console.log('file : ', file);
        return cb(null, 'uploads');
    },
    filename: function (_req: any, file: { originalname: string }, cb: (arg0: null, arg1: string) => any) {
        console.log('file from filename function : ', file);
        console.log('filename : ', file.originalname);
        return cb(null, file.originalname);
    }
});

export const fileFilter = (req: any, file: { mimetype: string }, cb: (arg0: null, arg1: boolean) => void) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

export const multerUpload = multer();

router.route('/images').post(multerUpload.single('image'), controller.create);
router.post('/images/find', controller.find);

export default router;
