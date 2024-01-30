<?php
class Score
{
	public $score;

	function __construct()
	{
		$this->score = array();
	
	}

	function mostrar($pdo) 
	{
		$this->pdo = $pdo;

		$sql = 'SELECT score, name, time FROM zarandraca ORDER by score DESC, time ASC LIMIT 35';

		$this->pdo->prepare($sql);
		$puesto = 0;
		foreach ($this->pdo->query($sql) as $row) {

		        //echo '<img src="photos/'.$row['name'].'.png" alt="tu dibujo fiera" height="400" width="600">';
				$date = date_create($row['time']);
				//$date = $row['time']; 
				$date_new = date_format($date, 'g:ia \o\n l jS F Y');
				$puesto += 1;
				echo '<div class="score">					    
					    
					    puesto: '.$puesto.' puntaje: '.$row['score'].' nombre: '.$row['name'].',  '.$date_new.'
					    
					  </div>';

		        
		}
		
	}
}

?>