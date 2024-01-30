<?php

//traigo la conexion a la db
	include_once 'Conexion.php';
	$conexion = new Conexion();
	//la variable de conexion me sirve para hacer consultas
	$pdo = $conexion->pdo;

	$hiscore = $_POST['hiscore']; 
	$author = $_POST['author']; 

	/**
	* Inserta puntaje
	*/


			$sql = "INSERT INTO zarandraca(id,name,score,time) VALUES (?, ?, ?, ?)";

	        $usu = null;

	        $date = date('Y-m-d H:i:s');

	         

	        $stmt = $pdo->prepare($sql);

	        $stmt->bindParam(1, $usu, PDO::PARAM_INT, 10);

	        $stmt->bindParam(2, $author, PDO::PARAM_STR, 20);

	        $stmt->bindParam(3, $hiscore, PDO::PARAM_INT, 20);

	        $stmt->bindParam(4, $date, PDO::PARAM_STR, 20);

	        $stmt->execute();
	      
	die;













?>