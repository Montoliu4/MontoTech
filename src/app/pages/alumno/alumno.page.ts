import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonIcon,
  IonSpinner, IonModal, IonButton
} from '@ionic/angular/standalone';
import { AuthService } from '../../core/auth/auth';
import { MatriculaService } from '../../core/services/matricula';
import { EntregaService } from '../../core/services/entrega';
import { addIcons } from 'ionicons';
import {
  addOutline, schoolOutline, timeOutline, starOutline,
  closeOutline, checkmarkOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-alumno',
  templateUrl: './alumno.page.html',
  styleUrls: ['./alumno.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonToolbar,
    IonTitle, IonIcon, IonSpinner, IonModal, IonButton
  ]
})
export class AlumnoPage implements OnInit {

  private router = inject(Router);
  private authService = inject(AuthService);
  private matriculaService = inject(MatriculaService);
  private entregaService = inject(EntregaService);

  usuario: any;
  clases: any[] = [];
  entregas: any[] = [];
  cargando = true;

  mostrarModalUnirse = false;
  codigoAcceso = '';
  errorCodigo = '';
  uniendose = false;

  constructor() {
    addIcons({ addOutline, schoolOutline, timeOutline, starOutline, closeOutline, checkmarkOutline });
  }

  ngOnInit() {
    this.usuario = this.authService.getUsuario();
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando = true;
    this.matriculaService.getByAlumno(this.usuario.id).subscribe({
      next: (matriculas: any[]) => {
        this.clases = matriculas
          .filter(m => m.activa)
          .map(m => ({ ...m.clase, matriculaId: m.id, bloqueado: m.bloqueado }));
        this.cargarEntregas();
      },
      error: () => { this.cargando = false; }
    });
  }

  cargarEntregas() {
    this.entregaService.getByAlumno(this.usuario.id).subscribe({
      next: (data: any[]) => {
        this.entregas = data;
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }

  get tareasPendientes() {
    return this.entregas.filter(e =>
      e.estadoTarea === 'ENTREGADA' || e.estadoTarea === 'FUERA_DE_PLAZO'
    ).length;
  }

  get mediaNotas() {
    const calificadas = this.entregas.filter(e => e.estadoTarea === 'CALIFICADA' && e.nota !== null);
    if (calificadas.length === 0) return null;
    const suma = calificadas.reduce((acc, e) => acc + e.nota, 0);
    return (suma / calificadas.length).toFixed(1);
  }

  irAClase(clase: any) {
    if (clase.bloqueado) return;
    this.router.navigate(['/alumno/clase', clase.id]);
  }

  abrirModalUnirse() {
    this.codigoAcceso = '';
    this.errorCodigo = '';
    this.mostrarModalUnirse = true;
  }

  cerrarModalUnirse() {
    this.mostrarModalUnirse = false;
  }

  unirseAClase() {
    if (!this.codigoAcceso.trim()) {
      this.errorCodigo = 'Introduce un código de acceso';
      return;
    }
    this.uniendose = true;
    this.errorCodigo = '';
    this.matriculaService.create({
      idAlumno: this.usuario.id,
      codigoAcceso: this.codigoAcceso.trim()
    }).subscribe({
      next: () => {
        this.uniendose = false;
        this.mostrarModalUnirse = false;
        this.cargarDatos();
      },
      error: (err: any) => {
        this.uniendose = false;
        this.errorCodigo = err.error?.mensaje || 'Código incorrecto o ya matriculado';
      }
    });
  }
}
