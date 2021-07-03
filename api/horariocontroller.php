<?php
    require('models/horario.php');
    require_once('config/json.php');
    //methods
    if($_SERVER['REQUEST_METHOD']=='GET'){
        //get one
        if($action == ''){
           //get all
           if($parameter == ''){
                echo json_encode(array(
                    'status' => 0,
                    'horarios' => Json::listToArray(Horario::getAll())
                ));
            }
           else{
                try {
                    $hor = new Horario($parameter);
                    echo json_encode(array(
                    'status' => 0,
                    'horario' => json_decode($hor->toJson())
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
        
        
       
    }


   
?>