import { NextFunction, Response } from 'express';

import { IReqAuth } from '../config/interface';
import ApiError from '../utils/ApiError';
import UserService from '../services/UserService';
import Post from '../models/Post';
import Comment from '../models/Comment';
import User from '../models/User';

class MeController {
    async checkFollowUser(req: IReqAuth, res: Response, next: NextFunction) {
        try {
            const userService = new UserService(req.user?._id);
            let liked = await userService.checkFollowUser(
                req.query.userId as string
            );

            return res
                .status(200)
                .json({ data: liked, message: 'Check follow user' });
        } catch (error) {
            console.log(error);
            return next(new ApiError());
        }
    }

    async followUser(req: IReqAuth, res: Response, next: NextFunction) {
        try {
            const follow_user = await UserService.findOne({
                _id: req.body.user,
            });
            if (!follow_user) {
                return next(new ApiError(404, 'Follow user not found'));
            }

            const userService = new UserService(req.user?._id);
            await userService.follow(follow_user._id.toString());

            const user = await User.findOne({ _id: req.body.user }).select(
                '-__v -saved_posts -liked_posts -password'
            );

            return res
                .status(200)
                .json({ data: user, message: 'Follow user successfully' });
        } catch (error) {
            console.log(error);
            return next(new ApiError());
        }
    }

    async unfollowUser(req: IReqAuth, res: Response, next: NextFunction) {
        try {
            const unfollow_user = await UserService.findOne({
                _id: req.body.user,
            });
            if (!unfollow_user) {
                return next(new ApiError(404, 'Unfollow user not found'));
            }

            const userService = new UserService(req.user?._id);
            await userService.unfollow(unfollow_user._id.toString());

            const user = await User.findOne({ _id: req.body.user }).select(
                '-__v -saved_posts -liked_posts -password'
            );

            return res
                .status(200)
                .json({ data: user, message: 'Unfollow user successfully' });
        } catch (error) {
            console.log(error);
            return next(new ApiError());
        }
    }

    async checkSavedPost(req: IReqAuth, res: Response, next: NextFunction) {
        try {
            const userService = new UserService(req.user?._id);
            let liked = await userService.checkSavedPost(
                req.query.postId as string
            );

            return res
                .status(200)
                .json({ data: liked, message: 'Check saved post' });
        } catch (error) {
            console.log(error);
            return next(new ApiError());
        }
    }

    async getSavedPosts(req: IReqAuth, res: Response, next: NextFunction) {
        try {
            const userService = new UserService(req.user?._id);
            const posts = await userService.getSavedPosts();

            return res.status(200).json({
                data: posts,
                message: 'Get saved posts successfully.',
            });
        } catch (error) {
            console.log(error);
            return next(new ApiError());
        }
    }

    async savePost(req: IReqAuth, res: Response, next: NextFunction) {
        try {
            const post = await Post.findOne({ _id: req.body.post }).populate({
                path: 'owner',
                select: '_id name account image role',
            });
            if (!post)
                return res.status(404).json({ message: 'Post not found.' });

            const userService = new UserService(req.user?._id);
            await userService.savePost(req.body.post);

            return res
                .status(200)
                .json({ data: post, message: 'Save post successfully' });
        } catch (error) {
            console.log(error);
            return next(new ApiError());
        }
    }

    async removeSavedPost(req: IReqAuth, res: Response, next: NextFunction) {
        try {
            const post = await Post.findOne({ _id: req.body.post }).populate({
                path: 'owner',
                select: '_id name account image role',
            });
            if (!post)
                return res.status(404).json({ message: 'Post not found.' });

            const userService = new UserService(req.user?._id);
            await userService.removeSavedPost(req.body.post);

            return res.status(200).json({
                data: post,
                message: 'Remove saved post successfully',
            });
        } catch (error) {
            console.log(error);
            return next(new ApiError());
        }
    }

    async checkLikedPost(req: IReqAuth, res: Response, next: NextFunction) {
        try {
            const userService = new UserService(req.user?._id);
            let liked = await userService.checkLikedPost(
                req.query.postId as string
            );

            return res
                .status(200)
                .json({ data: liked, message: 'Check liked post' });
        } catch (error) {
            console.log(error);
            return next(new ApiError());
        }
    }

    async likePost(req: IReqAuth, res: Response, next: NextFunction) {
        try {
            const post = await Post.findOne({ _id: req.body.post });
            if (!post)
                return res.status(404).json({ message: 'Post not found.' });

            const userService = new UserService(req.user?._id);
            const updated_posts = await userService.likePost(req.body.post);

            return res.status(200).json({
                data: updated_posts,
                message: 'Like post successfully',
            });
        } catch (error) {
            console.log(error);
            return next(new ApiError());
        }
    }

    async unlikePost(req: IReqAuth, res: Response, next: NextFunction) {
        try {
            const post = await Post.findOne({ _id: req.body.post });
            if (!post)
                return res.status(404).json({ message: 'Post not found.' });

            const userService = new UserService(req.user?._id);
            const updated_post = await userService.unlikePost(req.body.post);

            return res.status(200).json({
                data: updated_post,
                message: 'Unlike post successfully',
            });
        } catch (error) {
            console.log(error);
            return next(new ApiError());
        }
    }

    async checkLikedComment(req: IReqAuth, res: Response, next: NextFunction) {
        try {
            const userService = new UserService(req.user?._id);
            let liked = await userService.checkLikedComment(
                req.query.commentId as string
            );

            return res
                .status(200)
                .json({ data: liked, message: 'Check liked comment' });
        } catch (error) {
            console.log(error);
            return next(new ApiError());
        }
    }

    async likeComment(req: IReqAuth, res: Response, next: NextFunction) {
        try {
            const comment = await Comment.findOne({ _id: req.body.comment });
            if (!comment)
                return res.status(404).json({ message: 'Comment not found.' });

            const userService = new UserService(req.user?._id);
            const updated_comment = await userService.likeComment(
                req.body.comment
            );

            return res.status(200).json({
                data: updated_comment,
                message: 'Like comment successfully',
            });
        } catch (error) {
            console.log(error);
            return next(new ApiError());
        }
    }

    async unlikeComment(req: IReqAuth, res: Response, next: NextFunction) {
        try {
            const comment = await Comment.findOne({ _id: req.body.comment });
            if (!comment)
                return res.status(404).json({ message: 'Comment not found.' });

            const userService = new UserService(req.user?._id);
            const updated_comment = await userService.unlikeComment(
                req.body.comment
            );

            return res.status(200).json({
                data: updated_comment,
                message: 'Unlike comment successfully',
            });
        } catch (error) {
            console.log(error);
            return next(new ApiError());
        }
    }

    async getUserInfo(req: IReqAuth, res: Response, next: NextFunction) {
        try {
            const userService = new UserService(req.user?._id);
            const user = await userService.getInfo();
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            return res
                .status(200)
                .json({ data: user, message: 'Get user info successfully.' });
        } catch (error) {
            console.log(error);
            return next(new ApiError());
        }
    }
}

export default new MeController();
