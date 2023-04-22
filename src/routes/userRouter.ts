import { Router } from 'express';

import userController from '../controllers/UserController';
import { userAuth } from '../middlewares/auth';

const router = Router();

// [PATCH] /api/users/:id => update user by id
router.patch('/users/:id', userAuth, userController.updateUserById);

// [GET] /api/users/:id/posts => get posts by user id
router.get('/users/:id/posts', userAuth, userController.getPostsByUserId);

// [GET] /api/users/:id => get user by id
router.get('/users/:id', userAuth, userController.getUserById);

// [GET] /api/users/:id/following/posts => get posts of following user by user id
router.get(
    '/users/:id/following/posts',
    userAuth,
    userController.getFollowingUsersPosts
);

// [GET] /api/users/:id/following => get following of user by user id
router.get('/users/:id/following', userAuth, userController.getUserFollowing);

// [GET] /api/users/:id/followers => get followers of user by user id
router.get('/users/:id/followers', userAuth, userController.getUserFollowers);

export default router;
