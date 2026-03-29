import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Profesor } from '../models/profesor';

@Injectable({ providedIn: 'root' })
export class ProfesorService {

  private API = 'http://localhost:8080/api/profesores';

  constructor(private http: HttpClient) {}

  getAll() { return this.http.get<Profesor[]>(this.API); }
  getById(id: number) { return this.http.get<Profesor>(`${this.API}/${id}`); }
  getClases(id: number) { return this.http.get<any[]>(`${this.API}/${id}/clases`); }
  getTareas(id: number) { return this.http.get<any[]>(`${this.API}/${id}/tareas`); }
  create(data: any) { return this.http.post(this.API, data); }
  update(id: number, data: any) { return this.http.put(`${this.API}/${id}`, data); }
  delete(id: number) { return this.http.delete(`${this.API}/${id}`); }
  getByCentro(id: number) { return this.http.get<any[]>(`http://localhost:8080/api/profesores/centro/${id}`); }}
