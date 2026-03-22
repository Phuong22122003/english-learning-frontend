import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RequestType } from '../../models/request-type.model';

export enum TestType {
  VOCABULARY = 'vocabulary',
  GRAMMAR = 'grammar',
  LISTENING = 'listening',
}

export interface TestQuestion {
  question: string;
  options: string[];
  correctAnswer: string; // Now always stores letter (a, b, c, d)
  imageUrl?: string;
  audioUrl?: string;
  explaination?: string;
  image?: File; // For new questions being added
  audio?: File; // For new questions being added
  imageName?: string;
  audioName?: string;
  requestType?: RequestType; // Optional for backward compatibility
  id?: string; // For existing questions
  isNewAdd?: boolean;
}

export interface TestFormData {
  name: string;
  duration: number;
  questions: TestQuestion[];
  images: File[];
  audios?: File[]; // for listening tests
}

export interface TestFormConfig {
  testType: TestType;
  topicName: string;
  showAudioUpload?: boolean;
  showImageUpload?: boolean;
  supportsImage?: boolean; // For individual question images
  supportsAudio?: boolean; // For individual question audio
  maxOptions?: number;
}

@Component({
  selector: 'app-test-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './test-form.component.html',
  styleUrl: './test-form.component.scss',
})
export class TestFormComponent implements OnInit {
  @Input() config!: TestFormConfig;
  @Input() editData?: TestFormData; // Data for editing
  @Input() testToEdit?: any; // Test object for editing
  @Input() isEditMode = false; // Flag to indicate edit mode
  @Output() save = new EventEmitter<TestFormData>();
  @Output() cancel = new EventEmitter<void>();
  isEditQuestion = false;
  editingQuestion!: TestQuestion;
  editingIndexQuestion!: number;
  RequestType = RequestType;
  testData: TestFormData = {
    name: '',
    duration: 30,
    questions: [],
    images: [],
    audios: [],
  };

  newQuestion: TestQuestion = {
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 'a', // Default to option A
    explaination: '',
    image: undefined,
    audio: undefined,
    requestType: RequestType.ADD,
    isNewAdd: true,
  };

  selectedAudios: File[] = [];

  ngOnInit() {
    // Initialize based on config
    if (this.config) {
      this.newQuestion.correctAnswer = 'a'; // Default to option A
      if (this.config.maxOptions) {
        this.newQuestion.options = new Array(this.config.maxOptions).fill('');
      }
    }

    // Load edit data if in edit mode
    if (this.isEditMode && this.editData) {
      this.testData = { ...this.editData };
    }

    // Load test data for editing
    if (this.testToEdit) {
      this.loadTestData();
    }
  }

  loadTestData() {
    if (this.testToEdit) {
      this.testData = {
        name: this.testToEdit.testName || this.testToEdit.name || '',
        duration: this.testToEdit.duration || 30,
        questions:
          this.testToEdit.questions?.map((q: any) => ({
            question: q.question || '',
            options: [
              q.options?.a || '',
              q.options?.b || '',
              q.options?.c || '',
              q.options?.d || '',
            ],
            correctAnswer: q.correctAnswer || 'a',
            explaination: q.explaination || '',
            imageUrl: q.imageUrl,
            audioUrl: q.audioUrl,
            id: q.id,
            requestType: q.requestType,
          })) || [],
        images: [],
        audios: [],
      };
    }
  }

  getFormTitle(): string {
    if (this.testToEdit || this.isEditMode) {
      return 'Chỉnh sửa bài test';
    }
    return 'Tạo bài test mới';
  }

  onAudioSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedAudios = Array.from(event.target.files);
      this.testData.audios = this.selectedAudios;
    }
  }

  addQuestion() {

    // Validate question text
    if (!this.newQuestion.question.trim()) {
      alert('Vui lòng nhập câu hỏi');
      return;
    }

    // Validate options
    if (!this.newQuestion.options.every((opt) => opt.trim())) {
      alert('Vui lòng điền đầy đủ các lựa chọn');
      return;
    }

    if (this.config.supportsAudio && !this.newQuestion.audioName) {
      alert('Vui lòng chọn audio');
      return;
    }

    if (this.config.supportsImage && !this.newQuestion.imageName) {
      alert('Vui lòng chọn image');
      return;
    }

    // Validate correct answer
    if (
      !this.newQuestion.correctAnswer ||
      !['a', 'b', 'c', 'd'].includes(
        this.newQuestion.correctAnswer.toLowerCase()
      )
    ) {
      alert('Vui lòng chọn đáp án đúng (A, B, C, hoặc D)');
      return;
    }

    // Store the question with letter-based correct answer
    const questionToAdd = {
      ...this.newQuestion,
      correctAnswer: this.newQuestion.correctAnswer.toLowerCase(), // Ensure lowercase
      requestType: RequestType.ADD, // New question
    };

    this.testData.questions.push(questionToAdd);

    // Reset form
    this.newQuestion = {
      question: '',
      options: this.config.maxOptions
        ? new Array(this.config.maxOptions).fill('')
        : ['', '', '', ''],
      correctAnswer: 'a', // Default to option A
      explaination: '',
      image: undefined,
      requestType: RequestType.ADD,
    };
  }

  removeQuestion(visibleIndex: number) {
    let currentVisible = -1;

    for (
      let realIndex = 0;
      realIndex < this.testData.questions.length;
      realIndex++
    ) {
      const q = this.testData.questions[realIndex];

      if (q.requestType !== RequestType.DELETE) {
        currentVisible++;
      }

      if (currentVisible === visibleIndex) {
        q.requestType = RequestType.DELETE;
        return;
      }
    }
  }

  editQuestion(visibleIndex: number) {
    let currentVisible = -1;

    for (
      let realIndex = 0;
      realIndex < this.testData.questions.length;
      realIndex++
    ) {
      const q = this.testData.questions[realIndex];

      if (q.requestType !== RequestType.DELETE) {
        currentVisible++;
      }

      if (currentVisible === visibleIndex) {
        const question = this.testData.questions[realIndex];
        this.newQuestion = {
          question: question.question,
          options: [...question.options],
          correctAnswer: question.correctAnswer,
          explaination: question.explaination || '',
          image: undefined, // Reset file input
          audio: undefined, // Reset file input
          id: question.id, // Preserve existing question ID
          requestType: question.id ? RequestType.UPDATE : RequestType.ADD, // Set based on whether question has ID
          isNewAdd: question.id ? false : true,
        };
        // Remove the question from the list temporarily
        this.testData.questions.splice(realIndex, 1);
        this.isEditQuestion = true;
        this.editingQuestion = question;
        this.editingIndexQuestion = realIndex;
        return;
      }
    }
  }

  updateQuestion() {
    // Validate question text
    if (!this.newQuestion.question.trim()) {
      alert('Vui lòng nhập câu hỏi');
      return;
    }

    // Validate options
    if (!this.newQuestion.options.every((opt) => opt.trim())) {
      alert('Vui lòng điền đầy đủ các lựa chọn');
      return;
    }

    // Validate correct answer
    if (
      !this.newQuestion.correctAnswer ||
      !['a', 'b', 'c', 'd'].includes(
        this.newQuestion.correctAnswer.toLowerCase()
      )
    ) {
      alert('Vui lòng chọn đáp án đúng (A, B, C, hoặc D)');
      return;
    }
    this.newQuestion.audioUrl = this.editingQuestion.audioUrl;
    this.newQuestion.imageUrl = this.editingQuestion.imageUrl;
    // if (this.newQuestion.isNewAdd) {
    //   this.newQuestion.audioName = this.editingQuestion.audioName;
    //   this.newQuestion.audio = this.editingQuestion.audio;
    //   this.newQuestion.imageName = this.editingQuestion.imageName;
    //   this.newQuestion.image = this.editingQuestion.image;
    // }

    // Store the question with letter-based correct answer
    const questionToAdd = {
      ...this.newQuestion,
      correctAnswer: this.newQuestion.correctAnswer.toLowerCase(), // Ensure lowercase
      requestType: this.newQuestion.requestType || RequestType.UPDATE, // Preserve request type
    };


    this.testData.questions.splice(this.editingIndexQuestion, 0, questionToAdd);

    // Reset form
    this.newQuestion = {
      question: '',
      options: this.config.maxOptions
        ? new Array(this.config.maxOptions).fill('')
        : ['', '', '', ''],
      correctAnswer: 'a', // Default to option A
      explaination: '',
      image: undefined,
      requestType: RequestType.ADD,
    };

    this.isEditQuestion = false;
  }

  cancelEdit() {
    // Reset form without adding question
    this.newQuestion = {
      question: '',
      options: this.config.maxOptions
        ? new Array(this.config.maxOptions).fill('')
        : ['', '', '', ''],
      correctAnswer: 'a', // Default to option A
      explaination: '',
      image: undefined,
      audio: undefined,
      isNewAdd: true,
      requestType: RequestType.ADD,
    };
    this.isEditQuestion = false;
    this.testData.questions.splice(
      this.editingIndexQuestion,
      0,
      this.editingQuestion
    );
  }

  onSave() {
    if (this.testData.name.trim() && this.testData.questions.length > 0) {
      this.save.emit(this.testData);
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  selectOption(index: number) {
    // Convert index to letter (0->a, 1->b, 2->c, 3->d)
    const letters = ['a', 'b', 'c', 'd'];
    this.newQuestion.correctAnswer = letters[index] || 'a';
  }

  getCorrectAnswerDisplay(question: TestQuestion): string {
    // Convert letter to index and get the option text
    const letterToIndex: { [key: string]: number } = { a: 0, b: 1, c: 2, d: 3 };
    const index = letterToIndex[question.correctAnswer.toLowerCase()];
    return question.options[index] || '';
  }

  getCorrectAnswerLabel(question: TestQuestion): string {
    // Return the letter in uppercase
    return `Đáp án ${question.correctAnswer.toUpperCase()}`;
  }

  getOptionLetter(index: number): string {
    // Convert index to letter (0->a, 1->b, 2->c, 3->d)
    const letters = ['a', 'b', 'c', 'd'];
    return letters[index] || 'a';
  }

  // Question image methods
  onQuestionImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.newQuestion.image = file;
      this.newQuestion.imageName = file.name;
    }
  }

  removeQuestionImage() {
    this.newQuestion.image = undefined;
    this.newQuestion.imageName = undefined;
  }

  getImagePreview(file: File): string {
    return URL.createObjectURL(file);
  }

  // Question audio methods
  onQuestionAudioSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.newQuestion.audio = file;
      this.newQuestion.audioName = file.name;
    }
  }

  removeQuestionAudio() {
    this.newQuestion.audio = undefined;
    this.newQuestion.audioName = undefined;
  }

  isEditingQuestion(): boolean {
    return this.isEditQuestion;
  }

  getSaveButtonText(): string {
    return this.isEditMode ? 'Cập nhật' : 'Lưu';
  }

  // Helper methods for request type management
  getQuestionsByRequestType(requestType: RequestType): TestQuestion[] {
    return this.testData.questions.filter((q) => q.requestType === requestType);
  }

  getQuestionsToCreate(): TestQuestion[] {
    return this.getQuestionsByRequestType(RequestType.ADD);
  }

  getQuestionsToUpdate(): TestQuestion[] {
    return this.getQuestionsByRequestType(RequestType.UPDATE);
  }

  getQuestionsToDelete(): TestQuestion[] {
    return this.getQuestionsByRequestType(RequestType.DELETE);
  }

  // Method to get summary of changes
  getChangeSummary(): { create: number; update: number; delete: number } {
    return {
      create: this.getQuestionsToCreate().length,
      update: this.getQuestionsToUpdate().length,
      delete: this.getQuestionsToDelete().length,
    };
  }

  get visibleQuestions() {
    return this.testData.questions.filter(
      (q) => q.requestType !== RequestType.DELETE
    );
  }

  generateImageUrl(file: File) {
    if (!file) return null;
    return URL.createObjectURL(file);
  }
}
