import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http'; //for http requests
import { environment } from '../../environments/environment'; //read environmant constant

@Injectable({
  providedIn: 'root'
})
export class CitaService {

  private controller = 'cita/';
  private apiUrl = environment.apiUrl + this.controller;
  constructor(
    private HttpClient : HttpClient) { }
  

  getConsultoriosDisponibles(especialidad, dia,hora,fecha){
    return this.HttpClient.get(this.apiUrl + 'consultoriosdisponibles/', {headers : new HttpHeaders({
      'especialidad' : especialidad,
      'dia': dia,
      'hora': hora,
      'fecha': fecha
      
    })}).toPromise();
  }

  getConsultoriosDisponiblesHabilitados(especialidad){
    return this.HttpClient.get(this.apiUrl + 'consultoriosdisponibleshabilitados/', {headers : new HttpHeaders({
      'especialidad' : especialidad,
      
      
    })}).toPromise();
  }

  getCitasCanceladas(idPaciente){
    return this.HttpClient.get(this.apiUrl + 'citascanceladas/', {headers : new HttpHeaders({
      'idpaciente' : idPaciente,
      
      
    })}).toPromise();
  }

  addCita(fecha,paciente,medico,especialidad, tratamiento, consultorio,hora,dia,usuario){
    return this.HttpClient.post(this.apiUrl + "add/",null, {headers : new HttpHeaders({
      'fecha': fecha,
      'paciente': paciente,
      'medico': medico,
      'especialidad': especialidad,
      'tratamiento': tratamiento,
      'consultorio': consultorio,
      'hora': hora,
      'dia': dia,
      'usuario': usuario
      
    })}).toPromise();
  }

  getCitas(idmedico){
    return this.HttpClient.get(this.apiUrl + 'medico/' + idmedico).toPromise();
  }

  

  citasPorFechaEsp(fecha,esp){
    return this.HttpClient.get(this.apiUrl + 'fechaesp/', {headers : new HttpHeaders({
      'fecha' : fecha,
      'esp' : esp
      
      
    })}).toPromise();
  }

  getCitasPorId(id){
    return this.HttpClient.get(this.apiUrl + id).toPromise();
  }

  addNewCita(fecha,medico,consultorio,dia,hora,usuario,appaterno,apmaterno,direccion,genero,fechanac,nombre,
    telcasap, telmovilp,teloficinap,emailpersonalp,emailtrabajop,nombrece,telcasae,telmovile,
    teloficinae,emailpersonale,emailtrabajoe,especialidad,tratamiento){
    return this.HttpClient.post(this.apiUrl + "addnew/",null, {headers : new HttpHeaders({
      'fecha': fecha,
      'medico': medico,
      'consultorio': consultorio,
      'dia': dia,
      'hora': hora,
      'usuario': usuario,
      'appaterno': appaterno,
      'apmaterno': apmaterno,
      'direccion': direccion,
      'fechanac': fechanac,
      'genero': genero,
      'nombre': nombre,
      'telcasaP': telcasap,
      'telmovilP': telmovilp,
      'teloficinaP': teloficinap,
      'emailpersonalP': emailpersonalp,
      'emailtrabajoP': emailtrabajop,
      'nombreCE': nombrece,
      'telcasaE': telcasae,
      'telmovilE': telmovile,
      'teloficinaE': teloficinae,
      'emailpersonalE': emailpersonale,
      'emailtrabajoE': emailtrabajoe,
      'especialidad':especialidad,
      'tratamiento':tratamiento
      
    })}).toPromise();
  }

  updateStatus(status,id){
    return this.HttpClient.post(this.apiUrl + "updatestatus/",null, {headers : new HttpHeaders({
      'status': status,
      'id': id         
    })}).toPromise();
  }

  citasPorFechaHora(fecha,pac){
    return this.HttpClient.get(this.apiUrl + 'fechahora/', {headers : new HttpHeaders({
      'fecha' : fecha,      
      'pac' : pac    
      
    })}).toPromise();
  }


  

 

  


 
  
}
