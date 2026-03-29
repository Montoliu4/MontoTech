import {Component, inject, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonSpinner, IonIcon } from '@ionic/angular/standalone';
import { AuthService } from '../../core/auth/auth';
import { CentroService } from '../../core/services/centro';
import { addIcons } from 'ionicons';
import { addOutline, createOutline, trashOutline, closeOutline, businessOutline } from 'ionicons/icons';
import {Router} from "@angular/router";

@Component({
  selector: 'app-superadmin',
  templateUrl: './superadmin.page.html',
  styleUrls: ['./superadmin.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonContent, IonHeader, IonToolbar, IonTitle, IonSpinner, IonIcon]
})
export class SuperadminPage implements OnInit {

  centros: any[] = [];
  cargando = true;
  mostrarModal = false;
  modoEdicion = false;
  centroEditandoId: number | null = null;
  usuario: any;
  formulario!: FormGroup;
  private router = inject(Router);
  constructor(
    private authService: AuthService,
    private centroService: CentroService,
    private fb: FormBuilder,
) {
    addIcons({ addOutline, createOutline, trashOutline, closeOutline, businessOutline });
  }

  ngOnInit() {
    this.usuario = this.authService.getUsuario();
    this.initForm();
    this.cargarCentros();
  }

  initForm() {
    this.formulario = this.fb.group({
      nombre:        ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
      tipo:          ['INSTITUTO', Validators.required],
      ciudad:        ['', [Validators.required, Validators.minLength(2)]],
      direccion:     ['', [Validators.required, Validators.minLength(5)]],
      emailContacto: ['', [Validators.required, Validators.email]],
      activo:        [true]
    });
  }

  cargarCentros() {
    this.centroService.getAll().subscribe({
      next: (data: any[]) => { this.centros = data; this.cargando = false; },
      error: () => { this.cargando = false; }
    });
  }

  abrirModalNuevo() {
    this.modoEdicion = false;
    this.centroEditandoId = null;
    this.formulario.reset({ tipo: 'INSTITUTO', activo: true });
    this.mostrarModal = true;
  }

  abrirModalEditar(centro: any) {
    this.modoEdicion = true;
    this.centroEditandoId = centro.id;
    this.formulario.patchValue({
      nombre:        centro.nombre,
      tipo:          centro.tipo,
      ciudad:        centro.ciudad,
      direccion:     centro.direccion,
      emailContacto: centro.emailContacto,
      activo:        centro.activo
    });
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.formulario.reset({ tipo: 'INSTITUTO', activo: true });
  }

  guardar() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const data = this.formulario.value;
    if (this.modoEdicion && this.centroEditandoId) {
      this.centroService.update(this.centroEditandoId, data).subscribe({
        next: () => { this.cerrarModal(); this.cargarCentros(); }
      });
    } else {
      this.centroService.create(data).subscribe({
        next: () => { this.cerrarModal(); this.cargarCentros(); }
      });
    }
  }

  verDetalle(id: number) {
    this.router.navigate(['/superadmin/centro', id]);
  }

  get centrosActivos() { return this.centros.filter(c => c.activo).length; }
  get centrosInactivos() { return this.centros.filter(c => !c.activo).length; }
  get nombre()        { return this.formulario.get('nombre'); }
  get tipo()          { return this.formulario.get('tipo'); }
  get ciudad()        { return this.formulario.get('ciudad'); }
  get direccion()     { return this.formulario.get('direccion'); }
  get emailContacto() { return this.formulario.get('emailContacto'); }
}
