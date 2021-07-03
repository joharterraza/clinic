import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http'; //for http requests
import { environment } from '../../environments/environment'; //read environmant constant

@Injectable({
  providedIn: 'root'
})
export class ContemergenciaService {

  private controller = 'contactoemergencia/';
  private apiUrl = environment.apiUrl + this.controller;
  constructor(
    private HttpClient : HttpClient) { }

  getCEPorId(id){
    return this.HttpClient.get(this.apiUrl + id).toPromise();
  } 
  
}
