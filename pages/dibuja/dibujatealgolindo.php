
<html>
<head>
  <title>♤💣  𝓒ｏĹσŘㄖＥ𝒶 Ữη 𝐏𝔬𝓛𝓘тᶤ𝓬Ｏ  👍🐸</title>
  <link href="../../favicon.ico" rel="shortcut icon" type="image/x-icon" />
  <meta charset="UTF-8">
  <script language="javascript" type="text/javascript" src="../../lib/p5.js"></script>
  <!-- uncomment lines below to include extra p5 libraries -->
  <script language="javascript" src="../../lib/p5.dom.js"></script>
  <script language="javascript" src="../../lib/p5.sound.js"></script>
  <script language="javascript" type="text/javascript" src="js/sketch.min.js"></script>
  <script language="javascript" src="../../lib/jQuery-3.3.1.js"></script>
  <script language="javascript" src="js/cursor-effect-dibuja.js"></script>

  <!-- Link to our stylesheet! -->
   <link rel="stylesheet" href="css/style.css">
  <!-- this line removes any default padding and style. you might only need one of these values set. -->
  <style> body {padding: 0; margin: 0;} </style>
  
  <!-- https://elrumordelaluz.github.io/csshake/ 
    <link rel="stylesheet" type="text/css" href="http://csshake.surge.sh/csshake.min.css">-->
    <link rel="stylesheet" type="text/css" href="../../css/cssshake/csshake.min.css">
    
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
    <div class="dibuja-container">
            <!-- preloading gifhttps://stackoverflow.com/questions/22131821/how-can-i-display-a-loading-gif-until-an-entire-html-page-has-been-loaded -->
            <div id="loadingDibuja"></div>
            
        <div class="shake-crazy  shake-constant shake-constant--hover" id="img-dibuja-1">
         <img src="img/gifs/adiocat.gif" alt="Smiley face"> 
        </div>
        <div class="shake-crazy  shake-constant shake-constant--hover" id="img-dibuja-2">
                 <img src="img/gifs/ANIBLACKCATSILOUETTERUNNING.gif" alt="Smiley face"> 
        </div>
        <div class="shake-crazy  shake-constant shake-constant--hover" id="img-dibuja-3">
                 <img src="img/gifs/BlinkCat.gif" alt="Smiley face"> 
        </div>
        <div class="shake-crazy  shake-constant shake-constant--hover" id="img-dibuja-4">
                 <img src="img/gifs/cat_looks_back.gif" alt="Smiley face"> 
        </div>
        <div class="shake-crazy  shake-constant shake-constant--hover" id="img-dibuja-5">
                 <img src="img/gifs/cat_md_wht.gif" alt="Smiley face"> 
        </div>
        <div class="shake-crazy  shake-constant shake-constant--hover" id="img-dibuja-6">
                 <img src="img/gifs/cat-mail.gif" alt="Smiley face"> 
        </div>
        <div class="shake-crazy  shake-constant shake-constant--hover" id="img-dibuja-7">
                 <img src="img/gifs/cat-relaxing.gif" alt="Smiley face"> 
        </div>
        <div class="shake-crazy  shake-constant shake-constant--hover" id="img-dibuja-8">
                 <img src="img/gifs/cat.gif" alt="Smiley face"> 
        </div>
        <div class="shake-crazy  shake-constant shake-constant--hover" id="img-dibuja-9">
                 <img src="img/gifs/catgoofywink.gif" alt="Smiley face"> 
        </div>
        <div class="shake-crazy  shake-constant shake-constant--hover" id="img-dibuja-10">
                 <img src="img/gifs/catwalkingani.gif" alt="Smiley face"> 
        </div>
        <div class="shake-crazy  shake-constant shake-constant--hover" id="img-dibuja-11">
                 <img src="img/gifs/kittysnow.gif" alt="Smiley face"> 
        </div>
        <div class="shake-crazy  shake-constant shake-constant--hover" id="img-dibuja-12">
                 <img src="img/gifs/sweetbaby.gif" alt="Smiley face"> 
        </div>
        
        <h1 id="color-title"><div id="titulo-1">c</div><div id="titulo-2">0</div><div id="titulo-3">l</div> <div id="titulo-4">0</div><div id="titulo-5">R</div> <div id="titulo-6">e</div> <div id="titulo-7">A</div></h1>
    	 <button id="save" onclick="saveMyCanvas()">publicar mi dibujo</button> 
    
       <label class="label-color">
         <div id="color-1">dibujas sosteniendo el click con el mouse como en el paint,para cambiar de color apreta la tecla en el teclado que corresponda <br></div> 
         <div id="color-2">negro: apreta la n <br></div> 
         <div id="color-3">azul: la a <br></div>
         <div id="color-4">verde: la v <br></div>
         <div id="color-5">morado: la m <br></div>
         <div id="color-6">rojo: la r <br></div>
         <div id="borrador">para el borrador: la b (no funca, perddonn :(( )</div>
       </label>
    
       <label class="label-size">
          <div id="size-title">para cambiar el grosor de la linea tambien apreta en el teclado los numeros que correspondan <br></div>
          <div id="size-1">1: re finita <br></div>
          <div id="size-2">2: un toque mas gruesa pero sigue siendo fina <br></div>
          <div id="size-3">3: mas comun capaz <br></div>
          <div id="size-4">4: gruesa <br></div>
          <div id="size-5">5: muy gruesa <br></div>
          <div id="size-6">6: malisima</div>
       </label>
       
   </div> 

<div class="img-container">
<?php
  include_once 'Imagenes.php';
  $imagenes = new Imagenes();
  $imagenes->mostrar($conexion->pdo);
?>
</div>
</body>
</html>