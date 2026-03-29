import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Tarea } from '../models/tarea';

@Injectable({ providedIn: 'root' })
export class TareaService {

  private API = 'http://localhost:8080/api/tareas';

  constructor(private http: HttpClient) {}

  getAll() { return this.http.get<Tarea[]>(this.API); }
  getById(id: number) { return this.http.get<Tarea>(`${this.API}/${id}`); }
  getByClase(id: number) { return this.http.get<Tarea[]>(`${this.API}/clase/${id}`); }
  create(data: any) { return this.http.post(this.API, data); }
  update(id: number, data: any) { return this.http.put(`${this.API}/${id}`, data); }
  delete(id: number) { return this.http.delete(`${this.API}/${id}`); }
}
