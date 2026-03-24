import { ToeicPart } from '../toeic-part.enum';
import { ToeicTestQuestionResponse } from './toeic-test-question-response.model';

export interface ToeicTestQuestionGroupResponse {
  id: string;
  part: ToeicPart;
  audioUrl?: string;
  imageUrl?: string;
  createdAt: string;
  questions: ToeicTestQuestionResponse[];
}
