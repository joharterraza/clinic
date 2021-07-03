<?php

    require_once('contacto.php');
    require_once('especialidad.php');
    require_once('usuario.php');
    require_once('persona.php');
    require_once('horarioMedico.php');
    require_once('mysqlconnection.php');
    require_once('exceptions/recordnotfoundexception.php');
    require_once('config/json.php');

    class Medico extends Persona{
        private $id;
        private $cedula_profesional;
        private $contacto;
        private $usuario;

        public function getId() {return $this->id;}
        public function setId($id) {$this->id=$id;}
        public function setCedula_profesional($cedula_profesional) { $this->cedula_profesional = $cedula_profesional; }
        public function getCedula_profesional() { return $this->cedula_profesional; }
        public function setContacto($contacto) { $this->contacto = $contacto; }
        public function getContacto() { return $this->contacto; }
        public function setUsuario($usuario) { $this->usuario = $usuario; }
        public function getUsuario() { return $this->usuario; }

        public function __construct(){
            $arguments = func_get_args();
            if(func_num_args()==0){
                $this->id = 0;
                $this->cedula_profesional = '';
                $this->contacto = new Contacto();
                $this->usuario = new Usuario();
            }

            if(func_num_args() == 1){
                $arguments = func_get_args();
                $query = 'select id, cedulaProfesional, idContacto, idUsuario from medicos where id= ?';
                $connection = MySqlConnection::getConnection();
                $command =$connection->prepare($query);
                $command->bind_param('i', $arguments[0]);
                $command->bind_result($id, $cedula_profesional, $idcontacto, $idusuario);
                $command->execute();

                if($command->fetch()){
                    $contacto = new Contacto($idcontacto);
                    $usuario = new Usuario($idusuario);
                    $this->id = $id;
                    $this->cedula_profesional = $cedula_profesional;
                    $this->contacto = $contacto;
                    $this->usuario = $usuario;
                }else {
                    throw new RecordNotFoundException($arguments[0]);
                    mysqli_stmt_close($command);
                    $connection->close();
                }
            }
            if(func_num_args() == 2){
                $arguments = func_get_args();
                $query = 'select m.id, m.idUsuario, u.nombre, u.foto from medicos as m
                join usuarios as u on m.idUsuario = u.id 
                where m.id = ? && m.idUsuario = ?';
                $connection = MySqlConnection::getConnection();
                $command =$connection->prepare($query);
                $command->bind_param('is', $arguments[0], $arguments[1]);
                $command->bind_result($id,$idusuario, $nombreUsuario, $fotoUsuario);
                $command->execute();

                if($command->fetch()){
                   
                    $usuario = new Usuario($idusuario,$nombreUsuario,$fotoUsuario);  
                    $this->id = $id;               
                    $this->usuario = $usuario;
                }else {
                    throw new RecordNotFoundException($arguments[0]);
                    mysqli_stmt_close($command);
                    $connection->close();
                }
            }

            if(func_num_args()==4){
                $this->id = $arguments[0];
                $this->cedula_profesional = $arguments[1];
                $this->contacto = $arguments[2];
                $this->usuario = $arguments[3];
            }
        }

        public function toJson(){
            if($this->contacto == null){
                return json_encode(array(
                    'id'=>$this->id,
                    'nombre'=>Json::listToArray(Medico::getName()),                   
                    'usuario'=>json_decode($this->usuario->toJson())                                  
                    
                )); 
            }
            else if($this->usuario == null){
                return json_encode(array(
                    'id'=>$this->id,
                    'nombre'=>Json::listToArray(Medico::getName()),
                    'cedulaprofesional'=>$this->cedula_profesional,
                    'especialidad' => Json::listToArray(Medico::getEspecialidad()),
                    'contacto' => json_decode($this->contacto->toJson()),                    
                    'horario'=>Json::listToArray(HorarioMedico::getHorarioByMedico($this->id)),                
                    
                ));
            }
            else{
                return json_encode(array(
                    'id'=>$this->id,
                    'nombre'=>Json::listToArray(Medico::getName()),
                    'cedulaprofesional'=>$this->cedula_profesional,
                    'especialidad' => Json::listToArray(Medico::getEspecialidad()),
                    'contacto' => json_decode($this->contacto->toJson()),
                    'usuario'=>json_decode($this->usuario->toJson()),
                    'horario'=>Json::listToArray(HorarioMedico::getHorarioByMedico($this->id)),                
                    
                ));
            }
           
        }



        public static function getAll(){
            $list = array();
            $query='select id, cedulaProfesional, idContacto, idUsuario from medicos';
            $connection = MySqlConnection::getConnection();
            $command = $connection->prepare($query);
            $command->execute();
            $command->bind_result(
                $id,$cedula_profesional, 
                $idContacto, 
                $idUsuario);
            while($command->fetch()){
                $contacto = new Contacto($idContacto);
                $usuario = new Usuario($idUsuario);
                array_push($list, new Medico($id,$cedula_profesional, $contacto, $usuario));
            }
            mysqli_stmt_close($command);
            $connection->close();
            return $list;

        }

        //get medico name
        public function getName(){
            $list = array(); //array
            $query = 'select nombre, apellidoPaterno, apellidoMaterno from medicos where id = ?'; //query
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


        public function getEspecialidad() {
            $list = array(); //create list
            $connection = MySqlConnection::getConnection();//get connection
            $query = 'select es.id, es.descripcion
            from especialidades as es
            join medicoEspecialidad as me on me.idEspecialidad = es.id
            where me.idMedico = ?;';//query
            $command = $connection->prepare($query);//prepare statement
            $command->bind_param('i', $this->id);
			$command->execute();//execute
            $command->bind_result($id, $descripcion);//bind results
            //fetch data
			while ($command->fetch()) {
				array_push($list, new Especialidad($id, $descripcion));//add item to list
            }
            mysqli_stmt_close($command); //close command
            $connection->close(); //close connection
            return $list; //return list
        }

        public function addMedico() { 
            $connection = MySqlConnection::getConnection();//get connection 
            $query = 'insert into medicos (apellidoPaterno, apellidoMaterno, nombre, cedulaProfesional, idContacto, idUsuario) values
            (?,?,?,?,?,?);';//query 
            $command = $connection->prepare($query);//prepare statement 
            $command->bind_param('ssssis', $this->apPaterno, $this->apMaterno, $this->nombre, $this->cedula_profesional,$this->contacto,
            $this->usuario); //bind parameters 
            $result = $command->execute();//execute mysqli_stmt_close($command); //close command 
            $connection->close(); //close connection 
            return $result; //return result 
        }

        public function setEspecialidad($idMedico, $idEspecialidad) { 
            $connection = MySqlConnection::getConnection();//get connection 
            $query = 'insert into medicoEspecialidad(idMedico,idEspecialidad) values 
            (?,?);';//query 
            $command = $connection->prepare($query);//prepare statement 
            $command->bind_param('is', $idMedico,$idEspecialidad); //bind parameters 
            $result = $command->execute();//execute mysqli_stmt_close($command); //close command 
            $connection->close(); //close connection 
            return $result; //return result 
        }

        public function getLastMedicoId(){
            $last = 0; //create list
            $connection = MySqlConnection::getConnection();//get connection
            $query = 'select id from medicos order by id desc limit 1';//query
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

        public static function getMedicoByUsuario($idUs){
            $list = array();
            $query='select m.id, m.cedulaProfesional, m.idContacto, m.idUsuario 
            from medicos as m
            join usuarios as u on u.id = m.idUsuario
            where m.idUsuario = ?';
            $connection = MySqlConnection::getConnection();
            $command = $connection->prepare($query);
            $command->bind_param('s', $idUs);
            $command->execute();
            $command->bind_result(
                $id,$cedula_profesional, 
                $idContacto, 
                $idUsuario);
            while($command->fetch()){
                $contacto = new Contacto($idContacto);
                $usuario = null;
                array_push($list, new Medico($id,$cedula_profesional, $contacto,$usuario));
            }
            mysqli_stmt_close($command);
            $connection->close();
            return $list;

        }

        public static function getMedicoByEspecialidad($idEsp){
            $list = array();
            $query='select m.id, m.cedulaProfesional, m.idContacto, m.idUsuario 
            from medicos as m          
            join medicoEspecialidad as me on me.idMedico = m.id
            where me.idEspecialidad = ?';
            $connection = MySqlConnection::getConnection();
            $command = $connection->prepare($query);
            $command->bind_param('s', $idEsp);
            $command->execute();
            $command->bind_result(
                $id,$cedula_profesional, 
                $idContacto, 
                $idUsuario);
            while($command->fetch()){
                $contacto = new Contacto($idContacto);
                $usuario = null;
                array_push($list, new Medico($id,$cedula_profesional, $contacto,$usuario));
            }
            mysqli_stmt_close($command);
            $connection->close();
            return $list;

        }



    }

?>