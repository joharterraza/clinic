<?php
    
    //header
    header('Access-Control-Allow-Origin: *');
    //allow methods
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');

    header('Access-Control-Allow-Headers: *');
    //request url    
    $requestUri = substr($_SERVER['REQUEST_URI'], strlen(dirname($_SERVER['PHP_SELF'])));
    //split ur in parts
    $urlParts = explode('/', $requestUri);
    if(sizeof($urlParts)==3 || sizeof($urlParts) ==4){
        //controller
        $controller = $urlParts[1];
        //action
        if(sizeof($urlParts)==4){
            $action = $urlParts[2];
            $parameter = $urlParts[3];
        }
        else{
            $action = '';
            $parameter = $urlParts[2];
        }
        $controller.='controller.php';
        if(file_exists($controller))
            require_once($controller);
        else
        echo json_encode(array('status'=>998, 'errorMessage' => 'Invalid Controller'));


    }
    else
        echo json_encode(array('status'=>999, 'errorMessage' => 'Invalid URL'));

    
    

    
?>