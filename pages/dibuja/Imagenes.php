<?php
class Imagenes
{
	public $imagenes;

	function __construct()
	{
		$this->imagenes = array();
	
	}

	function mostrar($pdo) 
	{
		$this->pdo = $pdo;

		$sql = 'SELECT name, author, time FROM dibujo';

		$this->pdo->prepare($sql);
		
		foreach ($this->pdo->query($sql) as $row) {

		        //echo '<img src="photos/'.$row['name'].'.png" alt="tu dibujo fiera" height="400" width="600">';
				$date = date_create($row['time']);
				//$date = $row['time']; 
				$date_new = date_format($date, 'g:ia \o\n l jS F Y');

		        echo '<div class="img">
					    <a target="_blank" href="photos/'.$row['name'].'.png">
					      <img src="photos/'.$row['name'].'.png" alt="jejejejj" width="300" height="200">
					    </a>
					    <div class="desc">
					    autor: '.$row['author'].' <br>
					    fechayhora: '.$date_new.'
					    </div>
					  </div>';
		        
		}
		
	}
}

?>