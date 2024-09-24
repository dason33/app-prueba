import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EstudianteService } from '../services/estudiante.service';
import { Estudiante } from '../model/estudiante.interface';
import { CommonModule } from '@angular/common';

/**
 * Componente para manejar el formulario de estudiantes.
 * Permite crear y actualizar estudiantes.
 */
@Component({
  selector: 'app-estudiante-form', // Selector del componente
  standalone: true, // Indica que este componente es autónomo
  imports: [RouterModule, ReactiveFormsModule, CommonModule], // Importaciones necesarias para el enrutamiento y formularios reactivos
  templateUrl: './estudiante-form.component.html', // Ruta del archivo de plantilla
  styleUrl: './estudiante-form.component.css' // Ruta del archivo de estilos
})
export default class EstudianteFormComponent implements OnInit {
  
  // Inyección de dependencias
  private fb = inject(FormBuilder); // FormBuilder para manejar formularios
  private estudianteServ = inject(EstudianteService); // Servicio para manejar operaciones con estudiantes
  private router = inject(Router); // Router para la navegación
  private route = inject(ActivatedRoute); // Ruta activa para obtener parámetros

  form?: FormGroup; // Formulario reactivo para el estudiante
  student?: Estudiante; // Estudiante a ser editado (si existe)
  successMessage: boolean = false;
  successText: string='';

  /**
   * Método de ciclo de vida que se ejecuta al inicializar el componente.
   * Obtiene el ID del estudiante desde la ruta y carga los datos si existe.
   */
  ngOnInit(): void {
      const id = this.route.snapshot.paramMap.get('id'); // Obtiene el ID del estudiante de la URL
      if (id) {
        // Si hay un ID, se carga el estudiante existente
        this.estudianteServ.get(parseInt(id)).subscribe(est => {
          this.student = est; // Almacena el estudiante
          this.form = this.fb.group({
            nombre: [est.nombre, [Validators.required, Validators.maxLength(100)]], // Inicializa el formulario con el nombre del estudiante
          });
        });        
      } else {
        // Si no hay ID, se crea un nuevo formulario
        this.form = this.fb.group({
          nombre: ['', [Validators.required, Validators.maxLength(100)]], // Inicializa el formulario vacío
        });
      }
  }

  /**
   * Método para guardar el estudiante.
   * Crea un nuevo estudiante o actualiza uno existente.
   */
  save() {
    if(this.form?.valid){
      const estudianteForm = this.form!.value; // Obtiene los valores del formulario
  
      if (this.student) {
        // Si existe un estudiante, se actualiza
        this.estudianteServ.update(this.student.id, estudianteForm)
        .subscribe(() => {
          this.successMessage = true;
          this.successText = 'El registro ha sido actualizado exitosamente.';  // Asignamos el mensaje de actualización
          setTimeout(() => {
            this.successMessage = false; // Ocultar el mensaje después de 3 segundos
            this.router.navigate(['/']);// Navega a la ruta principal después de guardar
          }, 3000);
        });
      } else {
        // Si no existe, se crea un nuevo estudiante
        this.estudianteServ.create(estudianteForm).subscribe(() => {
          this.successMessage = true;
          this.successText = 'El registro ha sido guardado exitosamente.';  // Asignamos el mensaje de guardado
          setTimeout(() => {
            this.successMessage = false; // Ocultar el mensaje después de 3 segundos
            this.router.navigate(['/']);// Navega a la ruta principal después de guardar
          }, 3000);
        });
      }

    }else{
      this.form?.markAllAsTouched();
    }
  }

  /**
   * Método para eliminar un estudiante.
   * Obtiene el ID desde la ruta y lo elimina.
   */
  delete() {
    const id = this.route.snapshot.paramMap.get('id'); // Obtiene el ID del estudiante de la URL
    if (id) {
      this.estudianteServ.delete(parseInt(id)).subscribe(() => {
        this.router.navigate(['/']); // Navega a la ruta principal después de eliminar
      });
    }
  }
}