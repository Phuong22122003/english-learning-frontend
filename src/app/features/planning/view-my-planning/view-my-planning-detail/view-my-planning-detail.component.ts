import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { PlanService } from '../../../../services/PlanService';
import { ActivatedRoute } from '@angular/router';
import { PlanResponse } from '../../../../models/response/plan-response.model';
import { ItemTypeEnum } from '../../../../models/item-type-enum';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';
import { PlanningCalenderComponent } from './planning-calender/planning-calender.component';

@Component({
  selector: 'app-view-my-planning-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FontAwesomeModule,
    PlanningCalenderComponent,
  ],
  templateUrl: './view-my-planning-detail.component.html',
  styleUrl: './view-my-planning-detail.component.scss',
})
export class ViewMyPlanningDetailComponent implements OnInit {
  planId: string;
  plan: PlanResponse = {} as PlanResponse;
  isLoading = false;
  error: string | null = null;
  faTrash = faTrash;
  faEdit = faEdit;
  faArrowLeft = faArrowLeft;
  faCalendar = faCalendar;
  isShowCalendar = false;
  constructor(
    private planService: PlanService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.planId = this.route.snapshot.params['planId'];
  }

  ngOnInit(): void {
    this.loadPlanDetail();
  }

  loadPlanDetail() {
    this.isLoading = true;
    this.error = null;

    this.planService.getPlanDetail(this.planId).subscribe({
      next: (plan) => {
        this.plan = plan;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Không thể tải chi tiết kế hoạch. Vui lòng thử lại.';
        this.isLoading = false;},
    });
  }

  getTestTypeLabel(topicType: ItemTypeEnum): string {
    const typeLabels: { [key in ItemTypeEnum]?: string } = {
      [ItemTypeEnum.VOCABULARY]: 'Từ vựng',
      [ItemTypeEnum.GRAMMAR]: 'Ngữ pháp',
      [ItemTypeEnum.LISTENING]: 'Nghe hiểu',
    };
    return typeLabels[topicType] || topicType;
  }

  getStatusColor(isCompleted: boolean): string {
    return isCompleted ? 'text-green-600' : 'text-yellow-600';
  }

  getStatusBackgroundColor(isCompleted: boolean): string {
    return isCompleted ? 'bg-green-100' : 'bg-yellow-100';
  }

  getStatusLabel(isCompleted: boolean): string {
    return isCompleted ? 'Hoàn thành' : 'Đang thực hiện';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('vi-VN');
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('vi-VN');
  }

  getProgressPercentage(): number {
    if (this.plan.isCompleted) return 100;
    const startDate = new Date(this.plan.startDate);
    const endDate = new Date(this.plan.endDate);
    const today = new Date();
    const totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const passedDays = Math.ceil(
      (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.min(Math.max((passedDays / totalDays) * 100, 0), 100);
  }

  onEditPlan() {
    // Navigate to edit plan with isEdit=true
    this.router.navigate(['/planning/create', this.planId], {
      queryParams: { isEdit: 'true' },
    });
  }

  onDeletePlan() {
    // Show confirmation dialog and delete
    if (confirm(`Bạn có chắc chắn muốn xóa kế hoạch "${this.plan.title}"?`)) {
      this.planService.deletePlan(this.planId).subscribe({
        next: () => {
          this.router.navigate(['/planning']);
        },
        error: (error) => {},
      });
    }
  }

  getTotalPlanDetails(): number {
    if (!this.plan.planGroups) return 0;
    return this.plan.planGroups.reduce(
      (total, group) => total + (group.planDetails?.length || 0),
      0
    );
  }

  navigateToTopic(topicType: ItemTypeEnum, topicId: string) {
    let route = '';

    switch (topicType) {
      case ItemTypeEnum.VOCABULARY:
        route = `/topic-detail/vocabulary/${topicId}`;
        break;
      case ItemTypeEnum.GRAMMAR:
        route = `/topic-detail/grammar/${topicId}`;
        break;
      case ItemTypeEnum.LISTENING:
        route = `/topic-detail/listening/${topicId}`;
        break;
      default:
        console.warn('Unknown topic type:', topicType);
        return;
    }

    this.router.navigate([route]);
  }

  onShowCalendar() {
    this.isShowCalendar = !this.isShowCalendar;
  }
}
