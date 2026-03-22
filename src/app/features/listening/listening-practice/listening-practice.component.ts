import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft,
  faChevronRight,
  faChevronLeft,
  faStar,
} from '@fortawesome/free-solid-svg-icons';
import { AudioPlayerComponent } from '../../../shared/audio-player/audio-player.component';
import { QuestionGridComponent } from '../../../shared/question-grid-component/question-grid.component';
import { ListeningService } from '../../../services/ListeningService';
import { Listening } from '../../../models/listening/listening.model';
import { Subject, takeUntil } from 'rxjs';
import { faStar as faRegularStar } from '@fortawesome/free-regular-svg-icons';
// Using Listening model from the service

@Component({
  selector: 'app-listening-practice',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FontAwesomeModule,
    AudioPlayerComponent,
    QuestionGridComponent,
  ],
  templateUrl: './listening-practice.component.html',
})
export class ListeningPracticeComponent implements OnInit, OnDestroy {
  faArrowLeft = faArrowLeft;
  faChevronRight = faChevronRight;
  faChevronLeft = faChevronLeft;
  faRegularStar = faStar;
  isFinish = false;
  topic = '';
  exercises: Listening[] = [];
  currentIndex = 0;
  currentQuestionIndex = 0;
  selectedAnswers: number[] = [];
  showAnswers = false;
  completedExercises = new Set<number>();
  topicTitle = '';
  isLoading = true;
  error: string | null = null;
  gridQuestion: string[] = [];
  markedQuestions: number[] = [];
  // For QuestionGridComponent
  get questionGridAnswers(): (string | undefined)[] {
    return this.gridQuestion;
  }

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private listeningService: ListeningService
  ) {}

  ngOnInit() {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.topic = params['topic'];
      if (this.topic) {
        this.loadListenings();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadListenings() {
    this.isLoading = true;
    this.error = null;

    this.listeningService
      .getListeningsByTopic(this.topic)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.exercises = res.listenings;
          this.topicTitle = res.name;
          this.isLoading = false;
        },
        error: (error) => {this.error = 'Không thể tải danh sách bài luyện nghe';
          this.isLoading = false;
        },
      });
  }

  get currentExercise(): Listening | null {
    return this.exercises[this.currentIndex] || null;
  }

  get currentQuestion(): Listening | null {
    return this.currentExercise;
  }

  handleAnswerSelect(optionIndex: number) {
    if (this.showAnswers) return;
    // Chỉ cho phép chọn 1 đáp án
    this.gridQuestion[this.currentIndex] = this.indexToLetter(optionIndex);
    this.selectedAnswers = [optionIndex];
  }

  indexToLetter(index: number): string {
    const letters = ['a', 'b', 'c', 'd'];
    return letters[index] ?? '';
  }

  handleCheckAnswers() {
    this.showAnswers = true;
  }

  handleNextQuestion() {
    if (this.currentIndex < this.exercises.length - 1) {
      this.currentIndex++;
      this.resetSelection();
    }
  }

  handlePreviousQuestion() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.resetSelection();
    }
  }

  handleNextExercise() {
    if (this.currentIndex < this.exercises.length - 1) {
      this.completedExercises.add(parseInt(this.currentExercise!.id));
      this.currentIndex++;
      this.resetSelection();
    }
  }

  handlePreviousExercise() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.resetSelection();
    }
  }

  isCorrectAnswer(optionKey: string): boolean {
    return (
      this.currentQuestion?.correctAnswer.toLowerCase() ===
      optionKey.toLowerCase()
    );
  }

  isSelectedCorrect(): boolean {
    if (!this.currentQuestion || this.selectedAnswers.length === 0)
      return false;
    const selectedOptionKey = this.getSelectedOptionKey();
    return (
      selectedOptionKey.toLowerCase() ===
      this.currentQuestion.correctAnswer.toLowerCase()
    );
  }

  getSelectedOptionKey(): string {
    if (this.selectedAnswers.length === 0) return '';
    const optionKeys = Object.keys(this.currentQuestion?.options || {});
    return optionKeys[this.selectedAnswers[0]] || '';
  }

  resetSelection() {
    this.selectedAnswers = [];
    this.showAnswers = false;
  }

  reset() {
    this.currentIndex = 0;
    this.selectedAnswers = [];
    this.showAnswers = false;
    this.completedExercises.clear();
  }

  goBack() {
    this.router.navigate(['/listening/topics']);
  }
  getLetter(index: number): string {
    return String.fromCharCode(65 + index); // 65 = A
  }

  handleQuestionGridClick(exerciseIndex: number) {
    if (exerciseIndex >= 0 && exerciseIndex < this.exercises.length) {
      this.currentIndex = exerciseIndex;
      this.resetSelection();
    }
  }

  finish() {
    this.isFinish = true;
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
