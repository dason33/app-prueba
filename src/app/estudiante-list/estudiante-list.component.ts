import { Component, inject } from '@angular/core';
import { EstudianteService } from '../services/estudiante.service';
import { DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Estudiante } from '../model/estudiante.interface';
import { CommonModule } from '@angular/common';
import { NotaService } from '../services/nota.service';
import { firstValueFrom } from 'rxjs';

/**
 * Componente para listar estudiantes.
 * Permite visualizar y eliminar estudiantes de la lista.
 */
@Component({
  selector: 'app-estudiante-list', // Selector del componente
  standalone: true, // Indica que este componente es autónomo
  imports: [DatePipe, RouterModule, CommonModule], // Importaciones necesarias para formato de fecha y enrutamiento
  templateUrl: './estudiante-list.component.html', // Ruta del archivo de plantilla
  styleUrl: './estudiante-list.component.css' // Ruta del archivo de estilos
})
export default class EstudianteListComponent {
  // Inyección de servicio para manejar operaciones con estudiantes
  private estudianteService = inject(EstudianteService);
  private notaServ = inject(NotaService);
  // Lista de estudiantes
  lstestudiantes: Estudiante[] = [];
  successMessage: boolean = false;
  successText: string='';
  successDelete: boolean=false;

  /**
   * Método de ciclo de vida que se ejecuta al inicializar el componente.
   * Carga todos los estudiantes al iniciar la vista.
   */
  ngOnInit(): void {
    this.loadAll(); // Llama al método para cargar todos los estudiantes
  }

  /**
   * Método para cargar la lista de estudiantes.
   * Se suscribe al servicio para obtener la lista de estudiantes y actualizar la propiedad.
   */
  loadAll() {
    this.estudianteService.list().subscribe(estudiantes => {
      this.lstestudiantes = estudiantes; // Actualiza la lista de estudiantes
    });
  }

  /**
   * Método para eliminar un estudiante.
   * Muestra una confirmación antes de proceder con la eliminación.
   * @param estudiante - Estudiante a eliminar.
   */
  async deleteEstudiante(estudiante: Estudiante) {
    const confirmacion = window.confirm('¿Está seguro que desea eliminar el registro?'); // Solicita confirmación
    if (confirmacion) {
      const notas = await firstValueFrom(this.notaServ.list());

      for (let nota of notas) {
        if (nota.estudiante === estudiante.id) {
          this.successDelete = true;
          break;
        }
      }
      if (this.successDelete) {
        this.successDelete = false;
        this.successMessage = true;
        this.successText = 'Posee notas asociadas al estudiante seleccionado. Debe borrar o reasignar los registros para continuar.';  // Asignamos el mensaje de actualización
        setTimeout(() => {
          this.successMessage = false; // Ocultar el mensaje después de 3 segundos
          this.loadAll(); // Recarga la lista de estudiantes
        }, 3000);
        console.log('No se puede eliminar'); // Mensaje de confirmación en la consola
      } else {
        this.estudianteService.delete(estudiante.id).subscribe(() => {
          this.successMessage = true;
          this.successText = 'El registro ha sido eliminado exitosamente.';  // Asignamos el mensaje de actualización
          setTimeout(() => {
            this.successMessage = false; // Ocultar el mensaje después de 3 segundos
            this.loadAll(); // Recarga la lista de estudiantes
          }, 3000);
          console.log('ok'); // Mensaje de confirmación en la consola
        });
      }
    } else {
      console.log('Eliminación cancelada'); // Mensaje de cancelación
    }
  }
}
