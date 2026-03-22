import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';
import { PlanService } from '../../../services/PlanService';
import { VocabularyService } from '../../../services/VocabularyService';
import { GrammarService } from '../../../services/GrammarService';
import { ListeningService } from '../../../services/ListeningService';
import { PlanRequest } from '../../../models/request/plan-request.model';
import { PlanResponse } from '../../../models/response/plan-response.model';
import { PlanGroupRequest } from '../../../models/request/plan-group-request.model';
import { PlanDetailRequest } from '../../../models/request/plan-detail-request.model';
import { ItemTypeEnum } from '../../../models/item-type-enum';
import { VocabTopic } from '../../../models/vocabulary/vocab-topic.model';
import { GrammarTopic } from '../../../models/grammar/grammar-topic.model';
import { ListeningTopic } from '../../../models/listening/listening-topic.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-form-planning',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FontAwesomeModule],
  templateUrl: './form-planning.component.html',
  styleUrl: './form-planning.component.scss',
})
export class FormPlanningComponent implements OnInit {
  @Input() planToEdit: PlanResponse | null = null;
  @Input() isEditMode: boolean = false;
  @Input() isGenerateMode: boolean = false;
  @Output() planSaved = new EventEmitter<PlanResponse>();
  @Output() cancel = new EventEmitter<void>();

  planRequest: PlanRequest = {
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    target: 0,
    planGroups: [],
  };

  isLoading = false;
  error: string | null = null;
  isSubmitting = false;

  // Form validation
  formErrors: { [key: string]: string } = {};

  // Plan groups management
  newPlanGroup: PlanGroupRequest = {
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    planDetails: [],
  };

  // Plan details management - will be created per group
  newPlanDetail: PlanDetailRequest | null = null;

  // Available topic types
  topicTypes = [
    { value: ItemTypeEnum.NOTHING, label: 'Chọn loại chủ đề topic' },
    { value: ItemTypeEnum.VOCABULARY, label: 'Từ vựng' },
    { value: ItemTypeEnum.GRAMMAR, label: 'Ngữ pháp' },
    { value: ItemTypeEnum.LISTENING, label: 'Nghe hiểu' },
  ];

  // Topic management
  availableTopics: (VocabTopic | GrammarTopic | ListeningTopic)[] = [];
  isLoadingTopics = false;
  topicsError: string | null = null;

  // FontAwesome icons
  faTrash = faTrash;
  faTimes = faTimes;

  constructor(
    private planService: PlanService,
    private vocabularyService: VocabularyService,
    private grammarService: GrammarService,
    private listeningService: ListeningService
  ) {}

  ngOnInit(): void {

    if (
      (this.isEditMode && this.planToEdit) ||
      (this.isGenerateMode && this.planToEdit)
    ) {
      this.loadPlanForEdit();
    } else {
      this.initializeNewPlan();
    }
  }

  loadPlanForEdit() {
    if (this.planToEdit) {
      this.planRequest = {
        title: this.planToEdit.title,
        description: this.planToEdit.description,
        startDate: this.formatDateFromISO(this.planToEdit.startDate.toString()),
        endDate: this.formatDateFromISO(this.planToEdit.endDate.toString()),
        target: this.planToEdit.target,
        planGroups: this.planToEdit.planGroups.map((group) => ({
          name: group.name,
          description: group.description,
          startDate: this.formatDateFromISO(group.startDate.toString()),
          endDate: this.formatDateFromISO(group.endDate.toString()),
          planDetails: group.planDetails.map((detail) => ({
            topicType: detail.topicType,
            topicId: detail.topicId,
            startDate: detail.startDate,
            endDate: detail.endDate,
            topicName: detail.topicName,
            description: detail.description,
          })),
        })),
      };
    }
  }

  initializeNewPlan() {
    const today = new Date();
    const nextMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      today.getDate()
    );

    this.planRequest = {
      title: '',
      description: '',
      startDate: this.formatDateForInput(today),
      endDate: this.formatDateForInput(nextMonth),
      target: 100,
      planGroups: [],
    };
  }

  validateForm(): boolean {
    this.formErrors = {};

    if (!this.planRequest.title.trim()) {
      this.formErrors['title'] = 'Tên kế hoạch là bắt buộc';
    }

    if (!this.planRequest.description.trim()) {
      this.formErrors['description'] = 'Mô tả là bắt buộc';
    }

    if (!this.planRequest.startDate) {
      this.formErrors['startDate'] = 'Ngày bắt đầu là bắt buộc';
    }

    if (!this.planRequest.endDate) {
      this.formErrors['endDate'] = 'Ngày kết thúc là bắt buộc';
    }

    if (this.planRequest.startDate && this.planRequest.endDate) {
      const startDate = new Date(this.planRequest.startDate);
      const endDate = new Date(this.planRequest.endDate);

      if (startDate >= endDate) {
        this.formErrors['endDate'] = 'Ngày kết thúc phải sau ngày bắt đầu';
      }
    }

    if (this.planRequest.target < 10 || this.planRequest.target > 990) {
      this.formErrors['target'] = 'Mục tiêu phải từ 10 đến 990 điểm';
    }

    return Object.keys(this.formErrors).length === 0;
  }

  onCancel() {
    this.cancel.emit();
  }

  // Plan Groups Management
  addPlanGroup() {
    if (
      this.newPlanGroup.name.trim() &&
      this.newPlanGroup.description.trim() &&
      this.newPlanGroup.startDate &&
      this.newPlanGroup.endDate &&
      this.isValidDate(this.newPlanGroup.startDate) &&
      this.isValidDate(this.newPlanGroup.endDate) &&
      this.isStartBeforeEnd(
        this.newPlanGroup.startDate,
        this.newPlanGroup.endDate
      )
    ) {
      this.planRequest.planGroups.push({ ...this.newPlanGroup });

      this.newPlanGroup = {
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        planDetails: [],
      };
    } else {
      // optional: show error message
      console.warn('Ngày bắt đầu / kết thúc không hợp lệ');
    }
  }

  removePlanGroup(index: number) {
    if (
      confirm(
        'Bạn có chắc chắn muốn xóa nhóm kế hoạch này? Tất cả các chi tiết trong nhóm cũng sẽ bị xóa.'
      )
    ) {
      this.planRequest.planGroups.splice(index, 1);
    }
  }

  // Plan Details Management
  getNewPlanDetailForGroup(groupIndex: number): PlanDetailRequest {
    if (!this.planRequest.planGroups[groupIndex].newPlanDetail) {
      this.planRequest.planGroups[groupIndex].newPlanDetail = {
        topicType: ItemTypeEnum.NOTHING,
        topicId: '',
        startDate: '',
        endDate: '',
        topicName: '',
        description: '',
      };
    }
    return this.planRequest.planGroups[groupIndex].newPlanDetail!;
  }

  addPlanDetail(groupIndex: number) {
    const newDetail = this.getNewPlanDetailForGroup(groupIndex);
    if (newDetail.topicId.trim()) {
      this.planRequest.planGroups[groupIndex].planDetails.push({
        ...newDetail,
        topicName: this.getTopicDisplayName(
          newDetail.topicType,
          newDetail.topicId
        ),
      });
      // Reset the new detail for this group
      this.planRequest.planGroups[groupIndex].newPlanDetail = {
        topicType: ItemTypeEnum.VOCABULARY,
        topicId: '',
        startDate: '',
        endDate: '',
        topicName: '',
        description: '',
      };
    }
  }

  removePlanDetail(groupIndex: number, detailIndex: number) {
    const detail =
      this.planRequest.planGroups[groupIndex].planDetails[detailIndex];
    const topicName =
      detail.topicName ||
      this.getTopicDisplayName(detail.topicType, detail.topicId);
    if (
      confirm(
        `Bạn có chắc chắn muốn xóa chi tiết "${topicName}" khỏi nhóm này?`
      )
    ) {
      this.planRequest.planGroups[groupIndex].planDetails.splice(
        detailIndex,
        1
      );
    }
  }

  getTopicTypeLabel(topicType: ItemTypeEnum): string {
    if (topicType === ItemTypeEnum.NOTHING) return '';
    const type = this.topicTypes.find((t) => t.value === topicType);
    return type ? type.label : topicType;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('vi-VN');
  }

  // Topic management methods
  onTopicTypeChange(groupIndex: number) {
    const newDetail = this.getNewPlanDetailForGroup(groupIndex);
    newDetail.topicId = ''; // Reset selected topic
    this.loadTopicsByType(newDetail.topicType);
  }

  loadTopicsByType(topicType: ItemTypeEnum) {
    this.isLoadingTopics = true;
    this.topicsError = null;
    this.availableTopics = [];

    switch (topicType) {
      case ItemTypeEnum.VOCABULARY:
        this.vocabularyService.getTopics(0, 100).subscribe({
          next: (response) => {
            this.availableTopics = response.content || [];
            this.isLoadingTopics = false;
          },
          error: (error) => {
            this.topicsError =
              'Không thể tải danh sách từ vựng. Vui lòng thử lại.';
            this.isLoadingTopics = false;},
        });
        break;

      case ItemTypeEnum.GRAMMAR:
        this.grammarService.getAllTopics(0, 100).subscribe({
          next: (response) => {
            this.availableTopics = response.content || [];
            this.isLoadingTopics = false;
          },
          error: (error) => {
            this.topicsError =
              'Không thể tải danh sách ngữ pháp. Vui lòng thử lại.';
            this.isLoadingTopics = false;},
        });
        break;

      case ItemTypeEnum.LISTENING:
        this.listeningService.getTopics(0, 100).subscribe({
          next: (response) => {
            this.availableTopics = response.content || [];
            this.isLoadingTopics = false;
          },
          error: (error) => {
            this.topicsError =
              'Không thể tải danh sách nghe hiểu. Vui lòng thử lại.';
            this.isLoadingTopics = false;},
        });
        break;

      default:
        this.availableTopics = [];
        this.isLoadingTopics = false;
        break;
    }
  }

  getTopicName(topic: VocabTopic | GrammarTopic | ListeningTopic): string {
    return topic.name;
  }

  getTopicId(topic: VocabTopic | GrammarTopic | ListeningTopic): string {
    return topic.id;
  }

  getTopicDescription(
    topic: VocabTopic | GrammarTopic | ListeningTopic
  ): string {
    return topic.description;
  }

  getTopicDisplayName(topicType: ItemTypeEnum, topicId: string): string {
    const topic = this.availableTopics.find(
      (t) => this.getTopicId(t) === topicId
    );
    if (topic) {
      return this.getTopicName(topic);
    }
    return `ID: ${topicId}`; // Fallback to ID if topic not found
  }

  getSelectedTopicDescription(groupIndex: number): string {
    const newDetail = this.getNewPlanDetailForGroup(groupIndex);
    if (!newDetail.topicId) return '';
    const topic = this.availableTopics.find(
      (t) => this.getTopicId(t) === newDetail.topicId
    );
    return topic ? this.getTopicDescription(topic) : '';
  }

  // Date formatting methods
  formatDateForInput(date: Date): string {
    // Format for datetime-local input (YYYY-MM-DDTHH:mm)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  formatDateForAPI(dateString: string): string {
    if (!dateString) return '';
    return dateString.length === 16 ? `${dateString}:00` : dateString;
  }

  formatDateFromISO(isoString: string): string {
    // Convert ISO string to datetime-local format for input
    if (!isoString) return '';
    const date = new Date(isoString);
    return this.formatDateForInput(date);
  }

  onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    // Convert dates to ISO format for API
    const planRequestForAPI = {
      ...this.planRequest,
      startDate: this.formatDateForAPI(this.planRequest.startDate),
      endDate: this.formatDateForAPI(this.planRequest.endDate),
      planGroups: this.planRequest.planGroups.map((group) => ({
        name: group.name,
        description: group.description,
        startDate: this.formatDateForAPI(group.startDate),
        endDate: this.formatDateForAPI(group.endDate),
        planDetails: group.planDetails.map((detail) => ({
          ...detail,
          startDate: this.formatDateForAPI(detail.startDate),
          endDate: this.formatDateForAPI(detail.endDate),
        })),
      })),
    };
    // Use appropriate API based on mode
    let apiCall: Observable<PlanResponse>;
    if (this.isEditMode && this.planToEdit) {
      apiCall = this.planService.editPlan(
        this.planToEdit.id,
        planRequestForAPI
      );
    } else {
      apiCall = this.planService.addPlan(planRequestForAPI);
    }

    apiCall.subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.planSaved.emit(response);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.error = this.isEditMode
          ? 'Không thể cập nhật kế hoạch. Vui lòng thử lại.'
          : 'Không thể tạo kế hoạch. Vui lòng thử lại.';},
    });
  }

  private isValidDate(dateStr: string): boolean {
    if (!dateStr) return false;

    const d = new Date(dateStr);
    return !isNaN(d.getTime());
  }

  private isStartBeforeEnd(start: string, end: string): boolean {
    const startDate = new Date(start);
    const endDate = new Date(end);

    return startDate.getTime() < endDate.getTime();
  }
}
