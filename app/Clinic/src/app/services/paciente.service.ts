import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http'; //for http requests
import { environment } from '../../environments/environment'; //read environmant constant

@Injectable({
  providedIn: 'root'
})
export class PacienteService {

  private controller = 'paciente/';
  private apiUrl = environment.apiUrl + this.controller;
  constructor(private HttpClient : HttpClient) { }

  getPacientesPorNombre(palabra){
    return this.HttpClient.get(this.apiUrl + 'byname/', {headers : new HttpHeaders({
      
      'palabra': palabra     
      
    })}).toPromise();
  }

  getPacientesPorId(id){
    return this.HttpClient.get(this.apiUrl + id).toPromise();
  }
}
