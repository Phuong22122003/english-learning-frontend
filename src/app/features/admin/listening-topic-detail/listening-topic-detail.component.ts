import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ListeningService } from '../../../services/ListeningService';
import { Listening } from '../../../models/listening/listening.model';
import { ListeningRequest } from '../../../models/request/listening-request';
import { AudioPlayerComponent } from '../../../shared/audio-player/audio-player.component';
import { ListeningExerciseFormComponent } from '../listening-exercise-form/listening-exercise-form.component';
import {
  ListeningExercise,
  ListeningExerciseListComponent,
} from '../../../shared/listening-exercise-list/listening-exercise-list.component';
import { RequestType } from '../../../models/request-type.model';
import { UploadByFileComponent } from '../upload-by-file/upload-by-file.component';
import { environment } from '../../../../environments/environment';
enum State {
  View,
  AddExercise,
  EditExercise,
  UploadExercise,
}

@Component({
  selector: 'app-listening-topic-detail',
  standalone: true,
  imports: [
    CommonModule,
    ListeningExerciseFormComponent,
    ListeningExerciseListComponent,
    UploadByFileComponent,
  ],
  templateUrl: './listening-topic-detail.component.html',
  styleUrl: './listening-topic-detail.component.scss',
})
export class ListeningTopicDetailComponent implements OnInit {
  State = State;
  currentState = State.View;
  topicId = '';
  topicName = '';
  listenings: Listening[] = [];
  isLoading = true;
  isAddingExercise = false;
  isEditingExercise = false;
  listeningExercises: ListeningExercise[] = [];
  selectedListeningForEdit: ListeningExercise | null = null;
  excelTemplate = environment.excelListeningTemplate;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private listeningService: ListeningService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.topicId = params.get('topicId') || '';
      this.loadListenings();
    });
  }

  loadListenings() {
    this.listeningService.getListeningsByTopic(this.topicId).subscribe({
      next: (data) => {
        this.topicName = data.name;
        this.listenings = data.listenings;
        this.listeningExercises = data.listenings.map((listening) => ({
          id: listening.id,
          name: listening.name,
          audioUrl: listening.audioUrl,
          imageUrl: listening.imageUrl,
          transcript: listening.transcript,
          question: listening.question,
          options: listening.options,
          correctAnswer: listening.correctAnswer,
          createdAt: listening.createdAt,
        }));
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      },
    });
  }

  goBack() {
    this.router.navigate(['/admin/listening/manage']);
  }

  onViewListening(listening: ListeningExercise) {
    // Navigate to listening detail or open in modal
  }

  onEditListening(listening: ListeningExercise) {
    this.selectedListeningForEdit = listening;
    this.currentState = State.EditExercise;
  }

  onDeleteListening(listening: ListeningExercise) {
    // Show confirmation dialog and delete
    if (confirm('Are you sure you want to delete this listening exercise?')) {
      this.listeningService.deleteListening(listening.id).subscribe({
        next: () => {
          this.loadListenings();
        },
      });
    }
  }

  changeToAddExercise() {
    this.currentState = State.AddExercise;
  }

  changeToView() {
    this.currentState = State.View;
  }

  onAddExercises(data: {
    exercises: Partial<Listening>[];
    imageFiles: File[];
    audioFiles: File[];
  }) {
    // Prevent double call
    if (this.isAddingExercise) {
      return;
    }

    this.isAddingExercise = true;

    // Prepare exercises as ListeningRequest
    const listeningRequests: ListeningRequest[] = data.exercises.map(
      (exercise, i) => ({
        name: exercise.name || '',
        transcript: exercise.transcript || '',
        question: exercise.question || '',
        options: {
          a: exercise.options?.['A'] || exercise.options?.['a'] || '',
          b: exercise.options?.['B'] || exercise.options?.['b'] || '',
          c: exercise.options?.['C'] || exercise.options?.['c'] || '',
          d: exercise.options?.['D'] || exercise.options?.['d'] || '',
        },
        correctAnswer: exercise.correctAnswer || '',
        audioName: data.audioFiles[i].name,
        imageName: data.imageFiles[i].name,
      })
    );

    this.listeningService
      .addListeningList(
        this.topicId,
        listeningRequests,
        data.imageFiles,
        data.audioFiles
      )
      .subscribe({
        next: (response: Listening[]) => {
          // Reload the listenings list
          this.loadListenings();
          this.changeToView();
          this.isAddingExercise = false;
        },
        error: (err) => {this.isAddingExercise = false;
          // Show error message to user
          alert('Error adding exercises. Please try again.');
        },
      });
  }

  onCancelAddExercise() {
    this.changeToView();
  }

  changeToEditExercise() {
    this.currentState = State.EditExercise;
  }

  onUpdateExercise(data: {
    exercises: Partial<Listening>[];
    imageFiles: File[];
    audioFiles: File[];
  }) {
    // Prevent double call
    if (this.isEditingExercise) {
      return;
    }

    this.isEditingExercise = true;

    if (!this.selectedListeningForEdit) {
      this.isEditingExercise = false;
      return;
    }

    // Prepare exercise as ListeningRequest
    const exercise = data.exercises[0];
    const listeningRequest: ListeningRequest = {
      id: this.selectedListeningForEdit.id || undefined,
      name: exercise.name || this.selectedListeningForEdit.name || '',
      transcript:
        exercise.transcript || this.selectedListeningForEdit.transcript || '',
      question:
        exercise.question || this.selectedListeningForEdit.question || '',
      options: {
        a:
          exercise.options?.['A'] ||
          exercise.options?.['a'] ||
          this.selectedListeningForEdit.options?.['A'] ||
          this.selectedListeningForEdit.options?.['a'] ||
          '',
        b:
          exercise.options?.['B'] ||
          exercise.options?.['b'] ||
          this.selectedListeningForEdit.options?.['B'] ||
          this.selectedListeningForEdit.options?.['b'] ||
          '',
        c:
          exercise.options?.['C'] ||
          exercise.options?.['c'] ||
          this.selectedListeningForEdit.options?.['C'] ||
          this.selectedListeningForEdit.options?.['c'] ||
          '',
        d:
          exercise.options?.['D'] ||
          exercise.options?.['d'] ||
          this.selectedListeningForEdit.options?.['D'] ||
          this.selectedListeningForEdit.options?.['d'] ||
          '',
      },
      correctAnswer:
        exercise.correctAnswer ||
        this.selectedListeningForEdit.correctAnswer ||
        '',
      action: RequestType.UPDATE,
      imageName:
        data.imageFiles.length > 0 ? data.imageFiles[0].name : undefined,
      audioName:
        data.audioFiles.length > 0 ? data.audioFiles[0].name : undefined,
    };

    this.listeningService
      .updateListening([listeningRequest], data.imageFiles, data.audioFiles)
      .subscribe({
        next: (response: Listening) => {
          // Reload the listenings list
          this.loadListenings();
          this.changeToView();
          this.selectedListeningForEdit = null;
          this.isEditingExercise = false;
        },
        error: (err) => {
          this.isEditingExercise = false;
          // Show error message to user
          alert('Error updating exercise. Please try again.');
        },
      });
  }

  onCancelEditExercise() {
    this.selectedListeningForEdit = null;
    this.changeToView();
  }

  changeToUploadExercise() {
    this.currentState = State.UploadExercise;
  }

  onUploadExercises(files: {
    excelFile: File;
    imageFiles: File[];
    audioFiles: File[];
  }) {
    if (this.topicId) {
      this.listeningService
        .uploadListeningsByFile(
          this.topicId,
          files.excelFile,
          files.imageFiles,
          files.audioFiles
        )
        .subscribe({
          next: (response: Listening[]) => {
            this.loadListenings();
            this.changeToView();
          },
          error: (err) => {this.changeToView();
          },
        });
    }
  }
}
