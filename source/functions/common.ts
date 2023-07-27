// this was written before i knew about zod library
// https://github.com/colinhacks/zod

import { createImage } from '../api/images/imagesController';

export function checkTypes<T extends { [key: string]: any }>(obj: Record<keyof T, unknown>, types: T): boolean {
    return Object.keys(types).every((key) => {
        const type = types[key];

        if (typeof type === 'string') {
            if (typeof obj[key] === type) {
                return true;
            }
        } else {
            const keys = Object.keys(type) as Array<keyof typeof type>;
            const partialObj: Partial<Record<keyof typeof type, unknown>> = {};

            keys.forEach((prop) => {
                // @ts-ignore
                partialObj[prop] = obj[key][prop];
            });

            if (checkTypes(partialObj as T[keyof T], type)) {
                return true;
            }
        }

        return false;
    });
}

export async function getImagesFromReqFiles(
    files:
        | Express.Multer.File[]
        | {
              [fieldname: string]: Express.Multer.File[];
          }
) {
    let images: { originalname: string; mimetype: string }[] = [];
    // sendBackHandler(res, 'tattoos', true);
    if (files)
        await Promise.all(
            (files as Array<Express.Multer.File>).map(async (item: { originalname: string; mimetype: string }) => {
                images = images.concat(images, [await createImage({ file: item })]);

                return images;
            })
        );

    return images;
}
