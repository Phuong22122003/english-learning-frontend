import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
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
  faImage,
  faHeadphones,
} from '@fortawesome/free-solid-svg-icons';
import { ToeicTestRequest } from '../../../../../../models/request/toeic-test-request-model';
import { ToeicTestResponse } from '../../../../../../models/response/toeict-test-response.model';
import { ToeicPart } from '../../../../../../models/toeic-part.enum';
import { ToeicTestService } from '../../../../../../services/ToeicTestService';
import { RequestType } from '../../../../../../models/request-type.model';
import { AudioPlayerComponent } from '../../../../../../shared/audio-player/audio-player.component';
import { ToeicTestQuestionGroupRequest } from '../../../../../../models/request/toeic-test-question-group-request.model';
import { ToeicTestQuestionRequest } from '../../../../../../models/request/toeic-test-question-request.model';

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

  // Icons
  icons = { faSave, faTimes, faFileAlt, faPlus, faTrash, faImage, faHeadphones };

  currentPart = ToeicPart.PART_1;
  toeicParts = [
    { value: ToeicPart.PART_1, label: 'Part 1' },
    { value: ToeicPart.PART_2, label: 'Part 2' },
    { value: ToeicPart.PART_3, label: 'Part 3' },
    { value: ToeicPart.PART_4, label: 'Part 4' },
    { value: ToeicPart.PART_5, label: 'Part 5' },
    { value: ToeicPart.PART_6, label: 'Part 6' },
    { value: ToeicPart.PART_7, label: 'Part 7' },
  ];

  optionKeys = ['a', 'b', 'c', 'd'];
  form!: FormGroup;

  // Lưu trữ File thực tế để upload
  imageFiles: { url: string; file: File }[] = [];
  audioFiles: { url: string; file: File }[] = [];

  constructor(
    private fb: FormBuilder,
    private toeicTestService: ToeicTestService
  ) { }

  ngOnInit(): void {
    this.initForm();
    if (this.isEditMode && this.initialData) {
      // Logic để patchValue nếu cần chỉnh sửa
    }
  }

  private initForm() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      questionGroups: this.fb.array([]) // Danh sách các nhóm câu hỏi
    });
  }

  get questionGroups(): FormArray {
    return this.form.get('questionGroups') as FormArray;
  }

  onAddQuestionGroup() {
    const group = this.fb.group({
      part: [this.currentPart],
      action: [RequestType.ADD],
      imageName: [''],
      audioName: [''],
      previewUrl: [''],
      audioPreviewUrl: [''],
      description: [''], // temp
      questions: this.fb.array([this.createQuestion()]) // Mặc định tạo 1 câu khi add group
    });
    this.questionGroups.push(group);
  }

  createQuestion(): FormGroup {
    return this.fb.group({
      question: ['', Validators.required],
      optionA: ['', Validators.required],
      optionB: ['', Validators.required],
      optionC: ['', Validators.required],
      optionD: ['', Validators.required],
      correctAnswer: ['', Validators.required],
      explanation: [''],
      action: [RequestType.ADD]
    });
  }

  onAddQuestion(groupIndex: number) {
    const questions = this.questionGroups.at(groupIndex).get('questions') as FormArray;
    questions.push(this.createQuestion());
  }

  onRemoveGroup(index: number) {
    this.questionGroups.removeAt(index);
  }

  onImageSelected(event: any, groupIndex: number) {
    const file: File = event.target.files[0];
    if (file) {
      // Tạo đường dẫn tạm thời để hiển thị lên thẻ <img>
      const url = URL.createObjectURL(file);

      // Lưu file thực tế để upload sau này
      this.imageFiles.push({ url, file });

      // Cập nhật vào form của group cụ thể
      const group = this.questionGroups.at(groupIndex);
      group.patchValue({
        imageName: file.name,
        previewUrl: url // Lưu url vào đây để template lấy ra dùng
      });
    }
  }

  // Sửa hàm chọn Audio
  onAudioSelected(event: any, groupIndex: number) {
    const file: File = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      this.audioFiles.push({ url, file });

      const group = this.questionGroups.at(groupIndex) as FormGroup;
      group.patchValue({
        audioName: file.name,
        audioPreviewUrl: url // Lưu URL tạm thời để phát nhạc
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const rawValue = this.form.value;

    // Map dữ liệu từ Form sang Request Model
    const toeicTest: ToeicTestRequest = {
      name: rawValue.name,
      questionGroups: rawValue.questionGroups.map((g: any) => ({
        ...g,
        questions: g.questions.map((q: any) => ({
          question: q.question,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          action: q.action,
          options: { a: q.optionA, b: q.optionB, c: q.optionC, d: q.optionD }
        }))
      }))
    };

    const allImages = this.imageFiles.map(f => f.file);
    const allAudios = this.audioFiles.map(f => f.file);

    this.toeicTestService.addTest(toeicTest, this.groupId, allImages, allAudios).subscribe({
      next: (res) => {
        this.save.emit(toeicTest);
        alert('Thêm bài test thành công!');
      },
      error: (err) => console.error(err)
    });
  }

  onCancel() {
    this.cancel.emit();
  }

  onPartChange(part: ToeicPart) {
    this.currentPart = part;
  }

  getQuestionsArray(groupIndex: number): FormArray {
    return this.questionGroups.at(groupIndex).get('questions') as FormArray;
  }

  // Hàm xóa câu hỏi con
  onRemoveQuestion(groupIndex: number, questionIndex: number) {
    this.getQuestionsArray(groupIndex).removeAt(questionIndex);
  }
}