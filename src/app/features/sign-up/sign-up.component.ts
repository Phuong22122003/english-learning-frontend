import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faEye,
  faEyeSlash,
  faBookOpen,
  faArrowRight,
  faUser,
  faEnvelope,
  faUserCheck,
} from '@fortawesome/free-solid-svg-icons';
import { UserService } from '../../services/UserService';
import { HttpClientModule } from '@angular/common/http';
import { er } from '@fullcalendar/core/internal-common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './sign-up.component.html',
})
export class SignUpComponent {
  // Icons
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  faBookOpen = faBookOpen;
  faArrowRight = faArrowRight;
  faUser = faUser;
  faEnvelope = faEnvelope;
  faUserCheck = faUserCheck;

  showPassword = false;
  isLoading = false;
  errorMessage = '';

  registerForm = this.fb.group({
    fullname: ['', [Validators.required, Validators.minLength(3)]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    terms: [false, [Validators.requiredTrue]],
  });

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private userService: UserService
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  handleSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const data = {
      fullname: this.fullname?.value || '',
      username: this.username?.value || '',
      email: this.email?.value || '',
      password: this.password?.value || '',
    };
    this.userService.signUp(data).subscribe({
      next: (res) => {
        this.router.navigate(['/login']);
        this.isLoading = false;
      },
      error: (err: any) => {
        this.errorMessage = JSON.parse(err.error)['message'];
        this.isLoading = false;
      },
    });
  }

  // Helper getters
  get fullname() {
    return this.registerForm.get('fullname');
  }
  get username() {
    return this.registerForm.get('username');
  }
  get email() {
    return this.registerForm.get('email');
  }
  get password() {
    return this.registerForm.get('password');
  }
  get terms() {
    return this.registerForm.get('terms');
  }
}
