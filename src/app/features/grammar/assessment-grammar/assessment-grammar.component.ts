import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faStar as faRegularStar } from '@fortawesome/free-regular-svg-icons';
import {
  faCheckCircle,
  faChevronLeft,
  faChevronRight,
  faArrowLeft,
  faXmarkCircle,
  faStar,
} from '@fortawesome/free-solid-svg-icons';
import { GrammarService } from '../../../services/GrammarService';
import { QuestionGridComponent } from '../../../shared/question-grid-component/question-grid.component';
import { GrammarTestQuestion } from '../../../models/grammar/grammar-test-question.model';
import { HistoryService } from '../../../services/HistoryService';

import { ItemTypeEnum } from '../../../models/item-type-enum';
import { ExamHistoryResponse } from '../../../models/response/exam-history-response.model';
import { CommonUtils } from '../../../shared/utils/common';

@Component({
  selector: 'app-assessment-grammar',
  standalone: true,
  templateUrl: './assessment-grammar.component.html',
  styleUrls: ['./assessment-grammar.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    FontAwesomeModule,
    QuestionGridComponent,
  ],
})
export class AssessmentGrammarComponent implements OnDestroy {
  questions: GrammarTestQuestion[] = [];
  currentQuestion = 0;
  selectedAnswers: (string | undefined)[] = [];
  showResults = false;
  timeRemaining = 300;

  // icons
  faChevronRight = faChevronRight;
  faCheckCircle = faCheckCircle;
  faChevronLeft = faChevronLeft;
  faArrowLeft = faArrowLeft;
  faXmarkCircle = faXmarkCircle;
  faStar = faStar;
  faRegularStar = faRegularStar;
  startDate = '';

  private timerId: any = null;
  testId = '';
  grammarName = 'Grammar Test';
  testName = 'Test';
  markedQuestions: number[] = [];
  duration!: number;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private grammarService: GrammarService,
    private historyService: HistoryService
  ) {
    this.route.paramMap.subscribe((params) => {
      this.testId = params.get('testId') || '';
      if (this.testId) {
        this.loadQuestions(this.testId);
      }
    });
  }

  loadQuestions(testId: string) {
    this.grammarService.getTestQuestionsByTestId(testId).subscribe({
      next: (data) => {
        this.questions = data.grammarTestQuestions;
        this.grammarName = data.grammarName;
        this.timeRemaining = data.duration * 60;
        this.testName = data.testName;
        this.duration = data.duration;
        this.currentQuestion = 0;
        this.selectedAnswers = new Array(this.questions.length).fill(undefined);
        this.showResults = false;
        this.startTimer();
        this.startDate = CommonUtils.getNow();
      },
      error: (err) => {
},
    });
  }

  startTimer() {
    this.clearTimer();
    this.timerId = setInterval(() => {
      if (this.timeRemaining > 0 && !this.showResults) {
        this.timeRemaining--;
      } else {
        this.clearTimer();
        if (!this.showResults) this.handleFinish();
      }
    }, 1000);
  }

  handleAnswerSelect(key: string) {
    this.selectedAnswers[this.currentQuestion] = key;
  }

  handleNext() {
    if (this.currentQuestion < this.questions.length - 1) {
      this.currentQuestion++;
    }
  }

  handlePrevious() {
    if (this.currentQuestion > 0) {
      this.currentQuestion--;
    }
  }

  handleFinish() {
    this.showResults = true;
    this.clearTimer();
    this.historyService
      .addHistory({
        testType: ItemTypeEnum.GRAMMAR,
        testId: this.testId,
        score: this.calculateScore().percentage,
        name: this.testName,
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
        error: (err: any) => {
},
      });
  }

  calculateScore() {
    let correct = 0;
    this.questions.forEach((q, i) => {
      if (this.selectedAnswers[i] === q.correctAnswer) correct++;
    });
    return {
      correct,
      total: this.questions.length,
      percentage: Math.round((correct / this.questions.length) * 100),
    };
  }

  formatTime(sec: number) {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  goBack() {
    this.router.navigate(['/grammar/topics']);
  }

  retakeTest() {
    this.showResults = false;
    this.currentQuestion = 0;
    this.selectedAnswers = new Array(this.questions.length).fill(undefined);
    this.startTimer();
  }

  private clearTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  toggleMark(questionIndex: number) {
    if (this.markedQuestions.includes(questionIndex)) {
      this.markedQuestions = this.markedQuestions.filter(
        (q) => q !== questionIndex
      );
    } else {
      this.markedQuestions.push(questionIndex);
    }
  }

  handleQuestionJump(index: number) {
    if (index >= 0 && index < this.questions.length) {
      this.currentQuestion = index;
    }
  }
}
