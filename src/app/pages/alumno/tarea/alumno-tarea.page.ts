import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonIcon,
  IonButtons, IonBackButton, IonSpinner
} from '@ionic/angular/standalone';
import { AuthService } from '../../../core/auth/auth';
import { TareaService } from '../../../core/services/tarea';
import { EntregaService } from '../../../core/services/entrega';
import { ArchivoService } from '../../../core/services/archivo';
import { addIcons } from 'ionicons';
import {
  timeOutline, starOutline, documentOutline, cloudUploadOutline,
  checkmarkCircleOutline, closeCircleOutline, cloudDownloadOutline,
  createOutline, closeOutline, trashOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-alumno-tarea',
  templateUrl: './alumno-tarea.page.html',
  styleUrls: ['./alumno-tarea.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonToolbar,
    IonTitle, IonIcon, IonButtons, IonBackButton, IonSpinner
  ]
})
export class AlumnoTareaPage implements OnInit {

  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private tareaService = inject(TareaService);
  private entregaService = inject(EntregaService);
  private archivoService = inject(ArchivoService);

  usuario: any;
  claseId!: number;
  tareaId!: number;
  tarea: any = null;
  entrega: any = null;
  cargando = true;

  entregaForm: any = { comentarioAlumno: '' };
  archivosSeleccionados: File[] = [];
  enviando = false;
  subiendoArchivo = false;
  modoEdicion = false;

  constructor() {
    addIcons({
      timeOutline, starOutline, documentOutline, cloudUploadOutline,
      checkmarkCircleOutline, closeCircleOutline, cloudDownloadOutline,
      createOutline, closeOutline, trashOutline
    });
  }

  ngOnInit() {
    this.usuario = this.authService.getUsuario();
    this.claseId = Number(this.route.snapshot.paramMap.get('idClase'));
    this.tareaId = Number(this.route.snapshot.paramMap.get('idTarea'));
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando = true;
    this.tareaService.getById(this.tareaId).subscribe({
      next: (tarea: any) => {
        this.tarea = tarea;
        this.cargarEntrega();
      },
      error: () => { this.cargando = false; }
    });
  }

  cargarEntrega() {
    this.entregaService.getByAlumno(this.usuario.id).subscribe({
      next: (entregas: any[]) => {
        this.entrega = entregas.find(e => e.idTarea === this.tareaId) ?? null;
        if (this.entrega) {
          this.entregaForm.comentarioAlumno = this.entrega.comentarioAlumno ?? '';
        }
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }

  get estadoEntrega(): string {
    if (!this.entrega) return 'PENDIENTE';
    return this.entrega.estadoTarea;
  }

  get archivosEntrega(): { nombre: string, url: string }[] {
    return this.archivoService.deserializarArchivos(this.entrega?.archivoUrl);
  }

  get archivosTarea(): { nombre: string, url: string }[] {
    return this.archivoService.deserializarArchivos(this.tarea?.archivoUrl);
  }

  esFechaVencida(fechaLimite: string): boolean {
    if (!fechaLimite) return false;
    return new Date(fechaLimite) < new Date();
  }

  onArchivosSeleccionados(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.archivosSeleccionados = Array.from(input.files);
    }
  }

  eliminarArchivoSeleccionado(index: number) {
    this.archivosSeleccionados.splice(index, 1);
  }

  activarEdicion() {
    this.modoEdicion = true;
    this.archivosSeleccionados = [];
  }

  cancelarEdicion() {
    this.modoEdicion = false;
    this.archivosSeleccionados = [];
    this.entregaForm.comentarioAlumno = this.entrega?.comentarioAlumno ?? '';
  }

  enviarEntrega() {
    this.enviando = true;

    const guardar = (archivoUrl: string | null) => {
      const payload = {
        idTarea: this.tareaId,
        idAlumno: this.usuario.id,
        comentarioAlumno: this.entregaForm.comentarioAlumno,
        archivoUrl: archivoUrl ?? this.entrega?.archivoUrl ?? null
      };

      this.entregaService.create(payload).subscribe({
        next: () => {
          this.enviando = false;
          this.modoEdicion = false;
          this.archivosSeleccionados = [];
          this.cargarEntrega();
        },
        error: () => { this.enviando = false; }
      });
    };

    if (this.archivosSeleccionados.length > 0) {
      this.subiendoArchivo = true;
      this.archivoService.subirMultiples(this.archivosSeleccionados).subscribe({
        next: (res: any[]) => {
          this.subiendoArchivo = false;
          const archivoUrl = this.archivoService.serializarArchivos(res);
          guardar(archivoUrl);
        },
        error: () => { this.subiendoArchivo = false; this.enviando = false; }
      });
    } else {
      guardar(null);
    }
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
      case 'PENDIENTE': return 'Pendiente';
      case 'ENTREGADA': return 'Entregada';
      case 'FUERA_DE_PLAZO': return 'Fuera de plazo';
      case 'CALIFICADA': return 'Calificada';
      default: return estado;
    }
  }
}
