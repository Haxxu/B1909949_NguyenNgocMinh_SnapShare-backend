import mongoose from 'mongoose';
import Comment from '../models/Comment';
import Post from '../models/Post';
import User from '../models/User';

interface IPostUpdatePayload {
    title: string;
    description: string;
    image: string;
}

class PostService {
    id: string;

    constructor(id: string) {
        this.id = id;
    }

    static async findOne(condition: object) {
        return await Post.findOne(condition);
    }

    static async createNewPost(payload: object) {
        const newPost = await new Post(payload).save();

        newPost.__v = undefined;

        return newPost;
    }

    static async deletePostById(id: string) {
        await User.updateMany({}, { $pull: { saved_posts: { post_id: id } } });
        await User.updateMany({}, { $pull: { liked_posts: { post_id: id } } });
        await Comment.deleteMany({ post: id });
        await Post.findOneAndRemove({ _id: id });
    }

    async update(payload: IPostUpdatePayload) {
        const post = await Post.findOneAndUpdate(
            { _id: this.id },
            { $set: payload },
            { new: true }
        );
        await post?.populate({
            path: 'owner',
            select: '_id image name account role',
        });

        await post?.save();
        return post;
    }

    static async getPostsByTags(
        tags: string[],
        limit: string,
        userId?: string
    ) {
        interface IType {
            random?: any[];
            following?: any[];
            myPosts?: any[];
        }
        const object: IType = {};
        if (tags.includes('random')) {
            const result = await Post.aggregate([
                {
                    $sample: { size: parseInt(limit) || 8 },
                },
                { $sort: { createdAt: -1 } },
                {
                    $limit: parseInt(limit) || 8,
                },
            ]);
            const posts = await Post.populate(result, {
                path: 'owner',
                select: '_id name account image role',
            });

            object.random = [...result];
        }

        if (tags.includes('following')) {
            const user = await User.findOne({ _id: userId });
            const followingUserIds = user?.following.map(
                (item) => new mongoose.Types.ObjectId(item.user_id)
            );

            const result = await Post.aggregate([
                {
                    $match: {
                        owner: {
                            $in: followingUserIds,
                        },
                    },
                },
                { $sort: { createdAt: -1 } },
                {
                    $limit: parseInt(limit) || 8,
                },
            ]);
            const posts = await Post.populate(result, {
                path: 'owner',
                select: '_id name account image role',
            });

            object.following = [...posts];
        }

        if (tags.includes('myPosts')) {
            const posts = await Post.find({ owner: userId }).populate({
                path: 'owner',
                select: '_id name account image role',
            });

            object.myPosts = posts;
        }

        return object;
    }

    static async searchPost(condition: object) {
        return await Post.find(condition).select('-__v');
    }
}

export default PostService;
