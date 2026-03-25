import { UserAnswerRequest } from "./user-answer-request.model";

export interface UserAnswerGroupRequest {
    answers: UserAnswerRequest[];
    passageText?: string;
    part?: number;
    imageUrls?: string[];
    audioUrl?: string;
}
