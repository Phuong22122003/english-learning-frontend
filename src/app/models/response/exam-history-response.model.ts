import { ItemTypeEnum } from '../item-type-enum';
import { QuestionResponse } from './question-response.model';
import { UserAnswerGroupResponse } from './user-answer-group-response.model';

export interface ExamHistoryResponse {
  id: string;
  testType: ItemTypeEnum;
  testId: string;
  score: number;
  name: string;
  duration: number;
  takenAt: string;
  submittedAt: string;
  // questions: QuestionResponse[];
  answerGroups: UserAnswerGroupResponse[];
}
