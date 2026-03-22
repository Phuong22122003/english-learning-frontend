import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ListeningService } from '../../../services/ListeningService';
import { ListeningTopic } from '../../../models/listening/listening-topic.model';
import { Listening } from '../../../models/listening/listening.model';
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
import { ListeningTest } from '../../../models/listening/listening-test.model';
import { RequestType } from '../../../models/request-type.model';
import { UploadByFileComponent } from '../upload-by-file/upload-by-file.component';
import { AgentService } from '../../../services/AgentService';
import { AiButtonComponent } from '../../../shared/ai-button/ai-button.component';
import { GenerateTestsComponent } from '../generate-tests/generate-tests.component';
import { TestGenerateRequest } from '../../../models/request/test-generate-request.model';

enum State {
  View,
  Create,
  Edit,
  Upload,
}

@Component({
  selector: 'app-listening-tests-manage',
  standalone: true,
  imports: [
    CommonModule,
    TestFormComponent,
    ConfirmDialogComponent,
    TopicTestCardGridComponent,
    TestListComponent,
    UploadByFileComponent,
    AiButtonComponent,
    GenerateTestsComponent,
  ],
  templateUrl: './listening-tests-manage.component.html',
  styleUrl: './listening-tests-manage.component.scss',
})
export class ListeningTestsManageComponent implements OnInit {
  State = State;
  currentState = State.View;
  topics: ListeningTopic[] = [];
  topicsBase: TopicBase[] = [];
  selectedTopic: ListeningTopic | null = null;
  tests: Listening[] = [];
  currentPage = 1;
  totalPages = 0;
  readonly PAGE_SIZE = environment.PAGE_SIZE;
  private destroy$ = new Subject<void>();
  showDeleteConfirm = false;
  idToDelete: string | null = null;
  testsBase: TestBase[] = [];
  listeningTests: ListeningTest[] = [];
  testToEdit: ListeningTest | null = null;
  editTestData: TestFormData | null = null;
  isShowGenerateTests = false;
  listeningTestConfig: TestFormConfig = {
    testType: TestType.LISTENING,
    topicName: '',
    showImageUpload: false, // No test-level images
    showAudioUpload: false, // No test-level audio
    supportsImage: true, // Enable individual question images (1 per question)
    supportsAudio: true, // Enable audio for listening (1 per question)
    maxOptions: 4,
  };
  excelTemplate = environment.excelListeningTestsTemplate;
  constructor(
    private listeningService: ListeningService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private agentService: AgentService
  ) {}

  ngOnInit(): void {
    this.loadTopics();
  }

  loadTopics() {
    this.listeningService
      .getTopics(this.currentPage - 1, this.PAGE_SIZE) // Load all topics for selection
      .subscribe({
        next: (data) => {
          this.topics = data.content;
          this.topicsBase = data.content.map((topic) => ({
            id: topic.id,
            name: topic.name,
            description: topic.description,
            imageUrl: topic.imageUrl,
          }));
        },
        error: (error) => {},
      });
  }

  onTopicSelect(topic: TopicBase) {
    this.selectedTopic = this.topics.find((t) => t.id === topic.id) || null;
    this.listeningTestConfig.topicName = topic.name; // Update config
    this.tests = []; // Clear previous tests
    this.currentPage = 1; // Reset pagination
    this.totalPages = 0; // Reset total pages
    this.loadTestsForTopic(topic.id);
  }

  loadTestsForTopic(topicId: string) {
    this.listeningService.getTestsByTopicId(topicId).subscribe({
      next: (data) => {
        this.listeningTests = data.tests.content;
        this.testsBase = data.tests.content.map((test) => ({
          id: test.id,
          name: test.name,
          duration: test.duration, // Listening tests don't have duration
          createdAt: test.createdAt,
        }));
        // For listening, we don't have pagination from API, so set to 1
        this.currentPage = 1;
        this.totalPages = 1;
      },
      error: (error) => {},
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    if (this.selectedTopic) {
      this.loadTestsForTopic(this.selectedTopic.id);
    }
  }

  onCreateTest() {
    this.currentState = State.Create;
  }

  onSaveTest(testData: TestFormData) {
    if (!this.selectedTopic) {return;
    }

    // Convert TestFormData to API format for listening test
    const testDataForAPI = {
      name: testData.name,
      duration: testData.duration,
      questions: testData.questions.map((question, index) => ({
        id: (question as any).id || '', // Add id for existing questions
        name: question.question, // Use question as name for listening
        transcript: (question as any).transcript || '',
        question: question.question,
        options: {
          a: question.options[0] || '',
          b: question.options[1] || '',
          c: question.options[2] || '',
          d: question.options[3] || '',
        },
        correctAnswer: question.correctAnswer as string,
        questionOrder: index + 1,
        explaination: question.explaination || '',
        imageName: (question as any).imageName || '',
        audioName: (question as any).audioName || '',
        action: (question as any).action || 'UPDATE',
      })),
    };

    // Collect question images and audios
    const questionImages: File[] = [];
    const questionAudios: File[] = [];

    testData.questions.forEach((question, index) => {
      if (question.image) {
        questionImages.push(question.image);
      }
      if ((question as any).audio) {
        questionAudios.push((question as any).audio);
      }
    });

    // Use the new addTest API
    this.listeningService
      .addTest(
        this.selectedTopic.id,
        testDataForAPI,
        questionImages,
        questionAudios
      )
      .subscribe({
        next: (response: any) => {
          this.currentState = State.View;
          // Reload tests for the current topic
          this.loadTestsForTopic(this.selectedTopic!.id);
        },
        error: (error: any) => {},
      });
  }

  onCancelCreate() {
    this.currentState = State.View;
  }

  onUpdateTest(testData: TestFormData) {
    if (!this.selectedTopic || !this.testToEdit) {return;
    }

    // Convert TestFormData to API format for listening test
    const testDataForAPI = {
      name: testData.name,
      duration: testData.duration,
      questions: testData.questions
        .filter((question) => question.requestType != null)
        .map((question, index) => ({
          id: (question as any).id || '', // Add id for existing questions
          name: question.question, // Use question as name for listening
          transcript: (question as any).transcript || '',
          question: question.question,
          options: {
            a: question.options[0] || '',
            b: question.options[1] || '',
            c: question.options[2] || '',
            d: question.options[3] || '',
          },
          correctAnswer: question.correctAnswer as string,
          questionOrder: index + 1,
          explaination: question.explaination || '',
          imageName: (question as any).imageName || '',
          audioName: (question as any).audioName || '',
          action: question.requestType || RequestType.UPDATE,
        })),
    };


    // Collect question images and audios
    const questionImages: File[] = [];
    const questionAudios: File[] = [];

    testData.questions.forEach((question, index) => {
      if (question.image) {
        questionImages.push(question.image);
      }
      if ((question as any).audio) {
        questionAudios.push((question as any).audio);
      }
    });


    // Use the updateTest API
    this.listeningService
      .updateTest(
        this.testToEdit!.id,
        testDataForAPI,
        questionImages,
        questionAudios
      )
      .subscribe({
        next: (response: any) => {
          this.currentState = State.View;
          this.testToEdit = null;
          this.editTestData = null;
          // Reload tests for the current topic
          this.loadTestsForTopic(this.selectedTopic!.id);
        },
        error: (error: any) => {},
      });
  }

  onCancelEdit() {
    this.currentState = State.View;
    this.testToEdit = null;
    this.editTestData = null;
  }

  onViewTest(test: TestBase) {
    // Navigate to test detail or edit page
    this.router.navigate(['/admin/listening/tests', test.id]);
  }

  onDeleteTest(test: TestBase) {
    this.idToDelete = test.id;
    this.showDeleteConfirm = true;
  }

  onConfirmDelete() {
    if (this.idToDelete) {
      this.listeningService.deleteTest(this.idToDelete).subscribe({
        next: (response: any) => {
          this.loadTestsForTopic(this.selectedTopic!.id);
          this.showDeleteConfirm = false;
          this.idToDelete = null;
        },
        error: (error: any) => {this.showDeleteConfirm = false;
          this.idToDelete = null;
        },
      });
    }
  }

  onCancelDelete() {
    this.showDeleteConfirm = false;
    this.idToDelete = null;
  }

  onEditTest(test: TestBase) {
    // Find the full test data
    this.listeningService.getTestById(test.id).subscribe({
      next: (data) => {
        this.testToEdit = data;
        if (this.testToEdit) {
          // Convert ListeningTest to TestFormData
          this.editTestData = {
            name: this.testToEdit.name,
            duration: this.testToEdit.duration || 30,
            questions:
              this.testToEdit.questions?.map((q) => ({
                id: q.id,
                question: q.question,
                options: [
                  q.options['a'],
                  q.options['b'],
                  q.options['c'],
                  q.options['d'],
                ],
                correctAnswer: q.correctAnswer,
                explaination: q.explaination || '',
                imageUrl: q.imageUrl,
                audioUrl: q.audioUrl,
              })) || [],
            images: [],
            audios: [],
          };
          this.currentState = State.Edit;
        }
      },
      error: (error) => {},
    });
  }

  goBackToTopics() {
    this.selectedTopic = null;
    this.tests = [];
    this.testsBase = [];
    this.currentPage = 1;
    this.totalPages = 0;
    this.currentState = State.View;
    this.testToEdit = null;
    this.editTestData = null;
  }

  changeToUpload() {
    this.currentState = State.Upload;
  }

  onUploadTest(files: {
    excelFile: File;
    imageFiles: File[];
    audioFiles: File[];
  }) {
    this.listeningService
      .uploadTestsByFile(
        this.selectedTopic!.id,
        files.excelFile,
        files.imageFiles,
        files.audioFiles
      )
      .subscribe({
        next: (response: ListeningTest[]) => {
          this.currentState = State.View;
          this.loadTestsForTopic(this.selectedTopic!.id);
        },
        error: (error) => {
          alert('Không thể tải lên bài test');
        },
      });
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
