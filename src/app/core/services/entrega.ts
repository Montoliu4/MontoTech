import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Entrega } from '../models/entrega';

@Injectable({ providedIn: 'root' })
export class EntregaService {

  private API = 'http://localhost:8080/api/entregas';

  constructor(private http: HttpClient) {}

  getById(id: number) { return this.http.get<Entrega>(`${this.API}/${id}`); }
  getByAlumno(id: number) { return this.http.get<Entrega[]>(`${this.API}/alumno/${id}`); }
  getByTarea(id: number) { return this.http.get<Entrega[]>(`${this.API}/tarea/${id}`); }
  create(data: any) { return this.http.post(this.API, data); }
  update(id: number, data: any) { return this.http.put(`${this.API}/${id}`, data); }
  evaluar(id: number, data: any) { return this.http.put(`${this.API}/${id}/evaluar`, data); }
}
