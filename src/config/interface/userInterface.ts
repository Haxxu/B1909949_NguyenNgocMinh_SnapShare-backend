import { Request } from 'express';
import { Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    account: string;
    password: string;
    image: string;
    description: string;
    followers: IUserAdded[];
    following: IUserAdded[];
    saved_posts: IPostAdded[];
    liked_posts: IPostAdded[];
    role?: string;
    _doc: object;
}

export interface IUserMethods {
    generateAuthToken(): string;
}

export interface IUserAdded {
    user_id: string;
    added_at?: any;
}

export interface IPostAdded {
    post_id: string;
    added_at?: any;
}

export interface INewUser {
    name: string;
    account: string;
    password: string;
    description: string;
}

export interface IDecodedActiveToken {
    id?: string;
    newUser?: INewUser;
    iat: number;
    exp: number;
}

export interface IDecodedAuthToken {
    _id?: string;
    name?: string;
    account?: string;
    role?: string;
    iat: number;
    exp: number;
}

export interface IReqAuth extends Request {
    user?: IUser;
}
