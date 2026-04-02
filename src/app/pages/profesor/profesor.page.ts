import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonIcon,
  IonSpinner, IonSearchbar
} from '@ionic/angular/standalone';
import { AuthService } from '../../core/auth/auth';
import { ClaseService } from '../../core/services/clase';
import { addIcons } from 'ionicons';
import {
  addOutline, bookOutline, peopleOutline, timeOutline,
  chevronDownOutline, logOutOutline, gridOutline, listOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-profesor',
  templateUrl: './profesor.page.html',
  styleUrls: ['./profesor.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonToolbar, IonIcon, IonSpinner, IonSearchbar
  ]
})
export class ProfesorPage implements OnInit {

  usuario: any;
  clases: any[] = [];
  clasesFiltradas: any[] = [];
  cargando = true;
  busqueda = '';
  ordenacion = 'reciente';
  vistaGrid = true;

  constructor(
    private authService: AuthService,
    private claseService: ClaseService,
    private router: Router
  ) {
    addIcons({
      addOutline, bookOutline, peopleOutline, timeOutline,
      chevronDownOutline, logOutOutline, gridOutline, listOutline
    });
  }

  ngOnInit() {
    this.usuario = this.authService.getUsuario();
    this.cargarClases();
  }

  cargarClases() {
    this.cargando = true;
    this.claseService.getByProfesor(this.usuario.id).subscribe({
      next: (data: any[]) => {
        this.clases = data;
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }

  buscar(event: any) {
    this.busqueda = event.detail.value ?? '';
    this.aplicarFiltros();
  }

  setOrdenacion(orden: string) {
    this.ordenacion = orden;
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    let lista = this.clases.filter(c =>
      c.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
      (c.cursoAcademico ?? '').toLowerCase().includes(this.busqueda.toLowerCase())
    );
    if (this.ordenacion === 'reciente')
      lista = [...lista].sort((a, b) => b.id - a.id);
    else if (this.ordenacion === 'alfabetico')
      lista = [...lista].sort((a, b) => a.nombre.localeCompare(b.nombre));
    this.clasesFiltradas = lista;
  }

  verClase(id: number) {
    this.router.navigate(['/profesor/clase', id]);
  }

  get totalAlumnos() {
    return this.clases.reduce((acc, c) => acc + (c.totalAlumnos ?? 0), 0);
  }

  logout() {
    this.authService.logout();
  }
}
