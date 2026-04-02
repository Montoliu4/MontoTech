import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonIcon,
  IonButtons, IonBackButton, IonSpinner, IonMenu, IonMenuButton,
  IonList, IonItem, IonLabel
} from '@ionic/angular/standalone';
import { AuthService } from '../../../core/auth/auth';
import { ClaseService } from '../../../core/services/clase';
import { TareaService } from '../../../core/services/tarea';
import { EntregaService } from '../../../core/services/entrega';
import { MatriculaService } from '../../../core/services/matricula';
import { ArchivoService } from '../../../core/services/archivo';
import { forkJoin } from 'rxjs';
import { addIcons } from 'ionicons';
import {
  bookOutline, peopleOutline, calendarOutline, addOutline,
  closeOutline, createOutline, trashOutline, keyOutline,
  chevronDownOutline, chevronUpOutline, timeOutline, checkmarkCircleOutline,
  warningOutline, menuOutline, arrowBackOutline, eyeOffOutline, eyeOutline,
  cloudUploadOutline, documentOutline
} from 'ionicons/icons';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

@Component({
  selector: 'app-clase',
  templateUrl: './clase.page.html',
  styleUrls: ['./clase.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonToolbar,
    IonTitle, IonIcon, IonButtons, IonBackButton, IonSpinner,
    IonMenu, IonMenuButton, IonList, IonItem, IonLabel
  ]
})
export class ClasePage implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private claseService = inject(ClaseService);
  private tareaService = inject(TareaService);
  private entregaService = inject(EntregaService);
  private matriculaService = inject(MatriculaService);
  public archivoService = inject(ArchivoService);

  usuario: any;
  claseId!: number;
  clase: any = null;
  cargando = true;

  seccionActiva = 'contenido';
  categoriaActiva = 'Tarea';

  todasTareas: any[] = [];
  tareasActivas: any[] = [];
  tareasInactivas: any[] = [];
  mostrarInactivas = false;
  cargandoTareas = false;

  alumnos: any[] = [];
  cargandoAlumnos = false;
  totalAlumnosClase = 0;

  conteoEntregas: { [idTarea: number]: number } = {};
  entregasPorTarea: { [idTarea: number]: any[] } = {};

  mostrarCodigo = false;
  mostrarModalTarea = false;
  editandoTarea: any = null;
  tareaForm: any = {
    titulo: '',
    descripcion: '',
    fechaLimite: '',
    notaMaxima: 10,
    visible: true,
    idCategoria: 2
  };

  archivosSeleccionados: File[] = [];
  subiendoArchivo = false;

  private calendar: Calendar | null = null;

  categorias = [
    { id: 2, nombre: 'Tarea' },
    { id: 1, nombre: 'Examen' },
    { id: 3, nombre: 'Proyecto' }
  ];

  secciones = [
    { id: 'alumnos',    label: 'Alumnos',    icon: 'people-outline' },
    { id: 'calendario', label: 'Calendario', icon: 'calendar-outline' },
  ];

  constructor() {
    addIcons({
      bookOutline, peopleOutline, calendarOutline, addOutline,
      closeOutline, createOutline, trashOutline, keyOutline,
      chevronDownOutline, chevronUpOutline, timeOutline, checkmarkCircleOutline,
      warningOutline, menuOutline, arrowBackOutline, eyeOffOutline, eyeOutline,
      cloudUploadOutline, documentOutline
    });
  }

  ngOnInit() {
    this.usuario = this.authService.getUsuario();
    this.claseId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarClase();
  }

  cargarClase() {
    this.claseService.getById(this.claseId).subscribe({
      next: (data: any) => {
        this.clase = data;
        this.cargando = false;
        this.cargarTareas();
      },
      error: () => { this.cargando = false; }
    });
  }

  cambiarSeccion(s: any) {
    this.seccionActiva = s.id;
    if (s.id === 'alumnos') this.cargarAlumnos();
    if (s.id === 'calendario') setTimeout(() => this.initCalendar(), 100);
  }

  volverAContenido() {
    this.seccionActiva = 'contenido';
  }

  cambiarCategoria(nombre: string) {
    this.categoriaActiva = nombre;
    this.filtrarTareas();
  }

  cargarTareas() {
    this.cargandoTareas = true;
    forkJoin([
      this.claseService.getTareas(this.claseId),
      this.matriculaService.getByClase(this.claseId)
    ]).subscribe({
      next: ([tareas, matriculas]: [any[], any[]]) => {
        this.todasTareas = tareas;
        this.totalAlumnosClase = matriculas.length;
        this.filtrarTareas();
        this.cargarConteoEntregas(tareas);
        this.cargandoTareas = false;
      },
      error: () => { this.cargandoTareas = false; }
    });
  }

  cargarConteoEntregas(tareas: any[]) {
    tareas.forEach(tarea => {
      this.entregaService.getByTarea(tarea.id).subscribe({
        next: (entregas: any[]) => {
          this.conteoEntregas[tarea.id] = entregas.length;
          this.entregasPorTarea[tarea.id] = entregas;
        },
        error: () => {
          this.conteoEntregas[tarea.id] = 0;
          this.entregasPorTarea[tarea.id] = [];
        }
      });
    });
  }

  filtrarTareas() {
    const porCategoria = this.todasTareas.filter(t =>
      t.categoria?.nombre === this.categoriaActiva
    );
    this.tareasActivas = porCategoria
      .filter(t => t.visible)
      .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());
    this.tareasInactivas = porCategoria
      .filter(t => !t.visible)
      .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());
  }

  cargarAlumnos() {
    this.cargandoAlumnos = true;
    this.matriculaService.getByClase(this.claseId).subscribe({
      next: (data: any[]) => {
        this.alumnos = data;
        this.cargandoAlumnos = false;
      },
      error: () => { this.cargandoAlumnos = false; }
    });
  }

  toggleBloquear(matricula: any) {
    this.matriculaService.bloquear(matricula.id).subscribe({
      next: () => { matricula.bloqueado = !matricula.bloqueado; }
    });
  }

  toggleCodigo() {
    this.mostrarCodigo = !this.mostrarCodigo;
  }

  alumnosSinEntregar(tareaId: number): any[] {
    const entregas = this.entregasPorTarea[tareaId] ?? [];
    const idsEntregados = entregas.map((e: any) => e.idAlumno);
    return this.alumnos
      .map((m: any) => m.alumno ?? m)
      .filter(a => !idsEntregados.includes(a.id));
  }

  initCalendar() {
    const el = document.getElementById('calendar');
    if (!el) return;
    if (this.calendar) this.calendar.destroy();

    const eventos = this.todasTareas
      .filter(t => t.fechaLimite)
      .map(t => ({
        id: String(t.id),
        title: t.titulo,
        date: t.fechaLimite.substring(0, 10),
        backgroundColor: this.getColorCategoria(t.categoria?.nombre),
        borderColor: this.getColorCategoria(t.categoria?.nombre),
        textColor: '#ffffff',
        extendedProps: { tarea: t }
      }));

    this.calendar = new Calendar(el, {
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      locale: 'es',
      headerToolbar: { left: 'prev,next', center: 'title', right: 'today' },
      events: eventos,
      eventClick: (info) => {
        const tarea = info.event.extendedProps['tarea'];
        this.verTarea(tarea);
      },
      height: 'auto',
      buttonText: { today: 'Hoy' }
    });

    this.calendar.render();
  }

  getColorCategoria(categoria: string): string {
    switch (categoria) {
      case 'Examen': return '#ef4444';
      case 'Tarea': return '#6366f1';
      case 'Proyecto': return '#22c55e';
      default: return '#6366f1';
    }
  }

  getArchivosTarea(tarea: any): { nombre: string, url: string }[] {
    return this.archivoService.deserializarArchivos(tarea?.archivoUrl);
  }

  abrirModalNuevaTarea() {
    this.editandoTarea = null;
    this.archivosSeleccionados = [];
    this.tareaForm = {
      titulo: '',
      descripcion: '',
      fechaLimite: '',
      notaMaxima: 10,
      visible: true,
      idCategoria: this.categorias.find(c => c.nombre === this.categoriaActiva)?.id ?? 2
    };
    this.mostrarModalTarea = true;
  }

  abrirModalEditarTarea(tarea: any) {
    this.editandoTarea = tarea;
    this.archivosSeleccionados = [];
    this.tareaForm = {
      titulo: tarea.titulo,
      descripcion: tarea.descripcion || '',
      fechaLimite: tarea.fechaLimite ? tarea.fechaLimite.substring(0, 16) : '',
      notaMaxima: tarea.notaMaxima,
      visible: tarea.visible,
      idCategoria: tarea.categoria?.id
    };
    this.mostrarModalTarea = true;
  }

  cerrarModalTarea() {
    this.mostrarModalTarea = false;
    this.editandoTarea = null;
    this.archivosSeleccionados = [];
  }

  toggleVisible(event: Event) {
    this.tareaForm.visible = (event.target as HTMLInputElement).checked;
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

  guardarTarea() {
    const guardar = (archivoUrl?: string) => {
      const payload = {
        titulo: this.tareaForm.titulo,
        descripcion: this.tareaForm.descripcion,
        fechaLimite: this.tareaForm.fechaLimite,
        notaMaxima: this.tareaForm.notaMaxima,
        visible: this.tareaForm.visible,
        idClase: this.claseId,
        idProfesor: this.usuario.id,
        idCategoria: this.tareaForm.idCategoria,
        archivoUrl: archivoUrl ?? this.editandoTarea?.archivoUrl ?? null
      };

      if (this.editandoTarea) {
        this.tareaService.update(this.editandoTarea.id, payload).subscribe({
          next: () => { this.cerrarModalTarea(); this.cargarTareas(); }
        });
      } else {
        this.tareaService.create(payload).subscribe({
          next: () => { this.cerrarModalTarea(); this.cargarTareas(); }
        });
      }
    };

    if (this.archivosSeleccionados.length > 0) {
      this.subiendoArchivo = true;
      this.archivoService.subirMultiples(this.archivosSeleccionados).subscribe({
        next: (res: any[]) => {
          this.subiendoArchivo = false;
          this.archivosSeleccionados = [];
          const archivoUrl = this.archivoService.serializarArchivos(res);
          guardar(archivoUrl);
        },
        error: () => { this.subiendoArchivo = false; }
      });
    } else {
      guardar();
    }
  }

  eliminarTarea(tarea: any) {
    if (confirm(`¿Eliminar "${tarea.titulo}"?`)) {
      this.tareaService.delete(tarea.id).subscribe({
        next: () => { this.cargarTareas(); }
      });
    }
  }

  verTarea(tarea: any) {
    this.router.navigate(['/profesor/clase', this.claseId, 'tarea', tarea.id]);
  }

  esFechaVencida(fechaLimite: string): boolean {
    if (!fechaLimite) return false;
    return new Date(fechaLimite) < new Date();
  }
}
