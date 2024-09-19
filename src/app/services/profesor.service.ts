import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Profesor } from '../model/profesor.interface';

@Injectable({
  providedIn: 'root'
})
export class ProfesorService {

  private http = inject(HttpClient);

  list(){
    return this.http.get<Profesor[]>(`http://localhost:8080/api/profesores`);
  }
  get(id:number){
    return this.http.get<Profesor>(`http://localhost:8080/api/profesores/${id}`);
  }
  create(profesor:Profesor){
    return this.http.post<Profesor>(`http://localhost:8080/api/profesores`,profesor);
  }
  update(id:number,profesor:Profesor){
    return this.http.put<Profesor>(`http://localhost:8080/api/profesores/${id}`,profesor);
  }
  delete(id:number){
    return this.http.delete<void>(`http://localhost:8080/api/profesores/${id}`);
  }

}
