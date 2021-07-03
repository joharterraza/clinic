import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UsuariosService } from '../services/usuarios.service';
import {SignupService} from '../services/signup.service';
import {MedicoService} from '../services/medico.service';

declare var $:any;
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  private name;
  private pass;
  private medic = true;
  private asist = false;
  private message;
  private especialidades;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private usuarioService : UsuariosService,
    private signupService : SignupService,
    private medicoService : MedicoService
  ) { }


  ngOnInit(): void {
   
    $(document).on('show.bs.modal', '.modal', function (event) {
      var zIndex = 1040 + (10 * $('.modal:visible').length);
      $(this).css('z-index', zIndex);
      setTimeout(function() {
          $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
      }, 0);
    });



    
   
    this.name = document.getElementById('username');
    this.pass= document.getElementById('password');

    
   
    document.getElementById("btnlogin").onclick =  ()=>{
      this.signin();
    }

  }


  
  

  signin(){
    console.log("Login");
    
    var name = this.name.value;
    var password = this.pass.value;
      this.loginUser(name,password);
    
  }
  

  //consuming service
  loginUser(username, password){
    this.usuarioService.login(username,password)
    .then( (result) => {
         
      console.log(result);
      this.saveUser(result)
    } )
    .catch( (error) => {console.log(error); } )
  }

  
  saveUser(data){
    console.log(data);
    if(data.status == 0 ){
        sessionStorage.loggedIn = true;
        sessionStorage.userInfo = JSON.stringify(data.user);
        var check = JSON.parse(sessionStorage.userInfo);
        if(check.roles[0].id != 'SA'){
          window.location.href = 'agenda'
        }
        else{
          window.location.href = 'admin'
        }
    }
    else{
      this.showModal('Error','Usuario o contraseña incorrectos')
    }
    
  }

  
  showModal(titulo,mensaje){
    $("#titlemodalalert").html(titulo);
    $("#mensaje").html(mensaje)
    $("#alertModal").modal();
  }
  
  
  

}
