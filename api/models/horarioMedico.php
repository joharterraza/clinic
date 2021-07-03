<?php
    //required files
    require_once('horario.php');
    require_once('mysqlconnection.php');
    require_once('exceptions/recordnotfoundexception.php');
    require_once('config/json.php');


    class HorarioMedico{
        private $id;
        
        private $horaInicio;
        private $horaFinal;
        
        public function setId($id) { $this->id = $id; }
        public function getId() { return $this->id; }
        public function setHoraInicio($horaInicio) { $this->horaInicio = $horaInicio; }
        public function getHoraInicio() { return $this->horaInicio; }
        public function setHoraFinal($horaFinal) { $this->horaFinal = $horaFinal; }
        public function getHoraFinal() { return $this->horaFinal; }


        public function __construct(){
            $arguments = func_get_args();
            //empty obj
            if(func_num_args()==0){
                $this->id = 0;
                $this->horaInicio = new Horario();
                $this->horaFinal = new Horario();
               
            }         
            
            if(func_num_args()==3){
                
                $this->id = $arguments[0];
                $this->horaInicio = $arguments[1];
                $this->horaFinal = $arguments[2];
                        
                
            }
           
        }

        public function toJson(){
         
            return json_encode(array(               
                'horaInicio' => json_decode($this->horaInicio->toJson()),
                'horaFinal' => json_decode($this->horaFinal->toJson())
                
            ));

            
        }

        public static function getHorarioByMedico($idMedico) {
            $list = array(); //create list
            $connection = MySqlConnection::getConnection();//get connection
			$query = 'select id, idHoraInicio, idHoraFinal from horarioMedico where idMedico = ?';//query
            $command = $connection->prepare($query);//prepare statement
            $command->bind_param('i', $idMedico);			
            $command->bind_result(
                $id,
                $idInicio, 
                $idFinal);//bind results
            $command->execute();//execute
            //fetch data
			while ($command->fetch()) {
                $horaInicio =  new Horario($idInicio);
                $horaFinal = new Horario($idFinal);              
				array_push($list, new HorarioMedico($id,$horaInicio, $horaFinal));//add item to list
            }
            mysqli_stmt_close($command); //close command
            $connection->close(); //close connection
            return $list; //return list
        }

        public function addHorarioMedico($idMedico) { 
            $connection = MySqlConnection::getConnection();//get connection 
            $query = 'insert into horarioMedico (idMedico,idHoraInicio,idHoraFinal) values
            (?,?,?)';//query 
            $command = $connection->prepare($query);//prepare statement 
            $command->bind_param('iii', $idMedico,$this->horaInicio, $this->horaFinal); //bind parameters 
            $result = $command->execute();//execute mysqli_stmt_close($command); //close command 
            $connection->close(); //close connection 
            return $result; //return result 
        }

        



    }
    
?>