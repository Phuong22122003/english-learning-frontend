export interface CommentResponse {
    id: string;
    username: string;
    content: string;
    commentedAt: string;
    avatarUrl: string;
    parentId: string;
    replyComments: CommentResponse[];
}