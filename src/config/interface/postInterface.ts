import { Document } from 'mongoose';

import { ILike } from '.';

export interface IPost extends Document {
    owner: string;
    title: string;
    description: string;
    image: string;
    likes: ILike[];
    _doc: object;
}
