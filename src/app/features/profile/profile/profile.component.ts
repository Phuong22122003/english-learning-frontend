import { Component, OnInit } from '@angular/core';
import { User } from '../../../models/user/user.model';
import { UserService } from '../../../services/UserService';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  UserProfileUpdateRequest,
  StudyTime,
} from '../../../models/request/user-profile-update-request.model';
import { Level } from '../../../models/level.enum';
import { faCamera, faPencil, faLock } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ChangePasswordComponent } from '../change-password/change-password.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    ChangePasswordComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  profile?: User;
  isEditing: boolean = false;
  isLoading: boolean = false;
  error: string | null = null;
  success: string | null = null;
  faCamera = faCamera;
  faPencil = faPencil;
  faLock = faLock;
  isChangingPassword: boolean = false;
  showConfirmChangePassword: boolean = false;
  confirmTitle: string = 'Xác nhận';
  confirmMessage: string =
    'Bạn có chắc chắn muốn đổi mật khẩu?, OTP sẽ được gửi đến email của bạn';
  confirmText: string = 'Đổi mật khẩu';
  cancelText: string = 'Hủy';
  onConfirmChangePassword(): void {
    this.showConfirmChangePassword = false;
    this.isChangingPassword = true;
  }
  onCancelChangePassword(): void {
    this.showConfirmChangePassword = false;
  }
  // Form data
  editForm = {
    fullname: '',
    studyTime: StudyTime.MORNING,
    level: Level.BEGINNER,
    target: '',
  };

  // Options for selects
  studyLevelOptions = [
    { value: StudyTime.MORNING, label: 'Buổi sáng' },
    { value: StudyTime.AFTERNOON, label: 'Buổi chiều' },
    { value: StudyTime.EVENING, label: 'Buổi tối' },
    { value: StudyTime.NIGHT, label: 'Đêm' },
  ];

  levelOptions = [
    { value: Level.BEGINNER, label: 'Bắt đầu' },
    { value: Level.INTERMEDIATE, label: 'Trung bình' },
    { value: Level.ADVANCED, label: 'Nâng cao' },
  ];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.user$.subscribe((user) => {
      this.profile = user || undefined;
      if (this.profile) {
        this.initForm();
      }
    });
  }

  initForm(): void {
    if (!this.profile) return;

    this.editForm.fullname = this.profile.fullname || '';
    this.editForm.target = this.profile.target?.toString() || '';

    // Map studyTime to StudyLevel enum
    const studyTimeUpper = this.profile.studyTime.toString();
    if (studyTimeUpper === StudyTime.MORNING.toString()) {
      this.editForm.studyTime = StudyTime.MORNING;
    } else if (studyTimeUpper === StudyTime.AFTERNOON.toString()) {
      this.editForm.studyTime = StudyTime.AFTERNOON;
    } else if (studyTimeUpper === StudyTime.EVENING.toString()) {
      this.editForm.studyTime = StudyTime.EVENING;
    } else if (studyTimeUpper === StudyTime.NIGHT.toString()) {
      this.editForm.studyTime = StudyTime.NIGHT;
    } else {
      this.editForm.studyTime = StudyTime.MORNING;
    }

    // Map level string to Level enum
    const levelUpper = this.profile.level.toString();
    if (levelUpper === Level.BEGINNER.toString()) {
      this.editForm.level = Level.BEGINNER;
    } else if (levelUpper === Level.INTERMEDIATE.toString()) {
      this.editForm.level = Level.INTERMEDIATE;
    } else if (levelUpper === Level.ADVANCED.toString()) {
      this.editForm.level = Level.ADVANCED;
    } else {
      this.editForm.level = Level.BEGINNER;
    }
  }

  onAvatarChange(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.isLoading = true;
      this.error = null;
      this.success = null;

      this.userService.uploadAvatar(file).subscribe({
        next: (url) => {
          if (this.profile) {
            this.profile.avartarUrl = url;
            this.userService.setUser(this.profile);
          }
          this.isLoading = false;
          this.success = 'Avatar đã được cập nhật thành công!';
          setTimeout(() => (this.success = null), 3000);
        },
        error: (err) => {
this.isLoading = false;
          this.error = 'Không thể tải avatar. Vui lòng thử lại.';
          setTimeout(() => (this.error = null), 3000);
        },
      });
    }
  }

  startEdit(): void {
    this.isEditing = true;
    this.isChangingPassword = false;
    this.error = null;
    this.success = null;
  }

  startChangePassword(): void {
    this.showConfirmChangePassword = true;
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.isChangingPassword = false;
    this.initForm();
    this.error = null;
    this.success = null;
  }

  getStudyLevelLabel(): string {
    const option = this.studyLevelOptions.find(
      (opt) => opt.value === this.editForm.studyTime
    );
    return option?.label || this.profile?.studyTime.toString() || '';
  }

  getLevelLabel(): string {
    const option = this.levelOptions.find(
      (opt) => opt.value === this.editForm.level
    );
    return option?.label || this.profile?.level.toString() || '';
  }

  onSubmit(): void {
    if (!this.profile) return;

    // Validation
    if (!this.editForm.fullname?.trim()) {
      this.error = 'Vui lòng nhập họ tên';
      return;
    }

    if (!this.editForm.target || parseInt(this.editForm.target) <= 0) {
      this.error = 'Vui lòng nhập mục tiêu hợp lệ (số phút > 0)';
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.success = null;

    const updateData: UserProfileUpdateRequest = {
      fullname: this.editForm.fullname.trim(),
      studyTime: this.editForm.studyTime,
      level: this.editForm.level,
      target: this.editForm.target,
    };

    this.userService.updateProfile(updateData).subscribe({
      next: (updatedUser) => {
        this.profile = updatedUser;
        this.userService.setUser(updatedUser);
        this.isEditing = false;
        this.isLoading = false;
        this.success = 'Hồ sơ đã được cập nhật thành công!';
        setTimeout(() => (this.success = null), 3000);
      },
      error: (err) => {
        this.isLoading = false;
        this.error =
          err.error?.message || 'Không thể cập nhật hồ sơ. Vui lòng thử lại.';
        setTimeout(() => (this.error = null), 5000);
      },
    });
  }
}
