import { UserAnswerResponse } from "./user-answer-response.model";

export interface UserAnswerGroupResponse {
    answers: UserAnswerResponse[];
    passageText?: string;
    part?: number;
    imageUrls?: string[];
    audioUrl?: string;
}
