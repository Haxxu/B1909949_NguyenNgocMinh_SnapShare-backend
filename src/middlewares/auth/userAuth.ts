import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { IUser, IReqAuth, IDecodedAuthToken } from '../../config/interface';
import ApiError from '../../utils/ApiError';
import User from '../../models/User';

const userAuth = async (req: IReqAuth, res: Response, next: NextFunction) => {
    try {
        const token = req.header('x-auth-token');
        if (!token) {
            return res
                .status(401)
                .json({ message: 'Access denied, no token provided.' });
        }

        const decoded = <IDecodedAuthToken>(
            jwt.verify(token, `${process.env.JWT_PRIVATE_KEY}`)
        );
        if (!decoded) {
            return res.status(400).json({ message: 'Invalid Authentication.' });
        }

        const user: IUser | null = await User.findOne({
            _id: decoded._id,
        })
            .select('-password')
            .lean();

        if (!user) {
            return res.status(400).json({ message: 'User does not exist.' });
        }

        req.user = user;
        req.user._id = user._id.toString();
        next();
    } catch (error) {
        console.log(error);
        return next(new ApiError());
    }
};

export default userAuth;
