import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonIcon,
  IonButtons, IonBackButton, IonSpinner
} from '@ionic/angular/standalone';
import { AuthService } from '../../../core/auth/auth';
import { EntregaService } from '../../../core/services/entrega';
import { TareaService } from '../../../core/services/tarea';
import { ArchivoService } from '../../../core/services/archivo';
import { addIcons } from 'ionicons';
import {
  personOutline, documentOutline, starOutline, timeOutline,
  checkmarkOutline, cloudDownloadOutline, createOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-entrega',
  templateUrl: './entrega.page.html',
  styleUrls: ['./entrega.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonToolbar,
    IonTitle, IonIcon, IonButtons, IonBackButton, IonSpinner
  ]
})
export class EntregaPage implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private entregaService = inject(EntregaService);
  private tareaService = inject(TareaService);
  public archivoService = inject(ArchivoService);

  usuario: any;
  claseId!: number;
  tareaId!: number;
  entregaId!: number;

  entrega: any = null;
  tarea: any = null;
  cargando = true;

  evaluarForm: any = { nota: null, comentarioProfesor: '' };
  guardando = false;
  guardado = false;

  constructor() {
    addIcons({
      personOutline, documentOutline, starOutline, timeOutline,
      checkmarkOutline, cloudDownloadOutline, createOutline,
      checkmarkCircleOutline
    });
  }

  ngOnInit() {
    this.usuario = this.authService.getUsuario();
    this.claseId = Number(this.route.snapshot.paramMap.get('idClase'));
    this.tareaId = Number(this.route.snapshot.paramMap.get('idTarea'));
    this.entregaId = Number(this.route.snapshot.paramMap.get('idEntrega'));
    this.cargarDatos();
  }

  cargarDatos() {
    this.tareaService.getById(this.tareaId).subscribe({
      next: (tarea: any) => {
        this.tarea = tarea;
        this.cargarEntrega();
      },
      error: () => { this.cargando = false; }
    });
  }

  cargarEntrega() {
    this.entregaService.getByTarea(this.tareaId).subscribe({
      next: (entregas: any[]) => {
        this.entrega = entregas.find(e => e.id === this.entregaId) ?? null;
        if (this.entrega) {
          this.evaluarForm = {
            nota: this.entrega.nota ?? null,
            comentarioProfesor: this.entrega.comentarioProfesor ?? ''
          };
        }
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }

  get archivosEntrega(): { nombre: string, url: string }[] {
    return this.archivoService.deserializarArchivos(this.entrega?.archivoUrl);
  }

  get archivosTarea(): { nombre: string, url: string }[] {
    return this.archivoService.deserializarArchivos(this.tarea?.archivoUrl);
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

  guardarEvaluacion() {
    this.guardando = true;
    this.entregaService.evaluar(this.entregaId, {
      nota: this.evaluarForm.nota,
      comentarioProfesor: this.evaluarForm.comentarioProfesor,
      idProfesor: this.usuario.id
    }).subscribe({
      next: () => {
        this.guardando = false;
        this.guardado = true;
        this.cargarEntrega();
        setTimeout(() => this.guardado = false, 3000);
      },
      error: () => { this.guardando = false; }
    });
  }
}
