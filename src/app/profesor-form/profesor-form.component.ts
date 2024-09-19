import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Profesor } from '../model/profesor.interface';
import { ProfesorService } from '../services/profesor.service';

@Component({
  selector: 'app-profesor-form',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './profesor-form.component.html',
  styleUrl: './profesor-form.component.css'
})
export default class ProfesorFormComponent implements OnInit{
  
  private fb= inject(FormBuilder);
  private profesorServ=inject(ProfesorService);
  private router=inject(Router);
  private route=inject(ActivatedRoute);

  form?: FormGroup;
  teacher?: Profesor;

  ngOnInit(): void {
      const id=this.route.snapshot.paramMap.get('id');
      if(id){
        this.profesorServ.get(parseInt(id)).subscribe(est=>{
          this.teacher=est;
          this.form= this.fb.group({
            nombre:[est.nombre,[Validators.required]],
          })
        });        
      }else{
        this.form= this.fb.group({
          nombre:['',[Validators.required]],
        })
      }
  }

  
  save(){

    const profesorForm= this.form!.value;

    if(this.teacher){
      this.profesorServ.update(this.teacher.id, profesorForm)
      .subscribe(()=>{
        this.router.navigate(['/profesores']);
      });
    }else{
      this.profesorServ.create(profesorForm).subscribe(()=>{
        this.router.navigate(['/profesores']);
      });

    }

  }
  
}
