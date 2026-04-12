import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { VocabularyService } from '../../../services/VocabularyService';
import { VocabularyTestQuestion } from '../../../models/vocabulary/vocabulary-test-question.model';
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
import { QuestionGridComponent } from '../../../shared/question-grid-component/question-grid.component';
import { HistoryService } from '../../../services/HistoryService';
import { ItemTypeEnum } from '../../../models/item-type-enum';
import { ExamHistoryResponse } from '../../../models/response/exam-history-response.model';
import { CommonUtils } from '../../../shared/utils/common';

@Component({
  selector: 'app-assessment-test',
  standalone: true,
  templateUrl: './assessment-test.component.html',
  styleUrls: ['./assessment-test.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    FontAwesomeModule,
    QuestionGridComponent,
  ],
})
export class AssessmentTestComponent implements OnDestroy {
  questions: VocabularyTestQuestion[] = [];
  currentQuestion = 0;
  selectedAnswers: (string | undefined)[] = [];
  showResults = false;
  timeRemaining = 300;
  startDate = CommonUtils.getNow();
  endDate = CommonUtils.getNow();
  // icons
  faChevronRight = faChevronRight;
  faCheckCircle = faCheckCircle;
  faChevronLeft = faChevronLeft;
  faArrowLeft = faArrowLeft;
  faXmarkCircle = faXmarkCircle;
  faStar = faStar;
  faRegularStar = faRegularStar;

  private timerId: any = null;
  testId = '';
  topicName = 'Assessment Test';
  markedQuestions: number[] = [];
  test!:{
    id: string;
    name:string;
    duration: number;
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vocabService: VocabularyService,
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
    this.vocabService.getTestQuestionsByTestId(testId).subscribe({
      next: (data) => {
        this.test = data;
        this.questions = data.questions;
        this.topicName = data.topicName;
        this.timeRemaining = data.duration * 60;
        this.currentQuestion = 0;
        this.selectedAnswers = new Array(this.questions.length).fill(undefined);
        this.showResults = false;
        this.startTimer();
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
        testType: ItemTypeEnum.VOCABULARY,
        duration: this.test.duration,
        testId: this.test.id,
        score: this.calculateScore().percentage,
        name: this.test.name,
        answerGroups : this.questions.map((q, index) => {
          const answer = this.selectedAnswers[index] ?? '';
          return {
            answers:[{
              question: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer,
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
    this.router.navigate(['/vocabulary/topics']);
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
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
      // bỏ mark
      this.markedQuestions = this.markedQuestions.filter(
        (q) => q !== questionIndex
      );
    } else {
      // mark
      this.markedQuestions.push(questionIndex);
    }
  }

  handleQuestionJump(index: number) {
    if (index >= 0 && index < this.questions.length) {
      this.currentQuestion = index;
    }
  }
}
