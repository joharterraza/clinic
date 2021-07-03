<?php
    //required files
    require_once('mysqlconnection.php');
    require_once('exceptions/recordnotfoundexception.php');
    require_once('config/json.php');


    class Persona{
        protected $nombre;
        protected $apPaterno;
        protected $apMaterno;
        
        public function setNombre($nombre) { $this->nombre = $nombre; }
        public function getNombre() { return $this->nombre; }
        public function setApPaterno($apPaterno) { $this->apPaterno = $apPaterno; }
        public function getApPaterno() { return $this->apPaterno; }
        public function setApMaterno($apMaterno) { $this->apMaterno = $apMaterno; }
        public function getApMaterno() { return $this->apMaterno; }


        public function __construct(){
            $arguments = func_get_args();
            //empty obj
            if(func_num_args()==0){
                $this->nombre = "";
                $this->apPaterno = "";
                $this->apMaterno = "";
               
            }         
            
            if(func_num_args()==3){
                
                $this->nombre = $arguments[0];
                $this->apPaterno = $arguments[1];
                $this->apMaterno = $arguments[2];
                        
                
            }
           
        }

        public function toJson(){
         
            return json_encode(array(
                'nombrecompleto'=>$this->nombre." ".$this->apPaterno." ".$this->apMaterno          
            ));
        
        }

       
        
       
    }
    
?>