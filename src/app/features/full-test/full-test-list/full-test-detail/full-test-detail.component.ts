import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft,
  faClock,
  faCheckCircle,
  faFlag,
  faQuestion,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import { ToeicTestResponse } from '../../../../models/response/toeict-test-response.model';
import { ToeicTestQuestionResponse } from '../../../../models/response/toeic-test-question-response.model';
import { ToeicPart } from '../../../../models/toeic-part.enum';
import { AudioPlayerComponent } from '../../../../shared/audio-player/audio-player.component';
import { QuestionGridComponent } from '../../../../shared/question-grid-component/question-grid.component';
import { ToeicTestService } from '../../../../services/ToeicTestService';
import { HistoryService } from '../../../../services/HistoryService';
import { ItemTypeEnum } from '../../../../models/item-type-enum';
import { ExamHistoryResponse } from '../../../../models/response/exam-history-response.model';
import { CommonUtils } from '../../../../shared/utils/common';

@Component({
  selector: 'app-full-test-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FontAwesomeModule,
    AudioPlayerComponent,
    QuestionGridComponent,
  ],
  templateUrl: './full-test-detail.component.html',
  styleUrl: './full-test-detail.component.scss',
})
export class FullTestDetailComponent implements OnInit, OnDestroy {
  groupId: string = '';
  testId: string = '';
  isQuestionGridVisible = false;
  test: ToeicTestResponse | null = null;
  questions: ToeicTestQuestionResponse[] = [];
  currentQuestionIndex = 0;
  selectedAnswers: { [key: string]: string } = {};
  markedQuestions: Set<number> = new Set();

  // Timer
  totalTimeInSeconds = 2 * 60 * 60; // 2 hours = 7200 seconds
  timeRemaining = this.totalTimeInSeconds;
  timerInterval: any;

  // Test state
  isTestStarted = false;
  isTestCompleted = false;
  isLoading = false;
  error: string | null = null;
  startDate: string = '';
  // Score results
  listeningScore: number = 0;
  readingScore: number = 0;
  totalScore: number = 0;
  listeningCorrect: number = 0;
  readingCorrect: number = 0;
  listeningTotal: number = 0;
  readingTotal: number = 0;

  // Constants
  readonly TOTAL_QUESTIONS = 200;
  readonly PARTS = [
    { part: ToeicPart.PART_1, start: 1,   end: 6,   name: 'Part 1: Photographs' },
    { part: ToeicPart.PART_2, start: 7,   end: 31,  name: 'Part 2: Question-Response' },
    { part: ToeicPart.PART_3, start: 32,  end: 70,  name: 'Part 3: Conversations' },
    { part: ToeicPart.PART_4, start: 71,  end: 100, name: 'Part 4: Talks' },
    { part: ToeicPart.PART_5, start: 101, end: 130, name: 'Part 5: Incomplete Sentences' },
    { part: ToeicPart.PART_6, start: 131, end: 146, name: 'Part 6: Text Completion' },
    { part: ToeicPart.PART_7, start: 147, end: 200, name: 'Part 7: Reading Comprehension' }
  ];

  // TOEIC Score Conversion Table (0-100 correct answers to 5-495 score)
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

  // FontAwesome icons
  faArrowLeft = faArrowLeft;
  faArrowRight = faArrowRight;
  faClock = faClock;
  faCheckCircle = faCheckCircle;
  faFlag = faFlag;
  faQuestion = faQuestion;
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
      if (this.testId) {
        this.loadTest();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  loadTest(): void {
    this.isLoading = true;
    this.error = null;

    this.toeicTestService.getTestById(this.testId).subscribe({
      next: (test) => {
        this.test = test;
        this.questions = test.questions || [];
        this.isLoading = false;
      },
    });
  }

  generateMockQuestions(): ToeicTestQuestionResponse[] {
    const questions: ToeicTestQuestionResponse[] = [];

    this.PARTS.forEach((partInfo) => {
      for (let i = partInfo.start; i <= partInfo.end; i++) {
        const question: ToeicTestQuestionResponse = {
          id: `q${i}`,
          question: `Question ${i}`,
          options: {
            A: `Option A for question ${i}`,
            B: `Option B for question ${i}`,
            C: `Option C for question ${i}`,
            D: `Option D for question ${i}`,
          },
          correctAnswer: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
          part: partInfo.part,
          createdAt: CommonUtils.getNow(),
        };

        // Add image for Part 1
        if (partInfo.part === ToeicPart.PART_1) {
          question.imageUrl = `https://picsum.photos/400/300?random=${i}`;
        }

        // Add audio for Part 1, 2, 3, 4
        if (
          partInfo.part === ToeicPart.PART_1 ||
          partInfo.part === ToeicPart.PART_2 ||
          partInfo.part === ToeicPart.PART_3 ||
          partInfo.part === ToeicPart.PART_4
        ) {
          question.audioUrl = `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${
            (i % 3) + 1
          }.mp3`;
        }

        questions.push(question);
      }
    });

    return questions;
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
        this.submitTest();
      }
    }, 1000);
  }

  getFormattedTime(): string {
    const hours = Math.floor(this.timeRemaining / 3600);
    const minutes = Math.floor((this.timeRemaining % 3600) / 60);
    const seconds = this.timeRemaining % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  getCurrentQuestion(): ToeicTestQuestionResponse | null {
    if (
      this.questions.length === 0 ||
      this.currentQuestionIndex >= this.questions.length
    ) {
      return null;
    }
    return this.questions[this.currentQuestionIndex];
  }

  selectAnswer(answer: string): void {
    const currentQuestion = this.getCurrentQuestion();
    if (currentQuestion) {
      this.selectedAnswers[currentQuestion.id] = answer;
    }
  }

  getSelectedAnswer(): string | undefined {
    const currentQuestion = this.getCurrentQuestion();
    if (currentQuestion) {
      return this.selectedAnswers[currentQuestion.id];
    }
    return undefined;
  }

  toggleMarkQuestion(): void {
    if (this.markedQuestions.has(this.currentQuestionIndex)) {
      this.markedQuestions.delete(this.currentQuestionIndex);
    } else {
      this.markedQuestions.add(this.currentQuestionIndex);
    }
  }

  isQuestionMarked(): boolean {
    return this.markedQuestions.has(this.currentQuestionIndex);
  }

  goToQuestion(index: number): void {
    if (index >= 0 && index < this.questions.length) {
      this.currentQuestionIndex = index;
    }
  }

  goToPreviousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  goToNextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  getCurrentPart(): {
    part: ToeicPart;
    start: number;
    end: number;
    name: string;
  } | null {
    const currentNum = this.currentQuestionIndex + 1;
    return (
      this.PARTS.find((p) => currentNum >= p.start && currentNum <= p.end) ||
      null
    );
  }

  getQuestionsByPart(part: ToeicPart): ToeicTestQuestionResponse[] {
    return this.questions.filter((q) => q.part === part);
  }

  // For QuestionGridComponent
  get questionGridAnswers(): (string | undefined)[] {
    return this.questions.map((q) => this.selectedAnswers[q.id] || undefined);
  }

  get markedQuestionsArray(): number[] {
    return Array.from(this.markedQuestions);
  }

  handleQuestionGridClick(index: number): void {
    this.goToQuestion(index);
  }

  submitTest(): void {
    if (
      confirm(
        'Bạn có chắc chắn muốn nộp bài? Bạn sẽ không thể chỉnh sửa sau khi nộp.'
      )
    ) {
      this.calculateScores();
      this.isTestCompleted = true;
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
      }
      const results = this.questions.map((q) => {
        const selectedAnswer = this.selectedAnswers[q.id] ?? '';

        return {
          questionId: q.id,
          selectedAnswer,
          correct: selectedAnswer !== '' && q.correctAnswer === selectedAnswer,
        };
      });

      this.historyService
        .addHistory({
          testType: ItemTypeEnum.FULL_TEST,
          testId: this.testId,
          score: this.totalScore,
          answers: results.map((res) => ({
            questionId: res.questionId,
            selectedAnswer: res.selectedAnswer,
            correct: res.correct,
          })),
          takenAt: this.startDate,
          submittedAt: CommonUtils.getNow(),
        })
        .subscribe({
          next: (data: ExamHistoryResponse) => {
          },
          error: (error) => {
},
        });
    }
  }

  calculateScores(): void {
    // Calculate correct answers for listening (Part 1-4) and reading (Part 5-6)
    this.listeningCorrect = 0;
    this.readingCorrect = 0;
    this.listeningTotal = 0;
    this.readingTotal = 0;

    this.questions.forEach((question) => {
      const isListening =
        question.part === ToeicPart.PART_1 ||
        question.part === ToeicPart.PART_2 ||
        question.part === ToeicPart.PART_3 ||
        question.part === ToeicPart.PART_4;

      if (isListening) {
        this.listeningTotal++;
        if (this.selectedAnswers[question.id] === question.correctAnswer) {
          this.listeningCorrect++;
        }
      } else {
        this.readingTotal++;
        if (this.selectedAnswers[question.id] === question.correctAnswer) {
          this.readingCorrect++;
        }
      }
    });

    // Convert correct answers to TOEIC scores
    this.listeningScore = this.convertToToeicScore(
      this.listeningCorrect,
      this.listeningTotal
    );
    this.readingScore = this.convertToToeicScore(
      this.readingCorrect,
      this.readingTotal
    );

    // Calculate total score
    this.totalScore = this.listeningScore + this.readingScore;
  }

  convertToToeicScore(correct: number, total: number): number {
    if (total === 0) return 5;

    // Scale correct answers to 0-100 range (TOEIC standard)
    // If total is 100, use correct directly; otherwise scale proportionally
    const scaledCorrect = Math.round((correct / total) * 100);

    // Clamp to 0-100 range
    const clampedCorrect = Math.max(0, Math.min(100, scaledCorrect));

    // Find exact match in conversion table
    const exactEntry = this.SCORE_CONVERSION_TABLE.find(
      (e) => e.correct === clampedCorrect
    );

    if (exactEntry) {
      // Use listening score (both listening and reading use same conversion)
      return exactEntry.listening;
    }

    // If not found, find nearest entries for interpolation
    let lowerEntry = this.SCORE_CONVERSION_TABLE[0];
    let upperEntry =
      this.SCORE_CONVERSION_TABLE[this.SCORE_CONVERSION_TABLE.length - 1];

    for (let i = 0; i < this.SCORE_CONVERSION_TABLE.length - 1; i++) {
      const current = this.SCORE_CONVERSION_TABLE[i];
      const next = this.SCORE_CONVERSION_TABLE[i + 1];

      if (clampedCorrect >= current.correct && clampedCorrect <= next.correct) {
        lowerEntry = current;
        upperEntry = next;
        break;
      }
    }

    // Linear interpolation
    if (lowerEntry.correct === upperEntry.correct) {
      return lowerEntry.listening;
    }

    const ratio =
      (clampedCorrect - lowerEntry.correct) /
      (upperEntry.correct - lowerEntry.correct);
    return Math.round(
      lowerEntry.listening +
        (upperEntry.listening - lowerEntry.listening) * ratio
    );
  }

  goBack(): void {
    if (this.isTestStarted && !this.isTestCompleted) {
      if (
        confirm(
          'Bạn đang trong quá trình làm bài. Bạn có chắc chắn muốn thoát?'
        )
      ) {
        this.router.navigate(['/full-test/groups', this.groupId, 'tests']);
      }
    } else {
      this.router.navigate(['/full-test/groups', this.groupId, 'tests']);
    }
  }

  getProgress(): string {
    return `${this.currentQuestionIndex + 1}/${this.questions.length}`;
  }

  getAnsweredCount(): number {
    return Object.keys(this.selectedAnswers).length;
  }

  getNumberRange(start: number, end: number): number[] {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  getQuestionAnswer(index: number): string | undefined {
    if (index >= 0 && index < this.questions.length) {
      return this.selectedAnswers[this.questions[index].id];
    }
    return undefined;
  }

  toggleQuestionGrid(): void {
    this.isQuestionGridVisible = !this.isQuestionGridVisible;
  }

  getCorrectPercentage(): number {
    if (this.questions.length === 0) return 0;
    return Math.round(
      ((this.listeningCorrect + this.readingCorrect) / this.questions.length) *
        100
    );
  }
}
