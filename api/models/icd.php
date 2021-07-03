<?php
    //required files
    require_once('mysqlconnection.php');
    include('exceptions/recordnotfoundexception.php');
    require_once('config/json.php');


    class Icd{
        private $id;
        private $title;
        private $type;
        private $chapter;
        private $level;
        private $parentId;
        private $titulo;
        private $children;

        public function getId(){return $this->id;}
        public function setId(){$this->id = $id;}

        public function getTitle(){return $this->title;}
        public function setTitle(){$this->title = $title;}

        public function getType(){return $this->type;}
        public function setType(){$this->type = $type;}

        public function getChapter(){return $this->chapter;}
        public function setChapter(){$this->chapter = $chapter;}

        public function getLevel(){return $this->level;}
        public function setLevel(){$this->level = $level;}

        public function getParentId(){return $this->parentId;}
        public function setParentId(){$this->parentId = $parentId;}

        public function getTitulo(){return $this->titulo;}
        public function setTitulo(){$this->titulo = $titulo;}

        public function getChildren(){return $this->children;}
        public function setChildren(){$this->children = $children;}

        public function __construct(){
            //empty obj
            if(func_num_args()==0){
                $this->$id = '';
                $this->$title = '';
                $this->$type = '';
                $this->$chapter = 0;
                $this->$level = 0;
                $this->$parentId = '';
                $this->$titulo = '';
                $this->children = array();
            }
            
           
            
            if(func_num_args()==7){
                $arguments = func_get_args();
                $this->id = $arguments[0];
                $this->title = $arguments[1];
                $this->type = $arguments[2];
                $this->chapter = $arguments[3];
                $this->level = $arguments[4];
                $this->parentId = $arguments[5];
                $this->titulo = $arguments[6];
                
               
                
            }
           
        }
      
        public function getAll(){
            $list = array();          
            $query= 'select * from icd11 order by level,chapter,id';
            $connection = MySqlConnection::getConnection();
            $command = $connection->prepare($query);
            
            $command->bind_result($id, $title, $type, $chapter, $level, $parentId, $titulo);
            $command->execute();
            while($command->fetch()){                   
                array_push($list, new Icd($id, $title, $type, $chapter, $level, $parentId,$titulo));
                                
            }            
            mysqli_stmt_close($command);
            $connection->close();
            return $list;
        }

        public function search($language,$word){
            $list = array();    
            if($language == 'en'){
                $query= " SELECT * FROM icd11 WHERE title like '%".$word."%' limit 20";
            }      
            else{
                $query= " SELECT * FROM icd11 WHERE titulo like '%".$word."%' limit 20";
            }
            
            $connection = MySqlConnection::getConnection();
            $command = $connection->prepare($query);
            
            $command->execute();
            $command->bind_result($id, $title, $type, $chapter, $level, $parentId, $titulo);            
            while($command->fetch()){                   
                array_push($list, new Icd($id, $title, $type, $chapter, $level, $parentId,$titulo));
                                
            }            
            mysqli_stmt_close($command);
            $connection->close();
            return $list;
        }

       

        public function toJson(){
         
            return json_encode(array(
                'id'=>$this->id,
                'title'=>$this->title,
                'type'=>$this->type,
                'chapter'=>$this->chapter,
                'level'=>$this->level,
                'parentId'=>$this->parentId,
                'titulo'=>$this->titulo,
                
                
                
            ));
        }
    }
    
?>