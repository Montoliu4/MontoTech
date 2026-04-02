import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonIcon,
  IonButtons, IonBackButton, IonSpinner, IonMenu,
  IonMenuButton, IonList, IonItem, IonLabel
} from '@ionic/angular/standalone';
import { AuthService } from '../../../core/auth/auth';
import { ClaseService } from '../../../core/services/clase';
import { TareaService } from '../../../core/services/tarea';
import { EntregaService } from '../../../core/services/entrega';
import { addIcons } from 'ionicons';
import {
  bookOutline, calendarOutline, alertCircleOutline,
  timeOutline, starOutline, cloudUploadOutline,
  checkmarkCircleOutline, closeCircleOutline, ellipseOutline,
  closeOutline, documentOutline, checkmarkOutline
} from 'ionicons/icons';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';

@Component({
  selector: 'app-alumno-clase',
  templateUrl: './alumno-clase.page.html',
  styleUrls: ['./alumno-clase.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonToolbar,
    IonTitle, IonIcon, IonButtons, IonBackButton, IonSpinner,
    IonMenu, IonMenuButton, IonList, IonItem, IonLabel
  ]
})
export class AlumnoClasePage implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private claseService = inject(ClaseService);
  private tareaService = inject(TareaService);
  private entregaService = inject(EntregaService);

  usuario: any;
  claseId!: number;
  clase: any = null;
  cargando = true;

  seccionActiva = 'contenido';
  categoriaActiva = 'all';

  tareas: any[] = [];
  entregas: any[] = [];
  categorias: any[] = [];

  private calendar: Calendar | null = null;

  constructor() {
    addIcons({
      bookOutline, calendarOutline, alertCircleOutline,
      timeOutline, starOutline, cloudUploadOutline,
      checkmarkCircleOutline, closeCircleOutline, ellipseOutline,
      closeOutline, documentOutline, checkmarkOutline
    });
  }

  ngOnInit() {
    this.usuario = this.authService.getUsuario();
    this.claseId = Number(this.route.snapshot.paramMap.get('idClase'));
    this.cargarClase();
  }

  cargarClase() {
    this.claseService.getById(this.claseId).subscribe({
      next: (data: any) => {
        this.clase = data;
        this.cargarTareas();
        this.cargarEntregas();
      },
      error: () => { this.cargando = false; }
    });
  }

  cargarTareas() {
    this.claseService.getTareas(this.claseId).subscribe({
      next: (data: any[]) => {
        this.tareas = data.filter(t => t.visible);
        const cats = new Map<number, any>();
        this.tareas.forEach(t => {
          if (t.categoria) cats.set(t.categoria.id, t.categoria);
        });
        this.categorias = Array.from(cats.values());
        this.cargando = false;
        if (this.seccionActiva === 'calendario') {
          setTimeout(() => this.iniciarCalendario(), 300);
        }
      },
      error: () => { this.cargando = false; }
    });
  }

  cargarEntregas() {
    this.entregaService.getByAlumno(this.usuario.id).subscribe({
      next: (data: any[]) => {
        this.entregas = data;
      }
    });
  }

  get tareasFiltradas() {
    if (this.categoriaActiva === 'all') return this.tareas;
    return this.tareas.filter(t => t.categoria?.id === Number(this.categoriaActiva));
  }

  get tareasSinEntregar() {
    const idsEntregados = this.entregas.map(e => e.idTarea);
    return this.tareas.filter(t => !idsEntregados.includes(t.id));
  }

  getEntregaDeTarea(tareaId: number) {
    return this.entregas.find(e => e.idTarea === tareaId);
  }

  getEstadoTarea(tareaId: number) {
    const entrega = this.getEntregaDeTarea(tareaId);
    if (!entrega) return 'PENDIENTE';
    return entrega.estadoTarea;
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

  esFechaVencida(fechaLimite: string): boolean {
    if (!fechaLimite) return false;
    return new Date(fechaLimite) < new Date();
  }

  cambiarSeccion(seccion: string) {
    this.seccionActiva = seccion;
    if (seccion === 'calendario') {
      setTimeout(() => this.iniciarCalendario(), 300);
    }
  }

  irATarea(tarea: any) {
    this.router.navigate(['/alumno/clase', this.claseId, 'tarea', tarea.id]);
  }

  iniciarCalendario() {
    const el = document.getElementById('calendar-alumno');
    if (!el) return;
    if (this.calendar) { this.calendar.destroy(); }
    const eventos = this.tareas
      .filter(t => t.fechaLimite)
      .map(t => ({
        title: t.titulo,
        date: t.fechaLimite.split('T')[0],
        color: t.categoria?.nombre === 'Examen' ? '#ef4444' :
          t.categoria?.nombre === 'Proyecto' ? '#22c55e' : '#8b5cf6'
      }));
    this.calendar = new Calendar(el, {
      plugins: [dayGridPlugin],
      initialView: 'dayGridMonth',
      locale: 'es',
      headerToolbar: { left: 'prev,next today', center: 'title', right: '' },
      events: eventos,
      height: 'auto'
    });
    this.calendar.render();
  }
}
