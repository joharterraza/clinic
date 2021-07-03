<?php
    require_once('models/medico.php');
    require_once('models/horarioMedico.php');
    require_once('models/horario.php');
    require_once('models/usuario.php');
    require_once('models/contacto.php');
    require_once('models/roles.php');
    require_once('models/diasLibres.php');
    require_once('config/json.php');
    //methods
    if($_SERVER['REQUEST_METHOD']=='GET'){
        //get one
        if($action == ''){
           //get all
           if($parameter == ''){
                echo json_encode(array(
                    'status' => 0,
                    'medicos' => Json::listToArray(Medico::getAll())
                ));
           }
           else{
                try {
                    $med = new Medico($parameter);
                    echo json_encode(array(
                    'status' => 0,
                    'medico' => json_decode($med->toJson())
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
        if($action == 'searchbyuser'){
            //get all
            $headers = getallheaders();
            if(isset($headers['idusuario'])){
                  
                echo json_encode(array(
                    'status' => 0,
                    'medico' => Json::listToArray(Medico::getMedicoByUsuario($headers['idusuario']))
                ));
            }
            else{
                echo json_encode(array('status' => 999, 'errorMessage' => 'Missing parameters'));
            }
           
        }
       
        if($action == 'especialidades'){
            //get all
            echo json_encode(array(
                'status' => 0,
                'especialidades' => Json::listToArray(Especialidad::getEspecialidad())
            ));
           
        }

        if($action == 'porespecialidad'){
            //get all
            if($parameter !=''){
                echo json_encode(array(
                    'status' => 0,
                    'medicos' => Json::listToArray(Medico::getMedicoByEspecialidad($parameter))
                ));
            }
            else{
                echo json_encode(array('status' => 999, 'errorMessage' => 'Missing parameter'));
            }         
           
           
        }

        if($action == 'diaslibres'){
            //get all
            if($parameter !=''){
                echo json_encode(array(
                    'status' => 0,
                    'diaslibres' => Json::listToArray(DiasLibres::getDiasLibres($parameter))
                ));
            }
            else{
                echo json_encode(array('status' => 999, 'errorMessage' => 'Missing parameter'));
            }         
           
           
        }

        if($action == 'checkfechacitas'){
            $headers = getallheaders();
            if(isset($headers['idMedico'])&&isset($headers['fecha'])){
                if(DiasLibres::checkSiCitasFecha($headers['idMedico'],$headers['fecha']) == true
                || DiasLibres::checkDiasLibresFecha($headers['idMedico'],$headers['fecha']) == true){
                    echo json_encode(array(
                        'status' => 1,
                        'resultado' => 'Fecha no disponible' 
                    ));
                }
                else{
                    echo json_encode(array(
                        'status' => 0,
                        'resultado' => 'Fecha disponible' 
                    )); 
                }     
            }
            else{
                echo json_encode(array('status' => 999, 'errorMessage' => 'Missing parameter'));
            }  
           
           
           
        }

        
       
    }

    if($_SERVER['REQUEST_METHOD']=='POST'){
        
        if($action == 'add'){
            //get headers
            $headers = getallheaders();
            //check headers
            if(isset($headers['appaterno']) && isset($headers['apmaterno']) 
            && isset($headers['nombre']) && isset($headers['cedula'])&&isset($headers['telcasa']) 
            && isset($headers['telmovil']) 
            && isset($headers['teloficina']) && isset($headers['emailpersonal'])
            && isset($headers['emailtrabajo']) && isset($headers['especialidad']) &&isset($headers['idUs'])
            
            && isset($headers['foto']) && isset($headers['contrasena'])
            && isset($headers['tema'])&& isset($headers['lenguage'])&& isset($headers['role'])){



                $con = new Contacto(); //set values 
                $con->setTelefonoCasa($headers['telcasa']); 
                $con->setTelefonoMovil($headers['telmovil']); //add 
                $con->setTelefonoOficina($headers['teloficina']); //add 
                $con->setEmailPersonal($headers['emailpersonal']); //add     
                $con->setEmailTrabajo($headers['emailtrabajo']); //add                      
                if ($con->addContacto()) { 

                    $u = new Usuario(); //set values 
                   
                    $u->setId($headers['idUs']); //add 
                    $u->setName($headers['nombre']." ".$headers['appaterno']." ".$headers['apmaterno']); //add 
                    $u->setPhoto($headers['foto']); //add 
                    $u->setPassword($headers['contrasena']); //add 
                    $u->setTheme($headers['tema']); //add 
                    $u->setLanguage($headers['lenguage']); //add 
                                    
                    if ($u->createUsuario()) { 

                        if($u->setRole($headers['idUs'], $headers['role'])){

                            $med = new Medico(); //set values  
                            $med->setNombre($headers['nombre']);
                            $med->setApPaterno($headers['appaterno']);
                            $med->setApMaterno($headers['apmaterno']);
                            $med->setCedula_profesional($headers['cedula']);
                            $med->setContacto(Contacto::getLastContactId());
                            $med->setUsuario($headers['idUs']);
                                                               
                            if ($med->addMedico()) { 

                                if(Medico::setEspecialidad(Medico::getLastMedicoId(), $headers['especialidad'])){
                                    echo json_encode(array( 
                                        'status' => 0, 
                                        'message' =>  'medico added successfully'
                                        
                                    )); 
                                }
                                else{
                                    echo json_encode(array( 
                                        'status' => 2, 
                                        'message' =>  'Could not add especialidad'
                                        
                                    )); 
                                }
                               
                            } 
                            else{
                                echo json_encode(array( 
                                    'status' => 2, 
                                    'message' =>  'Could not add medico'
                                    
                                )); 
                            }
                           
                        }
                        else{
                            echo json_encode(array( 
                                'status' => 2, 
                                'message' =>  'Could not add role'
                                
                            )); 
                        }

                      
                       
                    } 
                    else{
                        echo json_encode(array( 
                            'status' => 2, 
                            'message' =>  'Could not add usuario'
                            
                        )); 
                    }


                   
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
        if($action == 'addhorario'){
            $headers = getallheaders();
            if(isset($headers['dia']) 
            && isset($headers['horainicial'])&& isset($headers['horafinal'])){

                $hm = new HorarioMedico();
                $hm->setHoraInicio(Horario::getHorarioIdByDayHour($headers['dia'],$headers['horainicial'])); 
                $hm->setHoraFinal(Horario::getHorarioIdByDayHour($headers['dia'],$headers['horafinal'])); //add 
                if($hm->addHorarioMedico(Medico::getLastMedicoId())){
    
                    echo json_encode(array( 
                        'status' => 0, 
                        'message' =>  'horario added successfully'
                        
                    )); 
    
                }
                else {
                    echo json_encode(array( 
                        'status' => 2, 
                        'errorMessage' => 'Could not add horario' 
                    )); 
                }
               
               
            }
            else{
                echo json_encode(array('status' => 999, 'errorMessage' => 'Missing parameters'));
            }
           
        }
        if($action == 'addespecialidad'){
            $headers = getallheaders();
            if(isset($headers['especialidad'])&& isset($headers['idMedico'])){

                if(Medico::setEspecialidad($headers['idMedico'], $headers['especialidad'])){
                    echo json_encode(array( 
                        'status' => 0, 
                        'message' =>  'Especilidad agregada exitosamente'
                        
                    )); 
                }
                else 
                echo json_encode(array( 
                    'status' => 2, 
                    'errorMessage' => 'Could not add especialidad' 
                )); 
               
            }
            else{
                echo json_encode(array('status' => 999, 'errorMessage' => 'Missing parameters'));
            }
           
        }
        if($action == 'adddialibre'){
            $headers = getallheaders();
            if(isset($headers['idMedico'])&& isset($headers['fecha'])){

                if(DiasLibres::agregarDiasLibres($headers['idMedico'], $headers['fecha'])){
                    echo json_encode(array( 
                        'status' => 0, 
                        'message' =>  'Dia Libre agregado correctamente'
                        
                    )); 
                }
                else 
                echo json_encode(array( 
                    'status' => 2, 
                    'errorMessage' => 'No se agrego dia libre' 
                )); 
               
            }
            else{
                echo json_encode(array('status' => 999, 'errorMessage' => 'Missing parameters'));
            }
        }

       
    }


   
?>