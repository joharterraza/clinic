<?php
    require('models/especialidad.php');

    require_once('config/json.php');
    //methods
    if($_SERVER['REQUEST_METHOD']=='GET'){
        //get one
        if($action == ''){
           //get all
           if($parameter == ''){
                echo json_encode(array(
                    'status' => 0,
                    'especialidades' => Json::listToArray(Especialidad::getEspecialidad())
                ));
            }
           else{
                try {
                    $esp = new Especialidad($parameter);
                    echo json_encode(array(
                    'status' => 0,
                    'especialidad' => json_decode($esp->toJson())
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





?>