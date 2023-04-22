import mongoose from 'mongoose';
import Joi from 'joi';

import { IComment } from '../config/interface';

const commentSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post',
            required: true,
        },
        content: {
            type: String,
            default: '',
        },
        likes: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true,
                },
                added_at: {
                    type: Date,
                    default: Date.now(),
                },
            },
        ],
    },
    { timestamps: true }
);

const validateComment = (comment: any) => {
    const schema = Joi.object({
        post: Joi.string().required(),
        content: Joi.string().min(1).required(),
    });

    return schema.validate(comment);
};

export { validateComment };

export default mongoose.model<IComment>('Comment', commentSchema);
