<?php
    //required files
    require_once('mysqlconnection.php');
    require_once('especialidad.php');
    require_once('exceptions/recordnotfoundexception.php');
    require_once('config/json.php');


    class Consultorio{
        private $id;
        private $nombre;
        private $status;

        public function setId($id) { $this->id = $id; }
        public function getId() { return $this->id; }
        public function setNombre($nombre) { $this->nombre = $nombre; }
        public function getNombre() { return $this->nombre; }
        public function getStatus(){return $this->status;}
        public function setStatus($status) { $this->status = $status; }
        public function getStatusDescription(){
            if($this->status != null || $this->status == 0){
                $statusDescription=[
                    0=>'Deshabilitado',
                    1=>'Habilitado'             
                ];
                return $statusDescription[$this->status];
            }else return null;
           
            
        }


        public function __construct(){
            $arguments = func_get_args();
            //empty obj
            if(func_num_args()==0){
                $this->id = '';
                $this->nombre = '';
                $this->status = 0;
               
            }     
            if(func_num_args() == 1){
                $arguments = func_get_args();
                $query = 'select id, nombre, status from consultorios where id = ?';
                $connection = MySqlConnection::getConnection();
                $command =$connection->prepare($query);
                $command->bind_param('s', $arguments[0]);
                $command->bind_result($id, $nombre, $status);
                $command->execute();

                if($command->fetch()){
                    $this->id = $id;
                    $this->nombre = $nombre;
                    $this->status = $status;
                }else {
                    throw new RecordNotFoundException($arguments[0]);
                    mysqli_stmt_close($command);
                    $connection->close();
                }
            }    
            
            if(func_num_args()==3){                
                $this->id = $arguments[0];
                $this->nombre = $arguments[1];      
                $this->status = $arguments[2];                     
                
            }
           
        }

        public function toJson(){
         
            return json_encode(array(
                'id'=>$this->id,
                'nombre'=>$this->nombre,                
                'status'=> array(
                    'id'=> $this->status,
                    'description' => $this->getStatusDescription()
                )
                     
                
            ));
        }

         //return a list of all consultorios
         public static function getAll() {
            $list = array(); //create list
            $connection = MySqlConnection::getConnection();//get connection
			$query = 'select id, nombre, status from consultorios';//query
			$command = $connection->prepare($query);//prepare statement
			$command->execute();//execute
            $command->bind_result($id, $nombre, $status);//bind results
            //fetch data
			while ($command->fetch()) {
				array_push($list, new Consultorio($id,$nombre, $status));//add item to list
            }
            mysqli_stmt_close($command); //close command
            $connection->close(); //close connection
            return $list; //return list
        }

        //get especialidad of all consultorios
        public function getEspecialidad() {
            $list = array(); //create list
            $connection = MySqlConnection::getConnection();//get connection
            $query = 'select es.id, es.descripcion
            from especialidades as es
            join consultorioEspecialidad as ce on ce.idEspecialidad = es.id
            where ce.idConsultorio = ?;';//query
            $command = $connection->prepare($query);//prepare statement
            $command->bind_param('s', $this->id);
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

        public function updateStatusConsultorio() { 
            $connection = MySqlConnection::getConnection();//get connection 
            $query = 'update consultorios set status= ? where id=?';//query 
            $command = $connection->prepare($query);//prepare statement 
            $command->bind_param('is', $this->status, $this->id ); //bind parameters 
            $result = $command->execute();//execute mysqli_stmt_close($command); //close command 
            $connection->close(); //close connection 
            return $result; //return result 
        }
    }
    
?>