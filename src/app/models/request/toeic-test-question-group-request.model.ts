import { ToeicPart } from '../toeic-part.enum';
import { RequestType } from '../request-type.model';
import { ToeicTestQuestionRequest } from './toeic-test-question-request.model';

export interface ToeicTestQuestionGroupRequest {
  id?: string;
  part: ToeicPart;
  action?: RequestType;
  imageName?: string;
  audioName?: string;
  questions: ToeicTestQuestionRequest[];
}
