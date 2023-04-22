import { NextFunction, Response } from 'express';

import { IReqAuth } from '../config/interface';
import ApiError from '../utils/ApiError';
import UserService from '../services/UserService';
import PostService from '../services/PostService';

interface SearchResultsType {
    posts?: object;
    users?: object;
}

class SeachController {
    async search(req: IReqAuth, res: Response, next: NextFunction) {
        const data: SearchResultsType = {};
        try {
            const tags = req.query.tags as string[];
            const search = req.query.search as string;
            const limit =
                req.query.limit && !isNaN(parseInt(req.query.limit as string))
                    ? parseInt(req.query.limit as string)
                    : 10;

            if (tags && search && search.trim() !== '') {
                const users = await UserService.searchUser({
                    search: search.trim(),
                    limit: limit,
                });
                const userIds = users.map((item) => item._id.toString());

                if (tags.includes('posts')) {
                    const searchCondition = {
                        $or: [
                            {
                                name: {
                                    $regex: search,
                                    $options: 'i',
                                },
                            },
                            { owner: { $in: userIds } },
                        ],
                    };
                    const posts = await PostService.searchPost(searchCondition);

                    data.posts = posts;
                }

                data.users = users;
            }

            return res
                .status(200)
                .send({ data, message: 'Search successfully' });
        } catch (error) {
            console.log(error);
            return next(new ApiError());
        }
    }
}

export default new SeachController();
