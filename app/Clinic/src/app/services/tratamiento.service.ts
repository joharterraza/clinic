import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http'; //for http requests
import { environment } from '../../environments/environment'; //read environmant constant

@Injectable({
  providedIn: 'root'
})
export class TratamientoService {

  private controller = 'tratamiento/';
  private apiUrl = environment.apiUrl + this.controller;
  constructor(private HttpClient : HttpClient) { }

  getTratamientoPorEspecialidad(especialidad, palabra){
    return this.HttpClient.get(this.apiUrl + 'especialidad/', {headers : new HttpHeaders({
      'especialidad': especialidad,
      'palabra': palabra     
      
    })}).toPromise();
  }
}
