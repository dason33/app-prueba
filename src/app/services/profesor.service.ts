import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Profesor } from '../model/profesor.interface';

/**
 * Servicio para gestionar operaciones relacionadas con profesores.
 * Proporciona métodos para listar, obtener, crear, actualizar y eliminar profesores.
 */
@Injectable({
  providedIn: 'root' // Indica que el servicio es singleton y está disponible en toda la aplicación
})
export class ProfesorService {
  private http = inject(HttpClient); // Inyección del cliente HTTP para realizar solicitudes

  /**
   * Obtiene la lista de profesores desde el servidor.
   * @returns Un observable que emite un arreglo de profesores.
   */
  list() {
    return this.http.get<Profesor[]>(`http://localhost:8080/api/profesores`); // Solicitud GET para obtener todos los profesores
  }

  /**
   * Obtiene un profesor específico por su ID.
   * @param id - El ID del profesor a obtener.
   * @returns Un observable que emite el profesor correspondiente.
   */
  get(id: number) {
    return this.http.get<Profesor>(`http://localhost:8080/api/profesores/${id}`); // Solicitud GET para obtener un profesor específico
  }

  /**
   * Crea un nuevo profesor en el servidor.
   * @param profesor - El profesor a crear.
   * @returns Un observable que emite el profesor creado.
   */
  create(profesor: Profesor) {
    return this.http.post<Profesor>(`http://localhost:8080/api/profesores`, profesor); // Solicitud POST para crear un nuevo profesor
  }

  /**
   * Actualiza un profesor existente en el servidor.
   * @param id - El ID del profesor a actualizar.
   * @param profesor - Los nuevos datos del profesor.
   * @returns Un observable que emite el profesor actualizado.
   */
  update(id: number, profesor: Profesor) {
    return this.http.put<Profesor>(`http://localhost:8080/api/profesores/${id}`, profesor); // Solicitud PUT para actualizar un profesor existente
  }

  /**
   * Elimina un profesor del servidor por su ID.
   * @param id - El ID del profesor a eliminar.
   * @returns Un observable vacío que se completa al eliminar el profesor.
   */
  delete(id: number) {
    return this.http.delete<void>(`http://localhost:8080/api/profesores/${id}`); // Solicitud DELETE para eliminar un profesor
  }
}
