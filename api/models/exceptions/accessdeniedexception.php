<?php
    class AccessDeniedException extends Exception{

        protected $message;

        public function __construct($agentId){
            $this->message = 'Access denied for user '.$agentId;
        }
        

    }


?>