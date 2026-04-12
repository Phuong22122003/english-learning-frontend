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
  confirmTitle: string = 'Confirm';
  confirmMessage: string =
    'Are you sure you want to change your password? OTP will be sent to your email';
  confirmText: string = 'Change password';
  cancelText: string = 'Cancel';
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
    { value: StudyTime.MORNING, label: 'Morning' },
    { value: StudyTime.AFTERNOON, label: 'Afternoon' },
    { value: StudyTime.EVENING, label: 'Evening' },
    { value: StudyTime.NIGHT, label: 'Night' },
  ];

  levelOptions = [
    { value: Level.BEGINNER, label: 'Beginner' },
    { value: Level.INTERMEDIATE, label: 'Intermediate' },
    { value: Level.ADVANCED, label: 'Advanced' },
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
            this.profile.avatarUrl = url;
            this.userService.setUser(this.profile);
          }
          this.isLoading = false;
          this.success = 'Avatar updated successfully!';
          setTimeout(() => (this.success = null), 3000);
        },
        error: (err) => {
this.isLoading = false;
          this.error = 'Unable to upload avatar. Please try again.';
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
      this.error = 'Please enter full name';
      return;
    }

    if (!this.editForm.target || parseInt(this.editForm.target) <= 0) {
      this.error = 'Please enter a valid target (minutes > 0)';
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
        this.success = 'Profile updated successfully!';
        setTimeout(() => (this.success = null), 3000);
      },
      error: (err) => {
        this.isLoading = false;
        this.error =
          err.error?.message || 'Unable to update profile. Please try again.';
        setTimeout(() => (this.error = null), 5000);
      },
    });
  }
}
