import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http'; //for http requests
import { environment } from '../../environments/environment'; //read environmant constant

@Injectable({
  providedIn: 'root'
})
export class IcdService {

  private controllerIcd = 'icd/'

  private apiUrl = environment.apiUrl + this.controllerIcd;

  //private apilogin = 'http://localhost:8080/callcenter2020/api/users/login/';

  constructor(private HttpClient : HttpClient) { }

  //get all
  getAll(){
    return this.HttpClient.get(this.apiUrl).toPromise();
  }

  //search by 'like'
  getSearch(language,inputvalue){
    return this.HttpClient.get(this.apiUrl + "search/" + language,{headers : new HttpHeaders({
      'word': inputvalue      
    })}).toPromise();
  }

  

 

  /*
  login(username, password){
    return this.HttpClient.get(this.apilogin, {headers : new HttpHeaders({
      'username': username,
      'password': password
      
    })}).toPromise();
  }
  */
}
