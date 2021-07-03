import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http'; //for http requests
import { environment } from '../../environments/environment'; //read environmant constant

@Injectable({
  providedIn: 'root'
})
export class EspecialidadService {

  private controller = 'especialidad/';
  private apiUrl = environment.apiUrl + this.controller;
  constructor(
    private HttpClient : HttpClient) { }

  getAll(){
    return this.HttpClient.get(this.apiUrl).toPromise();
  } 
}
