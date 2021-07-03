<?php
    require_once('models/contactoEmergencia.php');
    require_once('config/json.php');
    //methods
    if($_SERVER['REQUEST_METHOD']=='POST'){
        
        if($action == 'add'){
            //get headers
            $headers = getallheaders();
            //check headers
            if(isset($headers['idPaciente']) && isset($headers['nombre']) 
                && isset($headers['idContacto'])){
                    
                    $con = new ContactoEmergencia(); //set values 
                   
                    $con->setNombre($headers['nombre']); //add 
                    $con->setContacto($headers['idContacto']); //add 
                                    
                    if ($con->addContactoEmergencia($headers['idPaciente'])) { 
                        echo json_encode(array( 
                            'status' => 0, 
                            'message' =>  'contacto added successfully'
                            
                        )); 
                    } 
                    else 
                    echo json_encode(array( 
                        'status' => 2, 
                        'errorMessage' => 'Could not add contacto' 
                    )); 
                    
                   
               
               
            }
            else{
                echo json_encode(array('status' => 999, 'errorMessage' => 'Missing parameters'));
            }
            
        }
       
    }


    if($_SERVER['REQUEST_METHOD']=='GET'){
        //get one
        if($action == ''){
           //get all
           if($parameter == ''){
               
            }
           else{
                try {
                    $ce = new ContactoEmergencia($parameter);
                    echo json_encode(array(
                    'status' => 0,
                    'ce' => json_decode($ce->toJson())
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