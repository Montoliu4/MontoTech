export interface Clase {
  id: number;
  nombre: string;
  codigoAcceso: string;
  cursoAcademico?: string;
  descripcion?: string;
  fechaInicio?: string;
  fechaFin?: string;
  activo: boolean;
  fechaDesactivacion?: string;
  profesor?: any;
}
