import { Component, inject, OnInit } from '@angular/core';
import { NotaService } from '../services/nota.service';
import { DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Nota } from '../model/nota.interface';
import { ProfesorService } from '../services/profesor.service';
import { EstudianteService } from '../services/estudiante.service';
import { Profesor } from '../model/profesor.interface';
import { Estudiante } from '../model/estudiante.interface';
import { CommonModule } from '@angular/common';

/**
 * Componente para listar las notas.
 * Permite visualizar, eliminar y gestionar notas de estudiantes y profesores.
 */
@Component({
  selector: 'app-nota-list', // Selector del componente
  standalone: true, // Indica que este componente es autónomo
  imports: [DatePipe, RouterModule, CommonModule], // Importaciones necesarias
  templateUrl: './nota-list.component.html', // Ruta del archivo de plantilla
  styleUrl: './nota-list.component.css' // Ruta del archivo de estilos
})
export default class NotaListComponent implements OnInit {
  
  // Inyección de servicios
  private notaServ = inject(NotaService);
  private profesorServ = inject(ProfesorService);
  private estudianteServ = inject(EstudianteService);

  // Listas para almacenar notas, profesores y estudiantes
  lstnotas: Nota[] = [];
  lstprofesMap: Map<number, Profesor> = new Map<number, Profesor>();
  lstestMap: Map<number, Estudiante> = new Map<number, Estudiante>();
  successMessage: boolean = false;
  successText: string='';

  /**
   * Método de ciclo de vida que se ejecuta al inicializar el componente.
   * Carga todas las notas, profesores y estudiantes.
   */
  ngOnInit(): void {
    this.loadAll();        // Cargar las notas
    this.loadProfesores(); // Cargar los profesores
    this.loadEstudiantes(); // Cargar los estudiantes
  }

  /**
   * Método para cargar todas las notas.
   * Se suscribe al servicio de notas y almacena el resultado.
   */
  loadAll() {
    this.notaServ.list().subscribe(notas => {
      this.lstnotas = notas; // Almacena las notas en la lista
    });
  }

  /**
   * Método para cargar la lista de profesores.
   * Se suscribe al servicio de profesores y almacena el resultado en un mapa.
   */
  loadProfesores() {
    this.profesorServ.list().subscribe(profesores => {
      this.lstprofesMap = new Map<number, Profesor>();
      
      profesores.forEach(profesor => {
        this.lstprofesMap.set(profesor.id, profesor); // Agrega cada profesor al mapa
      });
    });
  }

  /**
   * Método para cargar la lista de estudiantes.
   * Se suscribe al servicio de estudiantes y almacena el resultado en un mapa.
   */
  loadEstudiantes() {
    this.estudianteServ.list().subscribe(estudiantes => {
      this.lstestMap = new Map<number, Estudiante>();
      
      estudiantes.forEach(estudiante => {
        this.lstestMap.set(estudiante.id, estudiante); // Agrega cada estudiante al mapa
      });
    });
  }

  /**
   * Método para eliminar una nota.
   * Solicita confirmación al usuario antes de eliminar.
   * Si se confirma, se llama al servicio para eliminar la nota.
   */
  deleteNota(nota: Nota) {
    const confirmacion = window.confirm('¿Está seguro que desea eliminar el registro?');
    if (confirmacion) {
      this.notaServ.delete(nota.id).subscribe(() => {
        this.successMessage = true;
          this.successText = 'El registro ha sido eliminado exitosamente.';  // Asignamos el mensaje de actualización
          setTimeout(() => {
            this.successMessage = false; // Ocultar el mensaje después de 3 segundos
            this.loadAll(); // Recarga la lista de estudiantes
          }, 3000);
          this.loadAll(); // Recargar la lista de notas después de eliminar
          console.log('ok'); // Mensaje de confirmación en la consola
      });
    } else {
      console.log('Eliminación cancelada'); // Mensaje de cancelación en la consola
    }
  }
}
