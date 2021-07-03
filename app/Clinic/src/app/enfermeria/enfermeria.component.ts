import { Component, OnInit } from '@angular/core';
import { PacienteService } from '../services/paciente.service';
import { MedicoService } from '../services/medico.service';
import { CitaService } from '../services/cita.service';
import { Router, ActivatedRoute } from '@angular/router';


declare var $:any;

@Component({
  selector: 'app-enfermeria',
  templateUrl: './enfermeria.component.html',
  styleUrls: ['./enfermeria.component.css']
})
export class EnfermeriaComponent implements OnInit {

  protected pacientes = [];
  protected user;
  protected medicos;
  protected citas;


  constructor(
    private medicoService : MedicoService,
    private pacienteService : PacienteService,
    private citaService: CitaService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(){
       //if is already logged in
    
    if(sessionStorage.loggedIn == 'true'){
      this.user = JSON.parse(sessionStorage.userInfo); //pass the response to a va
      $("#usernameL").html(this.user.nombre);
      $("#userrole").html(this.user.roles[0].nombre);
      $("#exiticon").attr("class","fas fa-sign-out-alt");
      this.menu(this.user.menu);  
      this.checkRoles(this.user.roles[0].id,this.user.id);

      
    }else{
      window.location.href = '';
    }
    //logout
    $("#exit").click(()=>{
      this.logout();
    });
    
    
     
  }

  fillTable(idMed,rol){
    $("#tbody").empty();
    this.citaService.getCitas(idMed)
    .then((response) => {
      this.citas = response;
      //fecha de hoy
      var today = new Date();  
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
      //termina fecha de hoy
      
      this.citas.citaspormedico.forEach(cita => {
        console.log(cita.fecha);
        if(cita.fecha == fecha /*&& cita.horario.hora >= today.getHours() && cita.status.id!=1*/){
          
          var newrow = document.createElement('tr');
          var tdpaciente = document.createElement('td');
          var tdsexo = document.createElement('td');
          var tdedad = document.createElement('td');
          var tdhora = document.createElement('td');
          var tdicon = document.createElement('td');
          var img = document.createElement('img');


          tdpaciente.innerHTML = cita.paciente.nombre[0].nombrecompleto;
          newrow.appendChild(tdpaciente);
          tdsexo.innerHTML = cita.paciente.genero;
          newrow.appendChild(tdsexo);
          tdedad.innerHTML = cita.paciente.edad+" años";
          newrow.appendChild(tdedad);
          if(cita.horario.hora<12){
            tdhora.innerHTML = cita.horario.hora+":00 am";
          }
          else{
            tdhora.innerHTML = cita.horario.hora+":00 pm";
          }
          
          newrow.appendChild(tdhora);
          
          if(rol == 'ASIST'){
            img.src='../../assets/patient.png';
            $(img).on("click", ()=>{
              window.location.href = 'exploracion/paciente/' + cita.paciente.id;
            })
          }
          else if(rol == 'MED'){
            img.src='../../assets/expediente.png';
            $(img).on("click", ()=>{
              window.location.href = 'expediente/paciente/' + cita.paciente.id;
            })
          }
          

          $(img).css({
            position: 'relative',
	          'max-width': '50px',
	          float: 'left',
            'margin-right': '15px',
            cursor: 'pointer'
          })
          tdicon.appendChild(img);
          newrow.appendChild(tdicon);
          document.getElementById('tbody').appendChild(newrow);
        }
      });
    })
    .catch((error)=> {
      console.log(error);
    })
  }






  fillMed(){
    this.medicoService.getAll()
    .then((response) =>{
      this.medicos = response;
      this.medicos.medicos.forEach(medico => {
        var option = document.createElement('option');
        option.value = medico.id;
        option.text = medico.nombre[0].nombrecompleto;
        document.getElementById('selectmedico2').appendChild(option);
        
      });
    })
    .catch((error) =>{
      console.log(error);
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

  checkRoles(idRole,idUs){
    
    if(idRole == 'ASIST'){
      $("#selectmedico2").show()
      this.fillMed();

      $("#selectmedico2").on("change", () =>{
        this.fillTable($("#selectmedico2").val(), idRole);
      })
    }
    else if(idRole == 'MED'){
      $("#selectmedico2").hide();
     this.medicoService.getMedicoPorUsuario(idUs)
     .then((response)=>{
      this.medicos = response;
      this.fillTable(this.medicos.medico[0].id,idRole)
     })
     .catch((error)=>{console.log(error)})
    }
  }

}
