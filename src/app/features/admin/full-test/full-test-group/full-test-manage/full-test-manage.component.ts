import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faFileAlt,
  faEye,
  faPlus,
  faArrowLeft,
  faClock,
  faEdit,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { ToeicTestResponse } from '../../../../../models/response/toeict-test-response.model';
import { ToeicTestGroupResponse } from '../../../../../models/response/toeic-test-group-response.model';
import { ToeicTestRequest } from '../../../../../models/request/toeic-test-request-model';
import { FullTestAddComponent } from './full-test-add/full-test-add.component';
import { ToeicTestService } from '../../../../../services/ToeicTestService';
import { UploadByFileComponent } from '../../../upload-by-file/upload-by-file.component';
import { environment } from '../../../../../../environments/environment';

enum Status {
  ADD = 'ADD',
  VIEW = 'VIEW',
  EDIT = 'EDIT',
  ADD_BY_FILE = 'ADD_BY_FILE',
}

@Component({
  selector: 'app-full-test-manage',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FontAwesomeModule,
    DatePipe,
    FullTestAddComponent,
    UploadByFileComponent,
  ],
  templateUrl: './full-test-manage.component.html',
  styleUrl: './full-test-manage.component.scss',
})
export class FullTestManageComponent implements OnInit {
  groupId: string = '';
  group: ToeicTestGroupResponse | null = null;
  tests: ToeicTestResponse[] = [];
  isLoading = false;
  error: string | null = null;
  currentStatus: Status = Status.VIEW;
  editingTest: ToeicTestResponse | null = null;
  excelTemplate = environment.excelToeicTestsTemplate;
  // FontAwesome icons
  faFileAlt = faFileAlt;
  faEye = faEye;
  faPlus = faPlus;
  faArrowLeft = faArrowLeft;
  faClock = faClock;
  faEdit = faEdit;
  faTrash = faTrash;
  Status = Status;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toeicTestService: ToeicTestService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.groupId = params['groupId'];
      if (this.groupId) {
        this.loadTests();
      }
    });
  }

  loadTests(): void {
    this.isLoading = true;
    this.error = null;

    this.toeicTestService.getGroupById(this.groupId).subscribe({
      next: (group) => {
        this.group = group;
        this.tests = group.tests;
        this.isLoading = false;
      },
      error: (error) => {this.isLoading = false;
        this.error = 'Không thể tải danh sách bài test. Vui lòng thử lại.';
      },
    });
  }

  viewTestDetail(testId: string): void {
    this.router.navigate(['/admin/full-test/groups', this.groupId, testId]);
  }

  goBack(): void {
    this.router.navigate(['/admin/full-test/groups']);
  }

  getTotalCompletion(test: ToeicTestResponse): number {
    return test.totalCompletion || 0;
  }

  addTest(): void {
    this.editingTest = null;
    this.currentStatus = Status.ADD;
  }

  editTest(testId: string): void {
    this.isLoading = true;
    this.error = null;

    this.toeicTestService.getTestById(testId).subscribe({
      next: (test) => {
        this.editingTest = test;
        this.currentStatus = Status.EDIT;
        this.isLoading = false;
      },
      error: (error) => {this.error = 'Không thể tải thông tin bài test. Vui lòng thử lại.';
        this.isLoading = false;
      },
    });
  }

  onSaveTest(request: ToeicTestRequest): void {
    this.currentStatus = Status.VIEW;
    this.editingTest = null;
    this.loadTests();
  }

  onCancelTest(): void {
    this.currentStatus = Status.VIEW;
    this.editingTest = null;
  }

  deleteTest(testId: string, testName: string): void {
    if (
      confirm(
        `Bạn có chắc chắn muốn xóa bài test "${testName}"? Hành động này không thể hoàn tác.`
      )
    ) {
      this.isLoading = true;
      this.error = null;

      this.toeicTestService.deleteTest(testId).subscribe({
        next: () => {
          this.isLoading = false;
          // Reload tests after deletion
          this.loadTests();
        },
        error: (error) => {this.error = 'Không thể xóa bài test. Vui lòng thử lại.';
          this.isLoading = false;
        },
      });
    }
  }

  addTestByFile(): void {
    this.currentStatus = Status.ADD_BY_FILE;
    this.editingTest = null;
  }

  onUploadTestByFile(files: {
    excelFile: File;
    imageFiles: File[];
    audioFiles: File[];
  }): void {
    this.isLoading = true;
    this.error = null;
    this.toeicTestService
      .addTestByFile(
        this.groupId,
        files.excelFile,
        files.imageFiles,
        files.audioFiles
      )
      .subscribe({
        next: (test) => {
          this.loadTests();
          this.isLoading = false;
          this.currentStatus = Status.VIEW;
          this.editingTest = null;
        },
        error: (error) => {this.error = 'Không thể tải lên bài test. Vui lòng thử lại.';
          this.isLoading = false;
          this.currentStatus = Status.VIEW;
          this.editingTest = null;
        },
      });
  }
}
