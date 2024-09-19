import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Nota } from '../model/nota.interface';

@Injectable({
  providedIn: 'root'
})
export class NotaService {

  private http = inject(HttpClient);

  list(){
    return this.http.get<Nota[]>(`http://localhost:8080/api/notas`);
  }

  get(id:number){
    return this.http.get<Nota>(`http://localhost:8080/api/notas/${id}`);
  }
  create(nota:Nota){
    return this.http.post<Nota>(`http://localhost:8080/api/notas`,nota);
  }
  update(id:number,nota:Nota){
    return this.http.put<Nota>(`http://localhost:8080/api/notas/${id}`,nota);
  }
  delete(id:number){
    return this.http.delete<void>(`http://localhost:8080/api/notas/${id}`);
  }
}
