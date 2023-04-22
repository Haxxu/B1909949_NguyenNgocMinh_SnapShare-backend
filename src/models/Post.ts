import mongoose from 'mongoose';
import Joi from 'joi';

import { IPost } from '../config/interface';

const postSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        description: {
            type: String,
            default: '',
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        image: {
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

const validatePost = (post: any) => {
    const schema = Joi.object({
        title: Joi.string().min(1).required(),
        description: Joi.string().allow(''),
        image: Joi.string().allow(''),
    });

    return schema.validate(post);
};

export { validatePost };

export default mongoose.model<IPost>('Post', postSchema);
