import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UsuariosService } from '../services/usuarios.service';
import {SignupService} from '../services/signup.service';
import {MedicoService} from '../services/medico.service';
import {EspecialidadService} from '../services/especialidad.service';

declare var $:any;
@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  private errorsHorario;
  private messageDiasLibresCheck;
  public user;
  private medic = true;
  private asist = false;
  private message;
  private especialidades;
  private medics;
  private messageC;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private usuarioService : UsuariosService,
    private signupService : SignupService,
    private medicoService : MedicoService,
    private especialidadService : EspecialidadService
  ) { }

  ngOnInit(){

    this.getMedicEsp();
    this.getEspecialidades();
    this.checkFreeDay();
    

    $("#btnOkSpec").click(() => {
     
      if($("#especialidadEsp").val()!= null && $("#medicEsp")!=null){
        this.saveSpec();
      }
      else{
        this.showModal('Error','Informacion incompleta');
      }
     
    })

    $("#btnOkFree").click(()=>{
      var idmedico = $("#medicFree").val();
      var fecha = $("#freeday").val();
      this.addFreeDay(idmedico,fecha);
    })

    document.getElementById('cancelUser').onclick = () =>{
      this.clearVal();
    }

    document.getElementById('cancelPass').onclick = () =>{
      this.clearUsPass();
    }
    
    this.defaultOk();
    if(sessionStorage.loggedIn == 'true'){
      this.user = JSON.parse(sessionStorage.userInfo); //pass the response to a variable
      console.log(this.user);
      $("#usernameL").html(this.user.nombre);
      $("#userrole").html(this.user.roles[0].nombre);
      $("#exiticon").attr("class","fas fa-sign-out-alt");
      document.getElementById('btnOkPass').onclick = () =>{
        this.cambiarContrasena();
      }
    }else{
      window.location.href = '';
    }
    
    $("#exit").click(()=>{
      this.logout();
    })   
  }

   //logout
   logout() {
    sessionStorage.loggedIn = false;
    sessionStorage.removeItem(sessionStorage.userInfo);
    sessionStorage.removeItem(sessionStorage.previousPage);
    $(".nav-item nav-link").remove();
    window.location.href = '';

  }

  showMedic(){
    if(this.medic == false){
      console.log('MEDICO');
      document.getElementById("formMedico").style.display='block';
      var rol = 'MED';
      this.validateAddHorarioChecks();
      $("#btnOkUser").off('click');
      $("#btnOkUser").click(() =>{
        var username = $("#usersignup").val();
        var pass = $("#contrasena").val();

        //starts upload img code

        var input = $("#foto");
        var file = input.prop('files')[0];
        if(file != undefined){
          var formData= new FormData();
          if(!!file.type.match(/image.*/)){
            formData.append("image", file);
            console.log(formData);
            $.ajax({
              url: "http://localhost:8080/clinicamedica/api/upload.php",
              type: "POST",
              data: formData,
              processData: false,
              contentType: false,
              success: () =>{
                  var firstfoto = $("#foto").val();
                  var array = firstfoto.split("\\");
                  var foto = array[2];
                  var tema = $("#tema").val();
                  var lang = $("#lenguaje").val();
                  var name = $("#nombre").val();
                  var appat =$("#apellidoP").val();
                  var apmat = $("#apellidoM").val();
                  var cedula = $("#cedula").val();
                  var especialidad = $("#especialidad").val();
                  var telcasa = $("#telcasa").val();
                  var telmovil = $("#telmovil").val();
                  var teloficina = $("#telofice").val();
                  var emailpersonal = $("#emailper").val();
                  var emailtrabajo = $("#emailtrab").val();

                  if( name != null && appat != null && apmat != null && username != null && pass != null && foto != null && tema != null && lang != null && rol != null
                    && cedula != null && especialidad != null && telcasa != null && telmovil != null && emailpersonal != null
                    && name != '' && appat != '' && apmat != '' && username != '' && pass != '' && foto != '' && tema != 0 && lang != 0 && rol != ''
                    && cedula != '' && especialidad != 0 && telcasa != '' && telmovil != '' && emailpersonal != ''){
                    
                      if(emailtrabajo == null){
                        emailtrabajo = '';
                      }
                      if(teloficina == null || teloficina == ''){
                        teloficina = '';
                      }
                     
                     
                      if(this.validateEmail(emailpersonal)){
                        console.log( username+" "+pass+" "+foto+" "+ tema+" "+ lang+" "+ rol+" "+cedula+" "+especialidad+" "+telcasa+" "+telmovil+" "+teloficina+" "+emailpersonal+" "+emailtrabajo);
                        this.checkErrorsHorario();
                        console.log(this.errorsHorario);
                        var lunes = $("#checkLunes").is(":checked");
                        var martes = $("#checkMartes").is(":checked");
                        var miercoles = $("#checkMiercoles").is(":checked");
                        var jueves = $("#checkJueves").is(":checked");
                        var viernes = $("#checkViernes").is(":checked");
                        if(lunes == false && martes == false && miercoles == false && jueves == false && viernes == false){
                          this.showModal('Error','Falta asignar horario');
                        }
                        else{
                          if(this.errorsHorario > 0 ){
                            this.showModal('Error','Horario erroneo, revise las asignaciones de horas');
                          }
                          else{
                            this.addMedic(username, pass, foto, tema, lang, rol, name, appat, apmat, cedula, telcasa.toString(), telmovil.toString(), teloficina.toString(), emailpersonal, emailtrabajo, especialidad);
                            
                            
                           
                          }
                         
                        }
                       
                        
                        
                      }
                      else{
                        this.showModal('Error','Agregar email valido');
                      }
                    
                  }else{
                    this.showModal('Error','Informacion incompleta');
                  }
              }
            });
          }else{
            this.showModal('Error','Formato de imagen invalido');
          }
        }else{
          this.showModal('Error','Adjunta una foto');
        }

        //ends img code
      })
      this.medic=true;
      this.asist=false;
    }
    
   }
  showAsist(){
    if(this.asist == false){
      console.log('ASIST');
      document.getElementById("formMedico").style.display='none';
      var rol = 'ASIST';
      $("#btnOkUser").off('click');
      $("#btnOkUser").click(() =>{
        var username = $("#usersignup").val();
        var pass = $("#contrasena").val();

        //starts upload img code

        var input = $("#foto");
        var file = input.prop('files')[0];
        if(file != undefined){
          var formData= new FormData();
          if(!!file.type.match(/image.*/)){
            formData.append("image", file);
            console.log(formData);
            $.ajax({
              url: "http://localhost:8080/clinicamedica/api/upload.php",
              type: "POST",
              data: formData,
              processData: false,
              contentType: false,
              success: () =>{
                  var firstfoto = $("#foto").val();
                  var array = firstfoto.split("\\");
                  var foto = array[2];
                  var tema = $("#tema").val();
                  var lang = $("#lenguaje").val();
                  var name = $("#nombre").val();
                  var appat =$("#apellidoP").val();
                  var apmat = $("#apellidoM").val();
                  var nombre =  name+ " "+appat+" "+apmat;
                  console.log( username+" "+pass+" "+foto+" "+ tema+" "+ lang+" "+ rol);
                  if( name != null && appat != null && apmat != null && username != null && pass != null && foto != null && tema != null && lang != null && rol != null
                    && name != '' && appat != '' && apmat != '' && username != '' && pass != '' && foto != '' && tema != '' && lang != '' && rol != ''){
                    this.addUser(username, pass,foto, tema, lang, rol, nombre);
                  }else{
                    this.showModal('Error','Informacion incompleta');
                  }
              }
            });
          }else{
            this.showModal('Error','Formato de imagen invalido');
          }
        }else{
          this.showModal('Error','Adjunta una foto');
        }

        //ends img code

       
      })
      this.asist=true;
      this.medic=false;
    }
  }
  

  addMedic(username, pass, foto, tema, lang, rol, nombre, appat, apmat, cedula, telcasa, telmovil, teloficina, emailpersonal, emailtrabajo, especialidad){
    this.signupService.addMedicUser(appat, apmat, nombre, cedula, telcasa, telmovil, teloficina, emailpersonal, emailtrabajo, especialidad, username, foto, pass, tema, lang,rol)
    .then((response) =>{
      console.log(response);
      this.message = response
      if(this.message.status == 0){
        this.showModal('Exito','Medico agregado correctamente');
        var lunes = $("#checkLunes").is(":checked");
        var martes = $("#checkMartes").is(":checked");
        var miercoles = $("#checkMiercoles").is(":checked");
        var jueves = $("#checkJueves").is(":checked");
        var viernes = $("#checkViernes").is(":checked");
        if(lunes == true){
          this.addHorario('1',$("#inicioLunes").val().toString(),$("#finalLunes").val().toString())
        }
        if(martes == true){
          this.addHorario('2',$("#inicioMartes").val().toString(),$("#finalMartes").val().toString())
        }
        if(miercoles == true){
          this.addHorario('3',$("#inicioMiercoles").val().toString(),$("#finalMiercoles").val().toString())
        }
        if(jueves == true){
          this.addHorario('4',$("#inicioJueves").val().toString(),$("#finalJueves").val().toString())
        }
        if(viernes == true){
          this.addHorario('5',$("#inicioViernes").val().toString(),$("#finalViernes").val().toString())
        }
        this.clearVal();
      }
      else
      this.showModal('Error','Error al registrar medico');
    })
    .catch((error) =>{
      console.log(error);

    })
  }

  addUser(username, pass, foto, tema, lang, rol, nombre){
    this.signupService.addUser(username, foto, pass, tema, lang, rol, nombre)
    .then((response) =>{
      console.log(response);
      this.message = response
      if(this.message.status == 0){
        this.showModal('Exito','Asistente agregado correctamente');
       
        this.clearVal();
      }
      else
      this.showModal('Error','Error al registrar asistente');
    })
    .catch((error) => {
      console.log(error);
    })
  }

  checkFreeDay(){
    $("#btnOkFree").prop('disabled','disabled');
    var inputdate = $("#freeday");
    var selectmedico = $("#medicFree");
    selectmedico.change(()=>{
      inputdate.val('');
      $("#resultcheck").empty();
      $("#btnOkFree").prop('disabled','disabled');
    })
    inputdate.change(()=>{
      if(selectmedico.val()!= '0'){
        this.checkFechasDisponibles(selectmedico.val().toString(),inputdate.val())
      }
    })
  }

  clearVal(){
    $("#tema").val('0');
    $("#lenguaje").val('0');
    $("#nombre").val('');
    $("#apellidoP").val('');
    $("#apellidoM").val('');
    $("#cedula").val('');
    $("#especialidad").val('0');
    $("#telcasa").val('');
    $("#telmovil").val('');
    $("#telofice").val('');
    $("#emailper").val('');
    $("#emailtrab").val('');
    $("#usersignup").val('');
    $("#contrasena").val('');
    $("#foto").val('');
    $('#checkLunes').prop('checked', false); // Unchecks it
    $('#checkMartes').prop('checked', false); // Unchecks it
    $('#checkMiercoles').prop('checked', false); // Unchecks it
    $('#checkJueves').prop('checked', false); // Unchecks it
    $('#checkViernes').prop('checked', false); // Unchecks it
    $("#inicioLunes").val('0');      
    $("#inicioLunes").prop('disabled','disabled');
    $("#finalLunes").val('0');      
    $("#finalLunes").prop('disabled','disabled');
    $("#inicioMartes").val('0');      
    $("#inicioMartes").prop('disabled','disabled');
    $("#finalMartes").val('0');      
    $("#finalMartes").prop('disabled','disabled');
    $("#inicioMiercoles").val('0');      
    $("#inicioMiercoles").prop('disabled','disabled');
    $("#finalMiercoles").val('0');      
    $("#finalMiercoles").prop('disabled','disabled');
    $("#inicioJueves").val('0');      
    $("#inicioJueves").prop('disabled','disabled');
    $("#finalJueves").val('0');      
    $("#finalJueves").prop('disabled','disabled');
    $("#inicioViernes").val('0');      
    $("#inicioViernes").prop('disabled','disabled');
    $("#finalViernes").val('0');      
    $("#finalViernes").prop('disabled','disabled');
    this.medic = false;
    this.asist = true;
    $("#addCitaModal").modal('hide');  

  }


  checkFechasDisponibles(idMedico,fecha){
    this.medicoService.getFechasDisponiblesDiasLibres(idMedico,fecha)
    .then((response)=>{
      this.messageDiasLibresCheck = response
      if(this.messageDiasLibresCheck.status == 1){
        $("#resultcheck").html(this.messageDiasLibresCheck.resultado);
        $("#btnOkFree").prop('disabled','disabled');
      }
      else if(this.messageDiasLibresCheck.status == 0){
        $("#resultcheck").html(this.messageDiasLibresCheck.resultado);
        $("#btnOkFree").prop('disabled',false);
      }
    })
    .catch((error) => { console.log(error); })
  }

  validateEmail(email){
    var re = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
    return re.test(email)
  }

  getEspecialidades(){
    this.medicoService.getEspecialidad()
    .then((response) =>{
      this.especialidades = response;
      console.log("especialidades: ")
      console.log(this.especialidades);
      this.especialidades.especialidades.forEach(especialidad => {
        var opt = document.createElement('option');
        opt.value = especialidad.id;
        opt.innerHTML = especialidad.descripcion;
        var opt2 = document.createElement('option');
        opt2.value = especialidad.id;
        opt2.innerHTML = especialidad.descripcion;
        document.getElementById("especialidad").appendChild(opt);
        document.getElementById("especialidadEsp").appendChild(opt2);
      });
    })
    .catch((error) =>{
      console.log(error);
    })
  }

  
  defaultOk(){
    console.log("Default Okay Executed");
    if(this.asist == false){
      console.log('ASIST');
      document.getElementById("formMedico").style.display='none';
      var rol = 'ASIST';
      //$("#btnOkUser").off('click');
      $("#btnOkUser").click(() =>{
        var username = $("#usersignup").val();
        var pass = $("#contrasena").val();

        //starts upload img code

        var input = $("#foto");
        var file = input.prop('files')[0];
        if(file != undefined){
          var formData= new FormData();
          if(!!file.type.match(/image.*/)){
            formData.append("image", file);
            console.log(formData);
            $.ajax({
              url: "http://localhost:8080/clinicamedica/api/upload.php",
              type: "POST",
              data: formData,
              processData: false,
              contentType: false,
              success: () =>{
                  var firstfoto = $("#foto").val();
                  var array = firstfoto.split("\\");
                  var foto = array[2];
                  var tema = $("#tema").val();
                  var lang = $("#lenguaje").val();
                  var name = $("#nombre").val();
                  var appat =$("#apellidoP").val();
                  var apmat = $("#apellidoM").val();
                  var nombre =  name+ " "+appat+" "+apmat;
                  console.log( username+" "+pass+" "+foto+" "+ tema+" "+ lang+" "+ rol);
                  if( name != null && appat != null && apmat != null && username != null && pass != null && foto != null && tema != null && lang != null && rol != null
                    && name != '' && appat != '' && apmat != '' && username != '' && pass != '' && foto != '' && tema != '' && lang != '' && rol != ''){
                    this.addUser(username, pass,foto, tema, lang, rol, nombre);
                  }else{
                    this.showModal('Error','Informacion incompleta');
                    console.log("informacion incompleta");
                  }
              }
            });
          }else{
            this.showModal('Error','Formato de imagen invalido');
          }
        }else{
          this.showModal('Error','Adjunta una foto');
        }

        //ends img code

       
      })
      this.asist=true;
      this.medic=false;
    }
  }



  getMedicEsp(){
    this.medicoService.getAll()
    .then((response) =>{
      this.medics = response;
      var medic;
      var select = document.getElementById('medicEsp');
      var select2 = document.getElementById('medicFree');
      this.medics.medicos.forEach(medico => {
        var medop = document.createElement('option');
        medop.innerHTML = medico.nombre[0].nombrecompleto;
        medop.value = medico.id;
        var medop2 = document.createElement('option');
        medop2.innerHTML = medico.nombre[0].nombrecompleto;
        medop2.value = medico.id;
        select.append(medop);
        select2.append(medop2);
      });
    })
  }

  saveSpec(){
    var newSpec = $("#especialidadEsp").val();
    var medicId = $("#medicEsp").val();
    var contador = 0;
    this.medics.medicos.forEach(medico => {
      if(medico.id == medicId){
          medico.especialidad.forEach(espec => {
            if(espec.id == newSpec){
              contador ++;
            }       
          });
      }
    });
    if(contador > 0){
      this.showModal('Error','Este medico ya tiene esta especialidad asignada');
    }

    else{
      this.medicoService.addEspecialidad(medicId, newSpec)
      .then((response) => {
        this.showModal('Exito','Especialidad asignada correctamente');
        $("#especialidadEsp").val('0')
        $("#medicEsp").val('0')
      })
      .catch((error) => { console.log(error); }
      )
      
    }
      
      
  }

  cambiarContrasena(){
    var idU = $("#userPass").val();
    var pass = $("#contrasenaPass").val();
    var passC = $("#contrasenaPassC").val();
    if(idU != '' && pass != '' && passC != ''){
      this.usuarioService.checarExiste(idU)
      .then((response)=>{
        this.messageC = response;
        if(this.messageC.status == 0){
          if(pass == passC){
            this.usuarioService.cambioContrasena(idU,passC)
            .then((response)=>{
              this.showModal('Exito','Contraseña actualizada correctamente');
              this.clearUsPass();
            })
            .catch((error) => { console.log(error); }
            )
            
          }
          else{
            this.showModal('Error','Las contraseñas no coinciden');
          }
        }
        else{
          this.showModal('Error','El usuario no existe');
        }
      })
      .catch((error) => { console.log(error); }
      )
    }
    else{
      this.showModal('Error', 'Informacion incompleta');
    }
    
   
  }

  addFreeDay(idMedico,fecha){
    this.medicoService.addDiaLibre(idMedico,fecha)
    .then((response)=>{
      this.showModal('Exito','Dia libre agregado exitosamente');
      $("#medicFree").val('0');
      $("#freeday").val('');
      $("#resultcheck").html('');
    })
    .catch((error) => { console.log(error); })

  }



  clearUsPass(){
    $("#userPass").val('');
    $("#contrasenaPass").val('');
    $("#contrasenaPassC").val('');
  }

  showModal(titulo,mensaje){
    $("#titlemodalalert").html(titulo);
    $("#mensaje").html(mensaje)
    $("#alertModal").modal();
  }

  validateAddHorarioChecks(){
    //lunes
    $("#checkLunes").click(() =>{     
      if ($("#checkLunes").is(":checked")) {          
        $("#inicioLunes").prop('disabled',false);  
        $("#finalLunes").prop('disabled',false);          
      } else {    
        $("#inicioLunes").val('0');      
        $("#inicioLunes").prop('disabled','disabled');
        $("#finalLunes").val('0');      
        $("#finalLunes").prop('disabled','disabled');
      }
    });
    //martes
    $("#checkMartes").click(() =>{     
      if ($("#checkMartes").is(":checked")) {          
        $("#inicioMartes").prop('disabled',false);  
        $("#finalMartes").prop('disabled',false);          
      } else {    
        $("#inicioMartes").val('0');      
        $("#inicioMartes").prop('disabled','disabled');
        $("#finalMartes").val('0');      
        $("#finalMartes").prop('disabled','disabled');
      }
    });
    //miercoles    
    $("#checkMiercoles").click(() =>{     
      if ($("#checkMiercoles").is(":checked")) {          
        $("#inicioMiercoles").prop('disabled',false);  
        $("#finalMiercoles").prop('disabled',false);          
      } else {    
        $("#inicioMiercoles").val('0');      
        $("#inicioMiercoles").prop('disabled','disabled');
        $("#finalMiercoles").val('0');      
        $("#finalMiercoles").prop('disabled','disabled');
      }
    });
    //jueves
    $("#checkJueves").click(() =>{     
      if ($("#checkJueves").is(":checked")) {          
        $("#inicioJueves").prop('disabled',false);  
        $("#finalJueves").prop('disabled',false);          
      } else {    
        $("#inicioJueves").val('0');      
        $("#inicioJueves").prop('disabled','disabled');
        $("#finalJueves").val('0');      
        $("#finalJueves").prop('disabled','disabled');
      }
    });
    //Viernes
    $("#checkViernes").click(() =>{     
      if ($("#checkViernes").is(":checked")) {          
        $("#inicioViernes").prop('disabled',false);  
        $("#finalViernes").prop('disabled',false);          
      } else {    
        $("#inicioViernes").val('0');      
        $("#inicioViernes").prop('disabled','disabled');
        $("#finalViernes").val('0');      
        $("#finalViernes").prop('disabled','disabled');
      }
    });
  }

  checkErrorsHorario(){
    this.errorsHorario = 0;
    var iniLunes = parseInt($("#inicioLunes").val(),10);   
    var finLunes = parseInt($("#finalLunes").val(),10);
    var iniMartes = parseInt($("#inicioMartes").val(),10);
    var finMartes = parseInt($("#finalMartes").val(),10)
    var iniMiercoles = parseInt($("#inicioMiercoles").val(),10);
    var finMiercoles = parseInt($("#finalMiercoles").val(),10)
    var iniJueves = parseInt($("#inicioJueves").val(),10);
    var finJueves = parseInt($("#finalJueves").val(),10)
    var iniViernes = parseInt($("#inicioViernes").val(),10);
    var finViernes = parseInt($("#finalViernes").val(),10);

    if ($("#checkLunes").is(":checked")) {          
      if($("#inicioLunes").val() != null || $("#finalLunes").val() != null){
        if(iniLunes > finLunes || iniLunes == finLunes){
          this.errorsHorario++;
        }        
      }
      else{
        this.errorsHorario++;
      }      
    }

    if ($("#checkMartes").is(":checked")) {          
      if($("#inicioMartes").val() != null || $("#finalMartes").val() != null){
        if(iniMartes > finMartes || iniMartes == finMartes){
          this.errorsHorario++;
        }        
      }
      else{
        this.errorsHorario++;
      }     
    } 

    if ($("#checkMiercoles").is(":checked")) {          
      if($("#inicioMiercoles").val() != null || $("#finalMiercoles").val() != null){
        if(iniMiercoles > finMiercoles || iniMiercoles == finMiercoles){
          this.errorsHorario++;
        }        
      } 
      else{
        this.errorsHorario++;
      }       
    }
    
    if ($("#checkJueves").is(":checked")) {          
      if($("#inicioJueves").val() != null || $("#finalJueves").val() != null){
        if(iniJueves > finJueves || iniJueves == finJueves){
          this.errorsHorario++;
        }        
      } 
      else{
        this.errorsHorario++;
      }    
    }

    if ($("#checkViernes").is(":checked")) {          
      if($("#inicioViernes").val() != null || $("#finalViernes").val() != null){
        if(iniViernes > finViernes || iniViernes == finViernes){
          this.errorsHorario++;
        }        
      } 
      else{
        this.errorsHorario++;
      }
    }
  }

  addHorario(dia,horaIni,horaFin){
    this.medicoService.addHorario(dia,horaIni,horaFin)
    .then((response)=>{
     
      console.log(response);
    })
    .catch((error)=>{console.log(error)})
  }

  

  
}
