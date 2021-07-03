<?php
    require_once('models/cita.php');
    require_once('models/horario.php');
    require_once('models/contacto.php');
    require_once('models/paciente.php');
    require_once('models/contactoEmergencia.php');
    require_once('config/json.php');
    //methods
    if($_SERVER['REQUEST_METHOD']=='GET'){
        //get one
        if($action == ''){
           //get all
           if($parameter == ''){
                echo json_encode(array(
                    'status' => 0,
                    'citas' => Json::listToArray(Cita::getAll())
                ));
           }
           else{
                try {
                    $cita = new Cita($parameter);
                    echo json_encode(array(
                    'status' => 0,
                    'cita' => json_decode($cita->toJson())
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
        else{
            if($action == 'medico'){
                
                if($parameter != ''){
                    echo json_encode(array(
                        'status' => 0,
                        'citaspormedico' => Json::listToArray(Cita::getCitasPorMedico($parameter))
                   ));
                }
            }
            if($action == 'consultorio'){
                
                if($parameter != ''){
                    echo json_encode(array(
                        'status' => 0,
                        'citasporconsultorio' => Json::listToArray(Cita::getCitasPorConsultorio($parameter))
                   ));
                }
            }
            if($action == 'fecha'){
                $headers = getallheaders();
                if(isset($headers['fecha'])){
                    echo json_encode(array(
                        'status' => 0,
                        'citasporfecha' => Json::listToArray(Cita::getCitasPorFecha($headers['fecha']))
                    ));
                }
                else{
                    echo json_encode(array('status' => 999, 'errorMessage' => 'Missing parameters'));
                }
               
                
            }
            if($action == 'fechaesp'){
                $headers = getallheaders();
                if(isset($headers['fecha'])&&isset($headers['esp'])){
                    echo json_encode(array(
                        'status' => 0,
                        'citasfechaesp' => Json::listToArray(Cita::getCitasPorFechaEspecialidad($headers['fecha'],$headers['esp']))
                    ));
                }
                else{
                    echo json_encode(array('status' => 999, 'errorMessage' => 'Missing parameters'));
                }
               
                
            }
            if($action == 'consultoriosdisponibles'){
                $headers = getallheaders();
                if(isset($headers['especialidad'])&&isset($headers['dia'])&&
                isset($headers['hora'])&&isset($headers['fecha'])){
                    echo json_encode(array(
                        'status' => 0,
                        'consultorios' => Json::listToArray(Cita::getConsultoriosDisponibles(
                            $headers['especialidad'],$headers['dia'],$headers['hora'],$headers['fecha']))
                    ));
                }
                else{
                    echo json_encode(array('status' => 999, 'errorMessage' => 'Missing parameters'));
                }
               
                
            }
            if($action == 'consultoriosdisponibleshabilitados'){
                $headers = getallheaders();
                if(isset($headers['especialidad'])){
                    echo json_encode(array(
                        'status' => 0,
                        'consultorios' => Json::listToArray(Cita::getConsultoriosEspecialidadHabilitados(
                            $headers['especialidad']))
                    ));
                }
                else{
                    echo json_encode(array('status' => 999, 'errorMessage' => 'Missing parameters'));
                }
               
                
            }
            if($action == 'fechahora'){
                $headers = getallheaders();
                if(isset($headers['fecha'])  && isset($headers['pac'])){
                    echo json_encode(array(
                        'status' => 0,
                        'citasfechahora' => Json::listToArray(Cita:: getCitasPorFechaPac(
                            $headers['fecha'],$headers['pac']))
                    ));
                }
                else{
                    echo json_encode(array('status' => 999, 'errorMessage' => 'Missing parameters'));
                }
               
                
            }
            if($action == 'citascanceladas'){
                $headers = getallheaders();
                if(isset($headers['idpaciente'])){
                    
                    echo json_encode(array(
                        'status' => 0,
                        'citascanceladas' =>Cita::getCitasCanceladas($headers['idpaciente'])
                    ));
                }
                else{
                    echo json_encode(array('status' => 999, 'errorMessage' => 'Missing parameters'));
                }
            }
           
            
        }
        
        
       
    }


    if($_SERVER['REQUEST_METHOD']=='POST'){
        
        if($action == 'add'){
            //get headers
            $headers = getallheaders();
            //check headers
            if(isset($headers['fecha']) && isset($headers['paciente']) 
                && isset($headers['medico'])  && isset($headers['especialidad']) && isset($headers['tratamiento'])
                && isset($headers['consultorio']) && isset($headers['hora']) && isset($headers['dia'])
                && isset($headers['usuario'])){
                    
                    $cita = new Cita(); //set values 
                    $cita->setFecha($headers['fecha']); 
                    $cita->setPaciente($headers['paciente']); //add 
                    $cita->setMedico($headers['medico']); //add
                    $cita->setEspecialidad($headers['especialidad']); //add
                    if($headers['tratamiento'] != '' || $headers['tratamiento'] != null){
                        $cita->setTratamiento($headers['tratamiento']); //add  
                    }else{
                        $cita->setTratamiento(null); //add  
                    }
                    
                    $cita->setConsultorio($headers['consultorio']); //add 
                    $cita->setHora(Horario::getHorarioIdByDayHour($headers['dia'],$headers['hora'])); //add 
                    $cita->setUsuario($headers['usuario']); //add                   
                    if ($cita->addCita()) { 
                        echo json_encode(array( 
                            'status' => 0, 
                            'newid' => Cita::getLastCitaId(),
                            'message' =>  'Cita agendada exitosamente'
                            
                        )); 
                    } 
                    else 
                    echo json_encode(array( 
                        'status' => 2, 
                        'errorMessage' => 'Error al registrar cita' 
                    ));        
            }
            else{
                echo json_encode(array('status' => 999, 'errorMessage' => 'Missing parameters'));
            }
            
        }
        if($action == 'addnew'){
            //get headers
            $headers = getallheaders();
            //check headers
            if(isset($headers['fecha'])&& isset($headers['medico']) && isset($headers['especialidad'])  && isset($headers['tratamiento']) 
                && isset($headers['consultorio']) && isset($headers['hora'])  && isset($headers['dia'])
                && isset($headers['usuario']) && isset($headers['appaterno']) && isset($headers['apmaterno']) 
                && isset($headers['direccion']) && isset($headers['genero']) && isset($headers['fechanac']) && isset($headers['nombre'])&&isset($headers['telcasaP']) 
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
                        $pac->setGenero($headers['genero']);
                        $pac->setFechaNac($headers['fechanac']);          
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
                                    $cita = new Cita(); //set values 
                                    $cita->setFecha($headers['fecha']); 
                                    $cita->setPaciente(Paciente::getLastPacienteId()); //add 
                                    $cita->setMedico($headers['medico']); //add 
                                    $cita->setEspecialidad($headers['especialidad']); //add 
                                    if($headers['tratamiento'] != '' || $headers['tratamiento'] != null){
                                        $cita->setTratamiento($headers['tratamiento']); //add  
                                    }else{
                                        $cita->setTratamiento(null); //add  
                                    }
                                    $cita->setConsultorio($headers['consultorio']); //add 
                                    $cita->setHora(Horario::getHorarioIdByDayHour($headers['dia'],$headers['hora'])); //add 
                                    $cita->setUsuario($headers['usuario']); //add                   
                                    if ($cita->addCita()) { 
                                        echo json_encode(array( 
                                            'status' => 0, 
                                            'newid' => Cita::getLastCitaId(),
                                            'message' =>  'Cita añadida exitosamente'
                                            
                                        )); 
                                    } 
                                    else 
                                    echo json_encode(array( 
                                        'status' => 2, 
                                        'errorMessage' => 'Could not add cita' 
                                    ));        
                                }  
                                else 
                                echo json_encode(array( 
                                    'status' => 2, 
                                    'errorMessage' => 'Could not add ce' 
                                ));         
                            }
                            else 
                            echo json_encode(array( 
                                'status' => 2, 
                                'errorMessage' => 'Could not add contacto de emergencia' 
                            ));     
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
        
        if($action == 'updatestatus'){
             //get headers
             $headers = getallheaders();
             //check headers
             if(isset($headers['id']) && isset($headers['status'])){
                     
                     $cita = new Cita(); //set values 
                     $cita->setId($headers['id']); 
                     $cita->setStatus($headers['status']); //add                                      
                     if ($cita->updateStatusCita()) { 
                         echo json_encode(array( 
                             'status' => 0, 
                             'message' =>  'cita updated successfully'
                             
                         )); 
                     } 
                     else 
                     echo json_encode(array( 
                         'status' => 2, 
                         'errorMessage' => 'Could not update cita' 
                     ));        
             }
             else{
                 echo json_encode(array('status' => 999, 'errorMessage' => 'Missing parameters'));
             }
        }
       
    }
?>