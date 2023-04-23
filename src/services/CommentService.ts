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

        await newComment.populate({
            path: 'owner',
            select: '_id image name account role',
        });

        newComment.__v = undefined;
        return newComment;
    }

    static async getCommentsByPostId(postId: string) {
        const comments = await Comment.find({ post: postId })
            .sort({ createdAt: 'desc' })
            .select('-__v')
            .populate([
                {
                    path: 'owner',
                    select: '_id name image account role',
                },
            ]);

        return comments;
    }

    static async deleteCommentById(commentId: string) {
        const comment = await Comment.findOneAndDelete({ _id: commentId });

        return comment;
    }
}

export default CommentService;
