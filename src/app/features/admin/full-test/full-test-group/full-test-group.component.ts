import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faFileAlt,
  faCalendarAlt,
  faClock,
  faArrowRight,
  faPlus,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';
import { ToeicTestGroupResponse } from '../../../../models/response/toeic-test-group-response.model';
import { ToeicTestService } from '../../../../services/ToeicTestService';
import { ToeicTestGroupRequest } from '../../../../models/request/toeic-test-group-request.model';
import { FullTestGroupAddComponent } from './full-test-group-add/full-test-group-add.component';
import { environment } from '../../../../../environments/environment';
import { PaginationComponent } from '../../../../shared/pagination/pagination.component';
import { ConfirmDialogComponent } from '../../../../shared/confirm-dialog/confirm-dialog.component';

enum Status {
  ADD = 'ADD',
  VIEW = 'VIEW',
  EDIT = 'EDIT',
}

@Component({
  selector: 'app-full-test-group',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FontAwesomeModule,
    FullTestGroupAddComponent,
    PaginationComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './full-test-group.component.html',
  styleUrl: './full-test-group.component.scss',
})
export class FullTestGroupComponent implements OnInit {
  Status = Status;
  toeicGroups: ToeicTestGroupResponse[] = [];
  isLoading = false;
  error: string | null = null;
  currentStatus: Status = Status.VIEW;
  // FontAwesome icons
  faFileAlt = faFileAlt;
  faCalendarAlt = faCalendarAlt;
  faClock = faClock;
  faArrowRight = faArrowRight;
  faPlus = faPlus;
  currentPage = 1;
  readonly GROUPS_PER_PAGE = environment.PAGE_SIZE;
  totalPages = 1;
  totalElements = 0;
  selectedGroup: ToeicTestGroupResponse | null = null;
  selectedGroupToDelete: ToeicTestGroupResponse | null = null;
  isShowDeleteConfirmation = false;
  faTrashAlt = faTrashAlt;
  constructor(private toeicTestService: ToeicTestService) {}

  ngOnInit(): void {
    this.fetchToeicTestGroups();
  }

  fetchToeicTestGroups() {
    this.isLoading = true;
    this.error = null;

    this.toeicTestService
      .getGroup(this.currentPage - 1, this.GROUPS_PER_PAGE)
      .subscribe({
        next: (groups) => {
          this.toeicGroups = groups.content;
          this.totalPages = groups.totalPages;
          this.totalElements = groups.totalElements;
          this.currentPage = groups.number + 1;
          this.isLoading = false;
        },
        error: (error) => {
          this.error = 'Không thể tải danh sách nhóm TOEIC. Vui lòng thử lại.';
          this.isLoading = false;
        },
      });
  }

  viewTests(groupId: string) {
    // Navigation will be handled by routerLink in template
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  addToeicTestGroup() {
    this.currentStatus = Status.ADD;
  }

  onSaveToeicTestGroup(request: ToeicTestGroupRequest) {
    this.currentStatus = Status.VIEW;
    this.fetchToeicTestGroups();
  }

  onCancelToeicTestGroup() {
    this.currentStatus = Status.VIEW;
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.fetchToeicTestGroups();
  }

  onEditToeicTestGroup(group: ToeicTestGroupResponse) {
    this.currentStatus = Status.EDIT;
    this.selectedGroup = group;
  }
  showDeleteConfirmation(group: ToeicTestGroupResponse) {
    this.selectedGroupToDelete = group;
    this.isShowDeleteConfirmation = true;
  }
  onDeleteToeicTestGroup() {
    this.toeicTestService
      .deleteGroup(this.selectedGroupToDelete?.id as string)
      .subscribe({
        next: () => {
          this.fetchToeicTestGroups();
          this.isShowDeleteConfirmation = false;
          this.selectedGroupToDelete = null;
        },
        error: (error) => {
          this.error = 'Không thể xóa nhóm TOEIC. Vui lòng thử lại.';
          this.isShowDeleteConfirmation = false;
          this.selectedGroupToDelete = null;},
      });
  }
}
