import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http'; //for http requests
import { environment } from '../../environments/environment'; //read environmant constant

@Injectable({
  providedIn: 'root'
})
export class MedicoService {

  private controller = 'medico/';
  private apiUrl = environment.apiUrl + this.controller;
  constructor(
    private HttpClient : HttpClient) { }

 

  getMedicoPorUsuario(idusuario){
    return this.HttpClient.get(this.apiUrl + 'searchbyuser/', {headers : new HttpHeaders({
      'idusuario' : idusuario,
      
      
    })}).toPromise();
  }

  getEspecialidad(){
    return this.HttpClient.get(this.apiUrl + 'especialidades/').toPromise();
  }

  getMedicosPorEspecialidad(idEspecialidad){
    return this.HttpClient.get(this.apiUrl + 'porespecialidad/' + idEspecialidad).toPromise();
  }

  addEspecialidad(idMedico, especialidad){
    return this.HttpClient.post(this.apiUrl + "addespecialidad/",null, {headers : new HttpHeaders({
      'idMedico': idMedico,
      'especialidad': especialidad
    })}).toPromise();
  }

  getAll(){
    return this.HttpClient.get(this.apiUrl).toPromise();
  }

  getDiasLibres(idMedico){
    return this.HttpClient.get(this.apiUrl + 'diaslibres/' + idMedico).toPromise();
  }

  getFechasDisponiblesDiasLibres(idMedico,fecha){
    return this.HttpClient.get(this.apiUrl + 'checkfechacitas/', {headers : new HttpHeaders({
      'idMedico' : idMedico,
      'fecha' : fecha    
      
    })}).toPromise();
  }

  addDiaLibre(idMedico, fecha){
    return this.HttpClient.post(this.apiUrl + "adddialibre/",null, {headers : new HttpHeaders({
      'idMedico': idMedico,
      'fecha': fecha
    })}).toPromise();
  }

  addHorario(dia, horaInicial, horaFinal){
    return this.HttpClient.post(this.apiUrl + "addhorario/",null, {headers : new HttpHeaders({
      'dia': dia,
      'horainicial': horaInicial,
      'horafinal': horaFinal
    })}).toPromise();
  }


  

}
