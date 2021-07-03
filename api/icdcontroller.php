<?php
    require('models/icd.php');
    require_once('config/json.php');
    //methods
    if($_SERVER['REQUEST_METHOD']=='GET'){
        //get one
        if($action == ''){
            echo json_encode(array(
                'status' => 0,
                'icd11' => Json::listToArray(Icd::getAll())
           ));
        }
        else if($action == 'search'){
            if($parameter != ''){
                $headers = getallheaders();
                echo json_encode(array(
                    'status' => 0,
                    'icd11' => Json::listToArray(Icd::search($parameter,$headers['word']))
               ));
            }
           
        }
        
        
       
    }
?>