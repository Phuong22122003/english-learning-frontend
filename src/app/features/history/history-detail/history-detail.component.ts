import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HistoryService } from '../../../services/HistoryService';
import { ExamHistoryResponse } from '../../../models/response/exam-history-response.model';
import { ItemTypeEnum } from '../../../models/item-type-enum';
import { CommonUtils } from '../../../shared/utils/common';
import { UserAnswerResponse } from '../../../models/response/user-answer-response.model';

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

  // Getter tính tổng số câu hỏi từ các group
  get totalQuestions(): number {
    if (!this.historyDetail) return 0;
    return this.historyDetail.answerGroups.reduce((acc, g) => acc + g.answers.length, 0);
  }

  // Hàm quan trọng: Tính số thứ tự câu hỏi (Ví dụ: Group 1 có 3 câu, thì câu đầu Group 2 là số 4)
  getGlobalIndex(groupIndex: number, answerIndex: number): number {
    let count = 0;
    for (let i = 0; i < groupIndex; i++) {
      count += this.historyDetail?.answerGroups[i].answers.length || 0;
    }
    return count + answerIndex + 1;
  }

  getCorrectAnswersCount(): number {
    if (!this.historyDetail) return 0;
    return this.historyDetail.answerGroups
      .flatMap(g => g.answers)
      .filter(q => q.selectedAnswer === q.correctAnswer).length;
  }

  isAnswerCorrect(answer: UserAnswerResponse): boolean {
    return answer.selectedAnswer === answer.correctAnswer;
  }

  getObjectKeys(obj: any): string[] {
    return obj ? Object.keys(obj).sort() : [];
  }

  getTestTypeLabel(testType: string): string {
    const labels: { [key: string]: string } = {
      'GRAMMAR': 'Ngữ pháp',
      'LISTENING': 'Nghe hiểu',
      'VOCABULARY': 'Vocabulary',
      'FULL_TEST': 'Toeic'
    };
    return labels[testType] || testType;
  }

  getScoreColor(score: number): string {
    if (score >= 80 || score > 450) return 'text-green-600';
    if (score >= 50 || score > 200) return 'text-yellow-600';
    return 'text-red-600';
  }

  getScoreBackgroundColor(score: number): string {
    if (score >= 80 || score > 450) return 'bg-green-100';
    if (score >= 50 || score > 200) return 'bg-yellow-100';
    return 'bg-red-100';
  }

  getTime(takenTime: string, submitTime: string) {
    return CommonUtils.diffDateTimeToString(submitTime, takenTime);
  }
}