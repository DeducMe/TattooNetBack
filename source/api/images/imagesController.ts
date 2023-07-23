import { NextFunction, Request, Response } from 'express';
import { decodeToken, errorHandler, sendBackHandler } from '../../functions/apiHandlers';
import Images, { IImages } from './imagesModal';

import path from 'path';
import fs from 'fs';

export async function createImage({ file, name, description }: { file: { originalname: string; mimetype: string }; name?: string; description?: string }) {
    const body = {
        imageObject: {
            data: fs.readFileSync(path.join(__dirname.replace('/api/images', '') + '/uploads/' + file.originalname)),
            contentType: file.mimetype
        },
        name,
        description
    };

    const data = await new Images(body).save();

    return data._id;
}
const create = async (req: Request | any, res: Response, next: NextFunction) => {
    try {
        let file = req.file;
        let { name, description, image } = req.body;
        console.log(req.body, req.file);

        const decoded = await decodeToken(req?.headers?.authorization || '');
        if (!decoded) return errorHandler(res, { message: 'decode of auth header went wrong' }, 500);

        const id = await createImage({ file, name, description });

        sendBackHandler(res, 'images', id);
    } catch (e) {
        errorHandler(res, e);
    }
};

export default { create };
