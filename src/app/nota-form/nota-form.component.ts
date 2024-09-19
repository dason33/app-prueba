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

@Component({
  selector: 'app-nota-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './nota-form.component.html',
  styleUrl: './nota-form.component.css'
})
export default class NotaFormComponent implements OnInit{
  
  private fb= inject(FormBuilder);
  private notaServ=inject(NotaService);
  private router=inject(Router);
  private route=inject(ActivatedRoute);
  private profesorServ = inject(ProfesorService);
  private estudianteServ = inject(EstudianteService);
  lstprofesMap: Map<number,Profesor>=new Map<number,Profesor>();
  lstestMap: Map<number,Estudiante>=new Map<number,Estudiante>();

  estudiantesArray: Estudiante[] = [];
  profesoresArray: Profesor[] = [];

  form?: FormGroup;
  note?: Nota;

  ngOnInit(): void {
    this.loadProfesores(); // Cargar los profesores
    this.loadEstudiantes();// Cargar los estudiantes
      const id=this.route.snapshot.paramMap.get('id');
      if(id){
        this.notaServ.get(parseInt(id)).subscribe(nota=>{
          this.note=nota;
          this.form= this.fb.group({
            nombre:[nota.nombre,[Validators.required]],
            estudiante:[nota.estudiante,[Validators.required]],
            profesor:[nota.profesor,[Validators.required]],
            valor:[nota.valor,[Validators.required]],
          })
        });        
      }else{
        this.form= this.fb.group({
          nombre:['',[Validators.required]],
          estudiante:['',[Validators.required]],
          profesor:['',[Validators.required]],
          valor:['',[Validators.required]],
        })
      }
  }
  loadProfesores(){
    this.profesorServ.list().subscribe(profesores => {
      this.lstprofesMap = new Map<number, Profesor>();
      profesores.forEach(profesor => {
        this.lstprofesMap.set(profesor.id, profesor);
        
      });
      this.profesoresArray = Array.from(this.lstprofesMap.values());
    });
  }

  loadEstudiantes(){
    this.estudianteServ.list().subscribe(estudiantes => {
      this.lstestMap = new Map<number, Estudiante>();
      
      estudiantes.forEach(estudiante => {
        this.lstestMap.set(estudiante.id, estudiante);
      });
      this.estudiantesArray = Array.from(this.lstestMap.values());
    });
  }

  
  save(){

    const notaForm= this.form!.value;

    if(this.note){
      this.notaServ.update(this.note.id, notaForm)
      .subscribe(()=>{
        this.router.navigate(['/notas']);
      });
    }else{
      this.notaServ.create(notaForm).subscribe(()=>{
        this.router.navigate(['/notas']);
      });

    }

  }
}
