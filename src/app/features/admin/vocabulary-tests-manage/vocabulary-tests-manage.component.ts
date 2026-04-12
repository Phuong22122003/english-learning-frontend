import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { VocabularyService } from '../../../services/VocabularyService';
import { VocabTopic } from '../../../models/vocabulary/vocab-topic.model';
import { VocabularyTest } from '../../../models/vocabulary/vocabulary-test.model';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';
import { environment } from '../../../../environments/environment';
import { Page } from '../../../models/page.model';
import { Subject, takeUntil } from 'rxjs';
import {
  TestFormComponent,
  TestFormData,
  TestFormConfig,
  TestType,
} from '../../../shared/test-form/test-form.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { TopicBase } from '../../../models/topic-base';
import { TopicTestCardGridComponent } from '../../../shared/topic-test-card-grid/topic-test-card-grid.component';
import { TestListComponent } from '../../../shared/test-list/test-list.component';
import { TestBase } from '../../../models/test-base';
import { RequestType } from '../../../models/request-type.model';
import { UploadByFileComponent } from '../upload-by-file/upload-by-file.component';
import { GenerateTestsComponent } from '../generate-tests/generate-tests.component';
import { AiButtonComponent } from '../../../shared/ai-button/ai-button.component';
import { AgentService } from '../../../services/AgentService';
import { TestGenerateRequest } from '../../../models/request/test-generate-request.model';

enum State {
  View,
  Create,
  Edit,
  Upload,
}

@Component({
  selector: 'app-vocabulary-tests-manage',
  standalone: true,
  imports: [
    CommonModule,
    TestFormComponent,
    ConfirmDialogComponent,
    TopicTestCardGridComponent,
    TestListComponent,
    UploadByFileComponent,
    GenerateTestsComponent,
    AiButtonComponent,
  ],
  templateUrl: './vocabulary-tests-manage.component.html',
  styleUrl: './vocabulary-tests-manage.component.scss',
})
export class VocabularyTestsManageComponent implements OnInit {
  State = State;
  currentState = State.View;
  topics: VocabTopic[] = [];
  topicsBase: TopicBase[] = [];
  selectedTopic: VocabTopic | null = null;
  tests: VocabularyTest[] = [];
  currentPage = 1;
  totalPages = 0;
  readonly PAGE_SIZE = environment.PAGE_SIZE;
  private destroy$ = new Subject<void>();
  showDeleteConfirm = false;
  testToDelete: VocabularyTest | null = null;
  testToEdit: VocabularyTest | null = null;
  testsBase: TestBase[] = [];
  vocabularyTestConfig: TestFormConfig = {
    testType: TestType.VOCABULARY,
    topicName: '',
    showImageUpload: false, // No test-level images
    showAudioUpload: false,
    supportsImage: true, // Enable individual question images
    supportsAudio: false,
    maxOptions: 4,
  };
  excelTemplate = environment.excelVocabularyTestsTemplate;
  isShowGenerateTests = false;
  constructor(
    private vocabService: VocabularyService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private agentService: AgentService
  ) {}
  ngOnInit(): void {
    this.loadTopics();
  }
  loadTopics() {
    this.vocabService.getTopics(this.currentPage - 1, this.PAGE_SIZE) // Load all topics for selection
    this.vocabService.topics$.subscribe({
        next: (data) => {
          if(data == null) return;
          this.topics = data.content;
          this.topicsBase = data.content.map((topic) => ({
            id: topic.id,
            name: topic.name,
            description: topic.description,
            imageUrl: topic.imageUrl,
          }));
          this.currentPage = data.pageable.pageNumber + 1;
          this.totalPages = data.totalPages;
        },
        error: (error) => {
},
      });
  }
  onTopicSelect(topic: TopicBase) {
    this.selectedTopic = this.topics.find((t) => t.id === topic.id) || null;
    this.vocabularyTestConfig.topicName = topic.name; // Update config
    this.tests = []; // Clear previous tests
    this.currentPage = 1; // Reset pagination
    this.totalPages = 0; // Reset total pages
    this.loadTestsForTopic(topic.id);
  }
  loadTestsForTopic(topicId: string) {
    this.vocabService
      .getTestsByTopicId(topicId, this.currentPage - 1, this.PAGE_SIZE)
      .subscribe({
        next: (data) => {
          this.tests = data.tests.content;
          this.currentPage = data.tests.pageable.pageNumber + 1;
          this.totalPages = data.tests.totalPages;
          this.testsBase = data.tests.content.map((test) => ({
            id: test.id,
            name: test.name || test.topicName || '',
            duration: test.duration,
            createdAt: test.createdAt,
          }));
        },
        error: (error) => {
},
      });
  }
  onPageChange(page: number) {
    this.currentPage = page;
    if (this.selectedTopic) {
      this.loadTestsForTopic(this.selectedTopic.id);
    }
  }
  onTopicPageChange(page: number) {
    this.currentPage = page;
    this.loadTopics();
  }
  onCreateTest() {
    this.currentState = State.Create;
  }

  onSaveTest(testData: TestFormData) {
    if (!this.selectedTopic) {
return;
    }
    const formData = new FormData();

    const testDataForAPI = {
      name: testData.name,
      duration: testData.duration,
      questions: testData.questions.map((question, index) => ({
        id: question.id || '',
        question: question.question,
        imageName: question.imageName || '',
        audioName: question.audioName || '',
        options: {
          a: question.options[0] || '',
          b: question.options[1] || '',
          c: question.options[2] || '',
          d: question.options[3] || '',
        },
        correctAnswer: question.correctAnswer, // Already a letter now
        questionOrder: index + 1,
        explaination: question.explaination || '',
        action: question.requestType || null,
      })),
    };

    // Add test data as JSON
    formData.append(
      'test',
      new Blob([JSON.stringify(testDataForAPI)], { type: 'application/json' })
    );

    // Add question images to images array for @RequestPart
    const questionImages: File[] = [];
    testData.questions.forEach((question, index) => {
      if (question.image) {
        questionImages.push(question.image);
      }
    });

    // Add all question images to FormData with name "images"
    questionImages.forEach((image: File) => {
      formData.append('images', image);
    });

    // Check if editing or creating
    if (this.currentState === State.Edit && this.testToEdit) {
      // Edit existing test - map to VocabularyTestRequest format
      const updateTestData = {
        name: testDataForAPI.name,
        duration: testDataForAPI.duration,
        questions: testDataForAPI.questions
          .filter((question) => question.action)
          .map((question, index) => ({
            id: question.id || '',
            question: question.question,
            imageName: question.imageName || '',
            audioName: question.audioName || '',
            options: question.options,
            correctAnswer: question.correctAnswer,
            explaination: question.explaination,
            action: question.action || RequestType.UPDATE,
            questionOrder: question.questionOrder,
          })),
      };

      this.vocabService
        .updateTest(
          this.testToEdit.testId || '',
          updateTestData,
          questionImages
        )
        .subscribe({
          next: (response) => {
            this.currentState = State.View;
            this.testToEdit = null;
            // Reload tests for the current topic
            this.loadTestsForTopic(this.selectedTopic!.id);
          },
          error: (error) => {
alert('Không thể cập nhật bài test');
          },
        });
    } else {
      // Create new test
      this.vocabService
        .createTest(this.selectedTopic.id, testDataForAPI, questionImages)
        .subscribe({
          next: (response) => {
            this.currentState = State.View;
            // Reload tests for the current topic
            this.loadTestsForTopic(this.selectedTopic!.id);
          },
          error: (error) => {
alert('Không thể tạo bài test');
          },
        });
    }
  }
  onCancelCreate() {
    this.currentState = State.View;
    this.testToEdit = null;
  }

  onViewTest(test: TestBase) {
    // Navigate to test detail or edit page
    this.router.navigate(['/admin/vocabulary/tests', test.id]);
  }
  onDeleteTest(test: TestBase) {
    this.testToDelete = this.tests.find((t) => t.id === test.id) || null;
    this.showDeleteConfirm = true;
  }

  onConfirmDelete() {
    if (this.testToDelete) {
      this.vocabService
        .deleteTest(this.testToDelete.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            // Reload tests for the current topic
            if (this.selectedTopic) {
              this.loadTestsForTopic(this.selectedTopic.id);
            }
            this.showDeleteConfirm = false;
            this.testToDelete = null;
          },
          error: (error) => {
alert('Không thể xóa bài test');
            this.showDeleteConfirm = false;
            this.testToDelete = null;
          },
        });
    }
  }

  onCancelDelete() {
    this.showDeleteConfirm = false;
    this.testToDelete = null;
  }
  onEditTest(test: TestBase) {
    this.loadTestForEdit(test.id);
  }

  loadTestForEdit(testId: string) {
    this.vocabService.getTestById(testId).subscribe({
      next: (test) => {
        this.testToEdit = test;
        this.currentState = State.Edit;
        this.vocabularyTestConfig.topicName = this.selectedTopic?.name || '';
      },
      error: (error) => {
alert('Không thể tải thông tin bài test');
      },
    });
  }
  goBackToTopics() {
    this.selectedTopic = null;
    this.tests = [];
    this.testsBase = [];
    this.currentPage = 1;
    this.totalPages = 0;
    this.currentState = State.View;
  }

  onCancelEdit() {
    this.currentState = State.View;
    this.testToEdit = null;
  }

  changeToUpload() {
    this.currentState = State.Upload;
  }

  onUploadTest(files: { excelFile: File; imageFiles: File[] }) {
    this.vocabService
      .uploadTestsByFile(
        this.selectedTopic!.id,
        files.excelFile,
        files.imageFiles
      )
      .subscribe({
        next: (response) => {
          this.currentState = State.View;
          this.loadTestsForTopic(this.selectedTopic!.id);
        },
        error: (error) => {
alert('Không thể tải lên bài test');
        },
      });
  }

  onOpenTestGenerate() {
    this.isShowGenerateTests = true;
  }

  submitGenerateTests(data: { topicType: string; description: string }) {
    this.isShowGenerateTests = false;
    const request: TestGenerateRequest = {
      description: data.description,
      id: this.selectedTopic?.id || '',
      name: this.selectedTopic?.name || '',
      content: '',
      test_type: data.topicType,
    };
    this.agentService.generateTests(request).subscribe(() => {
      this.loadTestsForTopic(this.selectedTopic?.id || '');
    });
  }
}
