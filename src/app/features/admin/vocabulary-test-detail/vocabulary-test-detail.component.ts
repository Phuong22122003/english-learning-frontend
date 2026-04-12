import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { VocabularyService } from '../../../services/VocabularyService';
import { VocabularyTest } from '../../../models/vocabulary/vocabulary-test.model';
import { VocabularyTestQuestion } from '../../../models/vocabulary/vocabulary-test-question.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-vocabulary-test-detail',
  standalone: true,
  imports: [CommonModule, KeyValuePipe, ConfirmDialogComponent],
  templateUrl: './vocabulary-test-detail.component.html',
  styleUrl: './vocabulary-test-detail.component.scss',
})
export class VocabularyTestDetailComponent implements OnInit, OnDestroy {
  test: VocabularyTest | null = null;
  questions: VocabularyTestQuestion[] = [];
  testInfo: {
    duration: number;
    topicName: string;
    topicId: string;
    testName: string;
    testId: string;
  } | null = null;
  isLoading = true;
  error: string | null = null;
  showDeleteConfirm = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vocabService: VocabularyService
  ) {}

  ngOnInit() {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const testId = params['id'];
      if (testId) {
        this.loadTestDetail(testId);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTestDetail(testId: string) {
    this.isLoading = true;
    this.error = null;

    this.vocabService
      .getTestQuestionsByTestId(testId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.testInfo = {
            duration: data.duration,
            topicName: data.topicName,
            topicId: data.topicId,
            testName: data.name,
            testId: data.id,
          };
          this.questions = data.questions || [];

          // Create a test object for compatibility
          this.test = {
            id: data.id,
            topicId: data.topicId,
            topicName: data.topicName,
            duration: data.duration,
            createdAt: '', // Not provided by this API
            questions: data.questions,
          };

          this.isLoading = false;
        },
        error: (error) => {
this.error = 'Không thể tải chi tiết bài test';
          this.isLoading = false;
        },
      });
  }

  goBack() {
    this.router.navigate(['/admin/vocabulary/tests']);
  }

  editTest() {
    if (this.test) {
      this.router.navigate(['/admin/vocabulary/tests', this.test.id, 'edit']);
    }
  }

  deleteTest() {
    this.showDeleteConfirm = true;
  }

  onConfirmDelete() {
    if (this.test) {
      this.vocabService
        .deleteTest(this.test.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.goBack();
          },
          error: (error) => {
alert('Không thể xóa bài test');
          },
        });
    }
  }

  onCancelDelete() {
    this.showDeleteConfirm = false;
  }

  getCorrectAnswerDisplay(question: VocabularyTestQuestion): string {
    if (question.correctAnswer && question.options) {
      const correctIndex = question.correctAnswer.toLowerCase();
      return question.options[correctIndex] || '';
    }
    return '';
  }

  getCorrectAnswerLabel(question: VocabularyTestQuestion): string {
    if (question.correctAnswer) {
      return `Đáp án ${question.correctAnswer.toUpperCase()}`;
    }
    return 'Đáp án đúng';
  }

  getOptionKey(option: any): string {
    return option.key as string;
  }
}
