import { ToeicTestQuestionGroupRequest } from './toeic-test-question-group-request.model';

export interface ToeicTestRequest {
  name: string;
  questionGroups: ToeicTestQuestionGroupRequest[];
}
