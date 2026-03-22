import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HistoryService } from '../../../services/HistoryService';
import { ExamHistoryResponse } from '../../../models/response/exam-history-response.model';
import { QuestionResponse } from '../../../models/response/question-response.model';
import { ItemTypeEnum } from '../../../models/item-type-enum';
import { CommonUtils } from '../../../shared/utils/common';

@Component({
  selector: 'app-history-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './history-detail.component.html',
  styleUrl: './history-detail.component.scss',
})
export class HistoryDetailComponent implements OnInit {
  itemType = ItemTypeEnum;
  examHistoryId: string = '';
  historyDetail: ExamHistoryResponse | null = null;
  constructor(
    private route: ActivatedRoute,
    private historyService: HistoryService
  ) {}

  ngOnInit(): void {
    this.examHistoryId = this.route.snapshot.params['examHistoryId'];
    this.loadHistoryDetail();
  }

  loadHistoryDetail() {
    this.historyService.getHistoryById(this.examHistoryId).subscribe((res) => {
      this.historyDetail = res;
    });
  }

  getTestTypeLabel(testType: string): string {
    switch (testType) {
      case 'GRAMMAR':
        return 'Ngữ pháp';
      case 'LISTENING':
        return 'Nghe hiểu';
      case 'VOCABULARY':
        return 'Từ vựng';
      case 'FULL_TEST':
        return 'Bài thi đầy đủ';
      default:
        return testType;
    }
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }

  getScoreBackgroundColor(score: number): string {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  }

  formatDuration(duration: number): string {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  getTime(takenTime: string, submitTime: string) {
    return CommonUtils.diffDateTimeToString(submitTime, takenTime);
  }

  isAnswerCorrect(question: QuestionResponse): boolean {
    return question.userAnswer === question.correctAnswer;
  }

  getAnswerStatusClass(question: QuestionResponse): string {
    return this.isAnswerCorrect(question)
      ? 'border-green-500 bg-green-50'
      : 'border-red-500 bg-red-50';
  }

  getOptionLetter(index: number): string {
    const letters = ['a', 'b', 'c', 'd'];
    return letters[index] || 'a';
  }

  getOptionKey(index: number): string {
    return this.getOptionLetter(index);
  }

  getCorrectAnswerDisplay(question: QuestionResponse): string {
    return question.options[question.correctAnswer] || '';
  }

  getUserAnswerDisplay(question: QuestionResponse): string {
    return question.options[question.userAnswer] || '';
  }

  getCorrectAnswerLabel(question: QuestionResponse): string {
    return `Đáp án đúng: ${question.correctAnswer.toUpperCase()}`;
  }

  getUserAnswerLabel(question: QuestionResponse): string {
    return `Đáp án của bạn: ${question.userAnswer.toUpperCase()}`;
  }

  getCorrectAnswersCount(): number {
    if (!this.historyDetail?.questions) return 0;
    return this.historyDetail.questions.filter((q) => this.isAnswerCorrect(q))
      .length;
  }

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
}
