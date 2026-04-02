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
    path: 'profesor/clase/:id',
    loadComponent: () =>
      import('./pages/profesor/clase/clase.page').then(m => m.ClasePage),
    canActivate: [authGuard('PROFESOR')]
  },
  {
    path: 'profesor/clase/:idClase/tarea/:idTarea',
    loadComponent: () =>
      import('./pages/profesor/tarea/tarea.page').then(m => m.TareaPage),
    canActivate: [authGuard('PROFESOR')]
  },
  {
    path: 'profesor/clase/:idClase/tarea/:idTarea/entrega/:idEntrega',
    loadComponent: () =>
      import('./pages/profesor/entrega/entrega.page').then(m => m.EntregaPage),
    canActivate: [authGuard('PROFESOR')]
  },
  {
    path: 'alumno',
    loadComponent: () =>
      import('./pages/alumno/alumno.page').then(m => m.AlumnoPage),
    canActivate: [authGuard('ALUMNO')]
  },
  {
    path: 'alumno/clase/:idClase',
    loadComponent: () =>
      import('./pages/alumno/clase/alumno-clase.page').then(m => m.AlumnoClasePage),
    canActivate: [authGuard('ALUMNO')]
  },
  {
    path: 'alumno/clase/:idClase/tarea/:idTarea',
    loadComponent: () =>
      import('./pages/alumno/tarea/alumno-tarea.page').then(m => m.AlumnoTareaPage),
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
