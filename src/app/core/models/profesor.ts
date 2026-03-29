export interface Profesor {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  dni: string;
  especialidad?: string;
  telefono?: string;
  activo: boolean;
  fechaRegistro?: string;
  fechaDesactivacion?: string;
}
