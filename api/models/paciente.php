<?php

    require_once('contacto.php');
    require_once('persona.php');
    require_once('contactoEmergencia.php');
    require_once('mysqlconnection.php');
    require_once('exceptions/recordnotfoundexception.php');
    require_once('config/json.php');

    class Paciente extends Persona{
        private $id;  
        private $genero;
        private $fechanac;  
        private $direccion;    
        private $contacto;
       

        public function getId() {return $this->id;}
        public function setId($id) {$this->id=$id;}       
        public function getGenero() {return $this->genero;}
        public function setGenero($genero) {$this->genero=$genero;} 
        public function getFechaNac() {return $this->fechanac;}
        public function setFechaNac($fechanac) {$this->fechanac=$fechanac;}      
        public function setContacto($contacto) { $this->contacto = $contacto; }
        public function getContacto() { return $this->contacto; }
        public function setDireccion($direccion) { $this->direccion = $direccion; }
        public function getDireccion() { return $this->direccion; }

        private function getAge(){
        
            if($this->fechanac != null){
                $birthdate = new DateTime($this->fechanac);
                $today   = new DateTime('today');
                $age = $birthdate->diff($today)->y;
                return $age;
            }
            else{
                return null;
            }
          
        }
       

        public function __construct(){
            $arguments = func_get_args();
            if(func_num_args()==0){
                $this->id = 0;   
                $this->genero = '';
                $this->fechanac = '';
                $this->direccion = '';                 
                $this->contacto = new Contacto();
               
            }
            if(func_num_args() == 1){
                $arguments = func_get_args();
                $query = 'select id, sexo, fechaNac, direccion, idContacto from pacientes where id = ?';
                $connection = MySqlConnection::getConnection();
                $command =$connection->prepare($query);
                $command->bind_param('i', $arguments[0]);
                $command->bind_result($id,$genero,$fechanac,$direccion, $idcontacto);
                $command->execute();

                if($command->fetch()){
                    $contacto = new Contacto($idcontacto);
                    $this->id = $id;
                    $this->genero = $genero;
                    $this->fechanac = $fechanac;
                    $this->direccion = $direccion;
                    $this->contacto = $contacto;
                    
                }else {
                    throw new RecordNotFoundException($arguments[0]);
                    mysqli_stmt_close($command);
                    $connection->close();
                }
            }

            if(func_num_args() == 2){
                $arguments = func_get_args();
                $query = 'select id,sexo,fechaNac, direccion from pacientes where id = ? && direccion = ?';
                $connection = MySqlConnection::getConnection();
                $command =$connection->prepare($query);
                $command->bind_param('is', $arguments[0], $arguments[1]);
                $command->bind_result($id,$genero,$fechanac,$direccion);
                $command->execute();

                if($command->fetch()){
                   
                    $this->id = $id;
                    $this->genero = $genero;
                    $this->fechanac = $fechanac;
                    $this->direccion = $direccion;
                   
                    
                }else {
                    throw new RecordNotFoundException($arguments[0]);
                    mysqli_stmt_close($command);
                    $connection->close();
                }
            }

           

            if(func_num_args()==5){
                $this->id = $arguments[0]; 
                $this->genero = $arguments[1];
                $this->fechanac = $arguments[2];  
                $this->direccion = $arguments[3];               
                $this->contacto = $arguments[4];
                
            }
        }

        public function toJson(){
         
            if($this->contacto == null){
                return json_encode(array(
                    'id'=>$this->id,                       
                    'nombre'=>Json::listToArray(Paciente::getName()),  
                    'genero'=>$this->genero,  
                    'fechanac'=>$this->fechanac,
                    'edad'=>$this->getAge(),
                    'direccion'=>$this->direccion                     
                    
                )); 
            }
            else{
                return json_encode(array(
                    'id'=>$this->id,  
                    'nombre'=>Json::listToArray(Paciente::getName()),  
                    'genero'=>$this->genero,  
                    'fechanac'=>$this->fechanac,
                    'edad'=>$this->getAge(),
                    'direccion'=>$this->direccion,             
                    'contacto' => json_decode($this->contacto->toJson()),
                    'contactoEmergencia'=>Json::listToArray(ContactoEmergencia::getContactoEmergenciaByPaciente($this->id))
                             
                    
                ));
            }
          
        }



        public static function getAll(){
            $list = array();
            $query='select id,sexo,fechaNac,direccion,idContacto from pacientes';
            $connection = MySqlConnection::getConnection();
            $command = $connection->prepare($query);
            $command->execute();
            $command->bind_result(
                $id,
                $genero,
                $fechanac,
                $direccion,
                $idContacto);
            while($command->fetch()){
                $contacto = new Contacto($idContacto);               
                array_push($list, new Paciente($id,$genero,$fechanac,$direccion,$contacto));
            }
            mysqli_stmt_close($command);
            $connection->close();
            return $list;

        }

         //get paciente name
         public function getName(){
            $list = array(); //array
            $query = 'select nombre, apellidoPaterno, apellidoMaterno from pacientes where id = ?'; //query
            $connection = MySqlConnection::getConnection();
            $command = $connection->prepare($query);
            $command->bind_param('i', $this->id);
            $command->bind_result($nombre, $apPaterno, $apMaterno);
            $command->execute();

            //read result
            while($command->fetch()){
                array_push($list, new Persona($nombre, $apPaterno, $apMaterno));
            }
            mysqli_stmt_close($command);
            $connection->close();
            return $list;
        }

        public function addPaciente() { 
            $connection = MySqlConnection::getConnection();//get connection 
            $query = 'insert into pacientes (apellidoPaterno, apellidoMaterno, nombre, sexo, fechaNac,direccion, idContacto) values
            (?,?,?,?,?,?,?)';//query 
            $command = $connection->prepare($query);//prepare statement 
            $command->bind_param('ssssssi', $this->apPaterno, $this->apMaterno, $this->nombre,$this->genero,$this->fechanac,$this->direccion, $this->contacto); //bind parameters 
            $result = $command->execute();//execute mysqli_stmt_close($command); //close command 
            $connection->close(); //close connection 
            return $result; //return result 
        }

        public function getLastPacienteId(){
            $last = 0; //create list
            $connection = MySqlConnection::getConnection();//get connection
            $query = 'select id from pacientes order by id desc limit 1';//query
            $command = $connection->prepare($query);//prepare statement           
			$command->execute();//execute
            $command->bind_result($lastId);//bind results
            //fetch data
			while ($command->fetch()) {
				$last = $lastId;
            }
            mysqli_stmt_close($command); //close command
            $connection->close(); //close connection
            return $last; //return list
        }

        public static function getPacientesByName($word){
            $list = array();
            $query="select id,sexo,fechaNac, direccion, idContacto 
            from pacientes 
            where apellidoPaterno like '%".$word."%'  
            or apellidoMaterno like '%".$word."%'
            or nombre like '%".$word."%'";
            $connection = MySqlConnection::getConnection();
            $command = $connection->prepare($query);
            $command->execute();
            $command->bind_result(
                $id,
                $genero,
                $fechanac,
                $direccion,
                $idContacto);
            while($command->fetch()){
                $contacto = new Contacto($idContacto);               
                array_push($list, new Paciente($id,$genero,$fechanac,$direccion,$contacto));
            }
            mysqli_stmt_close($command);
            $connection->close();
            return $list;

        }





    }
    

?>