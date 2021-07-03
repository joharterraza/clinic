import { Component, OnInit } from '@angular/core';

import { idText } from 'typescript';
import { IcdService } from '../services/icd.service';

declare var $:any;


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})


export class HomeComponent implements OnInit {

 
  constructor(private icd11Service : IcdService) { }

  jsonIcd : any;
  jsonSearch : any; 
  currentLanguage = "en";
  



  ngOnInit(){
   
    this.setLanguage();
    this.changeLanguage();
    
    this.getAll();    
    
   

   /*
   document.getElementById("logout").onclick = () =>{
     this.logout();
   }
   */
   
   
  }

  //diseases
  getAll(){
    this.icd11Service.getAll()
    .then( (result) => {   
      
      this.jsonIcd = result;
      console.log(this.jsonIcd.icd11.length);
      
      $("#chapList").empty();
      //first lvl
      this.jsonIcd.icd11.forEach(chap => {
        
         
        //create chapters
        if(chap.level == 0){
            var lic = document.createElement("li");
          lic.setAttribute("id", chap.id + "li"); 
          lic.setAttribute("class", chap.level + "li");  
          lic.style.fontSize = "12pt"; 
          lic.style.cursor = "pointer";  
            
          
          var p = document.createElement("p");   
          p.setAttribute("id", chap.id + "p");  
          p.setAttribute("class", chap.level );  
          if(this.currentLanguage == "es"){
            p.innerHTML = chap.id + " " + chap.titulo;
          }
          else{
            p.innerHTML = chap.id + " " + chap.title;
          }
          
          //hover
          p.onmouseover= function(){p.style.background='#FFF'; p.style.color='#7386D5'};
          p.onmouseleave = function(){p.style.background='#7386D5'; p.style.color='#FFF'};
          lic.appendChild(p);
          document.getElementById("chapList").appendChild(lic);

          //non-display list
          var ul = document.createElement("ul");
          ul.setAttribute("id",chap.id + "list");
          ul.style.display = "none";

          document.getElementById(chap.id + "li").appendChild(ul);

          //display when click
          $(p).click(()=>{
            if(ul.style.display === "none"){
              ul.style.display = "block";
            }
            else{
              ul.style.display = "none"
            }
          })
          
        }

        //for to populate list with all 8 levels
        setTimeout(()=>{
          for(var i = 1; i<=8;i++){
            
            if(chap.level==i){
              var lic = document.createElement("li");
              lic.setAttribute("id", chap.id + "li");   
              lic.setAttribute("class", chap.level);  
              lic.style.fontSize = "12pt"; 
              lic.style.cursor = "pointer";  
                
              
              var p = document.createElement("p");  
              p.setAttribute("id", chap.id + "p"); 
              p.setAttribute("class", chap.level );    
              p.onmouseover= function(){p.style.background='#FFF'; p.style.color='#7386D5'};
              p.onmouseleave = function(){p.style.background='#7386D5'; p.style.color='#FFF'}; 
              if(this.currentLanguage == "es"){
                p.innerHTML = chap.id + " " + chap.titulo;
              }
              else{
                p.innerHTML = chap.id + " " + chap.title;
              }
              
              
              lic.appendChild(p);
              $('[id="' + chap.parentId + "list" + '"]').append(lic);
              var ul = document.createElement("ul");
              ul.setAttribute("id",chap.id + "list");
              ul.style.display = "none";
    
              $(lic).append(ul);
    
              $(p).click(()=>{
                if(ul.style.display === "none"){
                  ul.style.display = "block";
                }
                else{
                  ul.style.display = "none"
                }
              })
            }
          }
        },100);  //time to not overload 
       
        
      });      
      this.search(); //search
    } )
    .catch( (error) => {console.error(error); } );
    
    
  }


  //change option language
  changeLanguage(){
    $("#languageoptions").click(()=>{
      if(this.currentLanguage == "es"){
        this.currentLanguage = "en";
        console.log(this.currentLanguage);
        this.setLanguage();
        this.getAll(); //get everything in spanish
      }
      else{
        this.currentLanguage = "es";
        console.log(this.currentLanguage);
        this.setLanguage();
        this.getAll(); //get everything in English
      }
    })
  }
  //set language in options 
  setLanguage(){
    if(this.currentLanguage == "es"){
     
     document.getElementById("dropdown09").innerHTML = "";
      document.getElementById("dropdown09").innerHTML = "ES Español";

     
      
     document.getElementById("languageoptions").innerHTML = ""
      document.getElementById("languageoptions").innerHTML = "EN English"; 
      $('#languageoptions').hover(function(){   
        $(this).css({ backgroundColor: '#E0E0E0', cursor : 'pointer'})
      },function(){
        $(this).css({ backgroundColor: 'white'});
      });
    }
    else{
     
     document.getElementById("dropdown09").innerHTML = "";
      document.getElementById("dropdown09").innerHTML = "EN English";

     
      
     document.getElementById("languageoptions").innerHTML = "";
      document.getElementById("languageoptions").innerHTML = "ES Español";

      $('#languageoptions').hover(function(){   
        $(this).css({ backgroundColor: '#E0E0E0', cursor : 'pointer'})
      },function(){
        $(this).css({ backgroundColor: 'white'});
      });
    }

    

    
  }

  //function to serach in an input text
  search(){
    var searchbox = $("#searchbox");
    searchbox.keyup((e)=>{
      var limit = 5; //just show 6/20
      console.log(e.target.value);
      
      //query eache time you write in the box
      if(e.target.value !=''){
        console.log(this.currentLanguage);
        //get search from the database
        this.getSearch(this.currentLanguage,e.target.value,limit);       
      }
      else{
        $(".suggestions").empty();
        var ul = document.getElementsByTagName("ul");
        for(var i = 0;i<ul.length;i++){
          if(ul[i].id != "chapList"){
            ul[i].style.display = "none";
          }
        }
      }
      
     
     
      
    })
  }
  
  //search query
  getSearch(language,inputvalue,limit){
    
    this.icd11Service.getSearch(language,inputvalue)
    .then( (result) => { 
      $(".suggestions").empty();
      this.jsonSearch = result;
      //show message if there are no results
      if(this.jsonSearch.icd11.length == 0){
         var message = document.createElement("div");
         if(language == 'en'){
          message.innerHTML = "No results found";
         }
         else{
          message.innerHTML = "Resultados no encontrados";
         }
        
        this.styleToDiv(message);
        $(message).css({color: "red"})
        $(".suggestions").append(message);
      }else{
        for(var i = 0;i<=limit;i++){
          console.log(this.jsonSearch.icd11[i])
          
          //create suggestions
          var div = document.createElement("div");
          div.setAttribute("id", this.jsonSearch.icd11[i].id);
          div.setAttribute("class", "option");
          
          //english/spanish
          if(language == 'en'){
            $(div).html(this.jsonSearch.icd11[i].id + " " +this.jsonSearch.icd11[i].title);
          }
          else{
            $(div).html(this.jsonSearch.icd11[i].id + " " +this.jsonSearch.icd11[i].titulo);
          }
         
          //apply styles to suggestions divs
          this.styleToDiv(div);
  
          //click in a suggestion
          $(div).click(function(e){
            
            console.log(e.target.id);
            var p = document.getElementsByTagName("p");
            //check all p element
            for(var i=0;i<p.length;i++){
              //compare input id and p id 
              if((e.target.id + "p") == p[i].id){   
                
                //change color to identify
                p[i].style.background='#FFF';   
                p[i].style.color='#7386D5';        
                //get lvl in int
                var lvl = parseInt($(p[i]).attr('class'));
                console.log(lvl);
                var first = p[i];
                //open list until chapters
                do{
                  console.log(first.closest("ul"));
                  first.closest("ul").style.display = "block";
                  console.log(first.closest("ul").parentElement);
                  first = ((first.closest("ul")).parentElement as HTMLParagraphElement)
                  
                  lvl--;
                }while(lvl>0);                
                
              }

            }
            //empty suggestion list
            $(".suggestions").empty();

            //scroll to choosen option
            var target_offset = $('[id="' + e.target.id + "li" + '"]').offset();
            
           
            console.log(target_offset);
            var target_top = target_offset.top;
            $('#sidebar').animate({
                scrollTop: (target_top-130)
            }, 700);
          })
          
          $(".suggestions").append($(div));
          
        }

        //if there are more options than the limit to show, show a message
        if(this.jsonSearch.icd11.length > limit){
          var message = document.createElement("div");
          if(language == 'en'){
            message.innerHTML = "...Resuls shown are incomplete, please specify more";
          }
          else{
            message.innerHTML = "...Los resultados estan incompletos, favor de especificar";
          }
          
          this.styleToDiv(message);
          $(message).css({color: "red"})
          $(".suggestions").append(message);
        }
      }
      

     
    })
    .catch( (error) => {console.error(error); } );
  }

 

  //style to suggestion divs
  styleToDiv(div){
    $(div).css({
      backgroundColor : "white",
      color : "black",
      cursor : "pointer",
      border: "1px solid #666",
      padding: "5px",
      'font-size': '12px' 
     
    })  

    $(div).hover(function(){   
      $(this).css({ backgroundColor: '#E0E0E0'})
    },function(){
      $(this).css({ backgroundColor: 'white'});
    });
   
  }




  /*
  logout() {
    sessionStorage.loggedIn = false;
    sessionStorage.removeItem(sessionStorage.userInfo);
    sessionStorage.removeItem(sessionStorage.previousPage);
    window.location.href = '';

  }

  */
  
  
  




  
 

  








 
  
  
  



  
}
 







