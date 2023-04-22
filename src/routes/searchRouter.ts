import { Router } from 'express';

import { userAuth } from '../middlewares/auth';
import searchController from '../controllers/SearchController';

const router = Router();

// [GET] /api/search => create comment (in post)
router.get('/search', userAuth, searchController.search);

export default router;
