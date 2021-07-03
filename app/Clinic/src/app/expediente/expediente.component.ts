import { Component, OnInit } from '@angular/core';
declare var $:any;
@Component({
  selector: 'app-expediente',
  templateUrl: './expediente.component.html',
  styleUrls: ['./expediente.component.css']
})
export class ExpedienteComponent implements OnInit {
  private user;
  constructor() { }

  ngOnInit(): void {

    if(sessionStorage.loggedIn == 'true'){
      this.user = JSON.parse(sessionStorage.userInfo); //pass the response to a va
      $("#usernameL").html(this.user.nombre);
      $("#userrole").html(this.user.roles[0].nombre);
      $("#exiticon").attr("class","fas fa-sign-out-alt");
      this.menu(this.user.menu);  
      

      
    }else{
      window.location.href = '';
    }
    //logout
    $("#exit").click(()=>{
      this.logout();
    });
    var body = document.getElementsByTagName('body');
    body[0].style.backgroundColor='#ECEFF1';
    $("#addAl").click(()=>{
      this.add(1);
    })  
    $("#addAP").click(()=>{
      this.add(2);
    })  
    $("#addANP").click(()=>{
      this.add(3);
    })  
    $("#addAH").click(()=>{
      this.add(4);
    })  

    $("#antecedentesModal").on("hidden.bs.modal", ()=>{
      $("#firstbox").val('')
      $("#secondbox").val('')      
    });
  }

  add(from){
    switch(from){
      case 1:   
        $("#agregar").off('click');                 
        this.showModalAnte('Agregar alergias','A medicamentos...','Otras alergias...');
        $("#agregar").click(()=>{
          if($("#firstbox").val() != '' && $("#firstbox").val() != null){
            
            var etiqueta = document.createElement('h6');
            etiqueta.innerHTML = '&nbsp - ' + $("#firstbox").val();
            etiqueta.style.color = '#f80000'
            $("#AMedicamentos").append(etiqueta);
            $("#firstbox").val('');
            document.getElementById('animagregado').style.display = 'block';
            setTimeout(()=>{ document.getElementById('animagregado').style.display = 'none';},1000)
            
          }
          if($("#secondbox").val() != '' && $("#secondbox").val() != null){
            
            var etiqueta = document.createElement('h6');
            etiqueta.innerHTML = '&nbsp - ' + $("#secondbox").val();
            etiqueta.style.color = '#f80000'
            $("#AGenerales").append(etiqueta);
            $("#secondbox").val('');
            document.getElementById('animagregado').style.display = 'block';
            setTimeout(()=>{ document.getElementById('animagregado').style.display = 'none';},1000)
          }
          
        })  
        break;
      case 2:
        $("#agregar").off('click'); 
        this.showModalAnte('Agregar antecedentes patologicos','Nombre','Descripcion');
        this.addAntecedentes("#antecedentesPatologicos");
        break;
      case 3:
        $("#agregar").off('click'); 
        this.showModalAnte('Agregar antecedentes no patologicos','Nombre','Descripcion');
        this.addAntecedentes("#antecedentesNoPatologicos");
        break;
      case 4:
        $("#agregar").off('click'); 
        this.showModalAnte('Agregar antecedentes heredofamiliares','Nombre','Descripcion');
        this.addAntecedentes("#antecedentesHeredoFamiliares")
        break;
    }
  }

  showModalAnte(titulo,phfirst,phsecond){       
    $("#titlemodalante").html(titulo);    
    $("#firstbox").attr('placeholder',phfirst);
    $("#secondbox").attr('placeholder',phsecond);  
    $("#antecedentesModal").modal();
  }

  addAntecedentes(divid){
    $("#agregar").click(()=>{
      if($("#firstbox").val() != '' && $("#firstbox").val() != null && $("#secondbox").val() != '' && $("#secondbox").val() != null){
        
        var row = document.createElement('div');
        row.className = 'row';
        row.style.borderBottom = 'solid 1px #e0dddd';

        var nombre = document.createElement('div');
        nombre.className = 'col-xl-6';
        var etiquetanombre = document.createElement('h6');
        etiquetanombre.innerHTML = $("#firstbox").val();
        nombre.appendChild(etiquetanombre);

        var descripcion = document.createElement('div');
        descripcion.className = 'col-xl-6';
        var etiquetadescripcion = document.createElement('h6');
        etiquetadescripcion.innerHTML = $("#secondbox").val();
        descripcion.appendChild(etiquetadescripcion);

        row.appendChild(nombre)
        row.appendChild(descripcion);

        $(divid).append(row)

        document.getElementById('animagregado').style.display = 'block';
        setTimeout(()=>{ document.getElementById('animagregado').style.display = 'none';},1000)
        $("#firstbox").val('');
        $("#secondbox").val('');
      }
     
      
    })  
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
  //logout
  logout() {
  sessionStorage.loggedIn = false;
  sessionStorage.removeItem(sessionStorage.userInfo);
  sessionStorage.removeItem(sessionStorage.previousPage);
  $(".nav-item nav-link").remove();
  window.location.href = '';
  

}

}
