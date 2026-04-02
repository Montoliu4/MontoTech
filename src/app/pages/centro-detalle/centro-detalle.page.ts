import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import {
  IonBackButton, IonButtons, IonContent, IonHeader, IonIcon,
  IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonLabel, IonList, IonMenu, IonMenuButton,
  IonSearchbar, IonSkeletonText, IonSpinner, IonTitle, IonToolbar
} from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth';
import { CentroService } from '../../core/services/centro';
import { AlumnoService } from '../../core/services/alumno';
import { ProfesorService } from '../../core/services/profesor';
import { ClaseService } from '../../core/services/clase';
import { addIcons } from 'ionicons';
import {
  businessOutline, peopleOutline, schoolOutline, personOutline,
  menuOutline, arrowBackOutline, searchOutline, addOutline,
  createOutline, closeOutline, checkmarkCircleOutline, closeCircleOutline,
  shieldOutline, bookOutline, cloudUploadOutline, documentOutline, warningOutline, refreshOutline
} from 'ionicons/icons';
import Papa from 'papaparse';

@Component({
  selector: 'app-centro-detalle',
  templateUrl: './centro-detalle.page.html',
  styleUrls: ['./centro-detalle.page.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, IonSkeletonText, IonMenu, IonHeader,
    IonToolbar, IonTitle, IonContent, IonList, IonItem, IonIcon, IonLabel, IonButtons,
    IonMenuButton, IonBackButton, IonSearchbar, IonSpinner, IonInfiniteScrollContent, IonInfiniteScroll
  ]
})
export class CentroDetallePage implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private centroService = inject(CentroService);
  private alumnoService = inject(AlumnoService);
  private profesorService = inject(ProfesorService);
  private claseService = inject(ClaseService);
  private fb = inject(FormBuilder);

  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;

  centro: any = null;
  usuario: any;
  esSuper = false;
  centroId!: number;

  seccionActiva = 'resumen';
  cargando = true;
  cargandoLista = false;
  cargandoDetalle = false;

  todosAlumnos: any[] = [];
  todosProfesores: any[] = [];
  todasClases: any[] = [];
  admins: any[] = [];

  dataAlumnos: any[] = Array(20);
  dataProfesores: any[] = Array(20);
  dataClases: any[] = Array(20);

  busqueda = '';
  filtroActivo: boolean | null = null;
  filtroFecha: string = '';

  // CSV Alumnos
  mostrarModalCSV = false;
  alumnosCSV: any[] = [];
  importando = false;
  resultadoImport: any = null;

  // CSV Profesores
  mostrarModalCSVProfesores = false;
  profesoresCSV: any[] = [];
  importandoProfesores = false;
  resultadoImportProfesores: any = null;

  // Detalle Alumno
  alumnoSeleccionado: any = null;
  editandoAlumno = false;
  clasesAlumno: any[] = [];
  alumnoEditForm: any = {};

  // Detalle Profesor
  profesorSeleccionado: any = null;
  editandoProfesor = false;
  clasesProfesor: any[] = [];
  profesorEditForm: any = {};

  // Detalle Clase
  claseSeleccionada: any = null;
  editandoClase = false;
  alumnosClase: any[] = [];
  profesoresClase: any[] = [];
  claseEditForm: any = {};

  // Detalle Admin
  adminSeleccionado: any = null;
  editandoAdmin = false;
  adminEditForm: any = {};

  formulario!: FormGroup;

  secciones = [
    { id: 'resumen',         label: 'Resumen',         icon: 'business-outline' },
    { id: 'administradores', label: 'Administradores', icon: 'shield-outline' },
    { id: 'profesores',      label: 'Profesores',      icon: 'school-outline' },
    { id: 'alumnos',         label: 'Alumnos',         icon: 'people-outline' },
    { id: 'clases',          label: 'Clases',          icon: 'book-outline' },
  ];

  constructor() {
    addIcons({
      businessOutline, peopleOutline, schoolOutline, personOutline,
      menuOutline, arrowBackOutline, searchOutline, addOutline,
      createOutline, closeOutline, checkmarkCircleOutline, closeCircleOutline,
      shieldOutline, bookOutline, cloudUploadOutline, documentOutline, warningOutline, refreshOutline
    });
  }

  ngOnInit() {
    this.usuario = this.authService.getUsuario();
    this.esSuper = this.usuario?.rol === 'SUPERADMIN';
    const idURL = this.route.snapshot.paramMap.get('id');
    this.centroId = idURL ? Number(idURL) : this.usuario?.idCentro;
    if (this.centroId) this.cargarCentro();
    else this.router.navigate(['/login']);
  }

  cargarCentro() {
    this.centroService.getById(this.centroId).subscribe({
      next: (data: any) => { this.centro = data; this.cargando = false; },
      error: () => { this.cargando = false; }
    });
  }

  cambiarSeccion(seccion: string) {
    this.seccionActiva = seccion;
    this.busqueda = '';
    this.filtroActivo = null;
    this.filtroFecha = '';
    switch (seccion) {
      case 'alumnos':         this.cargarAlumnos();    break;
      case 'profesores':      this.cargarProfesores(); break;
      case 'clases':          this.cargarClases();     break;
      case 'administradores': this.cargarAdmins();     break;
    }
  }

  resetInfiniteScroll() {
    this.dataAlumnos = Array(20);
    this.dataProfesores = Array(20);
    this.dataClases = Array(20);
    if (this.infiniteScroll) this.infiniteScroll.disabled = false;
  }

  cargarAlumnos() {
    this.cargandoLista = true;
    this.dataAlumnos = Array(20);
    this.alumnoService.getByCentro(this.centroId).subscribe({
      next: (data: any[]) => { this.todosAlumnos = data; this.cargandoLista = false; },
      error: () => { this.cargandoLista = false; }
    });
  }

  loadMasAlumnos(event: any) {
    setTimeout(() => {
      if (this.dataAlumnos.length >= this.alumnosFiltrados.length) {
        event.target.complete();
        if (this.infiniteScroll) this.infiniteScroll.disabled = true;
        return;
      }
      this.dataAlumnos.push(...Array(20));
      event.target.complete();
    }, 500);
  }

  cargarProfesores() {
    this.cargandoLista = true;
    this.dataProfesores = Array(20);
    this.profesorService.getByCentro(this.centroId).subscribe({
      next: (data: any[]) => {
        this.todosProfesores = data.map((pc: any) => pc.profesor ?? pc);
        this.cargandoLista = false;
      },
      error: () => { this.cargandoLista = false; }
    });
  }

  loadMasProfesores(event: any) {
    setTimeout(() => {
      if (this.dataProfesores.length >= this.profesoresFiltrados.length) {
        event.target.complete();
        if (this.infiniteScroll) this.infiniteScroll.disabled = true;
        return;
      }
      this.dataProfesores.push(...Array(20));
      event.target.complete();
    }, 500);
  }

  cargarClases() {
    this.cargandoLista = true;
    this.dataClases = Array(20);
    this.claseService.getByCentro(this.centroId).subscribe({
      next: (data: any[]) => { this.todasClases = data; this.cargandoLista = false; },
      error: () => { this.cargandoLista = false; }
    });
  }

  loadMasClases(event: any) {
    setTimeout(() => {
      if (this.dataClases.length >= this.clasesFiltradas.length) {
        event.target.complete();
        if (this.infiniteScroll) this.infiniteScroll.disabled = true;
        return;
      }
      this.dataClases.push(...Array(20));
      event.target.complete();
    }, 500);
  }

  cargarAdmins() {
    this.cargandoLista = true;
    this.centroService.getAdmins(this.centroId).subscribe({
      next: (data: any[]) => { this.admins = data; this.cargandoLista = false; },
      error: () => { this.cargandoLista = false; }
    });
  }

  buscar(event: any) {
    this.busqueda = event.detail.value ?? '';
    this.resetInfiniteScroll();
  }

  setFiltroActivo(valor: boolean | null) {
    this.filtroActivo = valor;
    this.resetInfiniteScroll();
  }

  setFecha() { this.resetInfiniteScroll(); }

  // ===== DETALLE ALUMNO =====
  abrirDetalleAlumno(alumno: any) {
    this.alumnoSeleccionado = alumno;
    this.editandoAlumno = false;
    this.alumnoEditForm = {
      nombre: alumno.nombre,
      apellidos: alumno.apellidos,
      email: alumno.email,
      dni: alumno.dni,
      telefono: alumno.telefono || '',
      password: ''
    };
    this.clasesAlumno = [];
    this.cargandoDetalle = true;
    this.alumnoService.getClases(alumno.id).subscribe({
      next: (data: any[]) => { this.clasesAlumno = data; this.cargandoDetalle = false; },
      error: () => { this.cargandoDetalle = false; }
    });
  }

  cerrarDetalleAlumno() {
    this.alumnoSeleccionado = null;
    this.editandoAlumno = false;
  }

  toggleActivoAlumno() {
    const activo = !this.alumnoSeleccionado.activo;
    this.alumnoService.update(this.alumnoSeleccionado.id, {
      ...this.alumnoSeleccionado, activo, password: ''
    }).subscribe({
      next: () => {
        this.alumnoSeleccionado.activo = activo;
        this.cargarAlumnos();
      }
    });
  }

  guardarAlumno() {
    this.alumnoService.update(this.alumnoSeleccionado.id, {
      ...this.alumnoEditForm,
      activo: this.alumnoSeleccionado.activo
    }).subscribe({
      next: () => {
        Object.assign(this.alumnoSeleccionado, this.alumnoEditForm);
        this.editandoAlumno = false;
        this.cargarAlumnos();
      }
    });
  }

  // ===== DETALLE PROFESOR =====
  abrirDetalleProfesor(profesor: any) {
    this.profesorSeleccionado = profesor;
    this.editandoProfesor = false;
    this.profesorEditForm = {
      nombre: profesor.nombre,
      apellidos: profesor.apellidos,
      email: profesor.email,
      dni: profesor.dni,
      especialidad: profesor.especialidad || '',
      telefono: profesor.telefono || '',
      password: ''
    };
    this.clasesProfesor = [];
    this.cargandoDetalle = true;
    this.profesorService.getClases(profesor.id).subscribe({
      next: (data: any[]) => { this.clasesProfesor = data; this.cargandoDetalle = false; },
      error: () => { this.cargandoDetalle = false; }
    });
  }

  cerrarDetalleProfesor() {
    this.profesorSeleccionado = null;
    this.editandoProfesor = false;
  }

  toggleActivoProfesor() {
    const activo = !this.profesorSeleccionado.activo;
    this.profesorService.update(this.profesorSeleccionado.id, {
      ...this.profesorSeleccionado, activo, password: ''
    }).subscribe({
      next: () => {
        this.profesorSeleccionado.activo = activo;
        this.cargarProfesores();
      }
    });
  }

  guardarProfesor() {
    this.profesorService.update(this.profesorSeleccionado.id, {
      ...this.profesorEditForm,
      activo: this.profesorSeleccionado.activo
    }).subscribe({
      next: () => {
        Object.assign(this.profesorSeleccionado, this.profesorEditForm);
        this.editandoProfesor = false;
        this.cargarProfesores();
      }
    });
  }

  // ===== DETALLE CLASE =====
  abrirDetalleClase(clase: any) {
    this.claseSeleccionada = clase;
    this.editandoClase = false;
    this.claseEditForm = {
      nombre: clase.nombre,
      descripcion: clase.descripcion || '',
      cursoAcademico: clase.cursoAcademico || '',
      fechaInicio: clase.fechaInicio || '',
      fechaFin: clase.fechaFin || ''
    };
    this.alumnosClase = [];
    this.profesoresClase = [];
    this.cargandoDetalle = true;
    this.claseService.getAlumnos(clase.id).subscribe({
      next: (data: any[]) => { this.alumnosClase = data; },
      error: () => {}
    });
    this.claseService.getProfesores(clase.id).subscribe({
      next: (data: any[]) => { this.profesoresClase = data; this.cargandoDetalle = false; },
      error: () => { this.cargandoDetalle = false; }
    });
  }

  cerrarDetalleClase() {
    this.claseSeleccionada = null;
    this.editandoClase = false;
  }

  toggleActivoClase() {
    const activo = !this.claseSeleccionada.activo;
    this.claseService.update(this.claseSeleccionada.id, {
      ...this.claseEditForm, activo
    }).subscribe({
      next: () => {
        this.claseSeleccionada.activo = activo;
        this.cargarClases();
      }
    });
  }

  regenerarCodigo() {
    this.claseService.regenerarCodigo(this.claseSeleccionada.id).subscribe({
      next: (res: any) => {
        const nuevoCodigo = res.mensaje?.split(': ')[1] ?? res.mensaje;
        this.claseSeleccionada.codigoAcceso = nuevoCodigo;
        this.cargarClases();
      }
    });
  }

  guardarClase() {
    this.claseService.update(this.claseSeleccionada.id, {
      ...this.claseEditForm,
      activo: this.claseSeleccionada.activo
    }).subscribe({
      next: () => {
        Object.assign(this.claseSeleccionada, this.claseEditForm);
        this.editandoClase = false;
        this.cargarClases();
      }
    });
  }

  // ===== DETALLE ADMIN =====
  abrirDetalleAdmin(admin: any) {
    this.adminSeleccionado = admin;
    this.editandoAdmin = false;
    this.adminEditForm = {
      nombre: admin.profesor.nombre,
      apellidos: admin.profesor.apellidos,
      email: admin.profesor.email,
      dni: admin.profesor.dni,
      telefono: admin.profesor.telefono || '',
      password: ''
    };
  }

  cerrarDetalleAdmin() {
    this.adminSeleccionado = null;
    this.editandoAdmin = false;
  }

  toggleActivoAdmin() {
    const activo = !this.adminSeleccionado.profesor.activo;
    this.profesorService.update(this.adminSeleccionado.profesor.id, {
      ...this.adminSeleccionado.profesor, activo, password: ''
    }).subscribe({
      next: () => {
        this.adminSeleccionado.profesor.activo = activo;
        this.cargarAdmins();
      }
    });
  }

  guardarAdmin() {
    this.profesorService.update(this.adminSeleccionado.profesor.id, {
      ...this.adminEditForm,
      activo: this.adminSeleccionado.profesor.activo
    }).subscribe({
      next: () => {
        Object.assign(this.adminSeleccionado.profesor, this.adminEditForm);
        this.editandoAdmin = false;
        this.cargarAdmins();
      }
    });
  }

  // ===== CSV ALUMNOS =====
  abrirModalCSV() {
    this.mostrarModalCSV = true;
    this.alumnosCSV = [];
    this.resultadoImport = null;
  }

  cerrarModalCSV() { this.mostrarModalCSV = false; }

  onArchivoCSV(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true, skipEmptyLines: true, encoding: 'UTF-8', delimiter: ',',
      complete: (result: any) => { this.alumnosCSV = result.data; },
      error: (err: any) => { console.log('CSV error:', err); }
    });
  }

  importarCSV() {
    if (!this.alumnosCSV.length) return;
    this.importando = true;
    this.alumnoService.importar(this.centroId, this.alumnosCSV).subscribe({
      next: (res: any) => {
        this.resultadoImport = res;
        this.importando = false;
        if (res.creados > 0) this.cargarAlumnos();
      },
      error: () => { this.importando = false; }
    });
  }

  // ===== CSV PROFESORES =====
  abrirModalCSVProfesores() {
    this.mostrarModalCSVProfesores = true;
    this.profesoresCSV = [];
    this.resultadoImportProfesores = null;
  }

  cerrarModalCSVProfesores() { this.mostrarModalCSVProfesores = false; }

  onArchivoCSVProfesores(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true, skipEmptyLines: true, encoding: 'UTF-8', delimiter: ',',
      complete: (result: any) => { this.profesoresCSV = result.data; },
      error: (err: any) => { console.log('CSV error:', err); }
    });
  }

  importarCSVProfesores() {
    if (!this.profesoresCSV.length) return;
    this.importandoProfesores = true;
    this.profesorService.importar(this.centroId, this.profesoresCSV).subscribe({
      next: (res: any) => {
        this.resultadoImportProfesores = res;
        this.importandoProfesores = false;
        if (res.creados > 0) this.cargarProfesores();
      },
      error: () => { this.importandoProfesores = false; }
    });
  }

  // ===== FILTROS =====
  get alumnosFiltrados() {
    let lista = this.todosAlumnos.filter(a => {
      const matchNombre = (a.nombre + ' ' + a.apellidos + ' ' + a.email)
        .toLowerCase().includes(this.busqueda.toLowerCase());
      const matchActivo = this.filtroActivo === null || a.activo === this.filtroActivo;
      return matchNombre && matchActivo;
    });
    if (this.filtroFecha === 'reciente')
      lista = [...lista].sort((a, b) => new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime());
    if (this.filtroFecha === 'antiguo')
      lista = [...lista].sort((a, b) => new Date(a.fechaRegistro).getTime() - new Date(b.fechaRegistro).getTime());
    return lista;
  }

  get profesoresFiltrados() {
    let lista = this.todosProfesores.filter(p => {
      const matchNombre = (p.nombre + ' ' + p.apellidos + ' ' + p.email)
        .toLowerCase().includes(this.busqueda.toLowerCase());
      const matchActivo = this.filtroActivo === null || p.activo === this.filtroActivo;
      return matchNombre && matchActivo;
    });
    if (this.filtroFecha === 'reciente')
      lista = [...lista].sort((a, b) => new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime());
    if (this.filtroFecha === 'antiguo')
      lista = [...lista].sort((a, b) => new Date(a.fechaRegistro).getTime() - new Date(b.fechaRegistro).getTime());
    return lista;
  }

  get clasesFiltradas() {
    return this.todasClases.filter(c =>
      c.nombre.toLowerCase().includes(this.busqueda.toLowerCase())
    );
  }

  get adminsFiltrados() {
    return this.admins.filter(a =>
      (a.profesor?.nombre + ' ' + a.profesor?.email)
        .toLowerCase().includes(this.busqueda.toLowerCase())
    );
  }

  volver() {
    if (this.esSuper) this.router.navigate(['/superadmin']);
    else this.router.navigate(['/login']);
  }
}
