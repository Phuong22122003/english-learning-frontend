import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faSave,
  faTimes,
  faFileAlt,
  faPlus,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { ToeicTestRequest } from '../../../../../../models/request/toeic-test-request-model';
import { ToeicTestResponse } from '../../../../../../models/response/toeict-test-response.model';
import { ToeicPart } from '../../../../../../models/toeic-part.enum';
import { ToeicTestService } from '../../../../../../services/ToeicTestService';
import { RequestType } from '../../../../../../models/request-type.model';
import { AudioPlayerComponent } from '../../../../../../shared/audio-player/audio-player.component';

@Component({
  selector: 'app-full-test-add',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    AudioPlayerComponent,
  ],
  templateUrl: './full-test-add.component.html',
  styleUrl: './full-test-add.component.scss',
})
export class FullTestAddComponent implements OnInit {
  @Input() initialData: ToeicTestResponse | null = null;
  @Input() isEditMode: boolean = false;
  @Input() groupId: string = '';
  @Output() save = new EventEmitter<ToeicTestRequest>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  isSubmitting = false;
  error: string | null = null;

  // FontAwesome icons
  faSave = faSave;
  faTimes = faTimes;
  faFileAlt = faFileAlt;
  faPlus = faPlus;
  faTrash = faTrash;

  // TOEIC Parts
  ToeicPart = ToeicPart;
  toeicParts = [
    { value: ToeicPart.PART_1, label: 'Part 1' },
    { value: ToeicPart.PART_2, label: 'Part 2' },
    { value: ToeicPart.PART_3, label: 'Part 3' },
    { value: ToeicPart.PART_4, label: 'Part 4' },
    { value: ToeicPart.PART_5, label: 'Part 5' },
    { value: ToeicPart.PART_6, label: 'Part 6' },
  ];

  // Options keys
  optionKeys = ['a', 'b', 'c', 'd'];

  // Track original question IDs for edit mode
  originalQuestionIds: Set<string> = new Set();

  // Shared images pool - one image can be used by multiple questions
  sharedImages: {
    id: string;
    file: File | null;
    previewUrl: string | null;
    name: string;
    usedByQuestions: number[]; // Array of question indices using this image
  }[] = [];

  // File uploads for each question
  questionFiles: {
    imageId: string | null; // Reference to shared image ID
    audioFile: File | null;
    audioPreviewUrl: string | null;
    audioName: string | null;
  }[] = [];

  // Track deleted question IDs
  deletedQuestionIds: string[] = [];

  private imageIdCounter = 0;

  constructor(
    private fb: FormBuilder,
    private toeicTestService: ToeicTestService
  ) {}

  ngOnInit(): void {
    this.isEditMode = this.isEditMode || !!this.initialData;
    this.initializeForm();
  }

  get questionsFormArray(): FormArray {
    return this.form.get('questions') as FormArray;
  }

  initializeForm(): void {
    this.form = this.fb.group({
      name: [
        this.initialData?.name || '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(200),
        ],
      ],
      questions: this.fb.array([]),
    });

    // Load questions if editing
    if (this.initialData?.questions && this.initialData.questions.length > 0) {
      this.initialData.questions.forEach((q) => {
        this.addQuestion(q);
        if (q.id) {
          this.originalQuestionIds.add(q.id);
        }
      });
    } else {
      // Add one empty question by default
      this.addQuestion();
    }
  }

  addQuestion(questionData?: any): void {
    const questionGroup = this.fb.group({
      id: [questionData?.id || null], // Track question ID for edit mode
      question: [questionData?.question || '', Validators.required],
      options: this.fb.group({
        a: [questionData?.options?.['a'] || '', Validators.required],
        b: [questionData?.options?.['b'] || '', Validators.required],
        c: [questionData?.options?.['c'] || '', Validators.required],
        d: [questionData?.options?.['d'] || '', Validators.required],
      }),
      correctAnswer: [questionData?.correctAnswer || '', Validators.required],
      part: [questionData?.part || ToeicPart.PART_1, Validators.required],
      explanation: [questionData?.explanation || ''],
    });

    this.questionsFormArray.push(questionGroup);

    // Initialize file uploads for this question
    const questionIndex = this.questionsFormArray.length - 1;
    let imageId: string | null = null;

    // If editing and has image, try to find or create shared image
    if (questionData?.imageUrl) {
      const imageName = this.extractFileName(questionData.imageUrl);
      // Try to find existing shared image with same name
      const existingImage = this.sharedImages.find(
        (img) => img.name === imageName
      );
      if (existingImage) {
        imageId = existingImage.id;
        existingImage.usedByQuestions.push(questionIndex);
      } else {
        // Create new shared image entry
        imageId = `img_${this.imageIdCounter++}`;
        this.sharedImages.push({
          id: imageId,
          file: null,
          previewUrl: questionData.imageUrl,
          name: imageName,
          usedByQuestions: [questionIndex],
        });
      }
    }

    this.questionFiles.push({
      imageId: imageId,
      audioFile: null,
      audioPreviewUrl: questionData?.audioUrl || null,
      audioName: questionData?.audioUrl
        ? this.extractFileName(questionData.audioUrl)
        : null,
    });
  }

  removeQuestion(index: number): void {
    if (this.questionsFormArray.length > 1) {
      const questionGroup = this.getQuestionFormGroup(index);
      const questionId = questionGroup.get('id')?.value;

      // If editing and question has ID, mark it for deletion
      if (
        this.isEditMode &&
        questionId &&
        this.originalQuestionIds.has(questionId)
      ) {
        this.deletedQuestionIds.push(questionId);
        this.originalQuestionIds.delete(questionId);
      }

      // Remove image reference
      const imageId = this.questionFiles[index]?.imageId;
      if (imageId) {
        const sharedImage = this.sharedImages.find((img) => img.id === imageId);
        if (sharedImage) {
          sharedImage.usedByQuestions = sharedImage.usedByQuestions.filter(
            (qIdx) => qIdx !== index
          );
          // If no questions use this image, remove it
          if (sharedImage.usedByQuestions.length === 0) {
            if (
              sharedImage.previewUrl &&
              sharedImage.previewUrl.startsWith('blob:')
            ) {
              URL.revokeObjectURL(sharedImage.previewUrl);
            }
            this.sharedImages = this.sharedImages.filter(
              (img) => img.id !== imageId
            );
          }
        }
      }

      // Clean up audio preview URL
      if (this.questionFiles[index]?.audioPreviewUrl) {
        URL.revokeObjectURL(this.questionFiles[index].audioPreviewUrl!);
      }

      // Update indices for remaining questions
      this.sharedImages.forEach((img) => {
        img.usedByQuestions = img.usedByQuestions
          .map((qIdx) => (qIdx > index ? qIdx - 1 : qIdx))
          .filter((qIdx) => qIdx !== index);
      });

      this.questionsFormArray.removeAt(index);
      this.questionFiles.splice(index, 1);
    }
  }

  getQuestionFormGroup(index: number): FormGroup {
    return this.questionsFormArray.at(index) as FormGroup;
  }

  getOptionsFormGroup(index: number): FormGroup {
    return this.getQuestionFormGroup(index).get('options') as FormGroup;
  }

  getQuestionControl(index: number, controlName: string): FormControl {
    return this.getQuestionFormGroup(index).get(controlName) as FormControl;
  }

  getOptionControl(index: number, optionKey: string): FormControl {
    return this.getOptionsFormGroup(index).get(optionKey) as FormControl;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.questionsFormArray.length === 0) {
      this.error = 'Vui lòng thêm ít nhất một câu hỏi.';
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    const formValue = this.form.value;
    const imageFiles: File[] = [];
    const audioFiles: File[] = [];

    // Build questions with actions and file names
    const questions = formValue.questions.map((q: any, index: number) => {
      const questionId = q.id;
      const fileInfo = this.questionFiles[index];

      // Determine action
      let action: RequestType;
      if (!questionId) {
        // New question
        action = RequestType.ADD;
      } else if (this.originalQuestionIds.has(questionId)) {
        // Existing question being updated
        action = RequestType.UPDATE;
      } else {
        // This shouldn't happen, but default to ADD
        action = RequestType.ADD;
      }

      // Collect audio file for upload
      if (fileInfo.audioFile) {
        audioFiles.push(fileInfo.audioFile);
      }

      // Get image info from shared images
      let imageName: string | undefined = undefined;
      if (fileInfo.imageId) {
        const sharedImage = this.sharedImages.find(
          (img) => img.id === fileInfo.imageId
        );
        if (sharedImage) {
          // Only add file once per unique image
          if (
            sharedImage.file &&
            !imageFiles.some((f) => f === sharedImage.file)
          ) {
            imageFiles.push(sharedImage.file);
          }
          imageName = sharedImage.name;
        }
      }

      return {
        id: questionId || undefined,
        question: q.question.trim(),
        options: {
          a: q.options.a.trim(),
          b: q.options.b.trim(),
          c: q.options.c.trim(),
          d: q.options.d.trim(),
        },
        correctAnswer: q.correctAnswer.toLowerCase().trim(),
        part: q.part,
        explanation: q.explanation?.trim() || undefined,
        action: action,
        imageName: imageName,
        audioName: fileInfo.audioFile
          ? fileInfo.audioFile.name
          : fileInfo.audioName || undefined,
      };
    });

    // Add deleted questions
    this.deletedQuestionIds.forEach((id) => {
      questions.push({
        id: id,
        action: RequestType.DELETE,
      } as any);
    });

    const request: ToeicTestRequest = {
      name: formValue.name.trim(),
      questions: questions,
    };

    // TODO: Implement API call
    if (this.isEditMode && this.initialData) {
      this.toeicTestService
        .updateTest(request, this.initialData.id, imageFiles, audioFiles)
        .subscribe({
          next: (response) => {
            this.isSubmitting = false;
            this.save.emit(response);
          },
          error: (error) => {
            this.isSubmitting = false;
            this.error = 'Không thể cập nhật bài test. Vui lòng thử lại.';},
        });
    } else {
      this.toeicTestService
        .addTest(request, this.groupId, imageFiles, audioFiles)
        .subscribe({
          next: (response) => {
            this.isSubmitting = false;
            this.save.emit(response);
          },
          error: (error) => {
            this.isSubmitting = false;
            this.error = 'Không thể tạo bài test. Vui lòng thử lại.';},
        });
    }
  }

  // File upload handlers
  onImageSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Remove previous image reference
      const oldImageId = this.questionFiles[index].imageId;
      if (oldImageId) {
        const oldImage = this.sharedImages.find((img) => img.id === oldImageId);
        if (oldImage) {
          oldImage.usedByQuestions = oldImage.usedByQuestions.filter(
            (qIdx) => qIdx !== index
          );
          if (oldImage.usedByQuestions.length === 0) {
            if (
              oldImage.previewUrl &&
              oldImage.previewUrl.startsWith('blob:')
            ) {
              URL.revokeObjectURL(oldImage.previewUrl);
            }
            this.sharedImages = this.sharedImages.filter(
              (img) => img.id !== oldImageId
            );
          }
        }
      }

      // Create new shared image
      const imageId = `img_${this.imageIdCounter++}`;
      const previewUrl = URL.createObjectURL(file);

      this.sharedImages.push({
        id: imageId,
        file: file,
        previewUrl: previewUrl,
        name: file.name,
        usedByQuestions: [index],
      });

      this.questionFiles[index].imageId = imageId;
    }
  }

  selectSharedImage(imageId: string, questionIndex: number): void {
    const sharedImage = this.sharedImages.find((img) => img.id === imageId);
    if (!sharedImage) return;

    // Validate: questions using same image must be consecutive and same part
    const currentPart = this.getQuestionControl(questionIndex, 'part').value;
    const usedIndices = [...sharedImage.usedByQuestions, questionIndex].sort(
      (a, b) => a - b
    );

    // Check if all questions are consecutive
    const isConsecutive = usedIndices.every(
      (idx, i) => i === 0 || idx === usedIndices[i - 1] + 1
    );

    // Check if all questions have same part
    const allSamePart = usedIndices.every(
      (idx) => this.getQuestionControl(idx, 'part').value === currentPart
    );

    if (!isConsecutive || !allSamePart) {
      this.error =
        'Các câu hỏi dùng chung một ảnh phải có thứ tự liên tiếp và cùng part.';
      setTimeout(() => {
        this.error = null;
      }, 5000);
      return;
    }

    // Remove previous image reference
    const oldImageId = this.questionFiles[questionIndex].imageId;
    if (oldImageId && oldImageId !== imageId) {
      const oldImage = this.sharedImages.find((img) => img.id === oldImageId);
      if (oldImage) {
        oldImage.usedByQuestions = oldImage.usedByQuestions.filter(
          (qIdx) => qIdx !== questionIndex
        );
        if (oldImage.usedByQuestions.length === 0) {
          if (oldImage.previewUrl && oldImage.previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(oldImage.previewUrl);
          }
          this.sharedImages = this.sharedImages.filter(
            (img) => img.id !== oldImageId
          );
        }
      }
    }

    // Add to shared image
    if (!sharedImage.usedByQuestions.includes(questionIndex)) {
      sharedImage.usedByQuestions.push(questionIndex);
    }

    this.questionFiles[questionIndex].imageId = imageId;
  }

  removeImageFromQuestion(questionIndex: number): void {
    const imageId = this.questionFiles[questionIndex].imageId;
    if (!imageId) return;

    const sharedImage = this.sharedImages.find((img) => img.id === imageId);
    if (sharedImage) {
      sharedImage.usedByQuestions = sharedImage.usedByQuestions.filter(
        (qIdx) => qIdx !== questionIndex
      );
      // If no questions use this image, remove it
      if (sharedImage.usedByQuestions.length === 0) {
        if (
          sharedImage.previewUrl &&
          sharedImage.previewUrl.startsWith('blob:')
        ) {
          URL.revokeObjectURL(sharedImage.previewUrl);
        }
        this.sharedImages = this.sharedImages.filter(
          (img) => img.id !== imageId
        );
      }
    }

    this.questionFiles[questionIndex].imageId = null;
  }

  getSharedImageForQuestion(questionIndex: number) {
    const imageId = this.questionFiles[questionIndex]?.imageId;
    if (!imageId) return null;
    return this.sharedImages.find((img) => img.id === imageId) || null;
  }

  getAvailableImagesForQuestion(questionIndex: number) {
    const currentPart = this.getQuestionControl(questionIndex, 'part').value;
    // Return images that are either:
    // 1. Not used yet
    // 2. Used by questions in the same part and can be extended consecutively
    return this.sharedImages.filter((img) => {
      if (img.usedByQuestions.length === 0) return true;

      // Check if all questions using this image have same part
      const allSamePart = img.usedByQuestions.every(
        (idx) => this.getQuestionControl(idx, 'part').value === currentPart
      );

      if (!allSamePart) return false;

      // Check if questionIndex can be added consecutively
      const usedIndices = [...img.usedByQuestions, questionIndex].sort(
        (a, b) => a - b
      );
      return usedIndices.every(
        (idx, i) => i === 0 || idx === usedIndices[i - 1] + 1
      );
    });
  }

  onAudioSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Clean up previous preview URL
      if (this.questionFiles[index].audioPreviewUrl) {
        URL.revokeObjectURL(this.questionFiles[index].audioPreviewUrl!);
      }

      this.questionFiles[index].audioFile = file;
      this.questionFiles[index].audioPreviewUrl = URL.createObjectURL(file);
      this.questionFiles[index].audioName = file.name;
    }
  }

  removeAudioFile(index: number): void {
    // Clean up preview URL
    if (this.questionFiles[index].audioPreviewUrl) {
      URL.revokeObjectURL(this.questionFiles[index].audioPreviewUrl!);
    }

    this.questionFiles[index].audioFile = null;
    this.questionFiles[index].audioPreviewUrl = null;
    this.questionFiles[index].audioName = null;
  }

  extractFileName(url: string): string {
    // Extract filename from URL
    const parts = url.split('/');
    return parts[parts.length - 1];
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
