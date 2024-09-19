import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Estudiante } from '../model/estudiante.interface';

@Injectable({
  providedIn: 'root'
})
export class EstudianteService {

  private http = inject(HttpClient);

  list(){
    return this.http.get<Estudiante[]>('http://localhost:8080/api/estudiantes');
  }

  get(id: number) {
    return this.http.get<Estudiante>(`http://localhost:8080/api/estudiantes/${id}`);
  }  
  create(estudiante:Estudiante){
    return this.http.post<Estudiante>('http://localhost:8080/api/estudiantes',estudiante);
  }
  update(id:number,estudiante:Estudiante){
    return this.http.put<Estudiante>(`http://localhost:8080/api/estudiantes/${id}`,estudiante);
  }
  delete(id:number){
    return this.http.delete<void>(`http://localhost:8080/api/estudiantes/${id}`);
  }

}
