import { Component, inject } from '@angular/core';
import { NotaService } from '../services/nota.service';
import { DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Nota } from '../model/nota.interface';
import { ProfesorService } from '../services/profesor.service';
import { EstudianteService } from '../services/estudiante.service';
import { Profesor } from '../model/profesor.interface';
import { Estudiante } from '../model/estudiante.interface';

@Component({
  selector: 'app-nota-list',
  standalone: true,
  imports: [DatePipe, RouterModule],
  templateUrl: './nota-list.component.html',
  styleUrl: './nota-list.component.css'
})
export default class NotaListComponent {
  private notaServ = inject(NotaService);
  private profesorServ = inject(ProfesorService);
  private estudianteServ = inject(EstudianteService);
  lstnotas: Nota []= [];
  lstprofesMap: Map<number,Profesor>=new Map<number,Profesor>();
  lstestMap: Map<number,Estudiante>=new Map<number,Estudiante>();

  ngOnInit(): void{
    this.loadAll();        // Cargar las notas
    this.loadProfesores(); // Cargar los profesores
    this.loadEstudiantes();// Cargar los estudiantes
  }

  loadAll(){
    this.notaServ.list().subscribe(notas =>{
      this.lstnotas=notas;
    })
  }

  loadProfesores(){
    this.profesorServ.list().subscribe(profesores => {
      this.lstprofesMap = new Map<number, Profesor>();
      
      profesores.forEach(profesor => {
        this.lstprofesMap.set(profesor.id, profesor);
        
      });
    });
  }

  loadEstudiantes(){
    this.estudianteServ.list().subscribe(estudiantes => {
      this.lstestMap = new Map<number, Estudiante>();
      
      estudiantes.forEach(estudiante => {
        this.lstestMap.set(estudiante.id, estudiante);
      });
    });
  }

  deleteNota(nota:Nota){
    const confirmacion = window.confirm('¿Está seguro que desea eliminar el registro?');
    if(confirmacion){
      this.notaServ.delete(nota.id).subscribe(()=>{
        console.log('ok');
        this.loadAll();
      })
    }
    else {
      console.log('Eliminación cancelada');
    }
    }
}
