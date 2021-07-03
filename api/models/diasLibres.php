<?php
    //required files
    require_once('mysqlconnection.php');
    require_once('exceptions/recordnotfoundexception.php');
    require_once('config/json.php');
    require_once('medico.php');


    class DiasLibres{
        private $id;
        private $idMedico;
        private $fecha;

        public function setId($id) { $this->id = $id; }
        public function getId() { return $this->id; }
        public function setIdMedico($idMedico) { $this->idMedico = $idMedico; }
        public function getIdMedico() { return $this->idMedico; }
        public function setFecha($fecha) { $this->fecha = $fecha; }
        public function getFecha() { return $this->fecha; }



        public function __construct(){
            $arguments = func_get_args();
            //empty obj
            if(func_num_args()==0){
                $this->id = 0;
                $this->idMedico = 0;
                $this->fecha = '';

               
            }    
            if(func_num_args() == 3){
                $arguments = func_get_args();
                $this->id = $arguments[0];
                $this->idMedico = $arguments[1];
                $this->fecha = $arguments[2];
            }     
            
          
           
        }

        public function toJson(){
         
            return json_encode(array(
                'fecha'=>$this->fecha                      
                
            ));
        }

        public function getDiasLibres($idMed) {
            $list = array(); //create list
            $connection = MySqlConnection::getConnection();//get connection
            $query = 'select * from diasLibres where idMedico = ?';//query
            $command = $connection->prepare($query);//prepare statement
            $command->bind_param('i', $idMed);           
			$command->execute();//execute
            $command->bind_result($id,$idMedico,$fecha);//bind results
            //fetch data
			while ($command->fetch()) {
				array_push($list, new DiasLibres($id,$idMedico,$fecha));//add item to list
            }
            mysqli_stmt_close($command); //close command
            $connection->close(); //close connection
            return $list; //return list
        }

        public function agregarDiasLibres($idMed, $fecha) { 
            $connection = MySqlConnection::getConnection();//get connection 
            $query = 'insert into diasLibres(idMedico,fecha) values 
            (?,?);';//query 
            $command = $connection->prepare($query);//prepare statement 
            $command->bind_param('is', $idMed,$fecha); //bind parameters 
            $result = $command->execute();//execute mysqli_stmt_close($command); //close command 
            $connection->close(); //close connection 
            return $result; //return result 
        }

        public function checkSiCitasFecha($idMed,$fecha) {
            $list = array(); //create list
            $connection = MySqlConnection::getConnection();//get connection
            $query = 'select id from citas where fecha = ? and idMedico = ? and status <> 1';//query
            $command = $connection->prepare($query);//prepare statement
            $command->bind_param('si', $fecha,$idMed);
			$command->execute();//execute
            $command->bind_result($id);//bind results
            //fetch data
			while ($command->fetch()) {
				array_push($list, $id);//add item to list
            }
            mysqli_stmt_close($command); //close command
            $connection->close(); //close connection
            if(count($list)>0){
                return true;
            }
            else{
                return false;
            }
            
        }

        public function checkDiasLibresFecha($idMed,$fecha) {
            $list = array(); //create list
            $connection = MySqlConnection::getConnection();//get connection
            $query = 'select id from diasLibres where fecha = ? and idMedico = ?';//query
            $command = $connection->prepare($query);//prepare statement
            $command->bind_param('si', $fecha,$idMed);
			$command->execute();//execute
            $command->bind_result($id);//bind results
            //fetch data
			while ($command->fetch()) {
				array_push($list, $id);//add item to list
            }
            mysqli_stmt_close($command); //close command
            $connection->close(); //close connection
            if(count($list)>0){
                return true;
            }
            else{
                return false;
            }
            
        }





        
        
       


    }
    
?>