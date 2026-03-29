export interface Alumno {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  telefono?: string;
  fechaNacimiento?: string;
  activo: boolean;
  fechaRegistro?: string;
  fechaDesactivacion?: string;
}
