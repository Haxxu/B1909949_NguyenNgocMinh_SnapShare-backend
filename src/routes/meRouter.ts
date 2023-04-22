import { Router } from 'express';

import userController from '../controllers/UserController';
import { userAuth } from '../middlewares/auth';
import meController from '../controllers/MeController';

const router = Router();

// [GET] /api/me/following/contains => check following user
router.get('/me/following/contains', userAuth, meController.checkFollowUser);

// [PUT] /api/me/following => follow user
router.put('/me/following', userAuth, meController.followUser);

// [DELETE] /api/me/following => unfollow user
router.delete('/me/following', userAuth, meController.unfollowUser);

// [GET] /api/me/saved-posts/contains => check saved post
router.get('/me/saved-posts/contains', userAuth, meController.checkSavedPost);

// [GET] /api/me/saved-posts => get saved post
router.get('/me/saved-posts', userAuth, meController.getSavedPosts);

// [PUT] /api/me/saved-posts => saved post
router.put('/me/saved-posts', userAuth, meController.savePost);

// [DELETE] /api/me/saved-posts => remove saved post
router.delete('/me/saved-posts', userAuth, meController.removeSavedPost);

// [GET] /api/me/liked-posts/contains => check liked post
router.get('/me/liked-posts/contains', userAuth, meController.checkLikedPost);

// [PUT] /api/me/liked-posts => like post
router.put('/me/liked-posts', userAuth, meController.likePost);

// [DELETE] /api/me/liked-posts => remove like post
router.delete('/me/liked-posts', userAuth, meController.unlikePost);

// [GET] /api/me/liked-comments/contains => check liked comment
router.get(
    '/me/liked-comments/contains',
    userAuth,
    meController.checkLikedComment
);

// [PUT] /api/me/liked-comments => like comment
router.put('/me/liked-comments', userAuth, meController.likeComment);

// [DELETE] /api/me/liked-comments => unlike comment
router.delete('/me/liked-comments', userAuth, meController.unlikeComment);

// [GET] /api/me
router.get('/me/info', userAuth, meController.getUserInfo);

export default router;
