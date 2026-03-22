import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GrammarService } from '../../../services/GrammarService';
import { GrammarTopic } from '../../../models/grammar/grammar-topic.model';
import { Grammar } from '../../../models/grammar/grammar.model';
import { GrammarTest } from '../../../models/grammar/grammar-test.model';
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
import { GrammarTestRequest } from '../../../models/request/grammar-test-request.model';
import { GrammarTestQuestion } from '../../../models/grammar/grammar-test-question.model';
import { RequestType } from '../../../models/request-type.model';
import { CommonUtils } from '../../../shared/utils/common';
import { UploadByFileComponent } from '../upload-by-file/upload-by-file.component';
import { AiButtonComponent } from '../../../shared/ai-button/ai-button.component';
import { GenerateTestsComponent } from '../generate-tests/generate-tests.component';
import { AgentService } from '../../../services/AgentService';
import { TestGenerateRequest } from '../../../models/request/test-generate-request.model';

enum State {
  View,
  Create,
  Edit,
  Upload,
}

@Component({
  selector: 'app-grammar-tests-manage',
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
  templateUrl: './grammar-tests-manage.component.html',
  styleUrl: './grammar-tests-manage.component.scss',
})
export class GrammarTestsManageComponent implements OnInit {
  isShowGenerateTests = false;
  State = State;
  currentState = State.View;
  topics: GrammarTopic[] = [];
  topicsBase: TopicBase[] = [];
  selectedTopic: GrammarTopic | null = null;
  grammars: Grammar[] = [];
  selectedGrammar: Grammar | null = null;
  tests: GrammarTest[] = [];
  currentPage = 1;
  totalPages = 0;
  readonly PAGE_SIZE = environment.PAGE_SIZE;
  private destroy$ = new Subject<void>();
  showDeleteConfirm = false;
  testToDelete: TestBase | null = null;
  testToEdit: GrammarTest | null = null;
  testQuestionsForEdit: GrammarTestQuestion[] = [];
  testsBase: TestBase[] = [];
  grammarTests: GrammarTest[] = [];
  excelTemplate = environment.excelGrammarTestsTemplate;
  grammarTestConfig: TestFormConfig = {
    testType: TestType.GRAMMAR,
    topicName: '',
    showImageUpload: false, // No test-level images
    showAudioUpload: false, // No test-level audio
    supportsImage: false, //
    supportsAudio: false, // Grammar tests typically don't have audio
    maxOptions: 4,
  };

  constructor(
    private grammarService: GrammarService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private agentService: AgentService
  ) {}

  ngOnInit(): void {
    this.loadTopics();
  }

  loadTopics() {
    this.grammarService
      .getAllTopics(this.currentPage - 1, this.PAGE_SIZE) // Load all topics for selection
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
    this.grammarTestConfig.topicName = topic.name; // Update config
    this.grammars = []; // Clear previous grammars
    this.selectedGrammar = null; // Clear selected grammar
    this.tests = []; // Clear previous tests
    this.currentPage = 1; // Reset pagination
    this.totalPages = 0; // Reset total pages
    this.loadGrammarsForTopic(topic.id);
  }

  loadGrammarsForTopic(topicId: string) {
    this.grammarService.getGrammarsByTopicId(topicId).subscribe({
      next: (data) => {
        this.grammars = data.grammars;
      },
      error: (error) => {},
    });
  }

  onGrammarSelect(grammar: Grammar) {
    this.selectedGrammar = grammar;
    this.grammarTestConfig.topicName = `${this.selectedTopic?.name} - ${grammar.title}`; // Update config
    this.tests = []; // Clear previous tests
    this.currentPage = 1; // Reset pagination
    this.totalPages = 0; // Reset total pages
    this.loadTestsForGrammar(grammar.id);
  }

  loadTestsForGrammar(grammarId: string) {
    this.grammarService.getTestsByGrammarId(grammarId).subscribe({
      next: (data) => {
        this.grammarTests = data.grammarTests.content;
        this.testsBase = data.grammarTests.content.map((test) => ({
          id: test.id,
          name: test.name,
          duration: test.duration,
          createdAt: test.createdAt,
        }));
        // For grammar, we don't have pagination from API, so set to 1
        this.currentPage = 1;
        this.totalPages = 1;
      },
      error: (error) => {},
    });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    if (this.selectedGrammar) {
      this.loadTestsForGrammar(this.selectedGrammar.id);
    }
  }

  onCreateTest() {
    this.currentState = State.Create;
  }

  onSaveTest(testData: TestFormData) {
    if (!this.selectedGrammar) {return;
    }

    // Convert TestFormData to API format for grammar test
    const request: GrammarTestRequest = {
      name: testData.name,
      duration: testData.duration,
      questions: testData.questions
        .filter((question) => question.requestType)
        .map((question, index) => ({
          id: question.id || '',
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
          action:
            question.requestType ||
            (question.id ? RequestType.UPDATE : RequestType.ADD),
        })),
    };
    // Check if editing or creating
    if (this.currentState === State.Edit && this.testToEdit) {
      // Edit existing test
      this.grammarService.updateTest(request, this.testToEdit.id).subscribe({
        next: (response: any) => {
          this.currentState = State.View;
          this.testToEdit = null;
          // Reload tests for the current grammar
          this.loadTestsForGrammar(this.selectedGrammar!.id);
        },
        error: (error: any) => {alert('Không thể cập nhật bài test');
        },
      });
    } else {
      // Create new test
      this.grammarService.addTest(this.selectedGrammar.id, request).subscribe({
        next: (response: any) => {
          this.currentState = State.View;
          // Reload tests for the current grammar
          this.loadTestsForGrammar(this.selectedGrammar!.id);
        },
        error: (error: any) => {
          alert('Không thể tạo bài test');
        },
      });
    }
  }

  onCancelCreate() {
    this.currentState = State.View;
    this.testToEdit = null;
    this.testQuestionsForEdit = [];
  }

  getTestWithQuestions() {
    if (!this.testToEdit) return null;
    return {
      ...this.testToEdit,
      questions: this.testQuestionsForEdit,
    };
  }

  onViewTest(test: TestBase) {
    // Navigate to test detail or edit page
    this.router.navigate(['/admin/grammar/tests', test.id]);
  }

  onEditTest(test: TestBase) {
    this.loadTestForEdit(test.id);
  }

  loadTestForEdit(testId: string) {
    this.grammarService.getTestQuestionsByTestId(testId).subscribe({
      next: (testData) => {
        // Convert the response to GrammarTest format
        const grammarTest: GrammarTest = {
          id: testData.testId,
          grammarId: testData.grammarId,
          name: testData.testName,
          duration: testData.duration,
          createdAt: CommonUtils.getNow(), // Default value since not provided
        };

        // Store questions for editing
        this.testQuestionsForEdit = testData.grammarTestQuestions.map(
          (q) =>
            ({
              id: q.id,
              question: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer,
              questionOrder: q.questionOrder,
              explaination: q.explaination,
              testId: q.testId,
            } as GrammarTestQuestion)
        );

        this.testToEdit = grammarTest;
        this.currentState = State.Edit;
        this.grammarTestConfig.topicName = this.selectedGrammar?.title || '';
      },
      error: (error) => {alert('Không thể tải thông tin bài test');
      },
    });
  }

  onDeleteTest(test: TestBase) {
    this.showDeleteConfirm = true;
    this.testToDelete = test;
  }

  onConfirmDelete() {
    this.grammarService.deleteTest(this.testToDelete?.id || '').subscribe({
      next: (res) => {
        if (this.selectedGrammar) {
          this.loadTestsForGrammar(this.selectedGrammar.id);
        }
        this.showDeleteConfirm = false;
        this.testToDelete = null;
      },
    });
  }

  onCancelDelete() {
    this.showDeleteConfirm = false;
    this.testToDelete = null;
  }

  goBackToGrammars() {
    this.selectedGrammar = null;
    this.tests = [];
    this.testsBase = [];
    this.currentPage = 1;
    this.totalPages = 0;
    this.currentState = State.View;
  }

  goBackToTopics() {
    this.selectedTopic = null;
    this.selectedGrammar = null;
    this.grammars = [];
    this.tests = [];
    this.testsBase = [];
    this.currentPage = 1;
    this.totalPages = 0;
    this.currentState = State.View;
  }

  onUploadTest(files: {
    excelFile: File;
    imageFiles: File[];
    audioFiles: File[];
  }) {
    this.grammarService
      .uploadTestsByFile(
        this.selectedGrammar!.id,
        files.excelFile,
        files.imageFiles,
        files.audioFiles
      )
      .subscribe({
        next: (response: GrammarTest[]) => {
          this.currentState = State.View;
          this.loadTestsForGrammar(this.selectedGrammar!.id);
        },
        error: (error) => {
          alert('Không thể tải lên bài test');
        },
      });
  }

  onUploadTestState() {
    this.currentState = State.Upload;
  }

  submitGenerateTests(data: { topicType: string; description: string }) {
    this.isShowGenerateTests = false;
    const request: TestGenerateRequest = {
      description: data.description,
      id: this.selectedGrammar?.id || '',
      name: this.selectedGrammar?.title || '',
      content: this.selectedGrammar?.content,
      test_type: data.topicType,
    };
    this.agentService.generateTests(request).subscribe(() => {
      this.loadTestsForGrammar(this.selectedGrammar?.id || '');
    });
  }
}
