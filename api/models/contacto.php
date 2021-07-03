<?php

    //required files
    require_once('mysqlconnection.php');
    require_once('exceptions/recordnotfoundexception.php');
    require_once('config/json.php');
    Class Contacto{
        private $id;
        private $telefonoCasa;
        private $telefonoMovil;
        private $telefonoOficina;
        private $emailPersonal;
        private $emailTrabajo;
        
        public function setId($id) { $this->id = $id; }
        public function getId() { return $this->id; }
        public function setTelefonoCasa($telefonoCasa) { $this->telefonoCasa = $telefonoCasa; }
        public function getTelefonoCasa() { return $this->telefonoCasa; }
        public function setTelefonoMovil($telefonoMovil) { $this->telefonoMovil = $telefonoMovil; }
        public function getTelefonoMovil() { return $this->telefonoMovil; }
        public function setTelefonoOficina($telefonoOficina) { $this->telefonoOficina = $telefonoOficina; }
        public function getTelefonoOficina() { return $this->telefonoOficina; }
        public function setEmailPersonal($emailPersonal) { $this->emailPersonal = $emailPersonal; }
        public function getEmailPersonal() { return $this->emailPersonal; }
        public function setEmailTrabajo($emailTrabajo) { $this->emailTrabajo = $emailTrabajo; }
        public function getEmailTrabajo() { return $this->emailTrabajo; }
        


        public function __construct(){
            $arguments=func_get_args();
            if(func_num_args()==0){
                $this->id=0;
                $this->telefonoCasa='';
                $this->telefonoMovil='';
                $this->telefonoOficina='';
                $this->emailPersonal='';
                $this->emailTrabajo='';
            }
            if(func_num_args() == 1){
                $arguments = func_get_args();
                $query = 'select * from contactos where id= ?';
                $connection = MySqlConnection::getConnection();
                $command =$connection->prepare($query);
                $command->bind_param('i', $arguments[0]);
                $command->bind_result($id, $telefonoCasa, $telefonoMovil,$telefonoOficina,$emailPersonal,$emailTrabajo);
                $command->execute();

                if($command->fetch()){
                    $this->id = $id;
                    $this->telefonoCasa = $telefonoCasa;
                    $this->telefonoMovil = $telefonoMovil;
                    $this->telefonoOficina = $telefonoOficina;
                    $this->emailPersonal = $emailPersonal;
                    $this->emailTrabajo = $emailTrabajo;
                }else {
                    throw new RecordNotFoundException($arguments[0]);
                    mysqli_stmt_close($command);
                    $connection->close();
                }
            }
            

            if(func_num_args()==6){
                $this->id=$arguments[0];
                $this->telefonoCasa=$arguments[1];
                $this->telefonoMovil=$arguments[2];
                $this->telefonoOficina=$arguments[3];
                $this->emailPersonal=$arguments[4];
                $this->emailTrabajo=$arguments[5];
            }
        }
        public function toJson(){
            return json_encode(array(
                'id'=> $this->id,
                'telefono'=> array(
                    'casa'=> $this->telefonoCasa,
                    'movil'=> $this->telefonoMovil,
                    'oficina'=> $this->telefonoOficina
                ),
                'email'=>array(
                    'personal'=> $this->emailPersonal,
                    'trabajo'=>  $this->emailTrabajo
                )
                
            ));
        }

        public function addContacto() { 
            $connection = MySqlConnection::getConnection();//get connection 
            $query = 'insert into contactos (telefonoMovil,telefonoCasa,telefonoOficina,emailTrabajo,emailPersonal) values
            (?,?,?,?,?)';//query 
            $command = $connection->prepare($query);//prepare statement 
            $command->bind_param('iiiss', $this->telefonoCasa, $this->telefonoMovil, $this->telefonoOficina, 
            $this->emailPersonal, $this->emailTrabajo); //bind parameters 
            $result = $command->execute();//execute mysqli_stmt_close($command); //close command 
            $connection->close(); //close connection 
            return $result; //return result 
        }

       

        public function getLastContactId(){
            $last = 0; //create list
            $connection = MySqlConnection::getConnection();//get connection
            $query = 'select id from contactos order by id desc limit 1';//query
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
    }
?>