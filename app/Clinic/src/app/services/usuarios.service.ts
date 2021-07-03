import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http'; //for http requests
import { environment } from '../../environments/environment'; //read environmant constant

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  private controller = 'usuario/';
  private apiUrl = environment.apiUrl + this.controller;
  constructor(private HttpClient : HttpClient) { }

  login(username, password){
    return this.HttpClient.get(this.apiUrl + 'login/', {headers : new HttpHeaders({
      'username': username,
      'password': password
      
    })}).toPromise();
  }

  cambioContrasena(idUs, newPassword){
    return this.HttpClient.post(this.apiUrl + "cambiocontrasena/",null, {headers : new HttpHeaders({
      'id': idUs,
      'password': newPassword
    })}).toPromise();
  }

  checarExiste(id){
    return this.HttpClient.get(this.apiUrl + 'exists/'+ id).toPromise();
  }
}
