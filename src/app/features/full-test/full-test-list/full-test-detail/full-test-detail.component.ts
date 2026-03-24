import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft,
  faClock,
  faCheckCircle,
  faFlag,
  faChevronLeft,
  faChevronRight,
  faThLarge,
  faFileAlt,
} from '@fortawesome/free-solid-svg-icons';
import { ToeicTestResponse } from '../../../../models/response/toeict-test-response.model';
import { ToeicTestService } from '../../../../services/ToeicTestService';
import { HistoryService } from '../../../../services/HistoryService';
import { ItemTypeEnum } from '../../../../models/item-type-enum';
import { CommonUtils } from '../../../../shared/utils/common';
import { AudioPlayerComponent } from '../../../../shared/audio-player/audio-player.component';

@Component({
  selector: 'app-full-test-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule, AudioPlayerComponent],
  templateUrl: './full-test-detail.component.html',
  styleUrl: './full-test-detail.component.scss',
})
export class FullTestDetailComponent implements OnInit, OnDestroy {
  groupId: string = '';
  testId: string = '';
  test: ToeicTestResponse | null = null;
  
  // Điều hướng theo Group
  currentGroupIndex = 0;
  selectedAnswers: { [questionId: string]: string } = {};
  markedQuestions: Set<string> = new Set(); // Lưu ID câu hỏi bị đánh dấu

  // Timer
  timeRemaining = 120 * 60; // 120 phút
  timerInterval: any;

  // State
  isTestStarted = false;
  isTestCompleted = false;
  isLoading = false;
  startDate: string = '';

  // Icons
  faArrowLeft = faArrowLeft;
  faClock = faClock;
  faCheckCircle = faCheckCircle;
  faFlag = faFlag;
  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;
  faThLarge = faThLarge;
  faFileAlt = faFileAlt;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toeicTestService: ToeicTestService,
    private historyService: HistoryService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.groupId = params['groupId'];
      this.testId = params['testId'];
      if (this.testId) this.loadTest();
    });
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  loadTest(): void {
    this.isLoading = true;
    this.toeicTestService.getTestById(this.testId).subscribe({
      next: (test) => {
        this.test = test;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  startTest(): void {
    this.isTestStarted = true;
    this.startDate = CommonUtils.getNow();
    this.startTimer();
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      if (this.timeRemaining > 0) {
        this.timeRemaining--;
      } else {
        this.submitTest(true); // Tự động nộp khi hết giờ
      }
    }, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  getFormattedTime(): string {
    const h = Math.floor(this.timeRemaining / 3600);
    const m = Math.floor((this.timeRemaining % 3600) / 60);
    const s = this.timeRemaining % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  // --- Logic Điều hướng ---

  getCurrentGroup() {
    return this.test?.questionGroups?.[this.currentGroupIndex];
  }

  nextGroup(): void {
    if (this.currentGroupIndex < (this.test?.questionGroups?.length || 0) - 1) {
      this.currentGroupIndex++;
    }
  }

  prevGroup(): void {
    if (this.currentGroupIndex > 0) {
      this.currentGroupIndex--;
    }
  }

  selectAnswer(questionId: string, answer: string): void {
    this.selectedAnswers[questionId] = answer;
  }

  toggleMark(questionId: string): void {
    if (this.markedQuestions.has(questionId)) {
      this.markedQuestions.delete(questionId);
    } else {
      this.markedQuestions.add(questionId);
    }
  }

  // Tính tổng số câu hỏi đã làm
  getAnsweredCount(): number {
    return Object.keys(this.selectedAnswers).length;
  }

  getTotalQuestions(): number {
    if (!this.test) return 0;
    return this.test.questionGroups.reduce((acc, g) => acc + g.questions.length, 0);
  }

  // --- Nộp bài ---

  submitTest(auto: boolean = false): void {
    if (!auto && !confirm('Bạn có chắc chắn muốn nộp bài?')) return;

    this.stopTimer();
    this.isTestCompleted = true;

    // Chuẩn bị dữ liệu nộp lên server
    const allQuestions = this.test?.questionGroups.flatMap(g => g.questions) || [];
    let correctCount = 0;

    const historyAnswers = allQuestions.map(q => {
      const isCorrect = this.selectedAnswers[q.id] === q.correctAnswer;
      if (isCorrect) correctCount++;
      return {
        questionId: q.id,
        selectedAnswer: this.selectedAnswers[q.id] || '',
        correct: isCorrect
      };
    });

    this.historyService.addHistory({
      testType: ItemTypeEnum.FULL_TEST,
      testId: this.testId,
      score: correctCount, // Tạm thời lưu số câu đúng, server sẽ convert sang thang 990 sau
      answers: historyAnswers,
      takenAt: this.startDate,
      submittedAt: CommonUtils.getNow(),
    }).subscribe({
      next: () => this.router.navigate(['/history']), // Hoặc hiện popup kết quả
      error: (err) => console.error(err)
    });
  }
  goBack(): void {
    // Nếu bài thi đang diễn ra, cần xác nhận trước khi thoát
    if (this.isTestStarted && !this.isTestCompleted) {
      if (confirm('Bạn đang trong quá trình làm bài. Bạn có chắc chắn muốn thoát? Kết quả sẽ không được lưu.')) {
        this.router.navigate(['/full-test/groups', this.groupId, 'tests']);
      }
    } else {
      // Nếu chưa bắt đầu hoặc đã xong, cho phép quay lại bình thường
      this.router.navigate(['/full-test/groups', this.groupId, 'tests']);
    }
  }
  // Thêm hàm này vào trong class FullTestDetailComponent
isGroupCompleted(groupIndex: number): boolean {
  const group = this.test?.questionGroups[groupIndex];
  if (!group) return false;
  // Kiểm tra xem tất cả các câu hỏi trong group này đã được chọn đáp án chưa
  return group.questions.every(q => !!this.selectedAnswers[q.id]);
}
}