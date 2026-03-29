export interface Profesor {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  especialidad?: string;
  telefono?: string;
  activo: boolean;
  fechaRegistro?: string;
  fechaDesactivacion?: string;
}
