import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {HomeComponent} from './home/home.component';
import { LoginComponent } from './login/login.component';
import { AgendaComponent } from './agenda/agenda.component';
import { AdminComponent } from './admin/admin.component';
import { EnfermeriaComponent } from './enfermeria/enfermeria.component';
import { ExploracionComponent } from './exploracion/exploracion.component';
import { ExpedienteComponent } from './expediente/expediente.component';


const routes: Routes = [
  /*
  { path: '', component: LoginComponent},
  
  */

 { path: '', component: LoginComponent},
 { path: 'agenda', component: AgendaComponent},
 { path: 'admin', component: AdminComponent},
 { path: 'icd', component: HomeComponent},
 {path: 'enfermeria', component: EnfermeriaComponent},
 {path: 'exploracion/paciente/:id', component: ExploracionComponent},
 {path: 'expediente/paciente/:id', component: ExpedienteComponent},
 { path:'list', component: HomeComponent}
 

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
