
<?php
	//traigo la conexion a la db
	include_once 'Conexion.php';
	$conexion = new Conexion();
	//la variable de conexion me sirve para hacer consultas
	$pdo = $conexion->pdo;

	$author = $_POST['author']; 
	$data = $_POST['photo']; 
	list($type, $data) = explode(';', $data);
	list(, $data)      = explode(',', $data);
	$data = base64_decode($data);

	//mkdir($_SERVER['DOCUMENT_ROOT'] . "/photos");
	$photoName = time();
	file_put_contents($_SERVER['DOCUMENT_ROOT'] . "/pages/"."dibuja/"."photos/".$photoName.'.png', $data); //guardo la imagen en el directorio con el nombre

	/**
	* Inserta imagen
	*/
			$sql = "INSERT INTO dibujo(id,name,author,time) VALUES (?, ?, ?, ?)";

	        $usu = null;

	        $nom = (string)$photoName;

	        $date = date('Y-m-d H:i:s');
	 

	        $stmt = $pdo->prepare($sql);

	        $stmt->bindParam(1, $usu, PDO::PARAM_INT, 10);

	        $stmt->bindParam(2, $nom, PDO::PARAM_STR, 20);

	        $stmt->bindParam(3, $author, PDO::PARAM_STR, 20);

	        $stmt->bindParam(4, $date, PDO::PARAM_STR, 20);

	        $stmt->execute();

	die;
?>
