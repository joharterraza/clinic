<?php
    require('models/consultorio.php');
    require_once('config/json.php');
    //methods
    if($_SERVER['REQUEST_METHOD']=='GET'){
        //get one
        if($action == ''){
           //get all
           if($parameter == ''){
                echo json_encode(array(
                    'status' => 0,
                    'consultorios' => Json::listToArray(Consultorio::getAll())
                ));
            }
           else{
                try {
                    $con = new Consultorio($parameter);
                    echo json_encode(array(
                    'status' => 0,
                    'consultorio' => json_decode($con->toJson())
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

    if($_SERVER['REQUEST_METHOD']=='POST'){
        
        
        if($action == 'updatestatus'){
             //get headers
             $headers = getallheaders();
             //check headers
             if(isset($headers['id']) && isset($headers['status'])){
                     
                     $con = new Consultorio(); //set values 
                     $con->setId($headers['id']); 
                     $con->setStatus($headers['status']); //add                                      
                     if ($con->updateStatusConsultorio()) { 
                         echo json_encode(array( 
                             'status' => 0, 
                             'message' =>  'consultorio updated successfully'
                             
                         )); 
                     } 
                     else 
                     echo json_encode(array( 
                         'status' => 2, 
                         'errorMessage' => 'Could not update consultorio' 
                     ));        
             }
             else{
                 echo json_encode(array('status' => 999, 'errorMessage' => 'Missing parameters'));
             }
        }
       
    }
?>


   
?>