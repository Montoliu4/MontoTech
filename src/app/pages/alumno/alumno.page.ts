import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonList, IonItem, IonLabel, IonSpinner } from '@ionic/angular/standalone';
import { AuthService } from '../../core/auth/auth';
import { AlumnoService } from '../../core/services/alumno';

@Component({
  selector: 'app-alumno',
  templateUrl: './alumno.page.html',
  styleUrls: ['./alumno.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonHeader, IonToolbar, IonTitle, IonList, IonItem, IonLabel, IonSpinner]
})
export class AlumnoPage implements OnInit {

  clases: any[] = [];
  cargando = true;
  usuario: any;

  constructor(
    private authService: AuthService,
    private alumnoService: AlumnoService
  ) {}

  ngOnInit() {
    this.usuario = this.authService.getUsuario();
    this.cargarClases();
  }

  cargarClases() {
    this.alumnoService.getClases(this.usuario.id).subscribe({
      next: (data: any[]) => {
        this.clases = data.map(m => m.clase);
        this.cargando = false;
      },
      error: () => { this.cargando = false; }
    });
  }
}
