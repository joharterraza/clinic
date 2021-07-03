<?php
    require('models/tratamiento.php');

    require_once('config/json.php');
    //methods
    if($_SERVER['REQUEST_METHOD']=='GET'){
        //get one
        if($action == ''){
           //get all
           if($parameter == ''){
                echo json_encode(array(
                    'status' => 0,
                    'tratamientos' => Json::listToArray(Tratamiento::getAll())
                ));
            }
           else{
                try {
                    $trat = new Tratamiento($parameter);
                    echo json_encode(array(
                    'status' => 0,
                    'tratamiento' => json_decode($trat->toJson())
                    ));
                }
                catch(RecordNotFoundException $ex){
                    echo json_encode(array(
                        'status' => 1,
                        'errorMessage' => $ex->getMessage()
                    ));
                } 
            }  
        }
        if($action == 'especialidad'){
            $headers = getallheaders();
            if(isset($headers['especialidad'])&&isset($headers['palabra'])){
                echo json_encode(array(
                    'status' => 0,
                    'tratamientos' => Json::listToArray(Tratamiento::getTratamientoPorEspecialidad($headers['especialidad'],$headers['palabra']))
                ));
            }
            else{
                echo json_encode(array('status' => 999, 'errorMessage' => 'Missing parameters'));
            }
        }
       
        
       
    }


    if($_SERVER['REQUEST_METHOD']=='POST'){
        
        if($action == 'add'){
            //get headers
            $headers = getallheaders();
            //check headers
            if(isset($headers['id']) && isset($headers['descripcion']) && isset($headers['especialidad']) 
                && isset($headers['duracion']) && isset($headers['precio'])){
                    
                    $t = new Tratamiento(); //set values 
                    $t->setId($headers['id']); 
                    $t->setDescripcion($headers['descripcion']); 
                    $t->setEspecialidad($headers['especialidad']); //add 
                    $t->setDuracion($headers['duracion']); //add 
                    $t->setPrecio($headers['precio']); //add                    
                    if ($t->addTratamiento()) { 
                        echo json_encode(array( 
                            'status' => 0, 
                            'message' =>  $headers['descripcion'].' added successfully'
                            
                        )); 
                    } 
                    else 
                    echo json_encode(array( 
                        'status' => 2, 
                        'errorMessage' => 'Could not add tratamiento' 
                    )); 
                    
                   
               
               
            }
            else{
                echo json_encode(array('status' => 999, 'errorMessage' => 'Missing parameters'));
            }
            
        }
       
    }
?>