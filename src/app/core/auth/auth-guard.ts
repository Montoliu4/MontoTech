import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import {AuthService} from "./auth";

export function authGuard(rolRequerido: string): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isLoggedIn()) {
      router.navigate(['/login']);
      return false;
    }

    if (auth.getRol() !== rolRequerido) {
      auth.redirectByRol(auth.getRol()!);
      return false;
    }

    return true;
  };
}
