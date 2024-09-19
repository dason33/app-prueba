import { Component, inject } from '@angular/core';
import { EstudianteService } from '../services/estudiante.service';
import { DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Estudiante } from '../model/estudiante.interface';

@Component({
  selector: 'app-estudiante-list',
  standalone: true,
  imports: [DatePipe, RouterModule],
  templateUrl: './estudiante-list.component.html',
  styleUrl: './estudiante-list.component.css'
})
export default class EstudianteListComponent {
  private estudianteService = inject(EstudianteService);
  lstestudiantes: Estudiante []= [];

  ngOnInit(): void{
    this.loadAll();
  }

  loadAll(){
    this.estudianteService.list().subscribe(estudiantes =>{
      this.lstestudiantes=estudiantes;
    })
  }

  deleteEstudiante(estudiante:Estudiante){
  const confirmacion = window.confirm('¿Está seguro que desea eliminar el registro?');
  if(confirmacion){
    this.estudianteService.delete(estudiante.id).subscribe(()=>{
      console.log('ok');
      this.loadAll();
    })
  }
  else {
    console.log('Eliminación cancelada');
  }
  }
}
