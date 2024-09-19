import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Estudiante } from '../model/estudiante.interface';

/**
 * Servicio para gestionar operaciones relacionadas con estudiantes.
 * Proporciona métodos para listar, obtener, crear, actualizar y eliminar estudiantes.
 */
@Injectable({
  providedIn: 'root' // Indica que el servicio es singleton y está disponible en toda la aplicación
})
export class EstudianteService {
  private http = inject(HttpClient); // Inyección del cliente HTTP para realizar solicitudes

  /**
   * Obtiene la lista de estudiantes desde el servidor.
   * @returns Un observable que emite un arreglo de estudiantes.
   */
  list() {
    return this.http.get<Estudiante[]>('http://localhost:8080/api/estudiantes'); // Solicitud GET para obtener estudiantes
  }

  /**
   * Obtiene un estudiante específico por su ID.
   * @param id - El ID del estudiante a obtener.
   * @returns Un observable que emite el estudiante correspondiente.
   */
  get(id: number) {
    return this.http.get<Estudiante>(`http://localhost:8080/api/estudiantes/${id}`); // Solicitud GET para obtener un estudiante específico
  }

  /**
   * Crea un nuevo estudiante en el servidor.
   * @param estudiante - El estudiante a crear.
   * @returns Un observable que emite el estudiante creado.
   */
  create(estudiante: Estudiante) {
    return this.http.post<Estudiante>('http://localhost:8080/api/estudiantes', estudiante); // Solicitud POST para crear un estudiante
  }

  /**
   * Actualiza un estudiante existente en el servidor.
   * @param id - El ID del estudiante a actualizar.
   * @param estudiante - Los nuevos datos del estudiante.
   * @returns Un observable que emite el estudiante actualizado.
   */
  update(id: number, estudiante: Estudiante) {
    return this.http.put<Estudiante>(`http://localhost:8080/api/estudiantes/${id}`, estudiante); // Solicitud PUT para actualizar un estudiante
  }

  /**
   * Elimina un estudiante del servidor por su ID.
   * @param id - El ID del estudiante a eliminar.
   * @returns Un observable vacío que se completa al eliminar el estudiante.
   */
  delete(id: number) {
    return this.http.delete<void>(`http://localhost:8080/api/estudiantes/${id}`); // Solicitud DELETE para eliminar un estudiante
  }
}
