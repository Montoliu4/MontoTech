export interface Tarea {
  id: number;
  titulo: string;
  descripcion?: string;
  fechaCreacion?: string;
  fechaLimite?: string;
  notaMaxima?: number;
  visible: boolean;
}
