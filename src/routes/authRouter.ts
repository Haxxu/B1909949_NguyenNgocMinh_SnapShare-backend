import { Router } from 'express';

import authController from '../controllers/AuthController';

const router = Router();

// [POST] /api/auth/register => register user
router.post('/auth/register', authController.register);

// [POST] /api/auth/active => active user
router.post('/auth/active', authController.activeAccount);

// [POST] /api/auth/login => login user
router.post('/auth/login', authController.login);

export default router;
