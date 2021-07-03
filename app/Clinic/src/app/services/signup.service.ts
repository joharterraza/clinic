import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http'; //for http requests
import { environment } from '../../environments/environment'; //read environmant constant

@Injectable({
  providedIn: 'root'
})
export class SignupService {
  private controller = 'usuario/';
  private controllerMedic = 'medico/';
  private apiUrl = environment.apiUrl + this.controller;
  private apiMedic = environment.apiUrl + this.controllerMedic;

  constructor(private HttpClient : HttpClient) {}

  addUser(id, foto, pass, tema, lenguaje, rol, nombre){
    return this.HttpClient.post(this.apiUrl + "add/",null,{headers : new HttpHeaders({
      'id' : id,
      'nombre' : nombre,
      'foto' : foto,
      'contrasena' : pass,
      'tema' : tema,
      'lenguage' : lenguaje,
      'role' : rol
    })}).toPromise();
  }

  addMedicUser(appaterno, apmaterno, nombre, cedula, telcasa, telmovil, teloficina, emailpersonal, emailtrabajo, especialidad, id, foto, pass, tema, lenguaje, rol){
    return this.HttpClient.post(this.apiMedic + "add/",null,{headers : new HttpHeaders({
      'appaterno' : appaterno,
      'apmaterno' : apmaterno,
      'nombre' : nombre,
      'cedula' : cedula,
      'telcasa' : telcasa,
      'telmovil' : telmovil,
      'teloficina' : teloficina,
      'emailpersonal' : emailpersonal,
      'emailtrabajo' : emailtrabajo,
      'especialidad' : especialidad,
      'idUs' : id,
      'foto' : foto,
      'contrasena' : pass,
      'tema' : tema,
      'lenguage' : lenguaje,
      'role' : rol
    })}).toPromise();

  }
}
