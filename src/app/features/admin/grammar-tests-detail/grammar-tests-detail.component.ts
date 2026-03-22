import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GrammarService } from '../../../services/GrammarService';
import { ActivatedRoute, Router } from '@angular/router';
import { GrammarTest } from '../../../models/grammar/grammar-test.model';
import { GrammarTestQuestion } from '../../../models/grammar/grammar-test-question.model';
import {
  ListeningExercise,
  ListeningExerciseListComponent,
} from '../../../shared/listening-exercise-list/listening-exercise-list.component';

@Component({
  selector: 'app-grammar-tests-detail',
  standalone: true,
  imports: [CommonModule, ListeningExerciseListComponent],
  templateUrl: './grammar-tests-detail.component.html',
  styleUrl: './grammar-tests-detail.component.scss',
})
export class GrammarTestsDetailComponent implements OnInit {
  testId: string = '';
  tests: GrammarTestQuestion[] = [];
  exercises: ListeningExercise[] = [];
  testName: string = '';
  showEmptyState = true;
  emptyStateTitle = 'No grammar exercises found';
  emptyStateMessage =
    'Start by adding your first grammar exercise to this test.';
  emptyStateButtonText = 'Add First Exercise';
  constructor(
    private grammarService: GrammarService,
    private route: ActivatedRoute,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.testId = this.route.snapshot.paramMap.get('testId')!;
    this.grammarService
      .getTestQuestionsByTestId(this.testId)
      .subscribe((data) => {
        this.tests = data.grammarTestQuestions;
        this.exercises = data.grammarTestQuestions.map((question) => ({
          id: question.id,
          name: null,
          audioUrl: '',
          imageUrl: '',
          transcript: '',
          question: question.question,
          options: question.options,
          correctAnswer: question.correctAnswer,
          createdAt: '',
          explaination: question.explaination || '',
        }));
        this.testName = data.testName;
      });
  }

  goBackToTopics() {
    this.router.navigate(['/admin/grammar/tests']);
  }
}
