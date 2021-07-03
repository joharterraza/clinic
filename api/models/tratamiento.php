<?php
    //required files
    require_once('mysqlconnection.php');
    require_once('especialidad.php');
    require_once('exceptions/recordnotfoundexception.php');
    require_once('config/json.php');


    class Tratamiento{
        private $id;
        private $descripcion;
        private $especialidad;
        private $duracion;
        private $precio;

        public function setId($id) { $this->id = $id; }
        public function getId() { return $this->id; }
        public function setDescripcion($descripcion) { $this->descripcion = $descripcion; }
        public function getDescripcion() { return $this->descripcion; }
        public function setEspecialidad($especialidad) { $this->especialidad = $especialidad; }
        public function getEspecialidad() { return $this->especialidad; }
        public function setDuracion($duracion) { $this->duracion = $duracion; }
        public function getDuracion() { return $this->duracion; }
        public function setPrecio($precio) { $this->precio = $precio; }
        public function getPrecio() { return $this->precio; }



        public function __construct(){
            $arguments = func_get_args();
            //empty obj
            if(func_num_args()==0){
                $this->id = '';
                $this->descripcion = '';
                $this->especialidad = new Especialidad();
                $this->duracion = 0;
                $this->precio = 0;
               
            }       
            if(func_num_args() == 1){
                $arguments = func_get_args();
                $query = 'select id, descripcion, idEspecialidad, duracion, precio from tratamientos where id = ?;';
                $connection = MySqlConnection::getConnection();
                $command =$connection->prepare($query);
                $command->bind_param('s', $arguments[0]);
                $command->bind_result($id, $descripcion, $idEspecialidad, $duracion, $precio);
                $command->execute();

                if($command->fetch()){
                    $especialidad = new Especialidad($idEspecialidad);
                    $this->id = $id;
                    $this->descripcion = $descripcion;
                    $this->especialidad = $especialidad;
                    $this->duracion = $duracion;
                    $this->precio = $precio;
                }else {
                    throw new RecordNotFoundException($arguments[0]);
                    mysqli_stmt_close($command);
                    $connection->close();
                }
            }  
            
            if(func_num_args()==5){                
                $this->id = $arguments[0];
                $this->descripcion =  $arguments[1];
                $this->especialidad =  $arguments[2];
                $this->duracion =  $arguments[3];
                $this->precio =  $arguments[4];            
                
            }
           
        }

        public function toJson(){
         
            return json_encode(array(
                'id'=>$this->id,
                'descripcion'=>$this->descripcion,
                'especialidad' => json_decode($this->especialidad->toJson()),
                'duracion'=>$this->duracion,
                'precio'=>$this->precio,
                
                     
                
            ));
        }

         //return a list of all tratamientos
         public static function getAll() {
            $list = array(); //create list
            $connection = MySqlConnection::getConnection();//get connection
			$query = 'select id, descripcion, idEspecialidad, duracion, precio from tratamientos;';//query
			$command = $connection->prepare($query);//prepare statement
			$command->execute();//execute
            $command->bind_result(
                $id, $descripcion,
                $idEspecialidad, //especialidad id 
                $duracion, $precio);//bind results
            //fetch data
			while ($command->fetch()) {
                $especialidad = new Especialidad($idEspecialidad);
				array_push($list, new Tratamiento($id,$descripcion, $especialidad, $duracion, $precio));//add item to list
            }
            mysqli_stmt_close($command); //close command
            $connection->close(); //close connection
            return $list; //return list
        }

        public function addTratamiento() { 
            $connection = MySqlConnection::getConnection();//get connection 
            $query = 'insert into tratamientos (id,descripcion, idEspecialidad, duracion, precio) values
            (?,?,?,?,?);';//query 
            $command = $connection->prepare($query);//prepare statement 
            $command->bind_param('sssid', $this->id, $this->descripcion, $this->especialidad, $this->duracion, $this->precio); //bind parameters 
            $result = $command->execute();//execute mysqli_stmt_close($command); //close command 
            $connection->close(); //close connection 
            return $result; //return result 
        }

        //return a list of all tratamientos
        public static function getTratamientoPorEspecialidad($idEsp,$word) {
            $list = array(); //create list
            $connection = MySqlConnection::getConnection();//get connection
			$query = " select id, descripcion, idEspecialidad, duracion, precio 
            from tratamientos 
            where idEspecialidad = ? and descripcion like '%".$word."%'";//query
            $command = $connection->prepare($query);//prepare statement
            $command->bind_param('s', $idEsp); //bind parameters			
            $command->bind_result(
                $id, $descripcion,
                $idEsp, //especialidad id 
                $duracion, $precio);//bind results
            $command->execute();//execute
            //fetch data
			while ($command->fetch()) {
                $especialidad = new Especialidad($idEsp);
				array_push($list, new Tratamiento($id,$descripcion, $especialidad, $duracion, $precio));//add item to list
            }
            mysqli_stmt_close($command); //close command
            $connection->close(); //close connection
            return $list; //return list
        }

      
    }
    
?>