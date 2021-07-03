<?php
    class Security
    {
        public static function generateToken()
        {
            $today = date_create();
            $token = '';
            //date only
            if(func_num_args() == 0)
                $token = sha1(date_format($today,'Ymd'));
            //user id and date
            if(func_num_args() == 1)
            {
                $user = func_get_arg(0);
                $token = sha1($user.(date_format($today,'Ymd')));

            }
            return $token;
        }
    }

?>