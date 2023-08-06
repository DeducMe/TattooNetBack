import { NextFunction, Request, Response } from 'express';
import { decodeToken, errorHandler, sendBackHandler } from '../../functions/apiHandlers';
import Images, { IImages } from './imagesModal';

import path from 'path';
import fs from 'fs';

export async function createImage({ file, name, description }: { file: { buffer: Buffer; mimetype: string }; name?: string; description?: string }) {
    const body = {
        imageObject: {
            data: file.buffer,
            contentType: file.mimetype
        },
        name,
        description
    };

    console.log(body);

    if (!body.imageObject.data) throw new Error(body.imageObject.data);

    const data = await new Images(body).save();

    if (!data?.imageObject || !data._id) throw new Error(JSON.stringify(data));

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

const find = async (req: Request | any, res: Response, next: NextFunction) => {
    try {
        let { _id } = req.body;
        console.log(req.body, req.file);

        const decoded = await decodeToken(req?.headers?.authorization || '');
        if (!decoded) return errorHandler(res, { message: 'decode of auth header went wrong' }, 500);

        const id = await Images.findById(_id);

        sendBackHandler(res, 'images', id);
    } catch (e) {
        errorHandler(res, e);
    }
};
export default { create, find };
