import { Document } from 'mongoose';

import { ILike } from '.';

export interface IComment extends Document {
    owner: string;
    post: string;
    content: string;
    likes: ILike[];
    _doc: object;
}
