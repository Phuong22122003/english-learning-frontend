import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PlanService } from '../../../services/PlanService';
import { PlanResponse } from '../../../models/response/plan-response.model';
import { PaginationComponent } from '../../../shared/pagination/pagination.component';
import { environment } from '../../../../environments/environment';
import {
  AiPlanningModalComponent,
  GenerateData,
} from '../ai-planning-modal/ai-planning-modal.component';
import { AiButtonComponent } from '../../../shared/ai-button/ai-button.component';
import { UserService } from '../../../services/UserService';
import { PlanRequest } from '../../../models/request/plan-request.model';

@Component({
  selector: 'app-view-my-planning',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PaginationComponent,
    AiPlanningModalComponent,
    AiButtonComponent,
  ],
  templateUrl: './view-my-planning.component.html',
  styleUrl: './view-my-planning.component.scss',
})
export class ViewMyPlanningComponent implements OnInit {
  plans: PlanResponse[] = [];
  currentPage = 1;
  readonly PAGE_SIZE = environment.PAGE_SIZE;
  totalPages = 1;
  isLoading = false;
  error: string | null = null;
  showAIPlanningModal = false;
  loading = false;
  constructor(
    private planService: PlanService,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadPlans(this.currentPage - 1);
  }

  handlePageChange(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadPlans(page - 1);
    }
  }

  loadPlans(page: number) {
    this.isLoading = true;
    this.error = null;

    this.planService.getPlans(page, this.PAGE_SIZE).subscribe({
      next: (data) => {
        this.plans = data.content || [];
        this.totalPages = data.totalPages || 1;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Không thể tải danh sách kế hoạch. Vui lòng thử lại.';
        this.isLoading = false;},
    });
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

  getProgressPercentage(plan: PlanResponse): number {
    // This is a mock calculation - you might want to implement actual progress tracking
    if (plan.isCompleted) return 100;
    const startDate = new Date(plan.startDate);
    const endDate = new Date(plan.endDate);
    const today = new Date();
    const totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const passedDays = Math.ceil(
      (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return Math.min(Math.max((passedDays / totalDays) * 100, 0), 100);
  }

  onViewPlan(plan: PlanResponse) {
    // Navigate to plan detail
    this.router.navigate(['/planning/detail', plan.id]);
  }

  onEditPlan(plan: PlanResponse) {
    // Navigate to edit plan
    this.router.navigate(['/planning/create', plan.id], {
      queryParams: { isEdit: 'true' },
    });
  }

  onDeletePlan(plan: PlanResponse) {
    // Show confirmation dialog and delete
    if (confirm(`Bạn có chắc chắn muốn xóa kế hoạch "${plan.title}"?`)) {
      this.planService.deletePlan(plan.id).subscribe({
        next: () => {
          this.loadPlans(this.currentPage - 1);
          this.router.navigate(['/planning']);
        },
        error: (error) => {},
      });
    }
  }

  handleGenerate(generateData: GenerateData) {
    if (generateData.useAccountInfo) {
      this.userService.user$.subscribe((user) => {
        if (user) {
          this.isLoading = true;
          this.planService
            .generatePlan({
              jwt: this.userService.getJwt() || '',
              target: generateData.target,
              description: generateData.description,
              level: generateData.level,
              studyTime: generateData.studyTime,
            })
            .subscribe((data) => {
              this.isLoading = false;
              const planResponse = JSON.parse(data) as PlanResponse;
              planResponse.target = generateData.target;
              this.planService.setPlanGenerateResponse(planResponse);
              this.router.navigate(['/planning/create'], {
                queryParams: { isGenerate: 'true' },
              });
            });
        }
      });
    } else {
      this.isLoading = true;
      this.planService
        .generatePlan({
          jwt: this.userService.getJwt() || '',
          target: generateData.target,
          description: generateData.description,
          level: generateData.level,
          studyTime: generateData.studyTime,
        })
        .subscribe({
          next: (data) => {
            this.isLoading = false;
            const planResponse = JSON.parse(data) as PlanResponse;
            planResponse.target = generateData.target;
            this.planService.setPlanGenerateResponse(planResponse);
            this.router.navigate(['/planning/create'], {
              queryParams: { isGenerate: 'true' },
            });
          },
          error: (error) => {
            this.isLoading = false;},
        });
    }
  }
}
