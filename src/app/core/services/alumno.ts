import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Alumno } from '../models/alumno';

@Injectable({ providedIn: 'root' })
export class AlumnoService {

  private API = 'http://localhost:8080/api/alumnos';

  constructor(private http: HttpClient) {}

  getAll() { return this.http.get<Alumno[]>(this.API); }
  getById(id: number) { return this.http.get<Alumno>(`${this.API}/${id}`); }
  getClases(id: number) { return this.http.get<any[]>(`${this.API}/${id}/clases`); }
  getEntregas(id: number) { return this.http.get<any[]>(`${this.API}/${id}/entregas`); }
  create(data: any) { return this.http.post(this.API, data); }
  update(id: number, data: any) { return this.http.put(`${this.API}/${id}`, data); }
  delete(id: number) { return this.http.delete(`${this.API}/${id}`); }
  getByCentro(id: number) { return this.http.get<any[]>(`${this.API}/centro/${id}`); }
  importar(idCentro: number, alumnos: any[]) {
    return this.http.post(`http://localhost:8080/api/alumnos/importar/${idCentro}`, alumnos);
  }

}
