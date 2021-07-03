<?php

 //header
 header('Access-Control-Allow-Origin: *');
 //allow methods
 header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');

 header('Access-Control-Allow-Headers: *');
    if($_SERVER['REQUEST_METHOD'] == 'POST'){
        $dir = "photos/";
        move_uploaded_file($_FILES["image"]["tmp_name"], $dir. $_FILES["image"]["name"]);
    }


?>