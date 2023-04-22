import { NextFunction, Response } from 'express';
import { IReqAuth } from '../config/interface';
import ApiError from '../utils/ApiError';
import Post, { validatePost } from '../models/Post';
import PostService from '../services/PostService';
import CommentService from '../services/CommentService';

class PostController {
    async createPost(req: IReqAuth, res: Response, next: NextFunction) {
        try {
            const { error } = validatePost(req.body);
            if (error) {
                return next(new ApiError(400, error.details[0].message));
            }

            const new_post = await PostService.createNewPost({
                ...req.body,
                owner: req.user?._id,
            });

            return res.status(200).json({
                data: { newPost: new_post },
                message: 'Create post successfully',
            });
        } catch (error) {
            console.log(error);
            return next(new ApiError());
        }
    }

    async updatePostById(req: IReqAuth, res: Response, next: NextFunction) {
        try {
            const post = await PostService.findOne({ _id: req.params.id });
            if (!post) {
                return res.status(404).json({ message: 'Post not found.' });
            }

            if (req.user?._id !== post.owner.toString()) {
                return res.status(403).json({
                    message: "User don't have permisson to perform this action",
                });
            }

            const { title, image, description } = req.body;

            const postService = new PostService(req.params.id);

            const updated_post = await postService.update({
                title,
                image,
                description,
            });

            return res.status(200).json({
                data: updated_post,
                message: 'Update post successfully',
            });
        } catch (error) {
            console.log(error);
            return next(new ApiError());
        }
    }

    async deletePostById(req: IReqAuth, res: Response, next: NextFunction) {
        try {
            const post = await PostService.findOne({ _id: req.params.id });
            if (!post) {
                return res.status(404).json({ message: 'Post not found.' });
            }

            if (req.user?._id !== post.owner.toString()) {
                return res.status(403).json({
                    message: "User don't have permisson to perform this action",
                });
            }

            await PostService.deletePostById(req.params.id);

            return res
                .status(200)
                .json({ message: 'Delete post successfully' });
        } catch (error) {
            console.log(error);
            return next(new ApiError());
        }
    }

    async getCommentsByPostId(
        req: IReqAuth,
        res: Response,
        next: NextFunction
    ) {
        try {
            const post = await Post.findOne({ _id: req.params.id });
            if (!post) {
                return res.status(404).json({ message: 'Post not found.' });
            }

            const comments = await CommentService.getCommentsByPostId(
                req.params.id
            );
            return res.status(200).json({
                data: comments,
                message: 'Get comments of post successfully',
            });
        } catch (error) {
            console.log(error);
            return next(new ApiError());
        }
    }

    async getPostsByTags(req: IReqAuth, res: Response, next: NextFunction) {
        try {
            const tags = req.query.tags as string[];
            const limit = req.query.limit as string;

            const posts = await PostService.getPostsByTags(
                tags,
                limit,
                req.user?._id
            );
            return res.status(200).json({
                data: posts,
                message: 'Get post by tags successfully',
            });
        } catch (error) {
            console.log(error);
            return next(new ApiError());
        }
    }
}

export default new PostController();
