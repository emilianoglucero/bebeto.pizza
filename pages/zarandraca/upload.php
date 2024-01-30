<?php
	//traigo la conexion a la db
	include_once 'Conexion.php';
	$conexion = new Conexion();
	//la variable de conexion me sirve para hacer consultas
	$pdo = $conexion->pdo;

	$hiscore = $_POST['hiscore']; 

	/**
	* Compara si el puntaje califica para entrar entre los 35 mejores
	*/

	$score = 'SELECT score FROM zarandraca ORDER by score DESC, time ASC LIMIT 34, 1 ';

	$stmt1 = $pdo->prepare($score);
	$stmt1->execute();
	$result = $stmt1->fetch(PDO::FETCH_ASSOC);

	/*
	* Si es 1 = no hay registros en ese puesto o superaste la puntuacion de ese puesto, por lo tanto puede escribir su record
	* Si es 2 = hay registros en ese puesto y no lo superaste, por lo tanto perdiste y no escribis nada 
	*/

	if ( ! $result) {
		$inserted = 1;		
	} else{
		foreach ($pdo->query($score) as $row) {

			if ($hiscore > $row['score'] ) {
			
				 $inserted = 1;

			} else {
				$inserted = 2;
			}
		}	
}
	//$inserted = true;
	echo $inserted;


?>