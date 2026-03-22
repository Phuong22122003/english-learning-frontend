import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChildren,
  QueryList,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { UserService } from '../../../services/UserService';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss',
})
export class ChangePasswordComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @Input() email: string = '';

  // Form states
  otpForm!: FormGroup;
  passwordForm!: FormGroup;

  // UI states
  currentStep: 'otp' | 'password' = 'otp';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  resetToken: string | null = null;

  // OTP input - 4 digits
  otpFields = Array(4).fill(null);
  @ViewChildren('inputField') inputFields!: QueryList<
    ElementRef<HTMLInputElement>
  >;

  // Resend OTP timer
  canResendOtp: boolean = true;
  resendOtpTimer: any;
  remainingTime: number = 0;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    if (!this.email) {
      this.errorMessage = 'Email không được để trống';
      return;
    }
    this.sendOtp();
  }

  ngAfterViewInit(): void {
    // Focus vào input đầu tiên khi component được khởi tạo
    if (this.inputFields && this.inputFields.first) {
      setTimeout(() => {
        this.inputFields.first.nativeElement.focus();
      }, 0);
    }
  }

  initForms(): void {
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
    });

    this.passwordForm = this.fb.group(
      {
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(group: FormGroup) {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  sendOtp(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.userService.sendOtp(this.email).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage =
          'Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.';
        this.startResendTimer();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage =
          error.error?.message || 'Không thể gửi mã OTP. Vui lòng thử lại.';
      },
    });
  }

  onKeyUp(event: KeyboardEvent): void {
    const target = event.target as HTMLInputElement;
    const key = event.key.toLowerCase();

    if (key === 'backspace' || key === 'delete' || key === 'arrowleft') {
      if (key === 'backspace' || key === 'delete') {
        target.value = '';
      }
      const prev = target.previousElementSibling as HTMLInputElement;
      if (prev) {
        prev.focus();
      }
    } else if (key === 'arrowright') {
      const next = target.nextElementSibling as HTMLInputElement;
      if (next) {
        next.focus();
      }
    } else {
      if (isNaN(Number(key))) {
        target.value = '';
        return;
      }
      target.value = key;
      const next = target.nextElementSibling as HTMLInputElement;
      if (next) {
        next.focus();
      }
    }

    // Cập nhật form value
    this.updateOtpFormValue();
  }

  updateOtpFormValue(): void {
    let otpValue = '';
    this.inputFields.forEach((inputField) => {
      const value = inputField.nativeElement.value;
      if (value !== '') {
        otpValue += value;
      }
    });
    this.otpForm.patchValue({ otp: otpValue }, { emitEvent: false });
  }

  verifyOtp(): void {
    // Lấy OTP từ các input fields
    let otp = '';
    this.inputFields.forEach((inputField) => {
      const value = inputField.nativeElement.value;
      if (value === '') {
        return;
      }
      otp += value;
    });

    if (!otp || otp.length < 4) {
      this.errorMessage = 'Vui lòng nhập đầy đủ 4 số OTP';
      this.otpForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.userService.verifyOtp(this.email, otp).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.resetToken = response.resetToken;
        this.currentStep = 'password';
        this.successMessage =
          'Xác thực OTP thành công. Vui lòng nhập mật khẩu mới.';
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage =
          error.error?.message || 'OTP không hợp lệ hoặc đã hết hạn';
      },
    });
  }

  resetPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    if (!this.resetToken) {
      this.errorMessage = 'Không tìm thấy token reset. Vui lòng thử lại.';
      return;
    }

    const newPassword = this.passwordForm.get('newPassword')?.value;
    const confirmPassword = this.passwordForm.get('confirmPassword')?.value;

    if (newPassword !== confirmPassword) {
      this.errorMessage = 'Mật khẩu xác nhận không khớp';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.userService.resetPassword(this.resetToken, newPassword).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Đổi mật khẩu thành công!';
        // Reset form
        setTimeout(() => {
          this.userService.logout();
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage =
          error.error?.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.';
      },
    });
  }

  resetForms(): void {
    this.currentStep = 'otp';
    this.resetToken = null;
    // Clear all OTP inputs
    this.inputFields.forEach((inputField) => {
      inputField.nativeElement.value = '';
    });
    this.otpForm.reset();
    this.passwordForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
    // Focus lại input đầu tiên
    if (this.inputFields && this.inputFields.first) {
      setTimeout(() => {
        this.inputFields.first.nativeElement.focus();
      }, 0);
    }
  }

  startResendTimer(): void {
    const countdownTime = 60; // 60 giây
    this.remainingTime = countdownTime;
    this.canResendOtp = false;

    this.resendOtpTimer = setInterval(() => {
      this.remainingTime--;

      if (this.remainingTime <= 0) {
        clearInterval(this.resendOtpTimer);
        this.canResendOtp = true;
        this.remainingTime = 0;
      }
    }, 1000);
  }

  resendOtp(): void {
    if (this.canResendOtp) {
      // Clear all OTP inputs
      this.inputFields.forEach((inputField) => {
        inputField.nativeElement.value = '';
      });
      this.otpForm.reset();
      this.sendOtp();
      this.startResendTimer();
    }
  }

  ngOnDestroy(): void {
    // Cleanup timer khi component bị destroy
    if (this.resendOtpTimer) {
      clearInterval(this.resendOtpTimer);
    }
  }
}
