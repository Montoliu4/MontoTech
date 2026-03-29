import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/centro-detalle/centro-detalle.page').then(m => m.CentroDetallePage),
    canActivate: [authGuard('ADMIN')]
  },
  {
    path: 'profesor',
    loadComponent: () =>
      import('./pages/profesor/profesor.page').then(m => m.ProfesorPage),
    canActivate: [authGuard('PROFESOR')]
  },
  {
    path: 'alumno',
    loadComponent: () =>
      import('./pages/alumno/alumno.page').then(m => m.AlumnoPage),
    canActivate: [authGuard('ALUMNO')]
  },
  {
    path: 'superadmin',
    loadComponent: () =>
      import('./pages/superadmin/superadmin.page').then(m => m.SuperadminPage),
    canActivate: [authGuard('SUPERADMIN')]
  },
  {
    path: 'superadmin/centro/:id',
    loadComponent: () =>
      import('./pages/centro-detalle/centro-detalle.page').then(m => m.CentroDetallePage),
    canActivate: [authGuard('SUPERADMIN')]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
