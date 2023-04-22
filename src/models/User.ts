import mongoose from 'mongoose';
import Joi from 'joi';
import passwordComplexity from 'joi-password-complexity';
import jwt from 'jsonwebtoken';

import { IUser, IUserMethods } from '../config/interface';

type UserModel = mongoose.Model<IUser, {}, IUserMethods>;

const userSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        account: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: '',
        },
        image: {
            type: String,
            default:
                'https://res.cloudinary.com/devatchannel/image/upload/v1602752402/avatar/avatar_cugq40.png',
        },
        followers: [
            {
                user_id: { type: String, required: true },
                added_at: { type: Date, default: Date.now() },
                _id: false,
            },
        ],
        following: [
            {
                user_id: { type: String, required: true },
                added_at: { type: Date, default: Date.now() },
                _id: false,
            },
        ],
        saved_posts: [
            {
                post_id: { type: String, required: true },
                added_at: { type: Date, default: Date.now() },
                _id: false,
            },
        ],
        liked_posts: [
            {
                post_id: { type: String, required: true },
                added_at: { type: Date, default: Date.now() },
            },
        ],
        role: { type: String, default: 'user' },
    },
    { timestamps: true }
);

userSchema.methods.generateAuthToken = function (): string {
    const token = jwt.sign(
        {
            _id: this._id,
            name: this.name,
            account: this.account,
            role: this.role,
        },
        process.env.JWT_PRIVATE_KEY as string,
        {
            expiresIn: '7d',
        }
    );

    return token;
};

const validateUser = (user: any) => {
    const schema = Joi.object({
        name: Joi.string().min(1).required(),
        account: Joi.string().min(3).required(),
        password: passwordComplexity().required(),
        description: Joi.string().allow(''),
    });

    return schema.validate(user);
};

export { validateUser };

export default mongoose.model<IUser, UserModel>('User', userSchema);
