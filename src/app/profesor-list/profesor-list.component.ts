import { Component, inject } from '@angular/core';
import { ProfesorService } from '../services/profesor.service';
import { DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Profesor } from '../model/profesor.interface';
import { CommonModule } from '@angular/common';
import { NotaService } from '../services/nota.service';
import { firstValueFrom } from 'rxjs';

/**
 * Componente para la lista de profesores.
 * Muestra todos los profesores y permite eliminar registros.
 */
@Component({
  selector: 'app-profesor-list', // Selector del componente
  standalone: true, // Indica que este componente es autónomo
  imports: [DatePipe, RouterModule, CommonModule], // Importaciones necesarias
  templateUrl: './profesor-list.component.html', // Ruta del archivo de plantilla
  styleUrl: './profesor-list.component.css' // Ruta del archivo de estilos
})
export default class ProfesorListComponent {
  // Inyección del servicio de profesores
  private profesorServ = inject(ProfesorService);
  private notaServ = inject(NotaService);
  lstprofesores: Profesor[] = []; // Lista de profesores
  successMessage: boolean = false;
  successText: string='';
  successDelete: boolean=false;

  /**
   * Método de ciclo de vida que se ejecuta al inicializar el componente.
   * Carga la lista de profesores al inicio.
   */
  ngOnInit(): void {
    this.loadAll(); // Cargar todos los profesores
  }

  /**
   * Método para cargar la lista de profesores desde el servicio.
   */
  loadAll() {
    this.profesorServ.list().subscribe(profesores => {
      this.lstprofesores = profesores; // Asignar la lista de profesores
    });
  }

  /**
   * Método para eliminar un profesor.
   * Muestra un cuadro de confirmación antes de proceder con la eliminación.
   * @param profesor - El profesor a eliminar.
   */
  async deleteProfesor(profesor: Profesor) {
    const confirmacion = window.confirm('¿Está seguro que desea eliminar el registro?');
    if (confirmacion) {
      const notas = await firstValueFrom(this.notaServ.list());

  for (let nota of notas) {
    if (nota.profesor === profesor.id) {
      this.successDelete = true;
      break;
    }
  }
      if(this.successDelete){
        this.successDelete = false;
        this.successMessage = true;
          this.successText = 'Posee notas asociadas al profesor seleccionado. Debe borrar o reasignar los registros para continuar.';  // Asignamos el mensaje de actualización
          setTimeout(() => {
            this.successMessage = false; // Ocultar el mensaje después de 3 segundos
            this.loadAll(); // Recarga la lista de profesores
          }, 3000);
        console.log('No se puede eliminar'); // Mensaje de confirmación en la consola
      }else{
        this.profesorServ.delete(profesor.id).subscribe(() => {
          this.successMessage = true;
            this.successText = 'El registro ha sido eliminado exitosamente.';  // Asignamos el mensaje de actualización
            setTimeout(() => {
              this.successMessage = false; // Ocultar el mensaje después de 3 segundos
              this.loadAll(); // Recarga la lista de profesores
            }, 3000);
          console.log('ok'); // Mensaje de confirmación en la consola
        });
      }
    } else {
      console.log('Eliminación cancelada'); // Mensaje de cancelación en la consola
    }
  }
}
