import { ToeicTestQuestionGroupResponse } from './toeic-test-question-group-response.model';
import { ToeicTestQuestionResponse } from './toeic-test-question-response.model';

export interface ToeicTestResponse {
  id: string;
  name: string;
  questionGroups: ToeicTestQuestionGroupResponse[];
  totalCompletion: number;
  createdAt: string;
}
