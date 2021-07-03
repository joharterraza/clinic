<?php
    //required files
    require_once('mysqlconnection.php');
    require_once('paciente.php');
    require_once('medico.php');
    require_once('tratamiento.php');
    require_once('consultorio.php');
    require_once('contacto.php');
    require_once('especialidad.php');
    require_once('horario.php');
    require_once('usuario.php');
    require_once('exceptions/recordnotfoundexception.php');
    require_once('config/json.php');


    class Cita{
        private $id;
        private $fecha;
        private $paciente;
        private $medico;
        private $especialidad;
        private $tratamiento;
        private $consultorio;
        private $hora;
        private $usuario;
        private $status;
        

        public function setId($id) { $this->id = $id; }
        public function getId() { return $this->id; }
        public function setFecha($fecha) { $this->fecha = $fecha; }
        public function getFecha() { return $this->fecha; }
        public function setPaciente($paciente) { $this->paciente = $paciente; }
        public function getPaciente() { return $this->paciente; }
        public function setMedico($medico) { $this->medico = $medico; }
        public function getMedico() { return $this->medico; }
        public function setEspecialidad($especialidad) { $this->especialidad = $especialidad; }
        public function getEspecialidad() { return $this->especialidad; }
        public function setTratamiento($tratamiento) { $this->tratamiento = $tratamiento; }
        public function getTratamiento() { return $this->tratamiento; }
        public function setConsultorio($consultorio) { $this->consultorio = $consultorio; }
        public function getConsultorio() { return $this->consultorio; }
        public function setHora($hora) { $this->hora = $hora; }
        public function getHora() { return $this->hora; }
        public function setUsuario($usuario) { $this->usuario = $usuario; }
        public function getUsuario() { return $this->usuario; }
        public function getStatus() { return $this->status; }
        public function setStatus($status) { $this->status = $status; }
        public function getStatusDescription(){
            if($this->status != null || $this->status == 0){
                $statusDescription=[
                    0=>'Agendada',                   
                    1=>'Cancelada',
                    2=>'Completada',
                    3=>'En curso',
                    4=>'Reemplazada'             
                ];
                return $statusDescription[$this->status];
            }else return null;
           
            
        }


        public function __construct(){
            $arguments = func_get_args();
            //empty obj
            if(func_num_args()==0){
                $this->id = 0;
                $this->fecha = '';
                $this->paciente = new Paciente();
                $this->medico = new Medico();
                $this->especialidad = new especialidad();
                $this->tratamiento = null;
                $this->consultorio = new Consultorio();
                $this->hora = new Horario();
                $this->usuario = new Usuario();
                $this->status = 0;
               
            }   
            if(func_num_args() == 1){
                $arguments = func_get_args();
                $query = 'select c.id, c.fecha, c.status, c.idPaciente,p.direccion, c.idMedico, m.idUsuario, c.idEspecialidad,
                c.idTratamiento, c.idConsultorio,
                c.idHora, c.idUsuario, u.nombre, u.foto from citas as c 
                join usuarios as u on c.idUsuario = u.id
                join medicos as m on c.idMedico = m.id
                join especialidades as e on c.idEspecialidad = e.id
                join pacientes as p on c.idPaciente = p.id
                where c.id = ?';
                $connection = MySqlConnection::getConnection();
                $command =$connection->prepare($query);
                $command->bind_param('i', $arguments[0]);
                $command->bind_result( $id, $fecha, $status, //cita
                    $idP, $pacienteDir, //paciente               
                    $idM, $idUM, //medico,
                    $idEsp,                
                    $idT,  //tratamiento        
                    $idConsu,  // consultorio
                    $idH,  //horario 
                    $idU,$nombreUsuario, $fotoUsuario); //usuario);
                $command->execute();

                if($command->fetch()){
                    $paciente = new Paciente($idP,$pacienteDir);               
                    $medico = new Medico($idM,$idUM);  
                    $especialidad = new Especialidad($idEsp);
                    if($idT == null || $idT == ''){
                        $tratamiento = null;
                    }  
                    else{
                        $tratamiento = new Tratamiento($idT);
                    }                      
                    $consultorio = new Consultorio($idConsu);
                    $hora = new Horario($idH);
                    $usuario = new Usuario( $idU,$nombreUsuario,$fotoUsuario);

                    $this->id = $id;
                    $this->fecha = $fecha;
                    $this->status = $status;
                    $this->paciente = $paciente;
                    $this->medico = $medico;
                    $this->especialidad = $especialidad;
                    $this->tratamiento = $tratamiento;
                    $this->consultorio = $consultorio;
                    $this->hora = $hora;
                    $this->usuario = $usuario;
                   
                }else {
                    throw new RecordNotFoundException($arguments[0]);
                    mysqli_stmt_close($command);
                    $connection->close();
                }
            }
                 
            
            if(func_num_args()==10){
                
                $this->id = $arguments[0];
                $this->fecha = $arguments[1];
                $this->paciente = $arguments[2];
                $this->medico = $arguments[3];
                $this->especialidad = $arguments[4];
                $this->tratamiento = $arguments[5];
                $this->consultorio = $arguments[6];
                $this->hora = $arguments[7];
                $this->usuario = $arguments[8];
                $this->status = $arguments[9];
                        
                
            }
           
        }

        public function toJson(){
            if($this->tratamiento == null){
                return json_encode(array(
                    'id'=>$this->id,
                    'fecha'=>$this->fecha,
                    'paciente' => json_decode($this->paciente->toJson()),
                    'medico' => json_decode($this->medico->toJson()),
                    'especialidad'=> json_decode($this->especialidad->toJson()),
                    'tratamiento' => null,                  
                    'consultorio' => json_decode($this->consultorio->toJson()),
                    'horario' => json_decode($this->hora->toJson()),
                    'usuario' => json_decode($this->usuario->toJson()),
                    'status'=> array(
                        'id'=> $this->status,
                        'description' => $this->getStatusDescription()
                    )
                    
                ));
            }
            else{
                return json_encode(array(
                    'id'=>$this->id,
                    'fecha'=>$this->fecha,
                    'paciente' => json_decode($this->paciente->toJson()),
                    'medico' => json_decode($this->medico->toJson()),
                    'especialidad'=> json_decode($this->especialidad->toJson()),
                    'tratamiento' => json_decode($this->tratamiento->toJson()),
                    'consultorio' => json_decode($this->consultorio->toJson()),
                    'horario' => json_decode($this->hora->toJson()),
                    'usuario' => json_decode($this->usuario->toJson()),
                    'status'=> array(
                        'id'=> $this->status,
                        'description' => $this->getStatusDescription()
                    )
                    
                ));
            }
           

            


        }


        public static function getAll() {
            $list = array(); //create list
            $connection = MySqlConnection::getConnection();//get connection
            $query = 'select c.id, c.fecha, c.status, c.idPaciente,p.direccion, c.idMedico, m.idUsuario, c.idEspecialidad,
            c.idTratamiento, c.idConsultorio,
            c.idHora, c.idUsuario, u.nombre, u.foto from citas as c 
            join usuarios as u on c.idUsuario = u.id
            join medicos as m on c.idMedico = m.id
            join especialidades as e on c.idEspecialidad = e.id
            join pacientes as p on c.idPaciente = p.id';//query
            $command = $connection->prepare($query);//prepare statement
            $command->execute();//execute
            $command->bind_result(
                $id, $fecha, $status, //cita
                $idP, $pacienteDir, //paciente               
                $idM, $idUM, //medico  
                $idEsp,              
                $idT,  //tratamiento        
                $idConsu,  // consultorio
                $idH,  //horario 
                $idU,$nombreUsuario, $fotoUsuario //usuario
            );//bind results
            //fetch data
            while ($command->fetch()) {                
                $paciente = new Paciente($idP,$pacienteDir);               
                $medico = new Medico($idM,$idUM);  
                $especialidad = new Especialidad($idEsp);
                if($idT == null || $idT == ''){
                    $tratamiento = null;
                }  
                else{
                    $tratamiento = new Tratamiento($idT);
                }    
               
                $consultorio = new Consultorio($idConsu);
                $hora = new Horario($idH);
                $usuario = new Usuario( $idU,$nombreUsuario,$fotoUsuario);
                array_push($list, new Cita($id,$fecha, $paciente,$medico,$especialidad,$tratamiento,$consultorio,$hora,$usuario,$status));//add item to list
            }
            mysqli_stmt_close($command); //close command
            $connection->close(); //close connection
            return $list; //return list
        }

        //citas por consultorio
        public static function getCitasPorConsultorio($idConsultorio) {
            $list = array(); //create list
            $connection = MySqlConnection::getConnection();//get connection
            $query = 'select c.id, c.fecha, c.status, c.idPaciente,p.direccion, c.idMedico, m.idUsuario, c.idEspecialidad,
            c.idTratamiento, c.idConsultorio,
            c.idHora, c.idUsuario, u.nombre, u.foto from citas as c 
            join usuarios as u on c.idUsuario = u.id
            join medicos as m on c.idMedico = m.id
            join especialidades as e on c.idEspecialidad = e.id
            join pacientes as p on c.idPaciente = p.id
            where c.idConsultorio = ?';//query
            $command = $connection->prepare($query);//prepare statement
           
            $command->bind_param('s', $idConsultorio); //bind parameters 
            $command->bind_result(
                $id, $fecha, $status, //cita
                $idP, $pacienteDir, //paciente               
                $idM, $idUM, //medico
                $idEsp,                
                $idT,  //tratamiento        
                $idConsu,  // consultorio
                $idH,  //horario 
                $idU,$nombreUsuario, $fotoUsuario //usuario
            );//bind results
            $command->execute();//execute
            //fetch data
            while ($command->fetch()) {                
                $paciente = new Paciente($idP,$pacienteDir);               
                $medico = new Medico($idM,$idUM); 
                $especialidad = new Especialidad($idEsp); 
                if($idT == null || $idT == ''){
                    $tratamiento = null;
                }  
                else{
                    $tratamiento = new Tratamiento($idT);
                }    
               
                $consultorio = new Consultorio($idConsu);
                $hora = new Horario($idH);
                $usuario = new Usuario( $idU,$nombreUsuario,$fotoUsuario);
                array_push($list, new Cita($id,$fecha, $paciente,$medico,$especialidad,$tratamiento,$consultorio,$hora,$usuario,$status));//add item to list
            }
            
            mysqli_stmt_close($command); //close command
            $connection->close(); //close connection
            return $list; //return list
        }

        //citas por medico
        public static function getCitasPorMedico($idMedico) {
            $list = array(); //create list
            $connection = MySqlConnection::getConnection();//get connection
            $query = 'select c.id, c.fecha, c.status, c.idPaciente,p.direccion, c.idMedico, m.idUsuario, c.idEspecialidad,
            c.idTratamiento, c.idConsultorio,
            c.idHora, c.idUsuario, u.nombre, u.foto from citas as c 
            join usuarios as u on c.idUsuario = u.id
            join medicos as m on c.idMedico = m.id
            join especialidades as e on c.idEspecialidad = e.id
            join pacientes as p on c.idPaciente = p.id
            where c.idMedico = ?';//query
            $command = $connection->prepare($query);//prepare statement
            
            $command->bind_param('i', $idMedico); //bind parameters 
            $command->bind_result(
                $id, $fecha, $status, //cita
                $idP, $pacienteDir, //paciente               
                $idM, $idUM, //medico  
                $idEsp,             
                $idT,  //tratamiento        
                $idConsu,  // consultorio
                $idH,  //horario 
                $idU,$nombreUsuario, $fotoUsuario //usuario
            );//bind results
            $command->execute();//execute
            //fetch data
            while ($command->fetch()) {                
                $paciente = new Paciente($idP,$pacienteDir);               
                $medico = new Medico($idM,$idUM);  
                $especialidad = new Especialidad($idEsp);
                if($idT == null || $idT == ''){
                    $tratamiento = null;
                }  
                else{
                    $tratamiento = new Tratamiento($idT);
                }    
               
                $consultorio = new Consultorio($idConsu);
                $hora = new Horario($idH);
                $usuario = new Usuario( $idU,$nombreUsuario,$fotoUsuario);
                array_push($list, new Cita($id,$fecha, $paciente,$medico,$especialidad,$tratamiento,$consultorio,$hora,$usuario,$status));//add item to list
            }
            mysqli_stmt_close($command); //close command
            $connection->close(); //close connection
            return $list; //return list
        }

        public function updateStatusCita() { 
            $connection = MySqlConnection::getConnection();//get connection 
            $query = 'update citas set status= ? where id=?';//query 
            $command = $connection->prepare($query);//prepare statement 
            $command->bind_param('ii', $this->status, $this->id ); //bind parameters 
            $result = $command->execute();//execute mysqli_stmt_close($command); //close command 
            $connection->close(); //close connection 
            return $result; //return result 
        }

        public function addCita() { 
            $connection = MySqlConnection::getConnection();//get connection 
            $query = 'insert into citas (fecha,idPaciente,idMedico,idEspecialidad,idTratamiento,idConsultorio,idHora,idUsuario) values
            (?,?,?,?,?,?,?,?);';//query 
            $command = $connection->prepare($query);//prepare statement 
            $command->bind_param('siisssis', $this->fecha, $this->paciente, $this->medico, $this->especialidad, $this->tratamiento,$this->consultorio,
            $this->hora,$this->usuario); //bind parameters 
            $result = $command->execute();//execute mysqli_stmt_close($command); //close command 
            $connection->close(); //close connection 
            return $result; //return result 
        }



         //citas por fecha
         public static function getCitasPorFecha($fecha) {
            $list = array(); //create list
            $connection = MySqlConnection::getConnection();//get connection
            $query = 'select c.id, c.fecha, c.status, c.idPaciente,p.direccion, c.idMedico, m.idUsuario, c.idEspecialidad,
            c.idTratamiento, c.idConsultorio,
            c.idHora, c.idUsuario, u.nombre, u.foto from citas as c 
            join usuarios as u on c.idUsuario = u.id
            join medicos as m on c.idMedico = m.id
            join especialidades as e on c.idEspecialidad = e.id
            join pacientes as p on c.idPaciente = p.id
            where c.fecha = ?';//query
            $command = $connection->prepare($query);//prepare statement
            
            $command->bind_param('s', $fecha); //bind parameters 
            $command->bind_result(
                $id, $fecha, $status, //cita
                $idP,$pacienteDir, //paciente               
                $idM, $idUM, //medico,
                $idEsp,                
                $idT,  //tratamiento        
                $idConsu,  // consultorio
                $idH,  //horario 
                $idU,$nombreUsuario, $fotoUsuario //usuario
            );//bind results
            $command->execute();//execute
            //fetch data
            while ($command->fetch()) {                
                $paciente = new Paciente($idP,$pacienteDir);               
                $medico = new Medico($idM,$idUM);  
                $especialidad = new Especialidad($idEsp);
                if($idT == null || $idT == ''){
                    $tratamiento = null;
                }  
                else{
                    $tratamiento = new Tratamiento($idT);
                }    
               
                $consultorio = new Consultorio($idConsu);
                $hora = new Horario($idH);
                $usuario = new Usuario( $idU,$nombreUsuario,$fotoUsuario);
                array_push($list, new Cita($id,$fecha, $paciente,$medico,$especialidad,$tratamiento,$consultorio,$hora,$usuario,$status));//add item to list
            }
            mysqli_stmt_close($command); //close command
            $connection->close(); //close connection
            return $list; //return list
        }

        //citas por fecha
        public static function getCitasPorFechaEspecialidad($fechas,$especialidades) {
            $list = array(); //create list
            $connection = MySqlConnection::getConnection();//get connection
            $query = 'select c.id, c.fecha, c.status, c.idPaciente,p.direccion, c.idMedico, m.idUsuario, c.idEspecialidad,
            c.idTratamiento, c.idConsultorio,
            c.idHora, c.idUsuario, u.nombre, u.foto from citas as c 
            join usuarios as u on c.idUsuario = u.id
            join medicos as m on c.idMedico = m.id
            join especialidades as e on c.idEspecialidad = e.id
            join pacientes as p on c.idPaciente = p.id
            where c.fecha = ? and c.idEspecialidad = ?';//query
            $command = $connection->prepare($query);//prepare statement            
            $command->bind_param('ss', $fechas,$especialidades); //bind parameters 
            $command->bind_result(
                $id, $fecha, $status, //cita
                $idP, $pacienteDir, //paciente               
                $idM, $idUM, //medico,
                $idEsp,                
                $idT,  //tratamiento        
                $idConsu,  // consultorio
                $idH,  //horario 
                $idU,$nombreUsuario, $fotoUsuario //usuario
            );//bind results
            $command->execute();//execute
            //fetch data
            while ($command->fetch()) {                
                $paciente = new Paciente($idP,$pacienteDir);               
                $medico = new Medico($idM,$idUM);  
                $especialidad = new Especialidad($idEsp);
                if($idT == null || $idT == ''){
                    $tratamiento = null;
                }  
                else{
                    $tratamiento = new Tratamiento($idT);
                }    
               
                $consultorio = new Consultorio($idConsu);
                $hora = new Horario($idH);
                $usuario = new Usuario( $idU,$nombreUsuario,$fotoUsuario);
                array_push($list, new Cita($id,$fecha, $paciente,$medico,$especialidad,$tratamiento,$consultorio,$hora,$usuario,$status));//add item to list
            }
            mysqli_stmt_close($command); //close command
            $connection->close(); //close connection
            return $list; //return list
        }

         

        public static function getConsultoriosDisponibles($idEspecialidad, $dia,$hora,$fecha) {
            $list = array(); //create list
            $connection = MySqlConnection::getConnection();//get connection
            $query = 'select cons.id from (select con.id, con.status from consultorios as con
            join consultorioEspecialidad as ce on ce.idConsultorio = con.id
            where ce.idEspecialidad = ?) as cons
            join (select citas.IdConsultorio from citas
            join horarios on citas.idHora = horarios.id
            where idHora = (select id from horarios where dia = ? and hora = ?) and fecha = ?) as comparation
            where cons.id <> comparation.idConsultorio and cons.status = 1;';//query
            $command = $connection->prepare($query);//prepare statement
            
            $command->bind_param('siis', $idEspecialidad,$dia,$hora,$fecha); //bind parameters 
            $command->bind_result(
                $idCons
            );//bind results
            $command->execute();//execute
            //fetch data
            while ($command->fetch()) {           
                
               
                array_push($list, new Consultorio($idCons));//add item to list
            }
            mysqli_stmt_close($command); //close command
            $connection->close(); //close connection
            return $list; //return list
        }

        public static function getConsultoriosEspecialidadHabilitados($idEspecialidad) {
            $list = array(); //create list
            $connection = MySqlConnection::getConnection();//get connection
            $query = 'select c.id from consultorios as c
            join consultorioEspecialidad as ce on ce.idConsultorio = c.id
            where ce.IdEspecialidad = ? and status = 1';//query
            $command = $connection->prepare($query);//prepare statement
            
            $command->bind_param('s', $idEspecialidad); //bind parameters 
            $command->bind_result(
                $idC
            );//bind results
            $command->execute();//execute
            //fetch data
            while ($command->fetch()) {                
               
                array_push($list, new Consultorio($idC));//add item to list
            }
            mysqli_stmt_close($command); //close command
            $connection->close(); //close connection
            return $list; //return list
        }

        public function getLastCitaId(){
            $last = 0; //create list
            $connection = MySqlConnection::getConnection();//get connection
            $query = 'select id from citas order by id desc limit 1';//query
            $command = $connection->prepare($query);//prepare statement           
			$command->execute();//execute
            $command->bind_result($lastId);//bind results
            //fetch data
			while ($command->fetch()) {
				$last = $lastId;
            }
            mysqli_stmt_close($command); //close command
            $connection->close(); //close connection
            return $last; //return list
        }

        /*
        public function checkPacienteSameHour($fecha,$idP,$idH) {
            $list = array(); //create list
            $connection = MySqlConnection::getConnection();//get connection
            $query = 'select id from citas
            where fecha = ? and idPaciente = ? and idHora = ? ';//query
            $command = $connection->prepare($query);//prepare statement
            $command->bind_param('sii', $fecha,$idP,$idH);
			$command->execute();//execute
            $command->bind_result($id);//bind results
            //fetch data
			while ($command->fetch()) {
				array_push($list, $id);//add item to list
            }
            mysqli_stmt_close($command); //close command
            $connection->close(); //close connection
            if(count($list)>0){
                return $id;
            }
            else{
                return 0;
            }
            
        }

        public function checkTratamientoSameHour($fecha,$idP,$idH) {
            $list = array(); //create list
            $connection = MySqlConnection::getConnection();//get connection
            $query = 'select t.duracion from citas as c
            join tratamientos as t on t.id = c.idTratamiento
            where c.fecha = ? and c.idPaciente = ? and c.idHora = ?';//query
            $command = $connection->prepare($query);//prepare statement
            $command->bind_param('sii', $fecha,$idP,$idH);
			$command->execute();//execute
            $command->bind_result($duracion);//bind results
            //fetch data
			while ($command->fetch()) {
				array_push($list, $duracion);//add item to list
            }
            mysqli_stmt_close($command); //close command
            $connection->close(); //close connection
            if(count($list)>0){
                return $duracion;
            }
            else{
                return 0;
            }
            
        }
        */

         //citas por fecha
         public static function getCitasPorFechaPac($fecha,$pac) {
            $list = array(); //create list
            $connection = MySqlConnection::getConnection();//get connection
            $query = 'select c.id, c.fecha, c.status, c.idPaciente,p.direccion, c.idMedico, m.idUsuario, c.idEspecialidad,
            c.idTratamiento, c.idConsultorio,
            c.idHora, c.idUsuario, u.nombre, u.foto from citas as c 
            join usuarios as u on c.idUsuario = u.id
            join medicos as m on c.idMedico = m.id
            join especialidades as e on c.idEspecialidad = e.id
            join pacientes as p on c.idPaciente = p.id
            join horarios as h on c.idHora = h.id
            where c.fecha = ? and c.idPaciente = ?';//query
            $command = $connection->prepare($query);//prepare statement
            
            $command->bind_param('si', $fecha,$pac); //bind parameters 
            $command->bind_result(
                $id, $fecha, $status, //cita
                $idP, $pacienteDir, //paciente               
                $idM, $idUM, //medico,
                $idEsp,                
                $idT,  //tratamiento        
                $idConsu,  // consultorio
                $idH,  //horario 
                $idU,$nombreUsuario, $fotoUsuario //usuario
            );//bind results
            $command->execute();//execute
            //fetch data
            while ($command->fetch()) {                
                $paciente = new Paciente($idP,$pacienteDir);               
                $medico = new Medico($idM,$idUM);  
                $especialidad = new Especialidad($idEsp);
                if($idT == null || $idT == ''){
                    $tratamiento = null;
                }  
                else{
                    $tratamiento = new Tratamiento($idT);
                }    
               
                $consultorio = new Consultorio($idConsu);
                $hora = new Horario($idH);
                $usuario = new Usuario( $idU,$nombreUsuario,$fotoUsuario);
                array_push($list, new Cita($id,$fecha, $paciente,$medico,$especialidad,$tratamiento,$consultorio,$hora,$usuario,$status));//add item to list
            }
            mysqli_stmt_close($command); //close command
            $connection->close(); //close connection
            return $list; //return list
        }
        
        

        public static function getCitasCanceladas($idPaciente){
            $citasC = 5;
            $connection = MySqlConnection::getConnection();
            $query = 'SELECT COUNT(*) FROM citas WHERE status = 1 AND idPaciente = ?';
            $command = $connection->prepare($query);
            $command->bind_param('i',$idPaciente);
            $command->bind_result($citasCan);
            $command->execute();
            while($command->fetch()){
                $citasC = $citasCan;
            }
            mysqli_stmt_close($command); //close command
            $connection->close(); //close connection
            
            return $citasC; //return list
        }



        


    }
    
?>