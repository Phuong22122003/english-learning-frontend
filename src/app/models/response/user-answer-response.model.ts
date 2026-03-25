export interface UserAnswerResponse {
  question: string;
  selectedAnswer: string;
  options: { [key: string]: string };
  explanation?: string;
  correctAnswer: string;
}
