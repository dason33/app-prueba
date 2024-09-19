import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Nota } from '../model/nota.interface';

/**
 * Servicio para gestionar operaciones relacionadas con notas.
 * Proporciona métodos para listar, obtener, crear, actualizar y eliminar notas.
 */
@Injectable({
  providedIn: 'root' // Indica que el servicio es singleton y está disponible en toda la aplicación
})
export class NotaService {
  private http = inject(HttpClient); // Inyección del cliente HTTP para realizar solicitudes

  /**
   * Obtiene la lista de notas desde el servidor.
   * @returns Un observable que emite un arreglo de notas.
   */
  list() {
    return this.http.get<Nota[]>(`http://localhost:8080/api/notas`); // Solicitud GET para obtener todas las notas
  }

  /**
   * Obtiene una nota específica por su ID.
   * @param id - El ID de la nota a obtener.
   * @returns Un observable que emite la nota correspondiente.
   */
  get(id: number) {
    return this.http.get<Nota>(`http://localhost:8080/api/notas/${id}`); // Solicitud GET para obtener una nota específica
  }

  /**
   * Crea una nueva nota en el servidor.
   * @param nota - La nota a crear.
   * @returns Un observable que emite la nota creada.
   */
  create(nota: Nota) {
    return this.http.post<Nota>(`http://localhost:8080/api/notas`, nota); // Solicitud POST para crear una nueva nota
  }

  /**
   * Actualiza una nota existente en el servidor.
   * @param id - El ID de la nota a actualizar.
   * @param nota - Los nuevos datos de la nota.
   * @returns Un observable que emite la nota actualizada.
   */
  update(id: number, nota: Nota) {
    return this.http.put<Nota>(`http://localhost:8080/api/notas/${id}`, nota); // Solicitud PUT para actualizar una nota existente
  }

  /**
   * Elimina una nota del servidor por su ID.
   * @param id - El ID de la nota a eliminar.
   * @returns Un observable vacío que se completa al eliminar la nota.
   */
  delete(id: number) {
    return this.http.delete<void>(`http://localhost:8080/api/notas/${id}`); // Solicitud DELETE para eliminar una nota
  }
}
