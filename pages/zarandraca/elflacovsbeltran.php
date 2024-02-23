<!-- https://github.com/donnikitos/vite-plugin-php -->

<?php
    include_once 'Conexion.php';
    $conexion = new Conexion();
?>
<!doctype html>
<html>
    <head>
        <!-- <base href="https://bebeto.pizza/pages/zarandraca/elflacovsbeltran.php" /> -->
        <title>Σᄂ VIΛJΣ DΣ ZΛЯΛПDЯΛᄃΛ</title>
        <link href="../../favicon.ico" rel="shortcut icon" type="image/x-icon" />
        <meta name="viewport" content="width=device-width, user-scalable=no">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <link rel="apple-touch-icon" href="assets/icon.png">
        <link rel="apple-touch-icon" sizes="120x120" href="assets/icon-120.png">
        
        <script language="javascript" src="../../lib/jQuery-3.3.1.js"></script>
        
                 <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
         <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/js/bootstrap.min.js" integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl" crossorigin="anonymous"></script>
         <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js" integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q" crossorigin="anonymous"></script>
         <script src=" https://cdnjs.cloudflare.com/ajax/libs/bootbox.js/4.4.0/bootbox.min.js"></script>
        
         <!-- Link to our stylesheet! -->
        <link rel="stylesheet" href="css/styles.css">
        
        <link href="https://fonts.googleapis.com/css?family=Pacifico" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css?family=Italianno" rel="stylesheet">  
        <link href="https://fonts.googleapis.com/css?family=Dawning+of+a+New+Day" rel="stylesheet"> 
        
        <!-- Global site tag (gtag.js) - Google Analytics -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=UA-114029730-1"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
        
          gtag('config', 'UA-114029730-1');
        </script>
        
    </head>
    <body>
        <div id="screen"></div>
            <div class="main-score">
            <?php
              include_once 'Score.php';
              $score = new Score();
              $score->mostrar($conexion->pdo);
            ?>
            </div>
        <script src="phaser.min.js"></script>
        <script src="main.min.js"></script>
        <script src="jumble.min.js">
            $('.score').jumble([180,160,90],[230,20,130],true,false,200);
        </script>

    </body>
</html>