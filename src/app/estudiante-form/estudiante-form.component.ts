import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EstudianteService } from '../services/estudiante.service';
import { Estudiante } from '../model/estudiante.interface';

@Component({
  selector: 'app-estudiante-form',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './estudiante-form.component.html',
  styleUrl: './estudiante-form.component.css'
})
export default class EstudianteFormComponent  implements OnInit{
  
  private fb= inject(FormBuilder);
  private estudianteServ=inject(EstudianteService);
  private router=inject(Router);
  private route=inject(ActivatedRoute);

  form?: FormGroup;
  student?: Estudiante;

  ngOnInit(): void {
      const id=this.route.snapshot.paramMap.get('id');
      if(id){
        this.estudianteServ.get(parseInt(id)).subscribe(est=>{
          this.student=est;
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

    const estudianteForm= this.form!.value;

    if(this.student){
      this.estudianteServ.update(this.student.id, estudianteForm)
      .subscribe(()=>{
        this.router.navigate(['/estudiantes']);
      });
    }else{
      this.estudianteServ.create(estudianteForm).subscribe(()=>{
        this.router.navigate(['/estudiantes']);
      });

    }

  }

  delete(){
    const id=this.route.snapshot.paramMap.get('id');
    if(id){
      this.estudianteServ.delete(parseInt(id)).subscribe(()=>{
        this.router.navigate(['/estudientes'])
      })
    }
  }
  
}
