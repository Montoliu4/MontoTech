export interface Entrega {
  id: number;
  archivoUrl?: string;
  comentarioAlumno?: string;
  comentarioProfesor?: string;
  estadoTarea: 'pendiente' | 'entregado' | 'fuera_de_plazo' | 'calificado';
  fechaEntrega?: string;
  fechaEvaluacion?: string;
  nota?: number;
}
