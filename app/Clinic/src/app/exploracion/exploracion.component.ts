import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PacienteService } from '../services/paciente.service';


declare var $:any;

@Component({
  selector: 'app-exploracion',
  templateUrl: './exploracion.component.html',
  styleUrls: ['./exploracion.component.css']
})
export class ExploracionComponent implements OnInit {
  id;
  protected user;
  private paciente;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private pacienteService: PacienteService
  ) { 
    this.activatedRoute.params.subscribe((params) => { 
      console.log(params);
      this.id= params.id;      
    });
  }

  ngOnInit(){
    console.log(this.id);
    var body = document.getElementsByTagName('body');
    body[0].style.backgroundColor='#ECEFF1';
    if(sessionStorage.loggedIn == 'true'){
      this.user = JSON.parse(sessionStorage.userInfo); //pass the response to a va
      $("#usernameL").html(this.user.nombre);
      $("#userrole").html(this.user.roles[0].nombre);
      $("#exiticon").attr("class","fas fa-sign-out-alt");
      this.menu(this.user.menu);
      $(".pacientdata").append("&nbsp;");
      this.datosPersonales(this.id);

        
    }else{
      window.location.href = '';
    }
    //logout
    $("#exit").click(()=>{
      this.logout();
    });
      
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

  datosPersonales(id){
    this.pacienteService.getPacientesPorId(id)
    .then((response)=>{
      $('.pacientdata').html('');
      this.paciente = response;
      //datos principales
      $("#nombre").html("&nbsp" + this.paciente.paciente.nombre[0].nombrecompleto );
      $("#edad").html("&nbsp" + this.paciente.paciente.edad + " años");
      $("#fechanac").html("&nbsp" + this.paciente.paciente.fechanac);
      $("#sexo").html("&nbsp" + this.paciente.paciente.genero);
      $("#direccion").html("&nbsp" + this.paciente.paciente.direccion);

      //contacto
      $("#telc").html("&nbsp" + this.paciente.paciente.contacto.telefono.casa);
      $("#telm").html("&nbsp" + this.paciente.paciente.contacto.telefono.movil);
      if(this.paciente.paciente.contacto.telefono.oficina == 0){
        $("#telo").html("&nbsp");
      }
      else{
        $("#telo").html("&nbsp" + this.paciente.paciente.contacto.telefono.oficina);  
      }     
      $("#emailp").html("&nbsp" + this.paciente.paciente.contacto.email.personal);
      $("#emailt").html("&nbsp" + this.paciente.paciente.contacto.email.trabajo);

      //contactoemergencia
      $("#nombrece").html(this.paciente.paciente.contactoEmergencia[0].nombre);
      $("#telcce").html("&nbsp" + this.paciente.paciente.contactoEmergencia[0].contacto.telefono.casa);
      $("#telmce").html("&nbsp" + this.paciente.paciente.contactoEmergencia[0].contacto.telefono.movil);
      if(this.paciente.paciente.contactoEmergencia[0].contacto.telefono.oficina == 0){
        $("#teloce").html("&nbsp");
      }
      else{
        $("#teloce").html("&nbsp" + this.paciente.paciente.contactoEmergencia[0].contacto.telefono.oficina);  
      }     
      $("#emailpce").html("&nbsp" + this.paciente.paciente.contactoEmergencia[0].contacto.email.personal);
      $("#emailtce").html("&nbsp" + this.paciente.paciente.contactoEmergencia[0].contacto.email.trabajo);

    })
    .catch((error)=>{console.log(error)})
  }

 
  

}
