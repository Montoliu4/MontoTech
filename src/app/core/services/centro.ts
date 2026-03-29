import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class CentroService {
  private API = 'http://localhost:8080/api/centros';
  constructor(private http: HttpClient) {}
  getAll() { return this.http.get<any[]>(this.API); }
  getById(id: number) { return this.http.get<any>(`${this.API}/${id}`); }
  create(data: any) { return this.http.post(this.API, data); }
  update(id: number, data: any) { return this.http.put(`${this.API}/${id}`, data); }
  delete(id: number) { return this.http.delete(`${this.API}/${id}`); }
  getAdmins(id: number) { return this.http.get<any[]>(`http://localhost:8080/api/admins/centro/${id}`);
  }
  }
