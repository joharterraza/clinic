<?php
    require('models/contacto.php');
    require_once('config/json.php');
    //methods
    if($_SERVER['REQUEST_METHOD']=='GET'){
        //get one
        if($action == ''){
           //get all
           if($parameter == ''){
               
            }
           else{
                try {
                    $con = new Contacto($parameter);
                    echo json_encode(array(
                    'status' => 0,
                    'contacto' => json_decode($con->toJson())
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
        
        if($action == 'add'){
            //get headers
            $headers = getallheaders();
            //check headers
            if(isset($headers['telcasa']) && isset($headers['telmovil']) 
                && isset($headers['teloficina']) && isset($headers['emailpersonal'])
                && isset($headers['emailtrabajo'])){
                    
                    $con = new Contacto(); //set values 
                    $con->setTelefonoCasa($headers['telcasa']); 
                    $con->setTelefonoMovil($headers['telmovil']); //add 
                    $con->setTelefonoOficina($headers['teloficina']); //add 
                    $con->setEmailPersonal($headers['emailpersonal']); //add     
                    $con->setEmailTrabajo($headers['emailtrabajo']); //add                      
                    if ($con->addContacto()) { 
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



    
?>