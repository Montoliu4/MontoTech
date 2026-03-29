import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private API = 'http://localhost:8080/api';

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string) {
    return this.http.post<any>(`${this.API}/auth/login`, { email, password })
      .pipe(
        tap(res => {
          localStorage.setItem('usuario', JSON.stringify(res));
          this.redirectByRol(res.rol);
        })
      );
  }

  getUsuario(): any {
    const u = localStorage.getItem('usuario');
    return u ? JSON.parse(u) : null;
  }

  getRol(): string | null {
    return this.getUsuario()?.rol ?? null;
  }

  redirectByRol(rol: string) {
    switch (rol) {
      case 'ADMIN':    this.router.navigate(['/admin']);    break;
      case 'PROFESOR': this.router.navigate(['/profesor']); break;
      case 'ALUMNO':   this.router.navigate(['/alumno']);   break;
      case 'SUPERADMIN': this.router.navigate(['/superadmin']); break;
      default:         this.router.navigate(['/login']);
    }
  }

  logout() {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('usuario');
  }
}
