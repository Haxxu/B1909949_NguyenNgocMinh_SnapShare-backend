import Comment from '../models/Comment';

interface ICommentPayload {
    owner: string;
    post: string;
    content: string;
}

class CommentService {
    id: string;
    user?: string;
    post?: string;

    constructor(commentId: string) {
        this.id = commentId;
    }

    static async createNewCommentInPost(payload: ICommentPayload) {
        const newComment = await new Comment(payload).save();

        newComment.__v = undefined;
        return newComment;
    }

    static async getCommentsByPostId(postId: string) {
        const comments = await Comment.find({ post: postId })
            .sort({ createdAt: 'desc' })
            .select('-__v');
        // .populate([
        //     {
        //         path: 'owner',
        //         select: '-password -__v -role -saved_posts -liked_posts',
        //     },
        // ]);

        return comments;
    }

    static async deleteCommentById(commentId: string) {
        await Comment.deleteOne({ _id: commentId });
    }
}

export default CommentService;
