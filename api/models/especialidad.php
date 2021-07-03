<?php
    //required files
    require_once('mysqlconnection.php');
    require_once('exceptions/recordnotfoundexception.php');
    require_once('config/json.php');


    class Especialidad{
        private $id;
        private $descripcion;

        public function setId($id) { $this->id = $id; }
        public function getId() { return $this->id; }
        public function setDescripcion($descripcion) { $this->descripcion = $descripcion; }
        public function getDescripcion() { return $this->descripcion; }


        public function __construct(){
            $arguments = func_get_args();
            //empty obj
            if(func_num_args()==0){
                $this->id = '';
                $this->descripcion = '';
               
            }    
            if(func_num_args() == 1){
                $arguments = func_get_args();
                $query = 'select id, descripcion from especialidades where id = ?';
                $connection = MySqlConnection::getConnection();
                $command =$connection->prepare($query);
                $command->bind_param('s', $arguments[0]);
                $command->bind_result($id, $descripcion);
                $command->execute();

                if($command->fetch()){
                    $this->id = $id;
                    $this->descripcion = $descripcion;
                    
                }else {
                    throw new RecordNotFoundException($arguments[0]);
                    mysqli_stmt_close($command);
                    $connection->close();
                }
            }     
            
            if(func_num_args()==2){
                
                $this->id = $arguments[0];
                $this->descripcion = $arguments[1];
                        
                
            }
           
        }

        public function toJson(){
         
            return json_encode(array(
                'id'=>$this->id,
                'descripcion'=>$this->descripcion         
                
            ));
        }
        
        public function getEspecialidad() {
            $list = array(); //create list
            $connection = MySqlConnection::getConnection();//get connection
            $query = 'select id, descripcion from especialidades';//query
            $command = $connection->prepare($query);//prepare statement           
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


    }
    
?>