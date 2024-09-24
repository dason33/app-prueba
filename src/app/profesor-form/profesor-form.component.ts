import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Profesor } from '../model/profesor.interface';
import { ProfesorService } from '../services/profesor.service';
import { CommonModule } from '@angular/common';

/**
 * Componente para el formulario de profesores.
 * Permite crear y actualizar información de profesores.
 */
@Component({
  selector: 'app-profesor-form', // Selector del componente
  standalone: true, // Indica que este componente es autónomo
  imports: [RouterModule, ReactiveFormsModule, CommonModule], // Importaciones necesarias
  templateUrl: './profesor-form.component.html', // Ruta del archivo de plantilla
  styleUrl: './profesor-form.component.css' // Ruta del archivo de estilos
})
export default class ProfesorFormComponent implements OnInit {
  
  // Inyección de servicios
  private fb = inject(FormBuilder); // Servicio para manejar formularios reactivos
  private profesorServ = inject(ProfesorService); // Servicio para gestionar profesores
  private router = inject(Router); // Servicio para la navegación
  private route = inject(ActivatedRoute); // Servicio para obtener parámetros de la ruta

  form?: FormGroup; // Formulario reactivo
  teacher?: Profesor; // Información del profesor
  successMessage: boolean = false;
  successText: string='';

  /**
   * Método de ciclo de vida que se ejecuta al inicializar el componente.
   * Carga la información del profesor si existe el ID en la ruta.
   */
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id'); // Obtener el ID del parámetro de la ruta
    if (id) {
      // Si hay un ID, se carga el profesor existente
      this.profesorServ.get(parseInt(id)).subscribe(est => {
        this.teacher = est; // Almacena el profesor
        this.form = this.fb.group({ // Inicializa el formulario con los datos del profesor
          nombre: [est.nombre, [Validators.required, Validators.maxLength(100)]], // Campo nombre requerido
        });
      });        
    } else {
      // Si no hay ID, se crea un nuevo formulario
      this.form = this.fb.group({
        nombre: ['', [Validators.required, Validators.maxLength(100)]], // Campo nombre requerido
      });
    }
  }

  /**
   * Método para guardar la información del profesor.
   * Si el profesor existe, se actualiza. Si no, se crea uno nuevo.
   */
  save() {
    if(this.form?.valid){
      const profesorForm = this.form!.value; // Obtener los valores del formulario
  
      if (this.teacher) {
        // Actualizar el profesor existente
        this.profesorServ.update(this.teacher.id, profesorForm).subscribe(() => {
          this.successMessage = true;
          this.successText = 'El registro ha sido actualizado exitosamente.';  // Asignamos el mensaje de guardado
          setTimeout(() => {
            this.successMessage = false; // Ocultar el mensaje después de 3 segundos
            this.router.navigate(['/profesores']); // Redirigir a la lista de profesores
          }, 3000);
        });
      } else {
        // Crear un nuevo profesor
        this.profesorServ.create(profesorForm).subscribe(() => {
          this.successMessage = true;
          this.successText = 'El registro ha sido guardado exitosamente.';  // Asignamos el mensaje de guardado
          setTimeout(() => {
            this.successMessage = false; // Ocultar el mensaje después de 3 segundos
            this.router.navigate(['/profesores']); // Redirigir a la lista de profesores
          }, 3000);
        });
      }
    }else{
      this.form?.markAllAsTouched();
    }
  }
}
