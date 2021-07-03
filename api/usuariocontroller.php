<?php
    //require files
    require_once('models/usuario.php');
    require_once('models/medico.php');
    require_once('config/json.php');
    require_once('models/roles.php');
    require_once('models/menuItems.php');
    
    //get
    if($_SERVER['REQUEST_METHOD'] == 'GET'){
        if($parameter==''){
            if($action == ''){
                //get all
                echo json_encode(array(
                    'status'=>0,
                    'users'=> Json::listToArray(Usuario::getAll())
                ));
            }
            //login
            if($action == 'login'){
                $headers = getallheaders();
                //check headers
                if(isset($headers['username']) && isset($headers['password']) ){
                    //headers
                    $userName = $headers['username'];
                    $password = $headers['password'];
                
                    //login
                    try{
                        $u = new Usuario($userName,$password);
                        
                        echo json_encode(array('status'=>0, 'user'=> json_decode($u->toJson())));
                    }
                    catch(AccessDeniedException $ex){
                        echo json_encode(array('status'=>500, 'errorMessage'=>$ex->getMessage()));
                    }
                   
                }
                else
                    echo json_encode(array('status'=>999, 'errorMessage'=>'Missing security headers'));
            }
        }
        else{
            if($action == 'exists'){
                if(Usuario::checkUserExists($parameter)){
                    echo json_encode(array(
                        'status'=>0,
                        'message'=> 'El usuario existe'
                    ));
                }
                else{
                    echo json_encode(array(
                        'status'=>2,
                        'message'=> 'Usuario no existe'
                    )); 
                }
               
                   
                
            }
        }
    }
       
    //post
    if($_SERVER['REQUEST_METHOD'] == 'POST'){

        if($action == 'add'){
            //get headers
            $headers = getallheaders();
            //check headers
            if(isset($headers['id']) && isset($headers['nombre']) 
                && isset($headers['foto']) && isset($headers['contrasena'])
                && isset($headers['tema'])&& isset($headers['lenguage'])&& isset($headers['role'])){
                    
                    $u = new Usuario(); //set values 
                   
                    $u->setId($headers['id']); //add 
                    $u->setName($headers['nombre']); //add 
                    $u->setPhoto($headers['foto']); //add 
                    $u->setPassword($headers['contrasena']); //add 
                    $u->setTheme($headers['tema']); //add 
                    $u->setLanguage($headers['lenguage']); //add 
                                    
                    if ($u->createUsuario()) { 

                        if($u->setRole($headers['id'], $headers['role'])){
                            echo json_encode(array( 
                                'status' => 0, 
                                'message' =>  'user added successfully'
                                
                            )); 
                        }

                      
                       
                    } 
                    else 
                    echo json_encode(array( 
                        'status' => 2, 
                        'errorMessage' => 'Could not add user' 
                    )); 
                    
                   
               
               
            }
            else{
                echo json_encode(array('status' => 999, 'errorMessage' => 'Missing parameters'));
            }
            
        }
        if($action == 'cambiocontrasena'){
            //get headers
            $headers = getallheaders();
            //check headers
            if(isset($headers['id']) && isset($headers['password'])){
                    
                    $us = new Usuario(); //set values 
                    $us->setId($headers['id']); 
                    $us->setPassword($headers['password']); //add                                      
                    if ($us->cambiarContrasena()) { 
                        echo json_encode(array( 
                            'status' => 0, 
                            'message' =>  'Contraseña actualizada correctamente'
                            
                        )); 
                    } 
                    else 
                    echo json_encode(array( 
                        'status' => 2, 
                        'errorMessage' => 'Error al cambiar contraseña' 
                    ));        
            }
            else{
                echo json_encode(array('status' => 999, 'errorMessage' => 'Missing parameters'));
            }
       }
    }
    //put
    if($_SERVER['REQUEST_METHOD'] == 'PUT'){

    }
    //delete
    if($_SERVER['REQUEST_METHOD'] == 'DELETE'){

    }

?>