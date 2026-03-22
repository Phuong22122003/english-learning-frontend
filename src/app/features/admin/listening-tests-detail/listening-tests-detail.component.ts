import { Component, OnInit } from '@angular/core';
import {
  ListeningExercise,
  ListeningExerciseListComponent,
} from '../../../shared/listening-exercise-list/listening-exercise-list.component';
import { Listening } from '../../../models/listening/listening.model';
import { ListeningService } from '../../../services/ListeningService';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

enum State {
  View,
  Create,
}

@Component({
  selector: 'app-listening-tests-detail',
  standalone: true,
  imports: [ListeningExerciseListComponent, CommonModule],
  templateUrl: './listening-tests-detail.component.html',
  styleUrl: './listening-tests-detail.component.scss',
})
export class ListeningTestsDetailComponent implements OnInit {
  State = State;
  currentState = State.View;
  onCreateTest() {
    throw new Error('Method not implemented.');
  }
  listenings: ListeningExercise[] = [];
  testId: string = '';
  testName: string = '';
  showEmptyState = true;
  emptyStateTitle = 'No listening exercises found';
  emptyStateMessage =
    'Start by adding your first listening exercise to this test.';
  emptyStateButtonText = 'Add First Exercise';

  constructor(
    private listeningService: ListeningService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.testId = params.get('testId') || '';
      this.loadListenings();
    });
  }

  loadListenings() {
    this.listeningService.getTestDetail(this.testId).subscribe((data) => {
      this.testName = data.name;
      this.listenings = data.questions.map((question) => ({
        id: question.id,
        name: null,
        audioUrl: question.audioUrl,
        imageUrl: question.imageUrl,
        transcript: question.transcript,
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        createdAt: question.createdAt,
        explaination: question.explaination,
      }));
    });
  }
  goBackToTopics() {
    this.router.navigate(['/admin/listening/tests']);
  }
}
