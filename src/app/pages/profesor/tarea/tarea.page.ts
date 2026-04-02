import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonIcon,
  IonButtons, IonBackButton, IonSpinner
} from '@ionic/angular/standalone';
import { AuthService } from '../../../core/auth/auth';
import { TareaService } from '../../../core/services/tarea';
import { EntregaService } from '../../../core/services/entrega';
import { ClaseService } from '../../../core/services/clase';
import { ArchivoService } from '../../../core/services/archivo';
import { addIcons } from 'ionicons';
import {
  timeOutline, checkmarkCircleOutline, closeCircleOutline,
  documentOutline, personOutline, starOutline, arrowBackOutline,
  checkmarkOutline, closeOutline, warningOutline, createOutline,
  cloudDownloadOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-tarea',
  templateUrl: './tarea.page.html',
  styleUrls: ['./tarea.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonToolbar,
    IonTitle, IonIcon, IonButtons, IonBackButton, IonSpinner
  ]
})
export class TareaPage implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private tareaService = inject(TareaService);
  private entregaService = inject(EntregaService);
  private claseService = inject(ClaseService);
  public archivoService = inject(ArchivoService);

  usuario: any;
  claseId!: number;
  tareaId!: number;
  tarea: any = null;
  cargando = true;

  entregas: any[] = [];
  alumnosClase: any[] = [];
  cargandoEntregas = false;

  constructor() {
    addIcons({
      timeOutline, checkmarkCircleOutline, closeCircleOutline,
      documentOutline, personOutline, starOutline, arrowBackOutline,
      checkmarkOutline, closeOutline, warningOutline, createOutline,
      cloudDownloadOutline
    });
  }

  ngOnInit() {
    this.usuario = this.authService.getUsuario();
    this.claseId = Number(this.route.snapshot.paramMap.get('idClase'));
    this.tareaId = Number(this.route.snapshot.paramMap.get('idTarea'));
    this.cargarTarea();
  }

  cargarTarea() {
    this.tareaService.getById(this.tareaId).subscribe({
      next: (data: any) => {
        this.tarea = data;
        this.cargando = false;
        this.cargarEntregas();
        this.cargarAlumnos();
      },
      error: () => { this.cargando = false; }
    });
  }

  cargarEntregas() {
    this.cargandoEntregas = true;
    this.entregaService.getByTarea(this.tareaId).subscribe({
      next: (data: any[]) => {
        this.entregas = data;
        this.cargandoEntregas = false;
      },
      error: () => { this.cargandoEntregas = false; }
    });
  }

  cargarAlumnos() {
    this.claseService.getAlumnos(this.claseId).subscribe({
      next: (data: any[]) => {
        this.alumnosClase = data.map((m: any) => m.alumno ?? m);
      },
      error: () => {}
    });
  }

  get archivosTarea(): { nombre: string, url: string }[] {
    return this.archivoService.deserializarArchivos(this.tarea?.archivoUrl);
  }

  get alumnosSinEntregar() {
    const idsEntregados = this.entregas.map(e => e.idAlumno);
    return this.alumnosClase.filter(a => !idsEntregados.includes(a.id));
  }

  get entregasSinCorregir() {
    return this.entregas.filter(e =>
      e.estadoTarea === 'ENTREGADA' || e.estadoTarea === 'FUERA_DE_PLAZO'
    );
  }

  verEntrega(entrega: any) {
    this.router.navigate([
      '/profesor/clase', this.claseId,
      'tarea', this.tareaId,
      'entrega', entrega.id
    ]);
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'ENTREGADA': return 'badge-blue';
      case 'FUERA_DE_PLAZO': return 'badge-red';
      case 'CALIFICADA': return 'badge-green';
      default: return 'badge-gray';
    }
  }

  getEstadoLabel(estado: string): string {
    switch (estado) {
      case 'ENTREGADA': return 'Entregado';
      case 'FUERA_DE_PLAZO': return 'Fuera de plazo';
      case 'CALIFICADA': return 'Calificado';
      default: return estado;
    }
  }

  esFechaVencida(fechaLimite: string): boolean {
    if (!fechaLimite) return false;
    return new Date(fechaLimite) < new Date();
  }
}
