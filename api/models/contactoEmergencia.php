<?php

    //required files
    require_once('mysqlconnection.php');
    require_once('contacto.php');
   
    require_once('exceptions/recordnotfoundexception.php');
    require_once('config/json.php');

    Class ContactoEmergencia{
        private $id;
        private $nombre;
        private $contacto;
        

        public function setContacto($contacto) { $this->contacto = $contacto; }
        public function getContacto() { return $this->contacto; }
        public function setId($id) { $this->id = $id; }
        public function getId() { return $this->id; }
        public function setNombre($nombre) { $this->nombre = $nombre; }
        public function getNombre() { return $this->nombre; }
       


        public function __construct() {
            $arguments = func_get_args();
            if(func_num_args()==0){
                $this->id=0;
                $this->nombre='';
                $this->contacto=new Contacto();
                
            }
            if(func_num_args() == 1){
                $arguments = func_get_args();
                $query = 'select id, nombre, idContacto from contactosEmergencia where id = ?;';
                $connection = MySqlConnection::getConnection();
                $command =$connection->prepare($query);
                $command->bind_param('i', $arguments[0]);
                $command->bind_result( $id, $nombre, $idContactoC);
                $command->execute();

                if($command->fetch()){
                   
                    $this->id = $id;
                    $this->nombre = $nombre;
                    $contacto = new Contacto($idContactoC);
                    $this->contacto = $contacto;
                    
                }else {
                    throw new RecordNotFoundException($arguments[0]);
                    mysqli_stmt_close($command);
                    $connection->close();
                }
            }

            if(func_num_args()==3) {
                $this->id=$arguments[0];
                $this->nombre=$arguments[1];
                $this->contacto=$arguments[2];
               
            }
        }
        public function toJson(){
            return json_encode(array(
                'id'=> $this->id,
                'nombre'=> $this->nombre,
                'contacto' => json_decode($this->contacto->toJson())
                
            ));
        }

        public static function getContactoEmergenciaByPaciente($idPaciente) {
            $list = array(); //create list
            $connection = MySqlConnection::getConnection();//get connection
			$query = 'select id, nombre, idContacto from contactosEmergencia where idPaciente = ?;';//query
            $command = $connection->prepare($query);//prepare statement
            $command->bind_param('i', $idPaciente);			
            $command->bind_result(
                $id, $nombre,
                $idContactoC);//bind results
            $command->execute();//execute
            //fetch data
			while ($command->fetch()) {
                $contacto = new Contacto($idContactoC);              
				array_push($list, new ContactoEmergencia($id,$nombre, $contacto));//add item to list
            }
            mysqli_stmt_close($command); //close command
            $connection->close(); //close connection
            return $list; //return list
        }

        public function addContactoEmergencia($idPaciente) { 
            $connection = MySqlConnection::getConnection();//get connection 
            $query = 'insert into contactosEmergencia(idPaciente, nombre, idContacto) values
            (?,?,?)';//query 
            $command = $connection->prepare($query);//prepare statement 
            $command->bind_param('isi', $idPaciente, $this->nombre, $this->contacto); //bind parameters 
            $result = $command->execute();//execute mysqli_stmt_close($command); //close command 
            $connection->close(); //close connection 
            return $result; //return result 
        }
    }
?>