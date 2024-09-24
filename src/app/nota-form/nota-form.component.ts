import { Component, inject, OnInit } from '@angular/core';
import { NotaService } from '../services/nota.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Nota } from '../model/nota.interface';
import { EstudianteService } from '../services/estudiante.service';
import { ProfesorService } from '../services/profesor.service';
import { Profesor } from '../model/profesor.interface';
import { Estudiante } from '../model/estudiante.interface';
import { CommonModule } from '@angular/common';

/**
 * Componente para el formulario de notas.
 * Permite crear y actualizar notas con selección de estudiantes y profesores.
 */
@Component({
  selector: 'app-nota-form', // Selector del componente
  standalone: true, // Indica que este componente es autónomo
  imports: [CommonModule, RouterModule, ReactiveFormsModule], // Importaciones necesarias
  templateUrl: './nota-form.component.html', // Ruta del archivo de plantilla
  styleUrl: './nota-form.component.css' // Ruta del archivo de estilos
})
export default class NotaFormComponent implements OnInit {
  
  // Inyección de dependencias
  private fb = inject(FormBuilder);
  private notaServ = inject(NotaService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private profesorServ = inject(ProfesorService);
  private estudianteServ = inject(EstudianteService);

  // Mapas para almacenar profesores y estudiantes
  lstprofesMap: Map<number, Profesor> = new Map<number, Profesor>();
  lstestMap: Map<number, Estudiante> = new Map<number, Estudiante>();

  // Arrays para almacenar los datos de estudiantes y profesores
  estudiantesArray: Estudiante[] = [];
  profesoresArray: Profesor[] = [];
  successMessage: boolean = false;
  successText: string='';

  // Formulario y nota
  form?: FormGroup;
  note?: Nota;

  /**
   * Método de ciclo de vida que se ejecuta al inicializar el componente.
   * Carga los estudiantes y profesores, y configura el formulario si se edita una nota.
   */
  ngOnInit(): void {
    this.loadProfesores(); // Carga la lista de profesores
    this.loadEstudiantes(); // Carga la lista de estudiantes

    const id = this.route.snapshot.paramMap.get('id'); // Obtiene el ID de la nota de la ruta
    if (id) {
      // Si existe un ID, se carga la nota para editar
      this.notaServ.get(parseInt(id)).subscribe(nota => {
        this.note = nota;
        this.form = this.fb.group({
          nombre: [nota.nombre, [Validators.required, Validators.maxLength(100)]], // Control para el nombre
          estudiante: [nota.estudiante, [Validators.required]], // Control para el estudiante
          profesor: [nota.profesor, [Validators.required]], // Control para el profesor
          valor: [nota.valor, [Validators.required, Validators.min(0), Validators.max(5)]], // Control para el valor
        });
      });
    } else {
      // Si no hay ID, se crea un nuevo formulario
      this.form = this.fb.group({
        nombre: ['', [Validators.required, Validators.maxLength(100)]], // Control para el nombre
        estudiante: ['', [Validators.required]], // Control para el estudiante
        profesor: ['', [Validators.required]], // Control para el profesor
        valor: ['', [Validators.required, Validators.min(0), Validators.max(5)]], // Control para el valor
      });
    }
  }

  /**
   * Método para cargar la lista de profesores.
   * Se almacenan en un mapa y se convierten a un array.
   */
  loadProfesores() {
    this.profesorServ.list().subscribe(profesores => {
      this.lstprofesMap = new Map<number, Profesor>();
      profesores.forEach(profesor => {
        this.lstprofesMap.set(profesor.id, profesor); // Agrega cada profesor al mapa
      });
      this.profesoresArray = Array.from(this.lstprofesMap.values()); // Convierte el mapa a array
    });
  }

  /**
   * Método para cargar la lista de estudiantes.
   * Se almacenan en un mapa y se convierten a un array.
   */
  loadEstudiantes() {
    this.estudianteServ.list().subscribe(estudiantes => {
      this.lstestMap = new Map<number, Estudiante>();
      estudiantes.forEach(estudiante => {
        this.lstestMap.set(estudiante.id, estudiante); // Agrega cada estudiante al mapa
      });
      this.estudiantesArray = Array.from(this.lstestMap.values()); // Convierte el mapa a array
    });
  }

  /**
   * Método para guardar la nota.
   * Si existe, se actualiza; si no, se crea una nueva.
   */
  save() {
    if(this.form?.valid){
      const notaForm = this.form!.value; // Obtiene los valores del formulario
  
      if (this.note) {
        // Si existe la nota, se actualiza
        this.notaServ.update(this.note.id, notaForm).subscribe(() => {
          this.successMessage = true;
          this.successText = 'El registro ha sido actualizado exitosamente.';  // Asignamos el mensaje de actualización
          setTimeout(() => {
            this.successMessage = false; // Ocultar el mensaje después de 3 segundos
            this.router.navigate(['/notas']); // Redirige a la lista de notas
          }, 3000);
        });
      } else {
        // Si no existe, se crea una nueva nota
        this.notaServ.create(notaForm).subscribe(() => {
          this.successMessage = true;
          this.successText = 'El registro ha sido guardado exitosamente.';  // Asignamos el mensaje de guardado
          setTimeout(() => {
            this.successMessage = false; // Ocultar el mensaje después de 3 segundos
            this.router.navigate(['/notas']); // Redirige a la lista de notas
          }, 3000);
        });
      }
    }else{
      this.form?.markAllAsTouched();
    }
  }
}
