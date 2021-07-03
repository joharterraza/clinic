<?php
    require_once('mysqlconnection.php');
    require_once('exceptions/recordnotfoundexception.php');
   
    

    class Role {
        //attributes
        private $id;
        private $name;
        

        //gettes and settes
        public function getId() {return $this->id;}
        public function setId($id) {$this->id=$id;}
        public function getName() {return $this->name;}
        public function setName($name) {$this->name=$name;}
        
       

        //constructor
        public function __construct(){
            //get arguments
            $arguments = func_get_args();
            //empty object
            if(func_num_args() == 0){
                $this->id = '';
                $this->name = '';
                

            }
            //create object with values 
            if(func_num_args() == 2){
                $this->id = $arguments[0];
                $this->name = $arguments[1];
               
                
            }
        }

        //represent the object as string
        public function toJson(){
            return json_encode(array(
                'id'=> $this->id,
                'nombre'=> $this->name,
               
            ));
        }

        //get all
        public static function getAll(){
            $list = array(); //array
            $query = 'select id, name from roles'; //query
            $connection = MySqlConnection::getConnection();
            $command = $connection->prepare($query);
            $command->bind_result($id,$name);
            $command->execute();

            //read result
            while($command->fetch()){
                array_push($list, new Role($id,$name));
            }
            mysqli_stmt_close($command);
            $connection->close();
            return $list;
        }

       

    }
   
?>