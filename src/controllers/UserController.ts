import { Response, Request, NextFunction } from 'express';

import { IReqAuth } from '../config/interface';
import ApiError from '../utils/ApiError';
import UserService from '../services/UserService';

class UserController {
    async getUserById(req: IReqAuth, res: Response, next: NextFunction) {
        try {
            const user = await UserService.getUserByIdPublic(req.params.id);
            if (!user) {
                return next(new ApiError(404, 'User not found.'));
            }

            let totalPosts = await UserService.countTotalPostsByUserId(
                req.params.id
            );

            return res.status(200).json({
                data: { user, totalPosts },
                message: 'Get user successfully',
            });
        } catch (error) {
            console.log(error);
            return next(new ApiError());
        }
    }

    async updateUserById(req: IReqAuth, res: Response, next: NextFunction) {
        try {
            if (req.user?._id !== req.params.id) {
                return res.status(403).json({
                    message: "User don't have permisson to perform this action",
                });
            }

            const { name, image, description } = req.body;

            const userService = new UserService(req.params.id);

            const updated_user = await userService.update({
                name,
                image,
                description,
            });

            return res.status(200).json({
                data: updated_user,
                message: 'Update user successfully',
            });
        } catch (error) {
            console.log(error);
            return next(new ApiError());
        }
    }

    async getFollowingUsersPosts(
        req: IReqAuth,
        res: Response,
        next: NextFunction
    ) {
        try {
            const userService = new UserService(req.user?._id);
            const posts = await userService.getFollowingUsersPosts(
                req.query.limit as string
            );
            return res.status(200).json({
                data: posts,
                message: 'Get following users posts successfully',
            });
        } catch (error) {
            console.log(error);
            return next(new ApiError());
        }
    }

    async getUserFollowing(req: IReqAuth, res: Response, next: NextFunction) {
        try {
            const userService = new UserService(req.params.id);
            const following = await userService.getFollowing();

            return res.status(200).json({
                data: following,
                message: 'Get user following successfully',
            });
        } catch (error) {
            console.log(error);
            return next(new ApiError());
        }
    }

    async getUserFollowers(req: IReqAuth, res: Response, next: NextFunction) {
        try {
            const userService = new UserService(req.params.id);
            const followers = await userService.getFollowers();

            return res.status(200).json({
                data: followers,
                message: 'Get user followers successfully',
            });
        } catch (error) {
            console.log(error);
            return next(new ApiError());
        }
    }

    async getPostsByUserId(req: IReqAuth, res: Response, next: NextFunction) {
        try {
            const user = await UserService.findOne({ _id: req.params.id });
            if (!user) {
                return res.status(404).json({ message: 'User not found.' });
            }
            const userService = new UserService(req.params.id);
            const posts = await userService.getPosts();

            return res
                .status(200)
                .json({ data: posts, message: 'Get posts successfully.' });
        } catch (error) {
            console.log(error);
            return next(new ApiError());
        }
    }
}

export default new UserController();
