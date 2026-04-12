import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft,
  faChevronRight,
  faChevronLeft,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faStar,
} from '@fortawesome/free-solid-svg-icons';
import { AudioPlayerComponent } from '../../../shared/audio-player/audio-player.component';
import { QuestionGridComponent } from '../../../shared/question-grid-component/question-grid.component';
import { ListeningService } from '../../../services/ListeningService';
import {
  ListeningTest,
  ListeningTestQuestion,
} from '../../../models/listening/listening-test.model';
import { HistoryService } from '../../../services/HistoryService';
import { ItemTypeEnum } from '../../../models/item-type-enum';
import { ExamHistoryResponse } from '../../../models/response/exam-history-response.model';
import { CommonUtils } from '../../../shared/utils/common';

@Component({
  selector: 'app-listening-test',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FontAwesomeModule,
    AudioPlayerComponent,
    QuestionGridComponent,
  ],
  templateUrl: './listening-test.component.html',
})
export class ListeningTestComponent {
  // FontAwesome icons
  faArrowLeft = faArrowLeft;
  faChevronRight = faChevronRight;
  faChevronLeft = faChevronLeft;
  faClock = faClock;
  faCheckCircle = faCheckCircle;
  faTimesCircle = faTimesCircle;
  faRegularStar = faStar;

  testId = '';
  questions: ListeningTestQuestion[] = [];
  currentQuestionIndex = 0;
  selectedAnswers: { [key: string]: string } = {};
  timeRemaining = 0;
  isTestStarted = false;
  isTestCompleted = false;
  isLoading = false;
  duration = 0;
  title = '';
  topicName = '';
  startDate = '';
  markedQuestions: number[] = [];
  // For QuestionGridComponent
  get questionGridAnswers(): (string | undefined)[] {
    if (!this.questions) return [];
    return this.questions.map((_, index) => {
      const question = this.questions[index];
      return this.selectedAnswers[question.id] || undefined;
    });
  }

  testResults: {
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    details: Array<{
      questionId: string;
      correct: boolean;
      selectedAnswer: string;
      correctAnswer: string;
    }>;
  } | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private listeningService: ListeningService,
    private historyService: HistoryService
  ) {
    this.route.paramMap.subscribe((params) => {
      this.testId = params.get('testId') || '';
      if (this.testId) {
        this.loadTestData();
      }
    });
  }

  loadTestData() {
    this.isLoading = true;
    this.listeningService.getTestDetail(this.testId).subscribe({
      next: (testData) => {
        this.questions = testData.questions;
        this.resetTest();
        this.duration = testData.duration;
        this.title = testData.name;
        this.topicName = testData.name;
        this.isLoading = false;
      },
      error: (err) => {
this.isLoading = false;
      },
    });
  }

  get currentQuestion(): ListeningTestQuestion | undefined {
    return this.questions[this.currentQuestionIndex];
  }

  startTest() {
    if (!this.questions) return;
    this.isTestStarted = true;
    this.timeRemaining = this.duration * 60; // Convert minutes to seconds
    this.startDate = CommonUtils.getNow();
    const timer = setInterval(() => {
      if (!this.isTestStarted || this.isTestCompleted) {
        clearInterval(timer);
        return;
      }
      if (this.timeRemaining <= 1) {
        this.handleFinishTest();
        clearInterval(timer);
      }
      this.timeRemaining -= 1;
    }, 1000);
  }

  handleAnswerSelect(questionId: string, optionKey: string) {
    if (this.isTestCompleted) return;
    this.selectedAnswers[questionId] = optionKey;
  }

  handleNextQuestion() {
    if (
      this.questions &&
      this.currentQuestionIndex < this.questions.length - 1
    ) {
      this.currentQuestionIndex++;
    }
  }

  handlePreviousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  handleFinishTest() {
    if (!this.questions) return;

    let correctCount = 0;
    const details = this.questions.map((q) => {
      const userAnswer = this.selectedAnswers[q.id] || '';
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) correctCount++;
      return {
        questionId: q.id,
        correct: isCorrect,
        selectedAnswer: userAnswer,
        correctAnswer: q.correctAnswer,
      };
    });

    const score = Math.round((correctCount / this.questions.length) * 100);
    this.testResults = {
      score,
      totalQuestions: this.questions.length,
      correctAnswers: correctCount,
      incorrectAnswers: this.questions.length - correctCount,
      details,
    };

    this.historyService
      .addHistory({
        testType: ItemTypeEnum.LISTENING,
        testId: this.testId,
        name: this.title,
        score: score,
        duration: this.duration,
        answerGroups: this.questions.map((q, index) => {
          const answer = this.selectedAnswers[index] ?? '';
          return {
            answers: [{
              question: q.question,
              correctAnswer: q.correctAnswer,
              options: q.options,
              selectedAnswer: answer
            }]
          };
        }),
        takenAt: this.startDate,
        submittedAt: CommonUtils.getNow(),
      })
      .subscribe({
        next: (data: ExamHistoryResponse) => {
        },
        error: (err: any) => {},
      });
    this.isTestCompleted = true;
  }

  resetTest() {
    this.currentQuestionIndex = 0;
    this.selectedAnswers = {};
    this.isTestStarted = false;
    this.isTestCompleted = false;
    this.testResults = null;
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  goBack() {
    this.router.navigate(['/listening/topics']);
  }

  getUserAnswer(q: ListeningTestQuestion, detail: any): string {
    if (!detail?.selectedAnswer) return 'No answer selected';
    return q.options[detail.selectedAnswer] || detail.selectedAnswer;
  }

  getCorrectAnswer(q: ListeningTestQuestion): string {
    return q.options[q.correctAnswer] || q.correctAnswer;
  }

  getLetter(index: number): string {
    return String.fromCharCode(65 + index); // 65 = A
  }

  getOptionKeys(question: ListeningTestQuestion): string[] {
    return Object.keys(question.options);
  }

  handleQuestionGridClick(questionIndex: number) {
    if (questionIndex >= 0 && questionIndex < this.questions.length) {
      this.currentQuestionIndex = questionIndex;
    }
  }

  formatDateForAPI(dateString: string): string {
    // Convert datetime-local format to ISO string for API
    if (!dateString) return '';
    return dateString.length === 16 ? `${dateString}:00` : dateString;
  }

  toggleMark(index: number) {
    if (this.markedQuestions.includes(index)) {
      // bỏ mark
      this.markedQuestions = this.markedQuestions.filter((q) => q !== index);
    } else {
      // mark
      this.markedQuestions.push(index);
    }
  }
}
