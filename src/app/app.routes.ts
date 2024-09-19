import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path:'estudiantes',
        loadComponent:() => import('./estudiante-list/estudiante-list.component')
    },
    {
        path:'profesores',
        loadComponent:() => import('./profesor-list/profesor-list.component')
    },
    {
        path:'notas',
        loadComponent:() => import('./nota-list/nota-list.component')
    },
    {
        path:'formest',
        loadComponent:() => import('./estudiante-form/estudiante-form.component')
    },
    {
        path:'formest/:id',
        loadComponent:() => import('./estudiante-form/estudiante-form.component')
    },
    {
        path:'formteach',
        loadComponent:() => import('./profesor-form/profesor-form.component')
    },
    {
        path:'formteach/:id',
        loadComponent:() => import('./profesor-form/profesor-form.component')
    },
    {
        path:'formnota',
        loadComponent:() => import('./nota-form/nota-form.component')
    },
    {
        path:'formnota/:id',
        loadComponent:() => import('./nota-form/nota-form.component')
    }
    
];
