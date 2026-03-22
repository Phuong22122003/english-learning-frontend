import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user/user.model';
import { UserProfileUpdateRequest } from '../models/request/user-profile-update-request.model';
import { ApiResponse } from '../models/response/api-response';
import { VerifyOtpResponse } from '../models/response/verify-otp-response.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userSource = new BehaviorSubject<User | null>(null);

  user$ = this.userSource.asObservable();

  private apiUrl = environment.apiUserServiceUrl; // ví dụ: http://localhost:8080/api
  constructor(private http: HttpClient) {}

  // ---------- AUTHENTICATION ----------
  signUp(data: {
    username: string;
    password: string;
    email: string;
    fullname: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/authenticate/signup`, data, {
      responseType: 'text',
    });
  }

  login(data: {
    username: string;
    password: string;
  }): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(
      `${this.apiUrl}/authenticate/login`,
      data
    );
  }

  validateToken(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/authenticate/introspect`, data);
  }

  sendOtp(email: string): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.apiUrl}/authenticate/password/otp`,
      { email }
    );
  }

  verifyOtp(email: string, otp: string): Observable<VerifyOtpResponse> {
    return this.http.post<VerifyOtpResponse>(
      `${this.apiUrl}/authenticate/password/otp/validation`,
      { email, otp }
    );
  }

  resetPassword(
    resetToken: string,
    newPassword: string
  ): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(
      `${this.apiUrl}/authenticate/password/resets`,
      { resetToken, newPassword }
    );
  }

  // ---------- USER ----------

  deleteAccount(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/account`);
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/profile`);
  }

  updateProfile(data: UserProfileUpdateRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/profile`, data);
  }

  // Upload avatar
  uploadAvatar(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.post(`${this.apiUrl}/users/avatar`, formData, {
      responseType: 'text',
    });
  }

  setUser(user: User | null) {
    this.userSource.next(user);
  }

  clearUser() {
    this.userSource.next(null);
  }

  logout() {
    localStorage.removeItem('token');
    this.clearUser();
  }

  loadUserProfile() {
    if (localStorage.getItem('token')) {
      this.getProfile().subscribe({
        next: (user) => this.userSource.next(user),
        error: () => this.userSource.next(null),
      });
    }
  }
  getJwt() {
    return localStorage.getItem('token');
  }

  getScope() {
    const jwt = this.getJwt();
    if (jwt) {
      const decoded = this.decodeJwtPayload(jwt);
      return decoded.scope;
    }
    return '';
  }
  decodeJwtPayload(token: string): any {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT token');
    }

    const payload = parts[1];

    // Base64URL -> Base64
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      '='
    );

    // Browser (Angular) dùng atob
    const json = atob(padded);
    return JSON.parse(json);
    
  }

  hasScope(requiredScope: string): boolean {
    const scope = this.getScope();
    return scope.includes(requiredScope);
  }
}
