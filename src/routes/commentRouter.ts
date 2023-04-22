import { Router } from 'express';

import { userAuth } from '../middlewares/auth';
import postController from '../controllers/PostController';
import commentController from '../controllers/CommentController';

const router = Router();

// [POST] /api/comments => create comment (in post)
router.post('/comments', userAuth, commentController.createComment);

// [DELETE] /api/comments/:id => delete comment by id
router.delete('/comments/:id', userAuth, commentController.deleteCommentById);

export default router;
