import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ArchivoService {

  private API = 'http://localhost:8080/api/archivos';

  constructor(private http: HttpClient) {}

  subir(archivo: File) {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post<{ url: string }>(`${this.API}/subir`, formData);
  }

  subirMultiples(archivos: File[]) {
    const formData = new FormData();
    archivos.forEach(f => formData.append('archivos', f));
    return this.http.post<{ nombre: string, url: string }[]>(`${this.API}/subir-multiples`, formData);
  }

  // Convierte lista de {nombre, url} a JSON string para guardar en BD
  serializarArchivos(archivos: { nombre: string, url: string }[]): string {
    return JSON.stringify(archivos);
  }

  // Convierte JSON string de BD a lista de {nombre, url}
  deserializarArchivos(json: string | null): { nombre: string, url: string }[] {
    if (!json) return [];
    try {
      const parsed = JSON.parse(json);
      // Compatibilidad con formato antiguo (string simple)
      if (typeof parsed === 'string') return [{ nombre: 'Archivo', url: parsed }];
      if (Array.isArray(parsed)) return parsed;
      return [];
    } catch {
      // Si no es JSON válido es una URL simple antigua
      return json.startsWith('http') ? [{ nombre: 'Archivo', url: json }] : [];
    }
  }
}
