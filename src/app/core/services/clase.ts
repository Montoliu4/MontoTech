import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Clase } from '../models/clase';

@Injectable({ providedIn: 'root' })
export class ClaseService {

  private API = 'http://localhost:8080/api/clases';

  constructor(private http: HttpClient) {}

  getAll() { return this.http.get<Clase[]>(this.API); }
  getById(id: number) { return this.http.get<Clase>(`${this.API}/${id}`); }
  getByProfesor(id: number) { return this.http.get<Clase[]>(`${this.API}/profesor/${id}`); }
  getByCentro(id: number) { return this.http.get<Clase[]>(`${this.API}/centro/${id}`); }
  getAlumnos(id: number) { return this.http.get<any[]>(`${this.API}/${id}/alumnos`); }
  getTareas(id: number) { return this.http.get<any[]>(`${this.API}/${id}/tareas`); }
  getProfesores(id: number) { return this.http.get<any[]>(`${this.API}/${id}/profesores`); }
  create(data: any) { return this.http.post(this.API, data); }
  update(id: number, data: any) { return this.http.put(`${this.API}/${id}`, data); }
  delete(id: number) { return this.http.delete(`${this.API}/${id}`); }


}
