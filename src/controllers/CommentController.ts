import { NextFunction, Response, Request } from 'express';

import { IReqAuth } from '../config/interface';
import ApiError from '../utils/ApiError';
import PostService from '../services/PostService';
import CommentService from '../services/CommentService';
import Comment, { validateComment } from '../models/Comment';

class CommentController {
    async createComment(req: IReqAuth, res: Response, next: NextFunction) {
        try {
            const { error } = validateComment(req.body);
            if (error) {
                return next(new ApiError(401, error.details[0].message));
            }

            const post = await PostService.findOne({ _id: req.body.post });
            if (!post) {
                return res.status(404).json({ message: 'Post not found.' });
            }

            const new_comment = await CommentService.createNewCommentInPost({
                owner: req.user?._id,
                post: req.body.post,
                content: req.body.content,
            });

            return res.status(200).json({
                data: new_comment,
                message: 'Create comment successfully',
            });
        } catch (error) {
            console.log(error);
            return next(new ApiError());
        }
    }

    async deleteCommentById(req: IReqAuth, res: Response, next: NextFunction) {
        try {
            const comment = await Comment.findOne({
                _id: req.params.id,
            });
            if (!comment) {
                return res.status(404).json({ message: 'Comment not found' });
            }

            const post = await PostService.findOne({
                _id: comment.post.toString(),
            });
            if (!post) {
                return res.status(404).json({ message: 'Post not found' });
            }

            if (
                comment.owner.toString() !== req.user?._id &&
                post.owner.toString() !== req.user?._id
            ) {
                return res.status(403).json({
                    messaeg: 'You dont have permission to do this action',
                });
            }

            await CommentService.deleteCommentById(req.params.id);

            return res.status(200).json({
                message: 'Delete comment successfully',
            });
        } catch (error) {
            console.log(error);
            return next(new ApiError());
        }
    }
}

export default new CommentController();
