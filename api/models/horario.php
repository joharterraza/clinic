<?php
    //required files
    require_once('mysqlconnection.php');
    require_once('exceptions/recordnotfoundexception.php');
    require_once('config/json.php');


    class Horario{
        private $id;
        private $dia;
        private $hora;

        public function setId($id) { $this->id = $id; }
        public function getId() { return $this->id; }
        public function getDia(){return $this->dia;}
        public function getDiaDescription(){
            if($this->dia != null || $this->dia == 0){
                $diaDescription=[
                    0=>'Domingo',
                    1=>'Lunes',
                    2=>'Martes',
                    3=>'Miercoles',
                    4=>'Jueves',
                    5=>'Viernes', 
                    6=>'Sabado',
                                
                ];
                return $diaDescription[$this->dia];
            }else return null;
           
            
        }
        public function setHora($hora) { $this->hora = $hora; }
        public function getHora() { return $this->hora; }


        public function __construct(){
            $arguments = func_get_args();
            //empty obj
            if(func_num_args()==0){
                $this->id = 0;
                $this->dia = 0;
                $this->hora = 0;
               
            }    
            
            if(func_num_args() == 1){
                $arguments = func_get_args();
                $query = 'select id, dia, hora from horarios where id = ?';
                $connection = MySqlConnection::getConnection();
                $command =$connection->prepare($query);
                $command->bind_param('i', $arguments[0]);
                $command->bind_result($id, $dia,$hora);
                $command->execute();

                if($command->fetch()){
                    $this->id = $id;
                    $this->dia = $dia;
                    $this->hora = $hora;
                    
                }else {
                    throw new RecordNotFoundException($arguments[0]);
                    mysqli_stmt_close($command);
                    $connection->close();
                }
            }     
            
            if(func_num_args()==3){
                
                $this->id = $arguments[0];
                $this->dia = $arguments[1];
                $this->hora = $arguments[2];
                        
                
            }
           
        }

        public function toJson(){
         
            return json_encode(array(
                'noDia'=> $this->dia,
                'dia'=> $this->getDiaDescription(),
                'hora'=>$this->hora

                
            ));

           
        }

        public static function getAll() {
            $list = array(); //create list
            $connection = MySqlConnection::getConnection();//get connection
            $query = 'select id, dia, hora from horarios';//query
            $command = $connection->prepare($query);//prepare statement
            $command->execute();//execute
            $command->bind_result($id, $dia, $hora);//bind results
            //fetch data
            while ($command->fetch()) {
                array_push($list, new Horario($id,$dia, $hora));//add item to list
            }
            mysqli_stmt_close($command); //close command
            $connection->close(); //close connection
            return $list; //return list
        }

        public function getHorarioIdByDayHour($day,$hour){
            $idHo = 0; //create list
            $connection = MySqlConnection::getConnection();//get connection
            $query = 'select id from horarios where dia = ? and hora = ?';//query
            $command = $connection->prepare($query);//prepare statement  
            $command->bind_param('ii', $day,$hour);         
			$command->execute();//execute
            $command->bind_result($hid);//bind results
            //fetch data
			while ($command->fetch()) {
				$idHo = $hid;
            }
            mysqli_stmt_close($command); //close command
            $connection->close(); //close connection
            return $idHo; //return list
        }
    }
    
?>