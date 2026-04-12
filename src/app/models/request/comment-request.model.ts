export interface CommentRequest {
    content: string;
    replyId?: string;
    parentId?: string;
    testId: string;
    contentId: string;
}
