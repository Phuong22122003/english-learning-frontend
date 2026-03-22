import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Listening } from '../../../models/listening/listening.model';
import { AudioPlayerComponent } from '../../../shared/audio-player/audio-player.component';

@Component({
  selector: 'app-listening-exercise-form',
  standalone: true,
  imports: [CommonModule, FormsModule, AudioPlayerComponent],
  templateUrl: './listening-exercise-form.component.html',
  styleUrl: './listening-exercise-form.component.scss',
})
export class ListeningExerciseFormComponent implements OnInit, OnDestroy {
  @Input() topicId = '';
  @Input() editingListening: any = null;
  @Output() submit = new EventEmitter<{
    exercises: Partial<Listening>[];
    imageFiles: File[];
    audioFiles: File[];
  }>();
  @Output() cancel = new EventEmitter<void>();

  exercises: Partial<Listening>[] = [
    {
      name: '',
      transcript: '',
      question: '',
      options: { A: '', B: '', C: '', D: '' },
      correctAnswer: '',
    },
  ];

  // File uploads - each exercise has its own files
  exerciseFiles: {
    imageFile: File | null;
    audioFile: File | null;
    audioPreviewUrl: string | null;
    imagePreviewUrl: string | null;
  }[] = [
    {
      imageFile: null,
      audioFile: null,
      audioPreviewUrl: null,
      imagePreviewUrl: null,
    },
  ];

  // Validation state
  showValidationErrors = false;

  // Prevent double submit
  isSubmitting = false;

  ngOnInit() {
    // If editing, populate form with existing data
    if (this.editingListening) {
      this.exercises = [
        {
          name: this.editingListening.name || '',
          transcript: this.editingListening.transcript || '',
          question: this.editingListening.question || '',
          options: {
            A:
              this.editingListening.options?.['A'] ||
              this.editingListening.options?.['a'] ||
              '',
            B:
              this.editingListening.options?.['B'] ||
              this.editingListening.options?.['b'] ||
              '',
            C:
              this.editingListening.options?.['C'] ||
              this.editingListening.options?.['c'] ||
              '',
            D:
              this.editingListening.options?.['D'] ||
              this.editingListening.options?.['d'] ||
              '',
          },
          correctAnswer: this.editingListening.correctAnswer || '',
        },
      ];

      // Set existing image and audio URLs for preview
      this.exerciseFiles = [
        {
          imageFile: null,
          audioFile: null,
          audioPreviewUrl: this.editingListening.audioUrl || null,
          imagePreviewUrl: this.editingListening.imageUrl || null,
        },
      ];
    }
  }

  addExercise() {
    this.exercises.push({
      name: '',
      transcript: '',
      question: '',
      options: { A: '', B: '', C: '', D: '' },
      correctAnswer: '',
    });

    // Add corresponding file entry
    this.exerciseFiles.push({
      imageFile: null,
      audioFile: null,
      audioPreviewUrl: null,
      imagePreviewUrl: null,
    });
  }

  removeExercise(index: number) {
    if (this.exercises.length > 1) {
      // Clean up preview URLs if exist
      if (this.exerciseFiles[index].audioPreviewUrl) {
        URL.revokeObjectURL(this.exerciseFiles[index].audioPreviewUrl!);
      }
      if (this.exerciseFiles[index].imagePreviewUrl) {
        URL.revokeObjectURL(this.exerciseFiles[index].imagePreviewUrl!);
      }

      this.exercises.splice(index, 1);
      this.exerciseFiles.splice(index, 1);
    }
  }

  onImageSelected(event: any, exerciseIndex: number) {
    const file = event.target.files[0];
    if (file) {
      // Clean up previous image preview URL if exists
      if (this.exerciseFiles[exerciseIndex].imagePreviewUrl) {
        URL.revokeObjectURL(this.exerciseFiles[exerciseIndex].imagePreviewUrl!);
      }

      this.exerciseFiles[exerciseIndex].imageFile = file;
      this.exerciseFiles[exerciseIndex].imagePreviewUrl =
        URL.createObjectURL(file);
    }
  }

  onAudioSelected(event: any, exerciseIndex: number) {
    const file = event.target.files[0];
    if (file) {
      // Clean up previous audio preview URL if exists
      if (this.exerciseFiles[exerciseIndex].audioPreviewUrl) {
        URL.revokeObjectURL(this.exerciseFiles[exerciseIndex].audioPreviewUrl!);
      }

      this.exerciseFiles[exerciseIndex].audioFile = file;
      this.exerciseFiles[exerciseIndex].audioPreviewUrl =
        URL.createObjectURL(file);
    }
  }

  removeImageFile(exerciseIndex: number) {
    // Clean up preview URL
    if (this.exerciseFiles[exerciseIndex].imagePreviewUrl) {
      URL.revokeObjectURL(this.exerciseFiles[exerciseIndex].imagePreviewUrl!);
    }

    this.exerciseFiles[exerciseIndex].imageFile = null;
    this.exerciseFiles[exerciseIndex].imagePreviewUrl = null;
  }

  removeAudioFile(exerciseIndex: number) {
    // Clean up preview URL
    if (this.exerciseFiles[exerciseIndex].audioPreviewUrl) {
      URL.revokeObjectURL(this.exerciseFiles[exerciseIndex].audioPreviewUrl!);
    }

    this.exerciseFiles[exerciseIndex].audioFile = null;
    this.exerciseFiles[exerciseIndex].audioPreviewUrl = null;
  }

  onSubmit(event?: Event) {
    // Prevent double submit
    if (this.isSubmitting) {
      return;
    }

    // Prevent default form submission
    if (event) {
      event.preventDefault();
    }

    // Show validation errors
    this.showValidationErrors = true;

    // Validate all exercises
    const validExercises = this.exercises.filter(
      (exercise) =>
        exercise.name &&
        exercise.transcript &&
        exercise.question &&
        exercise.options &&
        Object.values(exercise.options).every((option) => option) &&
        exercise.correctAnswer
    );

    if (validExercises.length > 0) {
      // Set submitting state
      this.isSubmitting = true;

      // Collect files from valid exercises
      const imageFiles: File[] = [];
      const audioFiles: File[] = [];

      validExercises.forEach((_, index) => {
        if (this.exerciseFiles[index].imageFile) {
          imageFiles.push(this.exerciseFiles[index].imageFile!);
        }
        if (this.exerciseFiles[index].audioFile) {
          audioFiles.push(this.exerciseFiles[index].audioFile!);
        }
      });


      this.submit.emit({
        exercises: validExercises,
        imageFiles: imageFiles,
        audioFiles: audioFiles,
      });

      // Reset submitting state after a delay
      setTimeout(() => {
        this.isSubmitting = false;
      }, 1000);
    }
  }

  onCancel() {
    // Reset submitting state
    this.isSubmitting = false;
    this.cancel.emit();
  }

  isExerciseValid(exercise: Partial<Listening>): boolean {
    return !!(
      exercise.name &&
      exercise.transcript &&
      exercise.question &&
      exercise.options &&
      Object.values(exercise.options).every((option) => option) &&
      exercise.correctAnswer
    );
  }

  getValidExercisesCount(): number {
    return this.exercises.filter((exercise) => this.isExerciseValid(exercise))
      .length;
  }

  getImagePreview(exerciseIndex: number): string | null {
    return this.exerciseFiles[exerciseIndex].imagePreviewUrl;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getOptionValue(exerciseIndex: number, optionKey: string): string {
    return this.exercises[exerciseIndex].options?.[optionKey] || '';
  }

  setOptionValue(
    exerciseIndex: number,
    optionKey: string,
    value: string
  ): void {
    if (!this.exercises[exerciseIndex].options) {
      this.exercises[exerciseIndex].options = { A: '', B: '', C: '', D: '' };
    }
    this.exercises[exerciseIndex].options![optionKey] = value;
  }

  // Get option keys for template
  getOptionKeys(): string[] {
    return ['A', 'B', 'C', 'D'];
  }

  ngOnDestroy() {
    // Clean up all object URLs to prevent memory leaks
    this.exerciseFiles.forEach((fileData) => {
      if (fileData.audioPreviewUrl) {
        URL.revokeObjectURL(fileData.audioPreviewUrl);
      }
      if (fileData.imagePreviewUrl) {
        URL.revokeObjectURL(fileData.imagePreviewUrl);
      }
    });
  }

  // Check if field is invalid and should show error
  isFieldInvalid(exerciseIndex: number, fieldName: string): boolean {
    if (!this.showValidationErrors) return false;

    const exercise = this.exercises[exerciseIndex];

    switch (fieldName) {
      case 'name':
        return !exercise.name;
      case 'transcript':
        return !exercise.transcript;
      case 'question':
        return !exercise.question;
      case 'correctAnswer':
        return !exercise.correctAnswer;
      case 'options':
        return (
          !exercise.options ||
          !Object.values(exercise.options).every((option) => option)
        );
      default:
        return false;
    }
  }

  // Get validation message for field
  getFieldErrorMessage(exerciseIndex: number, fieldName: string): string {
    if (!this.isFieldInvalid(exerciseIndex, fieldName)) return '';

    switch (fieldName) {
      case 'name':
        return 'Exercise name is required';
      case 'transcript':
        return 'Transcript is required';
      case 'question':
        return 'Question is required';
      case 'correctAnswer':
        return 'Correct answer is required';
      case 'options':
        return 'All options are required';
      default:
        return 'This field is required';
    }
  }
}
