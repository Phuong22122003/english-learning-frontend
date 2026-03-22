import { Component, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faBookOpen,
  faEye,
  faEyeSlash,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import { RouterModule, Router } from '@angular/router';
import { UserService } from '../../services/UserService';
import { HttpClientModule } from '@angular/common/http';

type AuthState = 'LOGIN' | 'FORGOT' | 'OTP' | 'PASSWORD';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FontAwesomeModule,
    RouterModule,
    ReactiveFormsModule,
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  faBookOpen = faBookOpen;
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  faArrowRight = faArrowRight;
  forgotEmail = '';
  showPassword = false;
  username = '';
  password = '';
  isLoading = false;
  authState: AuthState = 'LOGIN';
  errorMessage = '';
  successMessage = '';
  canResendOtp: boolean = true;
  resendOtpTimer: any;
  remainingTime: number = 0;
  passwordForm!: FormGroup;
  otpForm!: FormGroup;
  resetToken = '';
  otpFields = Array(4).fill(null);
  @ViewChildren('inputField') inputFields!: QueryList<
    ElementRef<HTMLInputElement>
  >;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService
  ) {
    this.initOtpForms();
  }

  handleSubmit(form: any) {
    if (form.valid) {
      this.userService
        .login({ username: this.username, password: this.password })
        .subscribe({
          next: (res) => {
            localStorage.setItem('token', res.token);
            this.userService.loadUserProfile();
            this.router.navigate(['/']);
            this.isLoading = false;
          },
          error: (err) => {alert('Đăng nhập không thành công, vui lòng thử lại!');
            this.isLoading = false;
          },
          complete: () => {
            this.isLoading = false;
          },
        });
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  submitForgot(form: NgForm) {
    if (form.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.sendOtp();
  }

  sendOtp() {
    this.userService.sendOtp(this.forgotEmail).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage =
          'Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.';
        this.startResendTimer();
        this.authState = 'OTP';
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage =
          error.error?.message || 'Không thể gửi mã OTP. Vui lòng thử lại.';
      },
    });
  }

  setState(state: AuthState) {
    this.authState = state;
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

  initOtpForms(): void {
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

    this.userService.verifyOtp(this.forgotEmail, otp).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.resetToken = response.resetToken;
        this.authState = 'PASSWORD';
        this.successMessage =
          'Xác thực OTP thành công. Vui lòng nhập mật khẩu mới.';
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage =
           'OTP không hợp lệ hoặc đã hết hạn';
      },
    });
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
  resetPassword() {
    if (this.passwordForm.invalid) return;
    const { newPassword } = this.passwordForm.value;
    this.userService.resetPassword(this.resetToken, newPassword).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Đổi mật khẩu thành công!';
        // Reset form
        setTimeout(() => {
          this.authState = 'LOGIN';
        }, 1000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage =
          error.error?.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.';
      },
    });
  }
}
