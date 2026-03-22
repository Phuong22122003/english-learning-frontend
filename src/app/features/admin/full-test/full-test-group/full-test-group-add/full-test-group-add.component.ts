import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSave, faTimes, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { ToeicTestGroupRequest } from '../../../../../models/request/toeic-test-group-request.model';
import { ToeicTestGroupResponse } from '../../../../../models/response/toeic-test-group-response.model';
import { ToeicTestService } from '../../../../../services/ToeicTestService';

@Component({
  selector: 'app-full-test-group-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './full-test-group-add.component.html',
  styleUrl: './full-test-group-add.component.scss',
})
export class FullTestGroupAddComponent implements OnInit {
  @Input() initialData: ToeicTestGroupResponse | null = null;
  @Input() isEditMode: boolean = false;
  @Output() save = new EventEmitter<ToeicTestGroupRequest>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  isSubmitting = false;
  error: string | null = null;

  // FontAwesome icons
  faSave = faSave;
  faTimes = faTimes;
  faFileAlt = faFileAlt;

  constructor(
    private fb: FormBuilder,
    private toeicTestService: ToeicTestService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    // Determine if edit mode (either explicitly set or inferred from initialData)
    this.isEditMode = this.isEditMode || !!this.initialData;

    // Get initial values
    const initialName = this.initialData?.name || '';
    const initialReleaseDate = this.initialData?.releaseDate
      ? this.formatDateFromISO(this.initialData.releaseDate)
      : this.formatDateForInput(new Date());

    this.form = this.fb.group({
      name: [
        initialName,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(200),
        ],
      ],
      releaseDate: [initialReleaseDate, Validators.required],
    });
  }

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDateFromISO(isoString: string): string {
    if (!isoString) return this.formatDateForInput(new Date());
    // Convert ISO string to YYYY-MM-DD for date input
    const date = new Date(isoString);
    return this.formatDateForInput(date);
  }

  formatDateForAPI(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toISOString();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    const formValue = this.form.value;
    const request: ToeicTestGroupRequest = {
      name: formValue.name.trim(),
      releaseDate: this.formatDateForAPI(formValue.releaseDate),
    };

    // TODO: Implement API call
    if (this.isEditMode && this.initialData) {
      this.toeicTestService
        .updateGroup(this.initialData.id, request)
        .subscribe({
          next: (response) => {
            this.isSubmitting = false;
            this.save.emit(response);
          },
          error: (error) => {
            this.isSubmitting = false;
            this.error =
              'Không thể cập nhật nhóm TOEIC test. Vui lòng thử lại.';},
        });
    } else {
      this.toeicTestService.addGroup(request).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.save.emit(response);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.error = 'Không thể tạo nhóm TOEIC test. Vui lòng thử lại.';},
      });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
