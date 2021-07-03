<?php
    require_once('models/paciente.php');
    require_once('models/contactoEmergencia.php');
    require_once('models/contacto.php');
    require_once('config/json.php');
    //methods
    if($_SERVER['REQUEST_METHOD']=='GET'){
        //get one
        if($action == ''){
           //get all
           if($parameter == ''){
                echo json_encode(array(
                    'status' => 0,
                    'pacientes' => Json::listToArray(Paciente::getAll())
                ));
           }
           else{
                try {
                    $pac = new Paciente($parameter);
                    echo json_encode(array(
                    'status' => 0,
                    'paciente' => json_decode($pac->toJson())
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
         //get one
        if($action == 'byname'){
           $headers = getallheaders();
           if(isset($headers['palabra'])){
                echo json_encode(array(
                    'status' => 0,
                    'pacientes' => Json::listToArray(Paciente::getPacientesByName($headers['palabra']))
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
            if(isset($headers['appaterno']) && isset($headers['apmaterno']) 
            && isset($headers['direccion']) && isset($headers['nombre'])&&isset($headers['telcasaP']) 
            && isset($headers['telmovilP'])&& isset($headers['teloficinaP']) 
            && isset($headers['emailpersonalP'])&& isset($headers['emailtrabajoP'])
            && isset($headers['nombreCE'])&&isset($headers['telcasaE']) 
            && isset($headers['telmovilE'])&& isset($headers['teloficinaE']) 
            && isset($headers['emailpersonalE'])&& isset($headers['emailtrabajoE'])){

                    
                $con = new Contacto(); //set values 
                $con->setTelefonoCasa($headers['telcasaP']); 
                $con->setTelefonoMovil($headers['telmovilP']); //add 
                $con->setTelefonoOficina($headers['teloficinaP']); //add 
                $con->setEmailPersonal($headers['emailpersonalP']); //add     
                $con->setEmailTrabajo($headers['emailtrabajoP']); //add                      
                if ($con->addContacto()) { 
                    
                    $pac = new Paciente(); //set values  
                    $pac->setApMaterno($headers['apmaterno']);
                    $pac->setApPaterno($headers['appaterno']);
                    $pac->setNombre($headers['nombre']);            
                    $pac->setDireccion($headers['direccion']);
                    $pac->setContacto(Contacto::getLastContactId());
                                                       
                    if ($pac->addPaciente()) { 

                        $conCE = new Contacto(); //set values 
                        $conCE->setTelefonoCasa($headers['telcasaE']); 
                        $conCE->setTelefonoMovil($headers['telmovilE']); //add 
                        $conCE->setTelefonoOficina($headers['teloficinaE']); //add 
                        $conCE->setEmailPersonal($headers['emailpersonalE']); //add     
                        $conCE->setEmailTrabajo($headers['emailtrabajoE']); //add
                        if ($conCE->addContacto()) { 
                            $conE = new ContactoEmergencia(); //set values 
                    
                            $conE->setNombre($headers['nombreCE']); //add 
                            $conE->setContacto(Contacto::getLastContactId()); //add 
                                            
                            if ($conE->addContactoEmergencia(Paciente::getLastPacienteId())) { 
                                echo json_encode(array( 
                                    'status' => 0, 
                                    'message' =>  'paciente added successfully'
                                    
                                )); 
                            }       
                        }
                    

                                 


                    } 
                    else 
                    echo json_encode(array( 
                        'status' => 2, 
                        'errorMessage' => 'Could not add paciente' 
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