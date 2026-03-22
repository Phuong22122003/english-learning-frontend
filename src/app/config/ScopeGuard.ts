import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { UserService } from '../services/UserService';

@Injectable({ providedIn: 'root' })
export class ScopeGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredScope = route.data['scope'] as string;

    if (!this.userService.getJwt()) {
      this.router.navigate(['/login']);
      return false;
    }

    if (this.userService.getScope() === 'ROLE_ADMIN') {
      return true;
    }

    if (requiredScope && !this.userService.hasScope(requiredScope)) {
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}
