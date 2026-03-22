import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormPlanningComponent } from '../form-planning/form-planning.component';
import { PlanResponse } from '../../../models/response/plan-response.model';
import { PlanService } from '../../../services/PlanService';
@Component({
  selector: 'app-create-planning',
  standalone: true,
  imports: [CommonModule, FormPlanningComponent],
  templateUrl: './create-planning.component.html',
  styleUrl: './create-planning.component.scss',
})
export class CreatePlanningComponent implements OnInit {
  isEditMode = false;
  isGenerateMode = false;
  planToEdit: PlanResponse | null = null;
  planId: string | null = null;
  isLoading = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private planService: PlanService
  ) {}

  ngOnInit(): void {
    // Check for isEdit query parameter
    this.route.queryParams.subscribe((params) => {
      this.isEditMode = params['isEdit'] === 'true';
      this.isGenerateMode = params['isGenerate'] === 'true';
      if (this.isEditMode) {
        // Get planId from route params
        this.planId = this.route.snapshot.params['planId'];
        if (this.planId) {
          this.loadPlanForEdit();
        }
      }
      if (this.isGenerateMode) {
        this.planService.planGenerateResponse$.subscribe((response) => {
          if (response) {
            this.planToEdit = response;
          }
        });
      }
    });
  }

  loadPlanForEdit() {
    if (!this.planId) return;

    this.isLoading = true;
    this.error = null;

    this.planService.getPlanDetail(this.planId).subscribe({
      next: (plan) => {
        this.planToEdit = plan;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'Không thể tải kế hoạch để chỉnh sửa. Vui lòng thử lại.';
        this.isLoading = false;},
    });
  }

  onPlanSaved(plan: PlanResponse) {
    this.router.navigate(['/planning/list']);
  }

  onCancel() {
    this.router.navigate(['/planning/list']);
  }
}
