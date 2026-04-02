import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class MatriculaService {

  private API = 'http://localhost:8080/api/matriculas';

  constructor(private http: HttpClient) {}

  getByClase(idClase: number) { return this.http.get<any[]>(`${this.API}/clase/${idClase}`); }
  getByAlumno(idAlumno: number) { return this.http.get<any[]>(`${this.API}/alumno/${idAlumno}`); }
  create(data: any) { return this.http.post(this.API, data); }
  bloquear(id: number) { return this.http.put(`${this.API}/${id}/bloquear`, {}); }
  desactivar(id: number) { return this.http.put(`${this.API}/${id}/desactivar`, {}); }
  delete(id: number) { return this.http.delete(`${this.API}/${id}`); }
}
