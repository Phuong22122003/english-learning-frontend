import { ItemTypeEnum } from '../item-type-enum';
import { UserAnswerGroupRequest } from './user-answer-group-request.model';
import { UserAnswerRequest } from './user-answer-request.model';

export interface ExamHistoryRequest {
  name: string;
  duration: number;
  testType: ItemTypeEnum;
  testId: string;
  score: number;
  answerGroups: UserAnswerGroupRequest[];
  takenAt: string;
  submittedAt: string;
}
