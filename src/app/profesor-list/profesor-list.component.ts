import { Component, inject } from '@angular/core';
import { ProfesorService } from '../services/profesor.service';
import { DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Profesor } from '../model/profesor.interface';

@Component({
  selector: 'app-profesor-list',
  standalone: true,
  imports: [DatePipe, RouterModule],
  templateUrl: './profesor-list.component.html',
  styleUrl: './profesor-list.component.css'
})
export default class ProfesorListComponent {
  private profesorServ = inject(ProfesorService);
  lstprofesores: Profesor []= [];

  ngOnInit(): void{
    this.loadAll();
  }

  loadAll(){
    this.profesorServ.list().subscribe(profesores =>{
      this.lstprofesores=profesores;
    })
  }

  deleteProfesor(profesor:Profesor){
    const confirmacion = window.confirm('¿Está seguro que desea eliminar el registro?');
    if(confirmacion){
      this.profesorServ.delete(profesor.id).subscribe(()=>{
        console.log('ok');
        this.loadAll();
      })
    }
    else {
      console.log('Eliminación cancelada');
    }
    }

}
