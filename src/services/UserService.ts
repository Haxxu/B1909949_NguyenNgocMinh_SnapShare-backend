import mongoose from 'mongoose';
import Comment from '../models/Comment';
import Post from '../models/Post';
import User from '../models/User';

interface IUserUpdatePayload {
    name: string;
    description: string;
    image: string;
}

class UserService {
    id: string;

    constructor(id: string) {
        this.id = id;
    }

    static async findOne(condition: object) {
        return await User.findOne(condition);
    }

    static async createNewUser(payload: object) {
        const newUser = await new User(payload).save();

        newUser.password = '';
        newUser.__v = undefined;
        const token = newUser.generateAuthToken();
        return { new_user: newUser, token };
    }

    static async getUserByIdPublic(id: string) {
        return await User.findOne({ _id: id }).select(
            '-password -__v -role -saved_posts -liked_posts'
        );
    }

    static async countTotalPostsByUserId(id: string) {
        return await User.find({ owner: id }).count();
    }

    async update(payload: IUserUpdatePayload) {
        return await User.findOneAndUpdate(
            { _id: this.id },
            { $set: payload },
            { new: true }
        ).select('-password -__v -role');
    }

    async follow(follow_user_id: string) {
        const user = await User.findOne({ _id: this.id });
        const follow_user = await User.findOne({ _id: follow_user_id });

        let index = user?.following
            .map((item) => item.user_id)
            .indexOf(follow_user_id);
        if (index === -1) {
            user?.following.push({
                user_id: follow_user_id,
                added_at: Date.now(),
            });
        }

        let index2 = follow_user?.followers
            .map((item) => item.user_id)
            .indexOf(this.id);
        if (index2 === -1) {
            follow_user?.followers.push({
                user_id: this.id,
                added_at: Date.now(),
            });
        }

        await user?.save();
        await follow_user?.save();
    }

    async unfollow(unfollow_user_id: string) {
        const user = await User.findOne({ _id: this.id });
        const unfollow_user = await User.findOne({ _id: unfollow_user_id });

        let indexInFollowing = user?.following
            .map((item) => item.user_id)
            .indexOf(unfollow_user_id);
        if (indexInFollowing !== -1) {
            user?.following.splice(indexInFollowing as number, 1);
        }

        let indexInFollowers = unfollow_user?.followers
            .map((item) => item.user_id)
            .indexOf(this.id);
        if (indexInFollowers !== -1) {
            unfollow_user?.followers.splice(indexInFollowers as number, 1);
        }

        await user?.save();
        await unfollow_user?.save();
    }

    async getFollowing() {
        let followingArray = [];
        const user = await User.findOne({ _id: this.id });

        let followingLen = user?.following.length || 0;

        for (let i = 0; i < followingLen; ++i) {
            const u = await User.findOne({
                _id: user?.following[i].user_id,
            })
                .select('-password -__v -role -saved_posts -liked_posts')
                .lean();
            followingArray.push(u);
        }

        return followingArray;
    }

    async getFollowers() {
        let followersArray = [];
        const user = await User.findOne({ _id: this.id });

        let followersLen = user?.followers.length || 0;

        for (let i = 0; i < followersLen; ++i) {
            const u = await User.findOne({
                _id: user?.followers[i].user_id,
            })
                .select('-password -__v -role -saved_posts -liked_posts')
                .lean();
            followersArray.push(u);
        }

        return followersArray;
    }

    async totalPosts() {
        return await Post.find({ owner: this.id }).count();
    }

    async getPosts() {
        let postsArray = [];
        const posts = await Post.find({ owner: this.id })
            .sort({
                createdAt: -1,
            })
            .populate({
                path: 'owner',
                select: '_id name image role account',
            });
        let postsLen = posts.length;
        for (let i = 0; i < postsLen; ++i) {
            postsArray.push(posts[i]);
        }

        return postsArray;
    }

    async getSavedPosts() {
        let postsArray = [];
        const user = await User.findOne({ _id: this.id });

        let savedPostsLeng = user?.saved_posts?.length || 0;

        for (let i = 0; i < savedPostsLeng; ++i) {
            const post = await Post.findOne({
                _id: user?.saved_posts[i].post_id,
            }).populate({
                path: 'owner',
                select: '_id name account image role',
            });
            postsArray.push(post);
        }
        return postsArray;
    }

    async savePost(postId: string) {
        const user = await User.findOne({ _id: this.id });

        let index = user?.saved_posts
            .map((item) => item.post_id)
            .indexOf(postId);
        if (index === -1) {
            user?.saved_posts.unshift({
                post_id: postId,
                added_at: Date.now(),
            });
        }

        await user?.save();
    }

    async removeSavedPost(postId: string) {
        await User.updateOne(
            { _id: this.id },
            { $pull: { saved_posts: { post_id: postId } } }
        );
    }

    async likePost(postId: string) {
        const user = await User.findOne({ _id: this.id });
        const post = await Post.findOne({ _id: postId });

        let index = user?.liked_posts
            .map((item) => item.post_id)
            .indexOf(postId);
        if (index === -1) {
            let added_at = Date.now();
            user?.liked_posts.unshift({
                post_id: postId,
                added_at,
            });
            post?.likes.unshift({
                user: this.id,
                added_at,
            });
        }

        await user?.save();

        await post?.populate({
            path: 'owner',
            select: '_id name account image role',
        });

        await post?.save();

        return post;
    }

    async unlikePost(postId: string) {
        await User.updateOne(
            { _id: this.id },
            { $pull: { liked_posts: { post_id: postId } } }
        );
        // const post = await Post.updateOne(
        //     { _id: postId },
        //     { $pull: { likes: { user: this.id } } },
        //     { new: true }
        // );

        const post = await Post.findOneAndUpdate(
            { _id: postId },
            { $pull: { likes: { user: this.id } } },
            { new: true }
        );

        await post?.populate({
            path: 'owner',
            select: '_id image name account role',
        });

        await post?.save();

        return post;
    }

    async likeComment(commentId: string) {
        const comment = await Comment.findOne({ _id: commentId });

        let index = comment?.likes
            .map((item) => item.user.toString())
            .indexOf(this.id);
        if (index === -1) {
            comment?.likes.unshift({
                user: this.id,
                added_at: Date.now(),
            });
        }

        await comment?.populate({
            path: 'owner',
            select: '_id image name account role',
        });
        await comment?.save();
        return comment;
    }

    async unlikeComment(commentId: string) {
        // const comment = await Comment.updateOne(
        //     { _id: commentId },
        //     { $pull: { likes: { user: this.id } } },
        //     { new: true }
        // );

        const comment = await Comment.findOneAndUpdate(
            {
                _id: commentId,
            },
            {
                $pull: { likes: { user: this.id } },
            },
            {
                new: true,
            }
        ).populate({ path: 'owner', select: '_id image name account role' });

        return comment;
    }

    async checkLikedPost(postId: string) {
        const user = await User.findOne({ _id: this.id });
        let index = user?.liked_posts
            .map((item) => item.post_id)
            .indexOf(postId);
        return index !== -1;
    }

    async checkLikedComment(commentId: string) {
        const comment = await Comment.findOne({ _id: commentId });
        let index = comment?.likes
            .map((item) => item.user.toString())
            .indexOf(this.id);
        return index !== -1;
    }

    async checkSavedPost(postId: string) {
        const user = await User.findOne({ _id: this.id });
        let index = user?.saved_posts
            .map((item) => item.post_id)
            .indexOf(postId);
        return index !== -1;
    }
    async checkFollowUser(userId: string) {
        const user = await User.findOne({ _id: userId });
        let index = user?.followers
            .map((item) => item.user_id)
            .indexOf(this.id);

        const user1 = await User.findOne({ _id: this.id });
        let index1 = user1?.following
            .map((item) => item.user_id)
            .indexOf(userId);
        return index !== -1 || index1 !== -1;
    }

    async getInfo() {
        const user = await User.findOne({ _id: this.id }).select(
            '-password -__v'
        );
        return user;
    }

    async getFollowingUsersPosts(limit: string) {
        const user = await User.findOne({ _id: this.id });
        const userIds = user?.following.map(
            (item) => new mongoose.Types.ObjectId(item.user_id)
        );
        const result = await Post.aggregate([
            {
                $match: { owner: { $in: userIds } },
            },
            { $sort: { createdAt: -1 } },
            {
                $limit: parseInt(limit) || 8,
            },
        ]);

        // const posts = await Post.populate(result, {
        //     path: 'owner',
        //     select: '-password -__v -saved_posts -liked_posts -role',
        // });

        return result;
    }

    static async searchUser({ search = '', limit = 10 }) {
        return await User.find({
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { account: { $regex: search, $options: 'i' } },
            ],
        })
            .select('-password -__v -saved_posts -liked_posts -role')
            .limit(limit);
    }
}

export default UserService;
