export interface Alumno {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  dni: string;
  telefono?: string;
  activo: boolean;
  fechaRegistro?: string;
  fechaDesactivacion?: string;
}
