<?php
    require_once('mysqlconnection.php');
    require_once('config/json.php');

    require_once(__DIR__.'/../config/config.php');
    require_once(__DIR__.'/../config/security.php');

   
    

    class MenuItem {
        //attributes
       
        private $id;
        private $titleEnglish; 
        private $titleSpanish; 
        private $type; 
        private $url; 
        private $icon; 
        private $idParent;

        //gettes and settes
        public function setId($id) { $this->id = $id; }
        public function getId() { return $this->id; }
        public function setTitleEnglish($titleEnglish) { $this->titleEnglish = $titleEnglish; }
        public  function getTitleEnglish() { return $this->titleEnglish; }
        public function setTitleSpanish($titleSpanish) { $this->titleSpanish = $titleSpanish; }
        public function getTitleSpanish() { return $this->titleSpanish; }
        public function setType($type) { $this->type = $type; }
        public function getType() { return $this->type; }
        public function getTypeDescription() {$type = [1 => 'link', 2=> 'menu']; return $type[$this->type];}
        public function setUrl($url) { $this->url = $url; }
        public function getUrl() { return $this->url; }
        public function setIcon($icon) { $this->icon = $icon; }
        public function getIcon() { return $this->icon; }
        public function setIdParent($idParent) { $this->idParent = $idParent; }
        public function getIdParent() { return $this->idParent; }
        
       

        //constructor
        public function __construct(){
            //get arguments
            $arguments = func_get_args();
            //empty object
            if(func_num_args() == 0){
                $this->id = 0;
                $this->titleEnglish = '';
                $this->titleSpanish = '';
                $this->type = 0;
                $this->url = '';
                $this->icon = '';
                $this->idParent = 0;
                

            }
            //create object with values 
            if(func_num_args() == 7){
                $this->id = $arguments[0];
                $this->titleSpanish = $arguments[1];
                $this->titleEnglish = $arguments[2];
               
                $this->type = $arguments[3];
                $this->icon = $arguments[4];
                $this->url = $arguments[5];                
                $this->idParent = $arguments[6];
               
                
            }
        }

        //represent the object as string
        public function toJson(){
            if($this->type == 1){
                return json_encode(array(
                
                    'titulo'=> array(
                        'ingles' =>$this->titleEnglish,
                        'español' => $this->titleSpanish
                    ) ,
                    
                    'tipo'=> $this->getTypeDescription(),
                    'url'=> $this->url,
                    'icono'=> $this->icon,                
                    
    
                   
                ));
            }
            else{
                
                return json_encode(array(
                    'titulo'=> array(
                        'ingles' =>$this->titleEnglish,
                        'español' => $this->titleSpanish
                    ) ,
                    
                    'tipo'=> $this->getTypeDescription(),
                    'url'=> $this->url,
                    'icono'=> $this->icon,                
                    'menuOpciones'=> Json::listToArray(MenuItem::getChild())
                ));
               
            }
           
        }

        //get all
        public static function getParent($idUser){
            $list = array(); //array
            $query = 'select mi.* from menuItemsRoles as mir 
            join menuItems as mi 
            join roles as r 
            join usuariosRoles as ur 
            on mir.idRole = r.id and mir.idMenuItem = mi.id and mir.idRole = ur.idRole
            where ur.idUsuario = ? and isnull(mi.idParent)
            group by mi.id;'; //query
            $connection = MySqlConnection::getConnection();
            $command = $connection->prepare($query);
            $command->bind_param('s', $idUser);
            $command->bind_result($id,$titleEnglish,$titleSpanish,$type,$url,$icon,$idParent);
            $command->execute();

            //read result
            while($command->fetch()){
                array_push($list, new MenuItem($id,$titleEnglish,$titleSpanish,$type,$url,$icon,$idParent));
            }
            mysqli_stmt_close($command);
            $connection->close();
            return $list;
        }

        public function getChild(){
            $list = array(); //array
            $query = 'select * from menuItems where idParent = ?'; //query
            $connection = MySqlConnection::getConnection();
            $command = $connection->prepare($query);
            $command->bind_param('i', $this->id);
            $command->bind_result($id,$titleEnglish,$titleSpanish,$type,$url,$icon,$idParent);
            $command->execute();

            //read result
            while($command->fetch()){
                array_push($list, new MenuItem($id,$titleEnglish,$titleSpanish,$type,$url,$icon,$idParent));
            }
            mysqli_stmt_close($command);
            $connection->close();
            return $list;
        }

       

    }
   
?>