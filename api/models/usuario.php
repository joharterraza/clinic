<?php
    require_once('mysqlconnection.php');
    require_once('roles.php');
    require_once('menuItems.php');
    require_once('exceptions/accessdeniedexception.php');
    require_once('exceptions/recordnotfoundexception.php');
    require_once('config/json.php');

    require_once(__DIR__.'/../config/config.php');
    require_once(__DIR__.'/../config/security.php');

    class Usuario {
        //attributes
        private $id;
        private $name;
        private $photo;
        private $password;
        private $theme;
        private $language;
      

        //gettes and settes
        public function getId() {return $this->id;}
        public function setId($id) {$this->id=$id;}
        public function getName() {return $this->name;}
        public function setName($name) {$this->name=$name;}
        public function getPhoto() {return $this->photo;}
        public function setPhoto($photo) {$this->photo=$photo;}
        public function setPassword($password) {$this->password=$password;}
        public function getTheme() {return $this->theme;}
        public function setTheme($theme) {$this->theme=$theme;}
        public function getLanguage() {return $this->language;}
        public function setLanguage($language) {$this->language=$language;}
        
       

        //constructor
        public function __construct(){
            //get arguments
            $arguments = func_get_args();
            //empty object
            if(func_num_args() == 0){
                $this->id = '';
                $this->name = '';
                $this->photo = '';
                $this->password = '';
                $this->theme = 'dark';
                $this->language = 'sp';
                

            }
            //create object with data
           
            if(func_num_args() == 1){
                $arguments = func_get_args();
                $query = 'select id, nombre, foto, tema, idioma from usuarios where id = ?';
                $connection = MySqlConnection::getConnection();
                $command =$connection->prepare($query);
                $command->bind_param('s', $arguments[0]);
                $command->bind_result($id, $name, $photo,$theme,$language);
                $command->execute();

                if($command->fetch()){
                    $this->id = $id;
                    $this->name = $name;
                    $this->photo = $photo;
                    $this->theme = $theme;
                    $this->language = $language;
                }else {
                    throw new RecordNotFoundException($arguments[0]);
                    mysqli_stmt_close($command);
                    $connection->close();
                }
            }
            //login
            if(func_num_args() == 2){
               $userName = $arguments[0];
               $password = $arguments[1];
               $list = array(); //create list
               $connection = MySqlConnection::getConnection();//get connection
               $query = 'select id,nombre,foto,tema,idioma from usuarios where id = ? and contrasena = sha1(?);';//query
               $command = $connection->prepare($query);//prepare statement
               $command->bind_param('ss', $userName,$password);
               $command->execute();//execute
               $command->bind_result($id, $name,$photo,$theme,$language);//bind results
               //fetch data
               if($command->fetch()) {
                   $this->id=$id;
                   $this->name=$name;
                   $this->photo=$photo;
                   $this->theme = $theme;
                   $this->language = $language;
               }
               else
                throw new AccessDeniedException($userName);
               mysqli_stmt_close($command); //close command
               $connection->close(); //close connection
               return $list; //return list
               
                

            }
            if(func_num_args() == 3){
                $arguments = func_get_args();
                $query = 'select id, nombre, foto from usuarios where id = ? && nombre = ? && foto = ?';
                $connection = MySqlConnection::getConnection();
                $command =$connection->prepare($query);
                $command->bind_param('sss', $arguments[0], $arguments[1], $arguments[2]);
                $command->bind_result($id, $name, $photo);
                $command->execute();

                if($command->fetch()){
                    $this->id = $id;
                    $this->name = $name;
                    $this->photo = $photo;
                    
                }else {
                    throw new RecordNotFoundException($arguments[0]);
                    mysqli_stmt_close($command);
                    $connection->close();
                }
            }
            //create object with values 
            if(func_num_args() == 5){
                $this->id = $arguments[0];
                $this->name = $arguments[1];
                $this->photo = $arguments[2];
                $this->theme = $arguments[3];
                $this->language = $arguments[4];
               
                
            }
        }

        //represent the object as string
        public function toJson(){
            if($this->language == null || $this->theme == null){
                return json_encode(array(
                    'id'=> $this->id,
                    'nombre'=> $this->name,
                    'foto'=> Config::getFileUrl('userPhotos').$this->photo    
                    
                ));
            }
            else{
                return json_encode(array(
                    'id'=> $this->id,
                    'nombre'=> $this->name,
                    'foto'=> Config::getFileUrl('userPhotos').$this->photo,
                    'tema'=> $this->theme,
                    'idioma' => $this->language,
                    'roles' => Json::listToArray(Usuario::getRoles()),
                    'menu' =>   Json::listToArray(MenuItem::getParent($this->id)),
                    'token' => Security::generateToken($this->id)         
                    
                ));
            }
           
        }

        //get all
        public static function getAll(){
            $list = array(); //array
            $query = 'select id,nombre,foto,tema,idioma from usuarios order by nombre'; //query
            
            $connection = MySqlConnection::getConnection();
            $command = $connection->prepare($query);
            $command->bind_result($id,$name,$photo, $theme, $language);
            $command->execute();

            //read result
            while($command->fetch()){               
                
                array_push($list, new Usuario($id,$name,$photo, $theme, $language));
                
            }
            mysqli_stmt_close($command);
            $connection->close();
            return $list;
        }

        public function getRoles() {
            $list = array(); //create list
            $connection = MySqlConnection::getConnection();//get connection
            $query = 'select r.id,r.name from usuariosRoles ur join roles r on ur.idRole = 
            r.id where ur.idUsuario = ?';//query
            $command = $connection->prepare($query);//prepare statement
            $command->bind_param('s', $this->id);
			$command->execute();//execute
            $command->bind_result($id, $name);//bind results
            //fetch data
			while ($command->fetch()) {
				array_push($list, new Role($id, $name));//add item to list
            }
            mysqli_stmt_close($command); //close command
            $connection->close(); //close connection
            return $list; //return list
        }

        public function createUsuario() { 
            $connection = MySqlConnection::getConnection();//get connection 
            $query = 'insert into usuarios(id,nombre, foto,contrasena, tema, idioma) values
            (?,?,?,sha1(?),?,?)';//query 
            $command = $connection->prepare($query);//prepare statement 
            $command->bind_param('ssssss', $this->id,$this->name, $this->photo, $this->password, $this->theme,$this->language); //bind parameters 
            $result = $command->execute();//execute mysqli_stmt_close($command); //close command 
            $connection->close(); //close connection 
            return $result; //return result 
        }

      

        public function cambiarContrasena() { 
            $connection = MySqlConnection::getConnection();//get connection 
            $query = 'update usuarios set contrasena= sha1(?) where id=?';//query 
            $command = $connection->prepare($query);//prepare statement 
            $command->bind_param('ss', $this->password, $this->id ); //bind parameters 
            $result = $command->execute();//execute mysqli_stmt_close($command); //close command 
            $connection->close(); //close connection 
            return $result; //return result 
        }

        public function setRole($idUser,$idRole) { 
            $connection = MySqlConnection::getConnection();//get connection 
            $query = 'insert into usuariosRoles(idUsuario,idRole) values
            (?,?)';//query 
            $command = $connection->prepare($query);//prepare statement 
            $command->bind_param('ss', $idUser,$idRole); //bind parameters 
            $result = $command->execute();//execute mysqli_stmt_close($command); //close command 
            $connection->close(); //close connection 
            return $result; //return result 
        }

        public function checkUserExists($id) {
            $list = array(); //create list
            $connection = MySqlConnection::getConnection();//get connection
            $query = 'select id from usuarios where id = ?';//query
            $command = $connection->prepare($query);//prepare statement
            $command->bind_param('s', $id);
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



       


        /*
        public static function belongsToRole($userName, $roles){
            
            $list = array();
            $connection = MySqlConnection::getConnection();//get connection
            $query = 'select idUser, idRole from userRoles where idUser = ?';//query
            $command = $connection->prepare($query);//prepare statement
            $command->bind_param('s', $userName);
			$command->execute();//execute
            $command->bind_result($userName, $roles);//bind results
            //fetch data
			while ($command->fetch()) {
                array_push($list, $roles);//add item to list
                if($list != ['SA'] && $list != ['SUPER']){
                    return false;
                }
                else
                return true;
            }
            mysqli_stmt_close($command); //close command
            $connection->close(); //close connection
            

            /*
            $grantAccess = false;
            try {
                $user = new User($userName);
                foreach($user->getRoles() as $role){
                    for($i = 0; $i< sizeof($roles); $i++){
                        if($role->getId() == $roles[$i]) $grantAccess = true;
                    }
                }
            }
            catch(recordnotfoundexception $ex) {echo $ex->getMessage();}

            return $grantAccess;
            
        
        }
        */
        

        



        
          
      

       

    }
   
?>