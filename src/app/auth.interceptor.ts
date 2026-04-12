import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { LoadingService } from './services/LoadingService ';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const loadingService = inject(LoadingService);

  const token = localStorage.getItem('token');
  let authReq = req;

  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  // Enable loading when request starts
  // loadingService.show();

  return next(authReq).pipe(
    catchError((err) => {
      if (err.status === 401) {
        localStorage.removeItem('token');
        router.navigate(['/login']);
      }
      return throwError(() => err);
    }),
    finalize(() => {
      // Disable loading when request ends (whether success or error)
      // loadingService.hide();
    })
  );
};
