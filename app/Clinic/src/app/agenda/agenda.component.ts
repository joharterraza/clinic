import { Component, OnInit } from '@angular/core';
import { Calendar, compareByFieldSpec, render } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin
import timeGridPlugin from '@fullcalendar/timegrid'; // a plugin
import interactionPlugin from '@fullcalendar/interaction'; // a plugin
import { CalendarOptions } from '@fullcalendar/angular'; // useful for typechecking
import { CitaService } from '../services/cita.service';
import { TratamientoService } from '../services/tratamiento.service';
import { PacienteService } from '../services/paciente.service';
import { MedicoService } from '../services/medico.service';
import { ContemergenciaService } from '../services/contemergencia.service';
import { EspecialidadService } from '../services/especialidad.service';






declare var $:any;

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.css']
})
export class AgendaComponent implements OnInit {

  //variables
  private generoañadir;
  private jsonCitasFechaHora;
  private medicoEnSesion;
  private businHours = [];
  private arrayHiddenDays = [];
  private jsonCheckPacienteDisp;
  private jsonDiasLibres;
  private dateStart;
  private medicoSeleccionado;
  public user;
  private medicoSelection;
  private jsonMedicosPorEspecialidad;
  private JsonAllEspecialidades;
  private especialidadValue;
  private messagefinal;
  private consultorioañadir = null;
  private pacienteañadir = null;
  private tratamientoañadir;
  private jsonConsultoriosDis;
  private jsonConsultoriosHab;
  public mediconombre;
  public eventsArray = [];
  private jsonSearch;
  private jsonSearchPacientes;
  private jsonc;
  private jsonCitas;
  private jsonMedico;
  private jsonCitasFechaEsp;
  private jsonCitasId;
  private jsonPaciente;
  private jsonCE;
  private jsonColoresStatus = [];
  //fin variables

  //calendar options object
  private optionsObject = {
    initialView : 'timeGridWeek', //grid
    slotLabelFormat: [
      {
        hour: '2-digit',
        minute: '2-digit',
        hour12:false
      }
    ],
    allDaySlot : false, //space for all day
    selectable : false, //selectable or not
    
    unselectAuto: true,
    validRange : { //from where the calendar is allowed to be selectable
      start: null,
      end:null
    },
    slotDuration : "01:00:00", //spacesof
    events : null, //citas
    slotMinTime : '08:00:00', //beginning of the day 
    slotMaxTime : '20:00:00',  //end of the day
    hiddenDays: null, 
    selectConstraint: "businessHours",
    businessHours : null,
    eventClick: null,
    select : null, //when select a slot to something
    contentHeight: 700,
    expandRows: true,
    locale: 'es',
    
   

  };


  constructor(
    private citasService : CitaService,
    private tratamietoService : TratamientoService,
    private pacienteService : PacienteService,
    private medicoService : MedicoService,
    private ceService: ContemergenciaService,
    private especialidadService: EspecialidadService
  ) { }

  
  ngOnInit(){
    //if is already logged in
    
    if(sessionStorage.loggedIn == 'true'){
      
      $("#addCitaModal").after($("#alertModal"));
      //function to fit alert modal
      $(document).on('show.bs.modal', '.modal', function (event) {
        var zIndex = 1040 + (10 * $('.modal:visible').length);
        $(this).css('z-index', zIndex);
        setTimeout(function() {
          $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
        }, 0);
      });
      this.user = JSON.parse(sessionStorage.userInfo); //pass the response to a variable
      console.log(this.user);
      this.menu(this.user.menu);
      //check if is medic or asist
      if(this.user.roles[0].id == 'MED'){
        
        this.medicoSchedule(this.user);
      }
      else if(this.user.roles[0].id == 'ASIST'){
        
        this.asistenteSchedule(this.user);
      } 
      
      
      
      
    }else{
      window.location.href = '';
    }
    //logout
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

  //call calendar 
  calendarOptions: CalendarOptions = this.optionsObject;

  //asistente
  asistenteSchedule(array){
    
    this.displayClock();//reloj
    this.optionsObject.validRange.start = new Date();  //selectable desde hoy
    $("#usernameL").html(array.nombre);
    $("#userrole").html(array.roles[0].nombre);
    $("#exiticon").attr("class","fas fa-sign-out-alt");
    $("#selectesp").show();
    $("#selectmedico").show();
    $("#selectmedico").prop('disabled','disabled');
    //traer las especialidades
    this.getAllEspecialidades();
    $("#selectesp").on('change',()=>{ //cuando cambias la especialidad llenar el medico select
      this.businHours = [];
      $("#selectmedico").empty();
      $("#selectmedico").prop('disabled',false);
      this.eventsArray = [];          
      this.optionsObject.events = this.eventsArray;
      this.especialidadValue = $("#selectesp").val();
      this.medicoService.getMedicosPorEspecialidad(this.especialidadValue) //medico por especialidad
      .then((response) => {
        console.log(response);  
        this.jsonMedicosPorEspecialidad = response;
        this.selectMed(this.jsonMedicosPorEspecialidad.medicos); //ñenar ,edocp select
      })
      .catch((error) => {
        console.error(error);
      })      
    })
    $("#selectmedico").on('change',()=>{ //cuando cambia el medico
      this.eventsArray = [];          
      this.optionsObject.events = this.eventsArray; 
      this.medicoSelection = $("#selectmedico").val();
      this.jsonMedicosPorEspecialidad.medicos.forEach(med => {
        if(med.id == this.medicoSelection){
          
          this.medicoEnSesion = med;
          this.medicoSeleccionado = med;
          this.getCitasPorMedico(med);    //traer citas de ese medico
          this.businessHours(med)
          setTimeout(()=>{
            this.automaticStatusChange();
          },2000)
          setInterval(()=>{
            console.log(this.medicoEnSesion);
            var today = new Date();  
            var found = false;
            if(today.getDate() < 10 ){
              if((today.getMonth()+1) <10){
                var fecha = today.getFullYear() + "-0" + (today.getMonth() + 1) + "-0" + today.getDate();
              }
              else{
                var fecha = today.getFullYear() + "-" + (today.getMonth() + 1) + "-0" + today.getDate();
              }
             
            } 
            else{
              if((today.getMonth()+1) <10){
                var fecha = today.getFullYear() + "-0" + (today.getMonth() + 1) + "-" + today.getDate();
              }
              else{
                var fecha = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
              }
            }       
            this.jsonCitas.citaspormedico.forEach(cita => {
             
              if(cita.horario.hora <= today.getHours() && cita.fecha == fecha  && cita.status.id == 0){
                this.updateStatus('3',cita.id.toString(),this.medicoEnSesion)  
              }
              else if(cita.fecha == fecha && (cita.status.id == 3 || cita.status.id == 0)){
                if(cita.tratamiento != null){
                  console.log("tratamiento")              
                  var total = (cita.horario.hora + cita.tratamiento.duracion)
                  if(today.getHours() >= total){
                    this.updateStatus('2',cita.id.toString(),this.medicoEnSesion)
                  }
                }
                else{
                  if((today.getHours()-1) >= cita.horario.hora){
                    this.updateStatus('2',cita.id.toString(),this.medicoEnSesion)
                  }
                }
              }
            });     
            
          },1000*60)
          //click en los eventos
          this.optionsObject.eventClick = (info)=>{
            $("#cancelarstatus").off('click');
            $("#verinformacion").off('click');
            if(info.event.id == 0){
              this.showModal('Alerta','Tiene cita a esta hora');
            }else if(info.event.backgroundColor == '#B4C6E7' || info.event.backgroundColor == '#C6EFCE'){
                $("#cancelarstatus").prop('disabled', true);
                $("#verinformacion").click(()=>{
                
                  this.getCitasClickEvento(info.event.id);//funcion para ver la info del evento                
                  $("#appatP").hide();       
                  $("#apmatP").hide();        
                  $("#nombreP").hide();
                  $("#nomc").show();
                  $("#addCitaModal").modal(); //show a form 
                })
               
                $("#preguntaStatus").modal();
            }
            else if(info.event.id == 'a'){
              this.showModal('Alerta','Es dia libre');
            }else if(info.event.id == 'c'){
              $("addCitaModal").modal();
            }
            else{
              $("#preguntaStatus").modal();
              $("#cancelarstatus").prop('disabled', false);
              $("#cancelarstatus").click(()=>{
                console.log(info.event.id);
                this.updateStatus('1',info.event.id,med); // cancelar
              })

              $("#verinformacion").click(()=>{
                
                this.getCitasClickEvento(info.event.id);//funcion para ver la info del evento                
                $("#appatP").hide();       
                $("#apmatP").hide();        
                $("#nombreP").hide();
                $("#nomc").show();
                $("#addCitaModal").modal(); //show a form 
              })
             
                  
              
            }
          }           
        }
      });
          
      
    })

    this.optionsObject.select = (info) =>{  //cuando seleccionas una fecha   
     

      var date = new Date();
      date = info.start; 
      var currentDate  = new Date();
      var currentFecha = new Date(currentDate.getFullYear()+'/'+(currentDate.getMonth()+1)+'/'+currentDate.getDate());
      var startFecha = new Date(date.getFullYear()+'/'+(date.getMonth()+1)+'/'+date.getDate());
      console.log(currentFecha.toString());
      if(currentFecha.toString() === startFecha.toString() &&  currentDate.getHours()>= date.getHours()){
        this.showModal("Error","Imposible agendar citas en el pasado!");
      }
      else{
        $("#pacienteRegular").off('click');
        $("#pacienteNuevo").off('click');
        $("#preguntaPacienteModal").modal(); //pregunta si es paciente nuevo o regular
        $("#pacienteRegular").click(()=>{ //paciente regular
        
          console.log("paciente registrado");
          this.clear(); //clear
          $("#lblbuscarp").show();
          $("#titlemodal").html('Añadir cita');
          $("#add").off('click');
          $("#consultorio").off('change');
          
        
          this.createAddModalElements(); //create elements
          // just full name
          $("#appatP").hide();       
          $("#apmatP").hide();        
          $("#nombreP").hide();
          $("#nomc").show();
          $("#edad").show();
          $("#edadinput").show();
        
        
        
        
          
          $("#addCitaModal").modal(); //show a form to add cita
          $("#medico").val("Dr. "+this.medicoSeleccionado.nombre[0].nombrecompleto); //pass id and name of medico to a input
          var fulldate;
          var dateCita;
          if(date.getDate() < 10){ //if the day is less than 10 add a 0 at the beginning
            if(date.getMinutes() == 0){
              var hour = date.getHours() + ":" + date.getMinutes() + "0";            
            }
            else{
              var hour = date.getHours() + ":" + date.getMinutes();           
            }
            if((date.getMonth()+1) <10){
              fulldate ="0" + date.getDate() + "-0" + (date.getMonth() + 1)+ "-" + date.getFullYear() + " " + hour;
              dateCita = date.getFullYear() + "-0" + (date.getMonth() + 1) + "-0" + date.getDate();
            }
            else{
              fulldate ="0" + date.getDate() + "-" + (date.getMonth() + 1)+ "-" + date.getFullYear() + " " + hour;
              dateCita = date.getFullYear() + "-" + (date.getMonth() + 1) + "-0" + date.getDate();
            }
            
          } 
          else{
            if(date.getMinutes() == 0){
              var hour = date.getHours() + ":" + date.getMinutes() + "0";
            }
            else{
              var hour = date.getHours() + ":" + date.getMinutes();
            }
            if((date.getMonth()+1) <10){
              fulldate =date.getDate() + "-0" + (date.getMonth() + 1)+ "-" + date.getFullYear() + " " + hour;
              dateCita = date.getFullYear() + "-0" + (date.getMonth() + 1) + "-" + date.getDate();
            }
            else{
              fulldate =date.getDate() + "-" + (date.getMonth() + 1)+ "-" + date.getFullYear() + " " + hour;
              dateCita = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
            }
          }
                  
          $("#fecha").val(fulldate); //pass date and hour to a input

          this.getAllConsultoriosHabilitados(date.getHours(),dateCita,this.especialidadValue) //consultorios de esa especialidad disponibles
          this.validateTratamiento(this.tratamientoañadir); //validar tratamiento check      
          this.search(this.especialidadValue); //buscar paciente y tratamiento

          $("#add").click(()=>{
            console.log($("#consultorio").val());
            this.consultorioañadir = $("#consultorio").val();
            if($("#divPaciente").is(':hidden')){ //if paciente div is hiden so no paciente
              this.pacienteañadir = null;
            }
            if(this.pacienteañadir == null  || $("#consultorio").val()==0){ //falta info
              
              this.showModal('Error','Falta informacion')
            }         
            else{
            
              if ($("#tratamientocheck").is(":checked")) {  //si hay tratamiento     
                if($("#duracionprecio").html() == '') {
                  this.showModal('Error','Especificar tratamiento');
                }
                else{ //ads cita
                  this.citasService.citasPorFechaHora(dateCita,this.pacienteañadir.id.toString())
                .then((response)=>{    
                  var exists = false; 
                  var end = 0;
                  this.jsonCitasFechaHora = response;
                  console.log(this.jsonCitasFechaHora.citasfechahora);
                  this.jsonCitasFechaHora.citasfechahora.forEach(cita => {
                    if(cita.tratamiento != null){
                      end = cita.horario.hora + cita.tratamiento.duracion;
                      if(date.getHours()<end && date.getHours()>=cita.horario.hora && 
                      cita.status.id != 1){
                        console.log("ocupado");
                        exists = true;
                      }
                      if(date.getHours()<cita.horario.hora){
                        var endtratamiento = 0;
                        endtratamiento = date.getHours() + this.tratamientoañadir.duracion
                        console.log(endtratamiento)
                        if(endtratamiento>cita.horario.hora && cita.status.id != 1){
                          console.log("ocupado");
                          exists = true;
                        }
                      }
                    }
                    else{
                      if(date.getHours()<cita.horario.hora){
                        var endtratamiento = 0;
                        endtratamiento = date.getHours() + this.tratamientoañadir.duracion
                        console.log(endtratamiento)
                        if(endtratamiento>cita.horario.hora && cita.status.id != 1){
                          console.log("ocupado");
                          exists = true;
                        }
                      }
                      if(cita.horario.hora == date.getHours() && cita.status.id != 1){
                        exists = true
                      }
                    }
                  
                  });
                  if(exists == false){
                    this.addCita(dateCita,this.pacienteañadir.id.toString(),this.medicoSeleccionado.id.toString(),this.especialidadValue,this.tratamientoañadir,
                    this.consultorioañadir,date.getHours().toString(),date.getDay().toString(),
                    this.user.id,date.getHours(),this.pacienteañadir.nombre[0].nombrecompleto)
                    
                    setTimeout(()=>{this.getCitasPorMedico(this.medicoEnSesion);},1000)  
                  }
                  else{
                    this.showModal("Error","Este paciente tiene cita en este horario")
                  }   
                
                })
                .catch((error)=>{console.log(error)})
                }
              }
              
              else{
                this.tratamientoañadir = ''; 
                this.citasService.citasPorFechaHora(dateCita,this.pacienteañadir.id.toString())
                .then((response)=>{    
                  var exists = false; 
                  var end = 0;
                  this.jsonCitasFechaHora = response;
                  console.log(this.jsonCitasFechaHora.citasfechahora);
                  this.jsonCitasFechaHora.citasfechahora.forEach(cita => {
                    if(cita.tratamiento != null){
                      end = cita.horario.hora + cita.tratamiento.duracion;
                      if(date.getHours()<end && date.getHours()>=cita.horario.hora && cita.status.id != 1){
                        console.log("ocupado");
                        exists = true;
                      }
                    }
                    else{
                      if(cita.horario.hora == date.getHours() && cita.status.id != 1){
                        exists = true
                      }
                    }
                  
                  });
                  if(exists == false){
                    this.addCita(dateCita,this.pacienteañadir.id.toString(),this.medicoSeleccionado.id.toString(),this.especialidadValue,this.tratamientoañadir,
                    this.consultorioañadir,date.getHours().toString(),date.getDay().toString(),
                    this.user.id,date.getHours(),this.pacienteañadir.nombre[0].nombrecompleto)
                    
                    setTimeout(()=>{this.getCitasPorMedico(this.medicoEnSesion);},1000) 
                  }
                  else{
                    this.showModal("Error","Este paciente tiene cita en este horario")
                  }   
                
                })
                .catch((error)=>{console.log(error)})

                
              }
            }
          }) 
          
        })
        $("#pacienteNuevo").click(()=>{ //paciente nuevo
          console.log("paciente nuevo");
          this.clear();
          $("#lblbuscarp").hide();
          
          $("#titlemodal").html('Añadir cita');
          $("#add").off('click');
          $("#consultorio").off('change');
          
        
          this.createAddModalElements(); //crear elementos
        
          $("#paciente").hide();
          $("#divPaciente").show();
          this.createElementsContactoEmergencia(); //crear elementos CE
          $("#divCE").show();
          this.takeOffReadOnly(); //quitar el solo leer
          $("#nombrecompleto").hide();
          $("#nom").hide();
          $("#edad").hide();
          $("#edadinput").hide();
          $("#appatP").show();
          $("#inputappatP").show();
          $("#apmatP").show();
          $("#inputapmatP").show();
          $("#nombreP").show();
          $("#inputnombreP").show();
          $("#genero").append('<option value = "0" selected disabled>Seleccione genero</option>')
          $("#genero").append('<option value="Femenino">Femenino</option>')
          $("#genero").append('<option value="Masculino">Masculino</option>')

          
        
          $("#addCitaModal").modal(); //show a form to add cita
          $("#medico").val("Dr."+this.medicoSeleccionado.nombre[0].nombrecompleto); //pass id and name of medico to a input
          var fulldate;
          var dateCita;
          if(date.getDate() < 10){ //if the day is less than 10 add a 0 at the beginning
            if(date.getMinutes() == 0){
              var hour = date.getHours() + ":" + date.getMinutes() + "0";            
            }
            else{
              var hour = date.getHours() + ":" + date.getMinutes();           
            }
            
            if((date.getMonth()+1) <10){
              fulldate ="0" + date.getDate() + "-0" + (date.getMonth() + 1)+ "-" +
              date.getFullYear() + " " + hour;

              dateCita = date.getFullYear() + "-0" + (date.getMonth() + 1) + "-0" + 
              date.getDate();
            }
            else{
              fulldate ="0" + date.getDate() + "-" + (date.getMonth() + 1)+ "-" + date.getFullYear() + " " + hour;
              dateCita = date.getFullYear() + "-" + (date.getMonth() + 1) + "-0" + date.getDate();
            }
          } 
          else{
            if(date.getMinutes() == 0){
              var hour = date.getHours() + ":" + date.getMinutes() + "0";
            }
            else{
              var hour = date.getHours() + ":" + date.getMinutes();
            }
            if((date.getMonth()+1) <10){
              fulldate =date.getDate() + "-0" + (date.getMonth() + 1)+ "-" + date.getFullYear() + " " + hour;
              dateCita = date.getFullYear() + "-0" + (date.getMonth() + 1) + "-" + date.getDate();
            }
            else{
              fulldate =date.getDate() + "-" + (date.getMonth() + 1)+ "-" + date.getFullYear() + " " + hour;
              dateCita = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
            }
          }
                  
          $("#fecha").val(fulldate); //pass date and hour to a input

          this.getAllConsultoriosHabilitados(date.getHours(),dateCita,this.especialidadValue)
          this.validateTratamiento(this.tratamientoañadir);       
          this.search(this.especialidadValue);
          $("#add").click(()=>{
            console.log(this.tratamientoañadir);
            console.log($("#consultorio").val());
            this.consultorioañadir = $("#consultorio").val();
            //datos del paciente a agregar
            var apellidoP = $("#inputappatP").val();
            var apellidoM = $("#inputapmatP").val();
            var nombreP = $("#inputnombreP").val();
            var generoP = $("#genero").val();
            var fechanacP = $("#fechanacimiento").val();
            var direccion = $("#direccion").val();
            var telCasaP = $("#telcasa").val();
            var telmovil = $("#telmovil").val();
            var teloficina = $("#teloficina").val();
            var emailpP = $("#emailp").val();
            var emailtP = $("#emailt").val();

            //datos del contacto emergencia a agregar
            var nomce = $("#nomce").val();
            var telcasace = $("#telcasace").val();
            var telmovilce = $("#telmovilce").val();
            var teloficinace = $("#teloficinace").val();
            var emailpce = $("#emailpce").val();
            var emailtce = $("#emailtce").val();

          

            if(this.consultorioañadir != 0 && apellidoP!=null && apellidoM!=null && 
            nombreP!=null && generoP!= null && fechanacP!= null  && direccion!= null && telCasaP!=null && telmovil!=null && emailpP!= null &&
            nomce!=null && telcasace!=null && telmovilce!=null  && emailpce!=null &&
            apellidoP!='' && apellidoM!='' && nombreP!='' && generoP!= '' && fechanacP!= '' && direccion!= '' && telCasaP!='' && telmovil!='' && emailpP!= '' &&
            nomce!='' && telcasace!='' && telmovilce!=''  && emailpce!='')

            {
              if(emailtP == null){
                emailtP = '';
              }
              if(emailtce == null){
                emailtce = '';
              }
              if(teloficinace == null || teloficinace == ''){
                teloficinace = '';
              }
              if(teloficina == null || teloficina == ''){
                teloficina = '';
              }
              if ($("#tratamientocheck").is(":checked")) {          
                if($("#duracionprecio").html() == '') {
                  this.showModal('Error','Especificar tratamiento');
                }
                else{
                  if(this.validateEmail(emailpP) && this.validateEmail(emailpce)){
                    
                    console.log(dateCita);
                    console.log(this.medicoSeleccionado.id.toString());
                    console.log(this.consultorioañadir);
                    console.log(date.getDay().toString());
                    console.log(date.getHours().toString());
                    console.log(array.id);
                    console.log(apellidoP);
                    console.log(apellidoM);
                    console.log(generoP);
                    console.log(fechanacP);
                    console.log(direccion);
                    console.log(nombreP);
                    console.log(telCasaP.toString());
                    console.log(telmovil.toString());
                    console.log(teloficina.toString());
                    console.log(emailpP.toString());
                    console.log(emailtP.toString());
                    console.log(nomce);
                    console.log(telcasace.toString());
                    console.log(telmovilce.toString());
                    console.log(teloficinace.toString());
                    console.log(emailpce.toString());
                    console.log(emailtce.toString());
                    console.log(this.especialidadValue);
                    console.log(this.tratamientoañadir);
                    
                    
                    this.addNewCita(dateCita,this.medicoSeleccionado.id.toString(),this.consultorioañadir,date.getDay().toString(),
                    date.getHours().toString(),array.id,apellidoP,apellidoM,direccion,generoP.toString(),fechanacP,nombreP,telCasaP.toString(),
                    telmovil.toString(),teloficina.toString(),emailpP,emailtP,nomce,telcasace.toString(),telmovilce.toString(),
                    teloficinace.toString(),emailpce,emailtce,this.especialidadValue,this.tratamientoañadir,date.getHours())
                    
                    setTimeout(()=>{this.getCitasPorMedico(this.medicoEnSesion);},1000)
                    
                    
                  }
                  else{
                    this.showModal('Error','Agregar email valido');
                  }
                }
                
              }else{
                this.tratamientoañadir = '';
                if(this.validateEmail(emailpP) && this.validateEmail(emailpce)){
                  console.log(dateCita);
                    console.log(this.medicoSeleccionado.id.toString());
                    console.log(this.consultorioañadir);
                    console.log(date.getDay().toString());
                    console.log(date.getHours().toString());
                    console.log(array.id);
                    console.log(apellidoP);
                    console.log(apellidoM);
                    console.log(generoP);
                    console.log(fechanacP);
                    console.log(direccion);
                    console.log(nombreP);
                    console.log(telCasaP.toString());
                    console.log(telmovil.toString());
                    console.log(teloficina.toString());
                    console.log(emailpP.toString());
                    console.log(emailtP.toString());
                    console.log(nomce);
                    console.log(telcasace.toString());
                    console.log(telmovilce.toString());
                    console.log(teloficinace.toString());
                    console.log(emailpce.toString());
                    console.log(emailtce.toString());
                    console.log(this.especialidadValue);
                    console.log(this.tratamientoañadir);
                  
                  
                  this.addNewCita(dateCita,this.medicoSeleccionado.id.toString(),this.consultorioañadir,date.getDay().toString(),
                  date.getHours().toString(),array.id,apellidoP,apellidoM,direccion,generoP.toString(),fechanacP,nombreP,telCasaP.toString(),
                  telmovil.toString(),teloficina.toString(),emailpP,emailtP,nomce,telcasace.toString(),telmovilce.toString(),
                  teloficinace.toString(),emailpce,emailtce,this.especialidadValue,this.tratamientoañadir,date.getHours())
                  
                  setTimeout(()=>{this.getCitasPorMedico(this.medicoEnSesion);},1000) 
                  
                  
                  
                }
                else{
                  this.showModal('Error','Agregar email valido');
                }
              }

            }else{
              this.showModal('Error','Informacion incompleta');
            }
          }) 

      
        })
      }
    }
    $("#addCitaModal").on("hidden.bs.modal", ()=>{
      this.clear();      
    });
   
    

    
    
  }

  medicoSchedule(array){
    this.optionsObject.eventClick = (info)=>{
      if(info.event.id == 0){
        this.showModal('Alerta','Tiene cita a esta hora');
      }
      else if(info.event.id == 'a'){
        this.showModal('Alerta','Es dia libre');
      }
      else{
        this.getCitasClickEvento(info.event.id);       
        
      }
    }

    //$("#userphoto").attr('src',this.user.foto)
    

    this.medicoService.getMedicoPorUsuario(array.id)
    .then((response) => {
      
      this.jsonMedico = response;
      console.log(this.jsonMedico);
      console.log(this.jsonMedico.medico[0])
      this.medicoEnSesion = this.jsonMedico.medico[0];
      this.displayClock();
      $("#usernameL").html(this.jsonMedico.medico[0].nombre[0].nombrecompleto);
      $("#userrole").html(array.roles[0].nombre);
      $("#exiticon").attr("class","fas fa-sign-out-alt");
      if(this.jsonMedico.medico[0].especialidad.length > 1){
       
        this.selectEsp(this.jsonMedico.medico[0].especialidad);
        $("#selectesp").show();
        $("#selectesp").on('change',()=>{  
          this.medicoSeleccionado = this.jsonMedico.medico[0]; 
          this.especialidadValue = $("#selectesp").val();       
          this.optionsObject.selectable = true;
          console.log($("#selectesp").val());
          this.eventsArray = [];          
          this.optionsObject.events = this.eventsArray;          
          this.getCitasPorMedico(this.jsonMedico.medico[0]);
          this.businessHours(this.jsonMedico.medico[0])
          setTimeout(()=>{
            this.automaticStatusChange();
          },2000)
          setInterval(()=>{
            console.log(this.medicoEnSesion);
            var today = new Date();  
            var found = false;
            console.log("yeii");        
            if(today.getDate() < 10 ){
              if((today.getMonth()+1) <10){
                var fecha = today.getFullYear() + "-0" + (today.getMonth() + 1) + "-0" + today.getDate();
              }
              else{
                var fecha = today.getFullYear() + "-" + (today.getMonth() + 1) + "-0" + today.getDate();
              }
             
            } 
            else{
              if((today.getMonth()+1) <10){
                var fecha = today.getFullYear() + "-0" + (today.getMonth() + 1) + "-" + today.getDate();
              }
              else{
                var fecha = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
              }
            }       
            this.jsonCitas.citaspormedico.forEach(cita => {
              console.log(cita.fecha);
              console.log(cita.horario.hora);
              console.log(cita.status.id);
              if(cita.horario.hora <= today.getHours() && cita.fecha == fecha  && cita.status.id == 0){
                this.updateStatus('3',cita.id.toString(),this.medicoEnSesion)  
              }
              else if(cita.fecha == fecha && (cita.status.id == 3 || cita.status.id == 0)){
                if(cita.tratamiento != null){
                  console.log("tratamiento")              
                  var total = (cita.horario.hora + cita.tratamiento.duracion)
                  if(today.getHours() >= total){
                    this.updateStatus('2',cita.id.toString(),this.medicoEnSesion)
                  }
                }
                else{
                  if((today.getHours()-1) >= cita.horario.hora){
                    this.updateStatus('2',cita.id.toString(),this.medicoEnSesion)
                  }
                }
              }
            });     
            
          },1000*60)
          
         
        
        })
      }
      else{
        this.medicoSeleccionado = this.jsonMedico.medico[0];
        this.getCitasPorMedico(this.jsonMedico.medico[0])
        this.businessHours(this.jsonMedico.medico[0])
        setTimeout(()=>{
          this.automaticStatusChange();
        },2000)
        setInterval(()=>{
          console.log(this.medicoEnSesion);
          var today = new Date();  
          var found = false;
          console.log("yeii");        
          if(today.getDate() < 10 ){
            if((today.getMonth()+1) <10){
              var fecha = today.getFullYear() + "-0" + (today.getMonth() + 1) + "-0" + today.getDate();
            }
            else{
              var fecha = today.getFullYear() + "-" + (today.getMonth() + 1) + "-0" + today.getDate();
            }
           
          } 
          else{
            if((today.getMonth()+1) <10){
              var fecha = today.getFullYear() + "-0" + (today.getMonth() + 1) + "-" + today.getDate();
            }
            else{
              var fecha = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
            }
          }       
          this.jsonCitas.citaspormedico.forEach(cita => {
            console.log(cita.fecha);
            console.log(cita.horario.hora);
            console.log(cita.status.id);
            if(cita.horario.hora <= today.getHours() && cita.fecha == fecha  && cita.status.id == 0){
              this.updateStatus('3',cita.id.toString(),this.medicoEnSesion)  
            }
            else if(cita.fecha == fecha && (cita.status.id == 3 || cita.status.id == 0)){
              if(cita.tratamiento != null){
                console.log("tratamiento")              
                var total = (cita.horario.hora + cita.tratamiento.duracion)
                if(today.getHours() >= total){
                  this.updateStatus('2',cita.id.toString(),this.medicoEnSesion)
                }
              }
              else{
                if((today.getHours()-1) >= cita.horario.hora){
                  this.updateStatus('2',cita.id.toString(),this.medicoEnSesion)
                }
              }
            }
          });     
          
        },1000*60)
        
        
      }

      
      
      
      
      

    })
    .catch((error) => {
      console.error(error);
    })  
    
    this.optionsObject.validRange.start = new Date();  
   
  
    

    this.optionsObject.select = (info) =>{
    
      
      
      var date = new Date();
      date = info.start; 
      var currentDate  = new Date();
      
      var currentFecha = new Date(currentDate.getFullYear()+'/'+(currentDate.getMonth()+1)+'/'+currentDate.getDate());
      var startFecha = new Date(date.getFullYear()+'/'+(date.getMonth()+1)+'/'+date.getDate());
      console.log(currentFecha + " " + startFecha);
      if(currentFecha.toString() === startFecha.toString() &&  currentDate.getHours()>= date.getHours()){
        this.showModal("Error","Imposible agendar citas en el pasado!");
      }
      else{
        $("#lblbuscarp").show();
        $("#titlemodal").html('Añadir cita');
        $("#add").off('click');
        $("#consultorio").off('change');
        this.createAddModalElements();
        $("#addCitaModal").modal(); //show a form to add cita
        
        $("#medico").val("Dr."+this.user.nombre); //pass id and name of medico to a input
        var fulldate;
        var dateCita;
        if(date.getDate() < 10){ //if the day is less than 10 add a 0 at the beginning
          if(date.getMinutes() == 0){
            var hour = date.getHours() + ":" + date.getMinutes() + "0";            
          }
          else{
            var hour = date.getHours() + ":" + date.getMinutes();           
          }
          
          if((date.getMonth()+1) <10){
            fulldate ="0" + date.getDate() + "-0" + (date.getMonth() + 1)+ "-" + date.getFullYear() + " " + hour;
            dateCita = date.getFullYear() + "-0" + (date.getMonth() + 1) + "-0" + date.getDate();
          }
          else{
            fulldate ="0" + date.getDate() + "-" + (date.getMonth() + 1)+ "-" + date.getFullYear() + " " + hour;
            dateCita = date.getFullYear() + "-" + (date.getMonth() + 1) + "-0" + date.getDate();
          }
        } 
        else{
          if(date.getMinutes() == 0){
            var hour = date.getHours() + ":" + date.getMinutes() + "0";
          }
          else{
            var hour = date.getHours() + ":" + date.getMinutes();
          }
          if((date.getMonth()+1) <10){
            fulldate =date.getDate() + "-0" + (date.getMonth() + 1)+ "-" + date.getFullYear() + " " + hour;
            dateCita = date.getFullYear() + "-0" + (date.getMonth() + 1) + "-" + date.getDate();
          }
          else{
            fulldate =date.getDate() + "-" + (date.getMonth() + 1)+ "-" + date.getFullYear() + " " + hour;
            dateCita = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
          }
        }
                
        $("#fecha").val(fulldate); //pass date and hour to a input
        
        
        
        this.getAllConsultoriosHabilitados(date.getHours(),dateCita,this.especialidadValue)
        this.validateTratamiento(this.tratamientoañadir);       
        this.search(this.especialidadValue);
        
        
        
        

        $("#add").click(()=>{
          console.log($("#consultorio").val());
          this.consultorioañadir = $("#consultorio").val();
          if($("#divPaciente").is(':hidden')){
            this.pacienteañadir = null;
          }
          if(this.pacienteañadir == null  || $("#consultorio").val()==0){
            
            this.showModal('Error','Falta informacion')
          }         
          else{
          
            if ($("#tratamientocheck").is(":checked")) {          
              if($("#duracionprecio").html() == '') {
                this.showModal('Error','Especificar tratamiento');
              }
              else{
                this.citasService.citasPorFechaHora(dateCita,this.pacienteañadir.id.toString())
                .then((response)=>{    
                  var exists = false; 
                  var end = 0;
                  this.jsonCitasFechaHora = response;
                  console.log(this.jsonCitasFechaHora.citasfechahora);
                  this.jsonCitasFechaHora.citasfechahora.forEach(cita => {
                    if(cita.tratamiento != null){
                      end = cita.horario.hora + cita.tratamiento.duracion;
                      if(date.getHours()<end && date.getHours()>=cita.horario.hora && cita.status.id != 1){
                        console.log("ocupado");
                        exists = true;
                      }
                      if(date.getHours()<cita.horario.hora){
                        var endtratamiento = 0;
                        endtratamiento = date.getHours() + this.tratamientoañadir.duracion
                        console.log(endtratamiento)
                        if(endtratamiento>cita.horario.hora && cita.status.id != 1){
                          console.log("ocupado");
                          exists = true;
                        }
                      }
                      if(cita.horario.hora == date.getHours() && cita.status.id != 1){
                        exists = true
                      }
                    }
                    else{
                      if(date.getHours()<cita.horario.hora){
                        var endtratamiento = 0;
                        endtratamiento = date.getHours() + this.tratamientoañadir.duracion
                        console.log(endtratamiento)
                        if(endtratamiento>cita.horario.hora && cita.status.id != 1){
                          console.log("ocupado");
                          exists = true;
                        }
                      }
                      if(cita.horario.hora == date.getHours() && cita.status.id != 1){
                        exists = true
                      }
                    }
                  
                  });
                  if(exists == false){
                    console.log(this.medicoSeleccionado.id.toString())
                    this.addCita(dateCita,this.pacienteañadir.id.toString(),this.medicoSeleccionado.id.toString(),this.especialidadValue,this.tratamientoañadir,
                    this.consultorioañadir,date.getHours().toString(),date.getDay().toString(),
                    this.user.id,date.getHours(),this.pacienteañadir.nombre[0].nombrecompleto)
                    
                    setTimeout(()=>{this.getCitasPorMedico(this.medicoEnSesion);},1000) 
                  }
                  else{
                    this.showModal("Error","Este paciente tiene cita en este horario")
                  }   
                
                })
                .catch((error)=>{console.log(error)})
              }
            }
            
            else{
              this.tratamientoañadir = ''; 
              this.citasService.citasPorFechaHora(dateCita,this.pacienteañadir.id.toString())
              .then((response)=>{    
                var exists = false; 
                var end = 0;
                this.jsonCitasFechaHora = response;
                console.log(this.jsonCitasFechaHora.citasfechahora);
                this.jsonCitasFechaHora.citasfechahora.forEach(cita => {
                  if(cita.tratamiento != null){
                    end = cita.horario.hora + cita.tratamiento.duracion;
                    if(date.getHours()<end && date.getHours()>=cita.horario.hora && cita.status.id != 1){
                      console.log("ocupado");
                      exists = true;
                    }
                    if(cita.horario.hora == date.getHours() && cita.status.id != 1){
                      exists = true
                    }
                  }
                  else{
                    if(cita.horario.hora == date.getHours() && cita.status.id != 1){
                      exists = true
                    }
                  }
                
                });
                if(exists == false){
                  this.addCita(dateCita,this.pacienteañadir.id.toString(),this.jsonMedico.medico[0].id.toString(),this.especialidadValue,this.tratamientoañadir,
                  this.consultorioañadir,date.getHours().toString(),date.getDay().toString(),
                  this.user.id,date.getHours(),this.pacienteañadir.nombre[0].nombrecompleto)

                  setTimeout(()=>{this.getCitasPorMedico(this.medicoEnSesion);},1000) 
                }
                else{
                  this.showModal("Error","Este paciente tiene cita en este horario")
                }   
              
              })
              .catch((error)=>{console.log(error)})
              
            
            }
          }
        }) 
      }
    }
   
    $("#addCitaModal").on("hidden.bs.modal", ()=>{
      this.clear();      
    });
  }
  
  citasPorFecha(hora,fecha,esp){
    $("#consultorio").empty();
    $("#consultorio").append('<option value = "0">Seleccione consultorio</option>')
    this.jsonConsultoriosHab.forEach(con => {
      var option  = $("<option></option>");
      option.attr('value',con.id);
      option.html(con.nombre);
      $("#consultorio").append(option);
    });
    console.log(fecha);
    this.citasService.citasPorFechaEsp(fecha,esp)
    .then((response) => {
      console.log(response);   
      this.jsonCitasFechaEsp = response;
      if(this.jsonCitasFechaEsp.status == 0){
        this.jsonCitasFechaEsp = this.jsonCitasFechaEsp.citasfechaesp;
        this.jsonCitasFechaEsp.forEach(cita => {
          
         if(cita.tratamiento == null){
           if(cita.horario.hora == hora && cita.status.id !=1){
              $("#consultorio option[value = '"+cita.consultorio.id+"']").remove();
            }
         
          }
          else{
            var rango = cita.horario.hora + cita.tratamiento.duracion;
            console.log(rango);
            if((rango - hora) >0 && cita.status.id !=1){
              $("#consultorio option[value = '"+cita.consultorio.id+"']").remove();
            }
            
          }
        });
        
      }   
      
    })
    .catch((error) => {
      console.error(error);
    })
  } 
 

  
  getAllConsultoriosHabilitados(hora,fecha,especialidad){
    this.citasService.getConsultoriosDisponiblesHabilitados(especialidad)
    .then((response) => {
      console.log(response);        
      this.jsonConsultoriosHab = response; 
      if(this.jsonConsultoriosHab.status == 0){
        this.jsonConsultoriosHab = this.jsonConsultoriosHab.consultorios;
        if(this.jsonConsultoriosHab.length == 0){
          this.showModal('Alerta','No hay consultorios disponibles')
          $("#consultorio").attr('disabled','disabled');
        }        
        else{
          this.citasPorFecha(hora,fecha,especialidad)
        }
       
      }     
    })
    .catch((error) => {
      console.error(error);
    })
  }

   //function to serach in an input text
  search(especialidad){
    var searchbox = $("#tratamiento");
    var searchpaciente = $("#paciente");
    searchbox.keyup((e)=>{
      $("#duracionprecio").html('');
      console.log(e.target.value);      
      //query eache time you write in the box
      if(e.target.value !=''){
        setTimeout(()=>{
          this.tratamietoService.getTratamientoPorEspecialidad(especialidad,e.target.value)
          .then((response) => {
            $("#suggestionstrat").empty();            
            this.jsonSearch = response;
            
            //show message if there are no results
            if(this.jsonSearch.tratamientos.length == 0){
               var message = document.createElement("div");
               message.innerHTML = 'Tratamiento no encontrado'
              
             
              $(message).css({color: "red"})
              $("#suggestionstrat").append(message);
            }
            else{
              for(var i = 0;i<this.jsonSearch.tratamientos.length;i++){
                
                
                //create suggestions
                var div = document.createElement("div");
                div.setAttribute("id", this.jsonSearch.tratamientos[i].id);
                div.setAttribute("class", "option");
                $(div).html(this.jsonSearch.tratamientos[i].descripcion);
                this.styleToDiv($(div));

                $(div).click((e)=>{
                  
                  this.jsonSearch.tratamientos.forEach(trat => {
                    if(trat.id == e.target.id){
                      this.tratamientoañadir = trat;
                      $("#tratamiento").val(trat.descripcion);
                      $("#idtratamiento").html(trat.id);
                      $("#duracionprecio").html("Duracion : " + trat.duracion  + " horas, Precio : " + "$" +trat.precio);
                    }
                  });

                  $("#suggestionstrat").empty();
                  
                  
                  
                });

                $("#suggestionstrat").append($(div))

              }
            }
          })
          .catch((error) => {
            console.error(error);
          })
        },100);
      }
      else{
        $("#suggestionstrat").empty();        
       
      }   
      
    });

    searchpaciente.keyup((e)=>{
      
      $("#divPaciente").hide();
      //query eache time you write in the box
      if(e.target.value !=''){
        console.log(e.target.value);     
        setTimeout(()=>{
          this.pacienteService.getPacientesPorNombre(e.target.value)
          .then((response) => {
            $("#suggestionspac").empty();     
            this.jsonSearchPacientes = response;
            
            //show message if there are no results
            if(this.jsonSearchPacientes.pacientes.length == 0){
              var message = document.createElement("div");
              message.innerHTML = 'No se encontraron coincidencias.'
             
            
             $(message).css({color: "red"})
             $("#suggestionspac").append(message);
            }
            else{
              for(var i = 0;i<this.jsonSearchPacientes.pacientes.length;i++){
               
                
                //create suggestions
                var div = document.createElement("div");
                div.setAttribute("id", this.jsonSearchPacientes.pacientes[i].id);
                div.setAttribute("class", "option");
                $(div).html(this.jsonSearchPacientes.pacientes[i].nombre[0].nombrecompleto);
                this.styleToDiv($(div));

                $(div).click((e)=>{
                  
                  this.jsonSearchPacientes.pacientes.forEach(pac => {
                    if(pac.id == e.target.id){
                      this.pacienteañadir = pac;
                      
                      $("#paciente").val(this.pacienteañadir.nombre[0].nombrecompleto);

                      $("#nombrecompleto").val(this.pacienteañadir.nombre[0].nombrecompleto);
                      $("#nombrecompleto").prop("readonly",true);

                      $("#genero").append('<option>' + this.pacienteañadir.genero+'</option>');                      
                      $("#genero").prop("disabled","disabled");

                      $("#fechanacimiento").val(this.pacienteañadir.fechanac);
                      $("#fechanacimiento").prop("readonly",true);

                      $("#edadinput").val(this.pacienteañadir.edad + " años");
                      $("#edadinput").prop("readonly",true);
                      

                      $("#direccion").val(this.pacienteañadir.direccion);
                      $("#direccion").prop("readonly",true);

                      $("#telcasa").val(this.pacienteañadir.contacto.telefono.casa);
                      $("#telcasa").prop("readonly",true);

                      $("#telmovil").val(this.pacienteañadir.contacto.telefono.movil);
                      $("#telmovil").prop("readonly",true);

                      $("#teloficina").val(this.pacienteañadir.contacto.telefono.oficina);
                      $("#teloficina").prop("readonly",true);

                      $("#emailp").val(this.pacienteañadir.contacto.email.personal);
                      $("#emailp").prop("readonly",true);

                      $("#emailt").val(this.pacienteañadir.contacto.email.trabajo);
                      $("#emailt").prop("readonly",true);

                      this.citasService.getCitasCanceladas(this.pacienteañadir.id.toString())
                      .then((response) =>{ 
                        this.jsonc = response;;
                        $("#citasCanceladas").html('Este paciente tiene un historial de '+this.jsonc.citascanceladas+' citas canceladas.'); }
                      )
                      .catch((error) => {
                        console.log(error);
                      })
                      $("#divPaciente").show();
                    }
                  });

                  $("#suggestionspac").empty();
                  
                  
                  
                });

               

                $("#suggestionspac").append($(div))

              }
            }
          })
          .catch((error) => {
            console.error(error);
          })
        },100);
      }
      else{
        this.pacienteañadir == null
        $("#nombrecompleto").val('');
        $("#nombrecompleto").prop("readonly",false);

        $("#direccion").val('');
        $("#direccion").prop("readonly",false);

        $("#genero").val('');
        $("#genero").prop("readonly",false);

        $("#fechanacimiento").val('');
        $("#fechanacimiento").prop("readonly",false);

        $("#edadinput").val('');
        $("#edadinput").prop("readonly",false);

        $("#telcasa").val('');
        $("#telcasa").prop("readonly",false);

        $("#telmovil").val('');
        $("#telmovil").prop("readonly",false);

        $("#teloficina").val('');
        $("#teloficina").prop("readonly",false);

        $("#emailp").val('');
        $("#emailp").prop("readonly",false);

        $("#emailt").val('');
        $("#emailt").prop("readonly",false);


        $("#suggestionspac").empty();        
        $("#divPaciente").hide();
        
      }  
    })
  }


  validateTratamiento(tratamiento){
    $("#tratamientocheck").click(() =>{
      console.log(tratamiento);
      if ($("#tratamientocheck").is(":checked")) {
          
          $("#tratamiento").show();
          
      } else {
          tratamiento = '';
          $("#tratamiento").val('');
          $("#tratamiento").hide();
          $("#suggestionstrat").empty();
          $("#duracionprecio").empty();
      }
    });
    
  }

  styleToDiv(div){
    $(div).css({
      backgroundColor : "white",
      color : "black",
      cursor : "pointer",
      border: "1px solid #ddd",
      padding: "5px",
      'font-size': '15px' 
     
    })  

    $(div).hover(function(){   
      $(this).css({ backgroundColor: '#E0E0E0'})
    },function(){
      $(this).css({ backgroundColor: 'white'});
    });
   
  }

  createAddModalElements(){
    var inputfecha = $("<input>",{
      type:"text",
      class:"form-control",
      id:"fecha",
      readonly: true
    }).appendTo($("#formfecha"));

    var inputmedico = $("<input>",{
      type:"text",
      class:"form-control",
      id:"medico",
      readonly: true
    }).appendTo($("#formmedico"));

    var inputcon = $("<select></select>",{      
      class:"form-control",
      id:"consultorio",      
    }).appendTo($("#formconsul"));
    var defaultoption = $('"<option value = "0" selected disabled>Seleccione especialidad...</option>"',{      
      class:"form-control",
      value:"0",      
    }).appendTo($(inputcon));

    var check = $("<input>",{
      type:"checkbox",      
      id:"tratamientocheck",      
    }).appendTo($("#tratamientolbl"));

    var inputtrat = $("<input>",{      
      class:"form-control",
      id:"tratamiento", 
      css : {
        display : 'none'
      },
      autocomplete: 'off'     
    }).appendTo($("#formtratamiento"));

    var sugtrat = $("<div></div>",{      
     
      id:"suggestionstrat", 
     
    }).appendTo($("#formtratamiento"));

    var durprec = $("<label></label>",{      
      class:"col-form-label",
      id:"duracionprecio",
      
    }).appendTo($("#formtratamiento"));

    var inputpaciente = $("<input>",{
      type:"text",
      class:"form-control",
      id:"paciente",
      placeholder: 'nombre del paciente',
      autocomplete: 'off' 
    }).appendTo($("#formpaciente"));

    var sugpac = $("<div></div>",{      
     
      id:"suggestionspac", 
     
    }).appendTo($("#formpaciente"));

    var appatP = $("<input>",{
      type:"text",
      class:"form-control",
      id:"inputappatP",
      css : {
        display : 'none'
      },
    });
    var apmatP = $("<input>",{
      type:"text",
      class:"form-control",
      id:"inputapmatP",
      css : {
        display : 'none'
      },
    });
    var nombreP = $("<input>",{
      type:"text",
      class:"form-control",
      id:"inputnombreP",
      css : {
        display : 'none'
      },
    });
    var nomc = $("<input>",{
      type:"text",
      class:"form-control",
      id:"nombrecompleto",
      readonly : true
    });

    var gen = $("<select></select>",{      
      class:"form-control",
      id:"genero",      
    });
   
   

    var fechanac = $("<input>",{
      type:"date",
      class:"form-control",
      id:"fechanacimiento",
      readonly : true
    });

    var edad = $("<input>",{
      type:"text",
      class:"form-control",
      id:"edadinput",
      readonly : true
    });

    var dir = $("<input>",{
      type:"text",
      class:"form-control",
      id:"direccion",
      readonly : true
    });

    var telc = $("<input>",{
      type:"number",
      class:"form-control",
      id:"telcasa",
      readonly : true
    });

    var telm = $("<input>",{
      type:"number",
      class:"form-control",
      id:"telmovil",
      readonly : true
    });

    var telo = $("<input>",{
      type:"number",
      class:"form-control",
      id:"teloficina",
      readonly : true
    });

    var ep = $("<input>",{
      type:"email",
      class:"form-control",
      id:"emailp",
      readonly : true
    });

    var et = $("<input>",{
      type:"email",
      class:"form-control",
      id:"emailt",
      readonly : true
    });

    var cc = $("<label>",{
      class: "form-label",
      id: "citasCanceladas",
      css: {
        'margin-top': '2%' 
      }
    });

    var btncan = $("<button></button>",{
      type:"button",
      class:"btn btn-secondary",
      id:"cancel",
      'data-dismiss':'modal',
      text:'Cancelar',
      css:{
        'background-color': '#FFF',
        'border-color':  '#007bff',
        'color': '#007bff'
      }
    }).appendTo($("#footmod"));

    var btnadd = $("<button></button>",{
      type:"button",
      class:"btn btn-primary",
      id:"add",      
      text:'Agendar Cita'
    }).appendTo($("#footmod"));

    $("#appatP").after(appatP);
    $("#apmatP").after(apmatP);
    $("#nombreP").after(nombreP);
    $("#nom").after(nomc);
    $("#gen").after(gen);
    $("#fechanac").after(fechanac);
    $("#edad").after(edad);
    $("#dir").after(dir);
    $("#telc").after(telc);
    $("#telm").after(telm);
    $("#telo").after(telo);
    $("#ep").after(ep);
    $("#et").after(et);
    et.after(cc);




  }

  addCita(fecha,paciente,medico, especialidad, tratamiento, consultorio,hora,dia,usuario,start,nombre){
    if(tratamiento == ''){
      this.citasService.addCita(fecha,paciente,medico,especialidad, tratamiento, consultorio,hora,dia,usuario)
      .then((response) => {
        console.log(response);
        
        this.messagefinal = response;
        if(this.messagefinal.status == 0){
          this.showModal('Exito', this.messagefinal.message);
          this.addEvent(start,this.messagefinal.newid,nombre,fecha,tratamiento,0)
          this.clear();
         
  
          $("#addCitaModal").modal('hide');       
        }
        else if(this.messagefinal.status == 2){
         
          this.showModal('Error', this.messagefinal.errorMessage);
        }                    
        
      })
      .catch((error) => {
        console.error(error);
      })
    }
    else{
      this.citasService.addCita(fecha,paciente,medico,especialidad, tratamiento.id, consultorio,hora,dia,usuario)
      .then((response) => {
        console.log(response);
        
        this.messagefinal = response;
        if(this.messagefinal.status == 0){
          this.showModal('Exito', this.messagefinal.message);
          this.addEvent(start,this.messagefinal.newid,nombre,fecha,tratamiento,0)
          this.clear();
  
          $("#addCitaModal").modal('hide');       
        }
        else if(this.messagefinal.status == 2){
         
          this.showModal('Error', this.messagefinal.errorMessage);
        }                    
        
      })
      .catch((error) => {
        console.error(error);
      })
    }
   
  }

  addEvent(start,id,nombre,fecha,tratamiento,status){
    this.jsonColoresStatus = [
      {
        color :  '#007bff',
        fontcolor : '#ffffff'

      },     
      {
        color :  '#FFC7CE',
        fontcolor : '#f80000'
      },
      {
        color :  '#B4C6E7',
        fontcolor : '#252850'
        
      },
      {
        color :  '#C6EFCE',
        fontcolor : '#0d6600'
      }
    ]
    
    console.log(status);

    if(status != 1){
      if(tratamiento == '' || tratamiento == null){
        if(start < 9){
          this.eventsArray.push({ 
            id : id,                 
            title : nombre,
            start: fecha + " 0" + start + ":00:00",
            end: fecha + " 0" + (start+1) + ":00:00",  
            backgroundColor: this.jsonColoresStatus[status].color,
            textColor: this.jsonColoresStatus[status].fontcolor,
            borderColor : this.jsonColoresStatus[status].color
          }) 
        }
        else if(start == 9){
          this.eventsArray.push({ 
            id : id,                  
            title : nombre,
            start: fecha + " 0" + start + ":00:00",
            end: fecha + " " + (start+1) + ":00:00", 
            backgroundColor: this.jsonColoresStatus[status].color,
            textColor: this.jsonColoresStatus[status].fontcolor,
            borderColor : this.jsonColoresStatus[status].color          
          }) 
        }
        else{
          this.eventsArray.push({ 
            id : id,                  
            title : nombre,
            start: fecha + " " + start + ":00:00",
            end: fecha + " " + (start+1) + ":00:00", 
            backgroundColor: this.jsonColoresStatus[status].color,
            textColor: this.jsonColoresStatus[status].fontcolor,
            borderColor : this.jsonColoresStatus[status].color            
          }) 
        }
      }
      else{
        if(start<9){
          if((start + tratamiento.duracion)>9){
            this.eventsArray.push({ 
              id : id,                  
              title : nombre,
              start: fecha + " 0" + start + ":00:00",
              end: fecha + " " + (start+tratamiento.duracion) + ":00:00", 
              backgroundColor: this.jsonColoresStatus[status].color,
              textColor: this.jsonColoresStatus[status].fontcolor,
              borderColor : this.jsonColoresStatus[status].color            
            }) 
          }
          else{
            this.eventsArray.push({ 
              id : id,                  
              title : nombre,
              start: fecha + " 0" + start + ":00:00",
              end: fecha + " 0" + (start+tratamiento.duracion) + ":00:00", 
              backgroundColor: this.jsonColoresStatus[status].color,
              textColor: this.jsonColoresStatus[status].fontcolor,
              borderColor : this.jsonColoresStatus[status].color            
            }) 
          }
        }
        else if(start == 9){
          this.eventsArray.push({ 
            id : id,                  
            title : nombre,
            start: fecha + " 0" + start + ":00:00",
            end: fecha + " " + (start+tratamiento.duracion) + ":00:00", 
            backgroundColor: this.jsonColoresStatus[status].color,
            textColor: this.jsonColoresStatus[status].fontcolor,
            borderColor : this.jsonColoresStatus[status].color            
          }) 
        }
        else{
          this.eventsArray.push({ 
            id : id,                  
            title : nombre,
            start: fecha + " " + start + ":00:00",
            end: fecha + " " + (start+tratamiento.duracion) + ":00:00",  
            backgroundColor: this.jsonColoresStatus[status].color,
            textColor: this.jsonColoresStatus[status].fontcolor,
            borderColor : this.jsonColoresStatus[status].color           
          }) 
        }
        
      }
    }
  }

  selectEsp(arrayesp){
   

    var selectesp = $("#selectesp")

    selectesp.append('"<option value="0" disabled selected>Seleccione especialidad</option>"');
    arrayesp.forEach(esp => {
      var option  = $("<option></option>");
      option.attr('value',esp.id);
      option.html(esp.descripcion);
      selectesp.append(option);
    });

    
  }

  busyHour(start,fecha,tratamiento){
    if(tratamiento == '' || tratamiento == null){
      if(start < 9){
        this.eventsArray.push({           
          id : 0,
          title: 'Ocupado',
          start: fecha + " 0" + start + ":00:00",
          end: fecha + " 0" + (start+1) + ":00:00", 
          backgroundColor : '#f1f1f1',
          textColor: '#007bff',
          borderColor: '#f1f1f1'
                   
        }) 
      }
      else if(start == 9){
        this.eventsArray.push({ 
          id : 0,
          title: 'Ocupado',
          start: fecha + " 0" + start + ":00:00",
          end: fecha + " " + (start+1) + ":00:00",  
          backgroundColor : '#f1f1f1',
          textColor: '#007bff' , 
          borderColor: '#f1f1f1'
                
        }) 
      }
      else{
        this.eventsArray.push({ 
          id : 0,
          title: 'Ocupado',
          start: fecha + " " + start + ":00:00",
          end: fecha + " " + (start+1) + ":00:00",   
          backgroundColor : '#f1f1f1',
          textColor: '#007bff',
          borderColor: '#f1f1f1' 
                
        }) 
      }
    }
    else{
      if(start<9){
        if((start + tratamiento.duracion)>9){
          this.eventsArray.push({ 
            id : 0,
            title: 'Ocupado',
            start: fecha + " 0" + start + ":00:00",
            end: fecha + " " + (start+tratamiento.duracion) + ":00:00",   
            backgroundColor : '#f1f1f1',
            textColor: '#007bff',
            borderColor: '#f1f1f1'
                   
          }) 
        }
        else{
          this.eventsArray.push({ 
            id : 0,
            title: 'Ocupado',
            start: fecha + " 0" + start + ":00:00",
            end: fecha + " 0" + (start+tratamiento.duracion) + ":00:00", 
            backgroundColor : '#f1f1f1',
            textColor: '#007bff' ,
            borderColor: '#f1f1f1' 
                   
          }) 
        }
      }
      else if(start == 9){
        this.eventsArray.push({ 
          id : 0,
          title: 'Ocupado',
          start: fecha + " 0" + start + ":00:00",
          end: fecha + " " + (start+tratamiento.duracion) + ":00:00",  
          backgroundColor : '#f1f1f1',
          textColor: '#007bff',
          borderColor: '#f1f1f1'
                  
        }) 
      }
      else{
        this.eventsArray.push({ 
          id : 0,
          title: 'Ocupado',
          start: fecha + " " + start + ":00:00",
          end: fecha + " " + (start+tratamiento.duracion) + ":00:00",  
          backgroundColor : '#f1f1f1',
          textColor: '#007bff',
          borderColor: '#f1f1f1'
                  
        }) 
      }
    }
    
  }

  getCitasClickEvento(idCita){
    this.citasService.getCitasPorId(idCita)
    .then((response) => {
      console.log(response);        
      this.jsonCitasId = response;
      if(this.jsonCitasId.status == 0){
        this.jsonCitasId = this.jsonCitasId.cita;
        this.createAddModalElements();
        this.populateElements(this.jsonCitasId);        
        $("#addCitaModal").modal(); //show a form
        
      }
    })
    .catch((error) => {
      console.error(error);
    })
  }

  clear(){

    $(".form-control").remove();
    $("#tratamientocheck").remove();
    $("#duracionprecio").remove();
    $("#suggestionstrat").remove();
    $("#suggestionspac").remove();
    $("#divPaciente").hide();
    $("#divCE").hide();
    $("#cancel").remove();
    $("#add").remove();
    $("#citasCanceladas").remove();

  }

  populateElements(array){
    $("#titlemodal").html('Informacion');
    $("#lblbuscarp").hide();
    $("#paciente").remove();
    $("#lblmedico").hide();
    $("#add").remove();
    $("#medico").remove();
    var date = $("#fecha");
    
    var selectCons = $("#consultorio");
    selectCons.empty();
    selectCons.prop('disabled','disabled');
    
    $("#tratamientocheck").prop('disabled','disabled')
    
    var fechafull = new Date(array.fecha);
    console.log(fechafull)
    var dateToShow = fechafull.getDate()+1 + "-" + (fechafull.getMonth()+1) + "-" +fechafull.getFullYear(); 
    date.val(dateToShow + " " + array.horario.hora + ":00");   
    console.log(array.consultorio.nombre)
    selectCons.append('<option>' + array.consultorio.nombre + '</option>');

    if(array.tratamiento != null){
      //check box tratamiento
      $("#tratamientocheck").prop('checked',true);      

      //input tratamiento
      $("#tratamiento").show();
      $("#tratamiento").prop('disabled','disabled');
      $("#tratamiento").val(array.tratamiento.descripcion);

      //extra information
      $("#duracionprecio").show();
      $("#duracionprecio").html("Duracion : " + array.tratamiento.duracion  + " horas, Precio : " + "$" +array.tratamiento.precio);
    }

    
    this.getPacientePorId(array.paciente.id);
   
    

    
    
    
  }

  getPacientePorId(id){
    this.pacienteService.getPacientesPorId(id)    
    .then((response) => {
      console.log(response);
      this.jsonPaciente = response;
      if(this.jsonPaciente.status == 0){
        this.jsonPaciente = this.jsonPaciente.paciente;
        $("#edad").show();
        $("#edadinput").show();
        $("#nombrecompleto").val(this.jsonPaciente.nombre[0].nombrecompleto) //nombre
        $("#genero").append('<option>' + this.jsonPaciente.genero+'</option>');                      
        $("#genero").prop("disabled","disabled");
        $("#fechanacimiento").val(this.jsonPaciente.fechanac); //direccion
        $("#edadinput").val(this.jsonPaciente.edad + " años"); //direccion
        $("#direccion").val(this.jsonPaciente.direccion); //direccion
        $("#telcasa").val(this.jsonPaciente.contacto.telefono.casa) //tel casa
        $("#telmovil").val(this.jsonPaciente.contacto.telefono.movil) //tel movil
        $("#teloficina").val(this.jsonPaciente.contacto.telefono.oficina) //tel oficina
        $("#emailp").val(this.jsonPaciente.contacto.email.personal) //email personal
        $("#emailt").val(this.jsonPaciente.contacto.email.trabajo) //email trabajo


        $("#divPaciente").show();

        var selectCE = $("<select>",{          
          class:"form-control",
          id:"selectCE",
          
        });

        selectCE.append("<option selected disabled>Contactos de Emergencia</option>");

        this.jsonPaciente.contactoEmergencia.forEach(ce => {
          var option = $("<option>",{       
            value: ce.id,   
            text: ce.nombre         
          });
          selectCE.append(option);
        });

        this.createElementsContactoEmergencia();
        selectCE.on('change',()=>{          
          this.getCEId(selectCE.val());
          $("#divCE").show();

        })


        $("#formselectce").append(selectCE);





        
      }


    })
    .catch((error) => {
      console.error(error);
    })

  }

  createElementsContactoEmergencia(){
    var nomce = $("<input>",{
      type:"text",
      class:"form-control",
      id:"nomce",
      readonly : true
    });
    
    var telcce = $("<input>",{
      type:"number",
      class:"form-control",
      id:"telcasace",
      readonly : true
    });

    var telmce = $("<input>",{
      type:"number",
      class:"form-control",
      id:"telmovilce",
      readonly : true
    });

    var teloce = $("<input>",{
      type:"number",
      class:"form-control",
      id:"teloficinace",
      readonly : true
    });

    var epce = $("<input>",{
      type:"email",
      class:"form-control",
      id:"emailpce",
      readonly : true
    });

    var etce = $("<input>",{
      type:"email",
      class:"form-control",
      id:"emailtce",
      readonly : true
    });


    $("#lblnomce").after(nomce);
    $("#lbltelcce").after(telcce);
    $("#lbltelmce").after(telmce);
    $("#lblteloce").after(teloce);
    $("#lblepce").after(epce);
    $("#lbletce").after(etce);
  }

  getCEId(id){
    this.ceService.getCEPorId(id)
    .then((response) => {
      this.jsonCE = response;
      if(this.jsonCE.status == 0){
        this.jsonCE = this.jsonCE.ce;
        $("#nomce").val(this.jsonCE.nombre) //nombre          
        $("#telcasace").val(this.jsonCE.contacto.telefono.casa) //tel casa
        $("#telmovilce").val(this.jsonCE.contacto.telefono.movil) //tel movil
        $("#teloficinace").val(this.jsonCE.contacto.telefono.oficina) //tel oficina
        $("#emailpce").val(this.jsonCE.contacto.email.personal) //email personal
        $("#emailtce").val(this.jsonCE.contacto.email.trabajo) //email trabajo

      }
      
    })
    .catch((error) => {
      console.error(error);
    })
  }

  displayClock(){
    var display = new Date().toLocaleTimeString();
    $("#clock").html(display)
    setInterval(this.displayClock, 1000); 
  }

  menu(array){
    array.forEach(item => {
      if(item.tipo == 'link'){
        var li = $("<li></li>",{
          class: 'nav-item'
        })
        var link = $("<a></a>",{
          class: 'nav-item nav-link active',
          href: item.url,
                    
        })

        var h = $("<h5></h5>")

        h.html(item.titulo.español)

        link.append(h);
        link.hover(function(){
          link.css("color", "#08f7fe");
          }, function(){
            link.css("color", "white");
        });
        li.append(link)
        $("#menu").append(li);

      }
    });

  }

  getCitasPorMedico(arrayMedico){
    this.citasService.getCitas(arrayMedico.id)
    .then((response) => {
       console.log(response);    
      this.jsonCitas = response;
      
        if(arrayMedico.especialidad.length>1){
          this.optionsObject.selectable = true;  
          this.eventsArray = [];          
          this.optionsObject.events = this.eventsArray;  
          
          this.jsonCitas.citaspormedico.forEach(cita => {
            if(cita.especialidad.id == this.especialidadValue)  {
              console.log(cita);               
              this.addEvent(cita.horario.hora,cita.id,cita.paciente.nombre[0].nombrecompleto,
                cita.fecha,cita.tratamiento, cita.status.id);
             
            }
            else{
              if(cita.status.id != 1){
                this.busyHour(cita.horario.hora,cita.fecha,cita.tratamiento)
              }
              
            }         
          });
          
          

        }
        else{   
          
          this.especialidadValue = arrayMedico.especialidad[0].id;
          this.optionsObject.selectable = true;  
          this.eventsArray = [];          
          this.optionsObject.events = this.eventsArray; 
               
          this.jsonCitas.citaspormedico.forEach(cita => {
            console.log(cita);               
            this.addEvent(cita.horario.hora,cita.id,cita.paciente.nombre[0].nombrecompleto,
              cita.fecha,cita.tratamiento, cita.status.id);
          });
         
        }
        this.getDiasLibres(arrayMedico.id)
         
      })
      .catch((error) => {
        console.error(error);
      })
  }

  showModal(titulo,mensaje){
    $("#titlemodalalert").html(titulo);
    $("#mensaje").html(mensaje)
    $("#alertModal").modal();
  }

  getAllEspecialidades(){
    this.especialidadService.getAll()
    .then((response) => {
      console.log(response);  
      this.JsonAllEspecialidades = response;
      this.selectEsp(this.JsonAllEspecialidades.especialidades);       
        
      })
     .catch((error) => {
       console.error(error);
     })

  }

  selectMed(arraymeds){
   

    var selectmed = $("#selectmedico")

    selectmed.append('"<option value="0" disabled selected>Seleccione medico</option>"');
    arraymeds.forEach(med => {
      var option  = $("<option></option>");
      option.attr('value',med.id);
      option.html(med.nombre[0].nombrecompleto);
      selectmed.append(option);
    });

    
  }

  takeOffReadOnly(){
    $(".form-control").attr('readonly',false);
    $("#fecha").attr('readonly',true);
    $("#medico").attr('readonly',true);
  }

  validateEmail(email){
    var re = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
    return re.test(email)
  }

  addNewCita(fecha,medico,consultorio,dia,hora,usuario,appaterno,apmaterno,direccion,genero,fechanac,nombre,
    telcasap, telmovilp,teloficinap,emailpersonalp,emailtrabajop,nombrece,telcasae,telmovile,
    teloficinae,emailpersonale,emailtrabajoe,especialidad,tratamiento,start){
    if(tratamiento == ''){
      this.citasService.addNewCita(fecha,medico,consultorio,dia,hora,usuario,appaterno,apmaterno,direccion,genero,fechanac,nombre,
        telcasap, telmovilp,teloficinap,emailpersonalp,emailtrabajop,nombrece,telcasae,telmovile,
        teloficinae,emailpersonale,emailtrabajoe,especialidad,tratamiento)
      .then((response) => {
        console.log(response);
        
        this.messagefinal = response;
        if(this.messagefinal.status == 0){
          this.showModal('Exito', this.messagefinal.message);
          this.addEvent(start,this.messagefinal.newid,nombre,fecha,tratamiento,0)
         
  
          $("#addCitaModal").modal('hide');       
        }
        else if(this.messagefinal.status == 2){
         
          this.showModal('Error', this.messagefinal.errorMessage);
        }                    
        
      })
      .catch((error) => {
        console.error(error);
      })
    }
    else{
      this.citasService.addNewCita(fecha,medico,consultorio,dia,hora,usuario,appaterno,apmaterno,direccion,genero,fechanac,nombre,
        telcasap, telmovilp,teloficinap,emailpersonalp,emailtrabajop,nombrece,telcasae,telmovile,
        teloficinae,emailpersonale,emailtrabajoe,especialidad,tratamiento.id)
      .then((response) => {
        console.log(response);
        
        this.messagefinal = response;
        if(this.messagefinal.status == 0){
          this.showModal('Exito', this.messagefinal.message);
          this.addEvent(start,this.messagefinal.newid,nombre,fecha,tratamiento,0)
         
  
          $("#addCitaModal").modal('hide');       
        }
        else if(this.messagefinal.status == 2){
         
          this.showModal('Error', this.messagefinal.errorMessage);
        }                    
        
      })
      .catch((error) => {
        console.error(error);
      })
    }
   
  }

  getDiasLibres(idMedico){
    this.medicoService.getDiasLibres(idMedico)
    .then((response)=>{
      this.jsonDiasLibres = response;
      if(this.jsonDiasLibres.diaslibres.length >0 && this.jsonDiasLibres.status == 0){
        this.jsonDiasLibres.diaslibres.forEach(dialibre => {
          this.eventsArray.push({   
            id:'a'  ,                     
            title : 'Dia libre',
            start: dialibre.fecha + ' 07:00:00',
            end: dialibre.fecha + ' 20:00:00',
            backgroundColor : '#f1f1f1',
            textColor: '#007bff',
            borderColor: '#f1f1f1'
                
          })  
        });
       
      }
    })
    .catch((error) => {
      console.error(error);
    })

  }

  updateStatus(status,id, arrayMed){
    this.citasService.updateStatus(status,id)
    .then((response)=>{      
      this.eventsArray = [];          
      this.optionsObject.events = this.eventsArray;
      this.getCitasPorMedico(arrayMed);
    })
    .catch((error) => {
      console.error(error);
    })

  }

  businessHours(arraymedico){
    this.arrayHiddenDays = [0,1,2,3,4,5,6];       
    this.businHours = [];
    
    
    for(var i = 0; i<= 6;i++){          
      arraymedico.horario.forEach(horario => {
        if(horario.horaInicio.noDia == i){              
          console.log(i);
          var index = this.arrayHiddenDays.indexOf(i);
          this.arrayHiddenDays.splice(index,1)
          var hourIn = '';
          var hourFin = '';
          if(horario.horaInicio.hora < 10){
            hourIn = '0' + horario.horaInicio.hora.toString() + ':00'; 
          }
          else{
            hourIn = horario.horaInicio.hora.toString() + ':00';
          }
          if(horario.horaFinal.hora < 10){
            hourFin = '0' + horario.horaFinal.hora.toString() + ':00'; 
          }
          else{
            hourFin = horario.horaFinal.hora.toString() + ':00'; 
          }
          this.businHours.push({
            daysOfWeek : [i],
            startTime : hourIn,
            endTime : hourFin
          })
        }
      });
      
    }
    this.optionsObject.hiddenDays = this.arrayHiddenDays;
    
    this.optionsObject.businessHours = this.businHours;

    
    console.log(this.arrayHiddenDays);
    console.log(this.businHours)
  }

  automaticStatusChange(){    
    console.log(this.medicoEnSesion);
    var today = new Date();  
    var found = false;
    console.log("yeii");
    if(today.getDate() < 10 ){
      if((today.getMonth()+1) <10){
        var fecha = today.getFullYear() + "-0" + (today.getMonth() + 1) + "-0" + today.getDate();
      }
      else{
        var fecha = today.getFullYear() + "-" + (today.getMonth() + 1) + "-0" + today.getDate();
      }
     
    } 
    else{
      if((today.getMonth()+1) <10){
        var fecha = today.getFullYear() + "-0" + (today.getMonth() + 1) + "-" + today.getDate();
      }
      else{
        var fecha = today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
      }
    }       
    
    console.log(fecha);
    if(this.jsonCitas.citaspormedico != null || this.jsonCitas.citaspormedico != undefined){
      this.jsonCitas.citaspormedico.forEach(cita => {
        console.log(cita.fecha);
        console.log(cita.horario.hora);
        console.log(cita.status.id);
        if(cita.horario.hora <= today.getHours() && cita.fecha == fecha  && cita.status.id == 0){
          
          this.updateStatus('3',cita.id.toString(),this.medicoEnSesion)  
        }
        else if(cita.fecha == fecha && (cita.status.id == 3 || cita.status.id == 0)){
          if(cita.tratamiento != null){
            console.log("tratamiento")              
            var total = (cita.horario.hora + cita.tratamiento.duracion)
            if(today.getHours() >= total){
              this.updateStatus('2',cita.id.toString(),this.medicoEnSesion)
            }
          }
          else{
            if((today.getHours()-1) >= cita.horario.hora){
              this.updateStatus('2',cita.id.toString(),this.medicoEnSesion)
            }
          }
        }
      });     
    }
    else{
      console.log("No hay citas");
    }
   
    
  }

  
  
 





 

 

 

} 
