<?php
class Conexion
{
	var $host='localhost';
	var $dbname='bebeeeod_bebeto';
	var $port =  '3306';
	var $user='bebeto';
	var $psw='bebettto';
	
	var $pdo;

	function __construct()
	{
		$this->pdo = new PDO("mysql:host=$this->host;dbname=$this->dbname;port=$this->port", $this->user, $this->psw);
	
	}
}

?>