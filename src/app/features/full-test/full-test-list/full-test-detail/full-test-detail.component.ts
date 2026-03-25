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
  faFileAlt
} from '@fortawesome/free-solid-svg-icons';
import { ToeicTestResponse } from '../../../../models/response/toeict-test-response.model';
import { ToeicTestService } from '../../../../services/ToeicTestService';
import { HistoryService } from '../../../../services/HistoryService';
import { ItemTypeEnum } from '../../../../models/item-type-enum';
import { CommonUtils } from '../../../../shared/utils/common';
import { AudioPlayerComponent } from '../../../../shared/audio-player/audio-player.component';
import { ExamHistoryRequest } from '../../../../models/request/exam-history-request.model';
import { UserAnswerGroupRequest } from '../../../../models/request/user-answer-group-request.model';
import { UserAnswerRequest } from '../../../../models/request/user-answer-request.model';

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
  test!: ToeicTestResponse;

  currentGroupIndex = 0;
  selectedAnswers: { [questionId: string]: string } = {};
  markedQuestions: Set<string> = new Set();

  timeRemaining = 120 * 60;
  timerInterval: any;

  isTestStarted = false;
  isTestCompleted = false;
  isLoading = false;
  startDate: string = '';

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
  ) { }

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
        console.log(test);
        
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }
  readonly SCORE_CONVERSION_TABLE: {
    correct: number;
    listening: number;
    reading: number;
  }[] = [
      { correct: 0, listening: 5, reading: 5 },
      { correct: 1, listening: 5, reading: 5 },
      { correct: 2, listening: 5, reading: 5 },
      { correct: 3, listening: 5, reading: 5 },
      { correct: 4, listening: 5, reading: 5 },
      { correct: 5, listening: 5, reading: 5 },
      { correct: 6, listening: 5, reading: 5 },
      { correct: 7, listening: 10, reading: 5 },
      { correct: 8, listening: 15, reading: 5 },
      { correct: 9, listening: 20, reading: 5 },
      { correct: 10, listening: 25, reading: 10 },
      { correct: 11, listening: 30, reading: 15 },
      { correct: 12, listening: 35, reading: 20 },
      { correct: 13, listening: 40, reading: 25 },
      { correct: 14, listening: 45, reading: 30 },
      { correct: 15, listening: 50, reading: 35 },
      { correct: 16, listening: 55, reading: 40 },
      { correct: 17, listening: 60, reading: 45 },
      { correct: 18, listening: 65, reading: 50 },
      { correct: 19, listening: 70, reading: 55 },
      { correct: 20, listening: 75, reading: 60 },
      { correct: 21, listening: 80, reading: 65 },
      { correct: 22, listening: 85, reading: 70 },
      { correct: 23, listening: 90, reading: 75 },
      { correct: 24, listening: 95, reading: 80 },
      { correct: 25, listening: 100, reading: 90 },
      { correct: 26, listening: 105, reading: 95 },
      { correct: 27, listening: 110, reading: 100 },
      { correct: 28, listening: 115, reading: 105 },
      { correct: 29, listening: 120, reading: 110 },
      { correct: 30, listening: 125, reading: 115 },
      { correct: 31, listening: 130, reading: 120 },
      { correct: 32, listening: 135, reading: 125 },
      { correct: 33, listening: 140, reading: 130 },
      { correct: 34, listening: 145, reading: 135 },
      { correct: 35, listening: 150, reading: 140 },
      { correct: 36, listening: 155, reading: 145 },
      { correct: 37, listening: 160, reading: 150 },
      { correct: 38, listening: 165, reading: 155 },
      { correct: 39, listening: 170, reading: 160 },
      { correct: 40, listening: 175, reading: 165 },
      { correct: 41, listening: 180, reading: 170 },
      { correct: 42, listening: 185, reading: 175 },
      { correct: 43, listening: 190, reading: 180 },
      { correct: 44, listening: 195, reading: 185 },
      { correct: 45, listening: 200, reading: 190 },
      { correct: 46, listening: 205, reading: 195 },
      { correct: 47, listening: 210, reading: 200 },
      { correct: 48, listening: 215, reading: 205 },
      { correct: 49, listening: 220, reading: 210 },
      { correct: 50, listening: 245, reading: 235 },
      { correct: 51, listening: 250, reading: 240 },
      { correct: 52, listening: 255, reading: 245 },
      { correct: 53, listening: 260, reading: 250 },
      { correct: 54, listening: 265, reading: 255 },
      { correct: 55, listening: 270, reading: 260 },
      { correct: 56, listening: 275, reading: 265 },
      { correct: 57, listening: 280, reading: 270 },
      { correct: 58, listening: 285, reading: 275 },
      { correct: 59, listening: 290, reading: 280 },
      { correct: 60, listening: 295, reading: 285 },
      { correct: 61, listening: 300, reading: 290 },
      { correct: 62, listening: 305, reading: 295 },
      { correct: 63, listening: 310, reading: 300 },
      { correct: 64, listening: 315, reading: 305 },
      { correct: 65, listening: 320, reading: 310 },
      { correct: 66, listening: 325, reading: 315 },
      { correct: 67, listening: 330, reading: 320 },
      { correct: 68, listening: 335, reading: 325 },
      { correct: 69, listening: 340, reading: 330 },
      { correct: 70, listening: 345, reading: 335 },
      { correct: 71, listening: 350, reading: 340 },
      { correct: 72, listening: 355, reading: 345 },
      { correct: 73, listening: 360, reading: 350 },
      { correct: 74, listening: 365, reading: 355 },
      { correct: 75, listening: 390, reading: 375 },
      { correct: 76, listening: 395, reading: 380 },
      { correct: 77, listening: 400, reading: 385 },
      { correct: 78, listening: 405, reading: 390 },
      { correct: 79, listening: 410, reading: 395 },
      { correct: 80, listening: 415, reading: 400 },
      { correct: 81, listening: 420, reading: 405 },
      { correct: 82, listening: 425, reading: 410 },
      { correct: 83, listening: 430, reading: 415 },
      { correct: 84, listening: 435, reading: 420 },
      { correct: 85, listening: 440, reading: 425 },
      { correct: 86, listening: 445, reading: 430 },
      { correct: 87, listening: 450, reading: 435 },
      { correct: 88, listening: 455, reading: 440 },
      { correct: 89, listening: 460, reading: 445 },
      { correct: 90, listening: 465, reading: 450 },
      { correct: 91, listening: 470, reading: 455 },
      { correct: 92, listening: 475, reading: 460 },
      { correct: 93, listening: 495, reading: 465 },
      { correct: 94, listening: 495, reading: 470 },
      { correct: 95, listening: 495, reading: 475 },
      { correct: 96, listening: 495, reading: 480 },
      { correct: 97, listening: 495, reading: 495 },
      { correct: 98, listening: 495, reading: 495 },
      { correct: 99, listening: 495, reading: 495 },
      { correct: 100, listening: 495, reading: 495 },
    ];
  // --- Logic Danh sách phẳng (Flat List) ---

  get allQuestions() {
    return this.test?.questionGroups.flatMap(g => g.questions) || [];
  }

  // Nhảy tới Group chứa câu hỏi khi click số ở Sidebar
  jumpToQuestion(questionId: string) {
    if (!this.test) return;
    const groupIndex = this.test.questionGroups.findIndex(g =>
      g.questions.some(q => q.id === questionId)
    );

    if (groupIndex !== -1) {
      this.currentGroupIndex = groupIndex;
      // Scroll mượt đến câu hỏi đó
      setTimeout(() => {
        const element = document.getElementById('q-' + questionId);
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }

  isQuestionAnswered(questionId: string): boolean {
    return !!this.selectedAnswers[questionId];
  }

  // --- Điều hướng & Timer ---

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
        this.submitTest(true);
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

  getAnsweredCount(): number {
    return Object.keys(this.selectedAnswers).length;
  }

  getTotalQuestions(): number {
    return this.allQuestions.length;
  }
  private calculateToeicScore(listeningCorrect: number, readingCorrect: number): number {
    // Tìm điểm Listening từ bảng (giới hạn max 100 câu)
    const listeningScoreEntry = this.SCORE_CONVERSION_TABLE.find(
      item => item.correct === Math.min(listeningCorrect, 100)
    );

    // Tìm điểm Reading từ bảng (giới hạn max 100 câu)
    const readingScoreEntry = this.SCORE_CONVERSION_TABLE.find(
      item => item.correct === Math.min(readingCorrect, 100)
    );

    const lScore = listeningScoreEntry ? listeningScoreEntry.listening : 5;
    const rScore = readingScoreEntry ? readingScoreEntry.reading : 5;

    return lScore + rScore;
  }
  submitTest(auto: boolean = false): void {
    if (!auto && !confirm('Bạn có chắc chắn muốn nộp bài?')) return;
    this.stopTimer();
    this.isTestCompleted = true;

    let listeningCorrect = 0;
    let readingCorrect = 0;

    const answerGroups: UserAnswerGroupRequest[] = this.test.questionGroups.map(group => {
      // Phân loại Part để tính điểm riêng cho Listening và Reading
      // Thường Part 1-4 là Listening, Part 5-7 là Reading
      const isListening = group.part <= 4;

      const answers: UserAnswerRequest[] = group.questions.map(q => {
        const isCorrect = this.selectedAnswers[q.id] === q.correctAnswer;

        if (isCorrect) {
          if (isListening) listeningCorrect++;
          else readingCorrect++;
        }

        return {
          correctAnswer:q.correctAnswer,
          question: q.question || '',
          selectedAnswer: this.selectedAnswers[q.id] || '',
          options: q.options,
          explanation: q.explanation
        };
      });

      return {
        answers,
        passageText: group.passageText,
        part: group.part,
        imageUrls: group.imageUrls,
        audioUrl: group.audioUrl
      };
    });

    // Tính tổng điểm dựa trên bảng tra (Score Conversion)
    const finalScore = this.calculateToeicScore(listeningCorrect, readingCorrect);

    const historyRequest: ExamHistoryRequest = {
      testType: ItemTypeEnum.FULL_TEST,
      testId: this.testId,
      name: this.test.name,
      duration: 120,
      score: finalScore, // Lưu tổng điểm (ví dụ: 750) thay vì số câu đúng
      answerGroups: answerGroups,
      takenAt: this.startDate,
      submittedAt: CommonUtils.getNow(),
    };
    console.log(historyRequest);
    
    this.historyService.addHistory(historyRequest).subscribe({
      next: () => this.router.navigate(['/history']),
      error: (err) => console.error(err)
    });
  }

  goBack(): void {
    if (this.isTestStarted && !this.isTestCompleted) {
      if (confirm('Bạn đang làm bài. Thoát sẽ không lưu kết quả?')) {
        this.router.navigate(['/full-test/groups', this.groupId, 'tests']);
      }
    } else {
      this.router.navigate(['/full-test/groups', this.groupId, 'tests']);
    }
  }
}