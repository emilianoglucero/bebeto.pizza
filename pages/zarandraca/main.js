//variable para determinar si cumplio con elminimo para anotarse al marcador
//var global = this; // in global scope.
//var inserted;
// import watt from "./assets/watt.mp3";
// import jadeo from "./assets/jadeo.mp3";
// import aullido from "./assets/aullido.mp3";

// import birdie from "./assets/birdie.png";
// import clouds from "./assets/clouds.png";
// import finger from "./assets/finger.png";
// import fence from "./assets/fence.png";
// import peron from "./assets/peron.mp3";
// import hurt from "./assets/hurt.wav";

var DEBUG = false;
var SPEED = 690;
var GRAVITY = 40;
var FLAP = 620;
var SPAWN_RATE = 1 / 1.2;
var OPENING = 134;

var myMake = [
  "./assets/watt.mp3",
  "./assets/jadeo.mp3",
  "./assets/aullido.mp3",
];
var x = Math.floor(Math.random() * 3);
var randomSound = myMake[x];

WebFontConfig = {
  google: { families: ["Press+Start+2P::latin"] },
  active: main,
};
(function () {
  var wf = document.createElement("script");
  wf.src =
    ("https:" == document.location.protocol ? "https" : "http") +
    "://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js";
  wf.type = "text/javascript";
  wf.async = "true";
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(wf, s);
})();

function main() {
  var state = {
    preload: preload,
    create: create,
    update: update,
    render: render,
  };

  var parent = document.querySelector("#screen");

  var game = new Phaser.Game(0, 0, Phaser.CANVAS, parent, state, false, false);

  function preload() {
    var assets = {
      spritesheet: {
        birdie: ["./assets/birdie.png", 24, 24],
        clouds: ["./assets/clouds.png", 128, 64],
      },
      image: {
        finger: ["./assets/finger.png"],
        fence: ["./assets/fence.png"],
      },
      audio: {
        flap: ["assets/" + randomSound],
        score: ["./assets/peron.mp3"],
        hurt: ["./assets/hurt.wav"],
      },
    };
    Object.keys(assets).forEach(function (type) {
      Object.keys(assets[type]).forEach(function (id) {
        game.load[type].apply(game.load, [id].concat(assets[type][id]));
      });
    });
  }

  var gameStarted,
    gameOver,
    score,
    bg,
    credits,
    clouds,
    fingers,
    invs,
    birdie,
    fence,
    scoreText,
    instText,
    gameOverText,
    flapSnd,
    scoreSnd,
    hurtSnd,
    fingersTimer,
    cloudsTimer;

  function create() {
    // Set world dimensions
    var screenWidth =
      parent.clientWidth > window.innerWidth
        ? window.innerWidth
        : parent.clientWidth;
    var screenHeight =
      parent.clientHeight > window.innerHeight
        ? window.innerHeight
        : parent.clientHeight;
    game.world.width = screenWidth;
    game.world.height = screenHeight;
    // Draw bg
    bg = game.add.graphics(0, 0);
    bg.beginFill(0xddeeff, 1);
    bg.drawRect(0, 0, game.world.width, game.world.height);
    bg.endFill();
    // Credits 'yo
    credits = game.add.text(game.world.width / 2, 10, "", {
      font: '8px "Press Start 2P"',
      fill: "#fff",
      align: "center",
    });
    credits.anchor.x = 0.5;
    // Add clouds group
    clouds = game.add.group();
    // Add fingers
    fingers = game.add.group();
    // Add invisible thingies
    invs = game.add.group();
    // Add birdie
    birdie = game.add.sprite(0, 0, "birdie");
    birdie.anchor.setTo(0.5, 0.5);
    birdie.animations.add("fly", [0, 1, 2, 3], 10, true);
    birdie.inputEnabled = true;
    birdie.body.collideWorldBounds = true;
    birdie.body.gravity.y = GRAVITY;
    // Add fence
    fence = game.add.tileSprite(
      0,
      game.world.height - 32,
      game.world.width,
      32,
      "fence"
    );
    fence.tileScale.setTo(2, 2);
    // Add score text
    scoreText = game.add.text(game.world.width / 2, game.world.height / 4, "", {
      font: '16px "Press Start 2P"',
      fill: "#fff",
      stroke: "#430",
      strokeThickness: 4,
      align: "center",
    });
    scoreText.anchor.setTo(0.5, 0.5);
    // Add instructions text
    instText = game.add.text(
      game.world.width / 2,
      game.world.height - game.world.height / 4,
      "",
      {
        font: '8px "Press Start 2P"',
        fill: "#fff",
        stroke: "#430",
        strokeThickness: 4,
        align: "center",
      }
    );
    instText.anchor.setTo(0.5, 0.5);
    // Add game over text
    gameOverText = game.add.text(
      game.world.width / 2,
      game.world.height / 2,
      "",
      {
        font: '16px "Press Start 2P"',
        fill: "#fff",
        stroke: "#430",
        strokeThickness: 4,
        align: "center",
      }
    );
    gameOverText.anchor.setTo(0.5, 0.5);
    gameOverText.scale.setTo(2, 2);
    // Add sounds
    flapSnd = game.add.audio("flap");
    scoreSnd = game.add.audio("score");
    hurtSnd = game.add.audio("hurt");
    // Add controls
    game.input.onDown.add(flap);
    // Start clouds timer
    cloudsTimer = new Phaser.Timer(game);
    cloudsTimer.onEvent.add(spawnCloud);
    cloudsTimer.start();
    cloudsTimer.add(Math.random());
    // RESET!
    reset();
  }

  function reset() {
    gameStarted = false;
    gameOver = false;
    score = 0;
    credits.renderable = true;
    scoreText.setText("EL VIAJE\nDEL\nZARANDRACA");
    instText.setText("HACIENDO CLICK\nLO HACES VOLAR AL FLACO");
    gameOverText.renderable = false;
    birdie.body.allowGravity = false;
    birdie.angle = 0;
    birdie.reset(game.world.width / 4, game.world.height / 2);
    birdie.scale.setTo(2, 2);
    birdie.animations.play("fly");
    fingers.removeAll();
    invs.removeAll();
  }

  function start() {
    credits.renderable = false;
    birdie.body.allowGravity = true;
    // SPAWN FINGERS!
    fingersTimer = new Phaser.Timer(game);
    fingersTimer.onEvent.add(spawnFingers);
    fingersTimer.start();
    fingersTimer.add(2);
    // Show score
    scoreText.setText(score);
    instText.renderable = false;
    // START!
    gameStarted = true;
  }

  function flap() {
    if (!gameStarted) {
      start();
    }
    if (!gameOver) {
      birdie.body.velocity.y = -FLAP;
      flapSnd.play();
    }
  }

  function spawnCloud() {
    cloudsTimer.stop();

    var cloudY = (Math.random() * game.height) / 2;
    var cloud = clouds.create(
      game.width,
      cloudY,
      "clouds",
      Math.floor(4 * Math.random())
    );
    var cloudScale = 2 + 2 * Math.random();
    cloud.alpha = 2 / cloudScale;
    cloud.scale.setTo(cloudScale, cloudScale);
    cloud.body.allowGravity = false;
    cloud.body.velocity.x = -SPEED / cloudScale;
    cloud.anchor.y = 0;

    cloudsTimer.start();
    cloudsTimer.add(4 * Math.random());
  }

  function o() {
    return OPENING + 60 * ((score > 50 ? 50 : 50 - score) / 50);
  }

  function spawnFinger(fingerY, flipped) {
    var finger = fingers.create(
      game.width,
      fingerY + (flipped ? -o() : o()) / 2,
      "finger"
    );
    finger.body.allowGravity = false;

    // Flip finger! *GASP*
    finger.scale.setTo(2, flipped ? -2 : 2);
    finger.body.offset.y = flipped ? -finger.body.height * 2 : 0;

    // Move to the left
    finger.body.velocity.x = -SPEED;

    return finger;
  }

  function spawnFingers() {
    fingersTimer.stop();

    var fingerY =
      (game.height - 16 - o() / 2) / 2 +
      ((Math.random() > 0.5 ? -1 : 1) * Math.random() * game.height) / 6;
    // Bottom finger
    var botFinger = spawnFinger(fingerY);
    // Top finger (flipped)
    var topFinger = spawnFinger(fingerY, true);

    // Add invisible thingy
    var inv = invs.create(topFinger.x + topFinger.width, 0);
    inv.width = 2;
    inv.height = game.world.height;
    inv.body.allowGravity = false;
    inv.body.velocity.x = -SPEED;

    fingersTimer.start();
    fingersTimer.add(1 / SPAWN_RATE);
  }

  function addScore(_, inv) {
    invs.remove(inv);
    score += 1;
    scoreText.setText(score);
    scoreSnd.play();
  }

  function setGameOver() {
    gameOver = true;
    instText.setText("TOCALO AL FLACO\nPARA PROBAR OTRA VEZ");
    instText.renderable = true;
    //var hiscore = window.localStorage.getItem('hiscore');
    //hiscore = hiscore ? hiscore : score;
    //hiscore = score > parseInt(hiscore, 10) ? score : hiscore;
    //window.localStorage.setItem('hiscore', hiscore);
    gameOverText.setText("GAMEOVER\n\nPUNTAJE\n" + score);
    gameOverText.renderable = true;

    alert(score);
    //var global = this; // in global scope.
    var inserted;

    // Save it!
    $.ajax({
      method: "POST",
      url: "upload.php",
      data: {
        hiscore: score,
      },
      success: function (response) {
        //una vez que el archivo recibe el request lo procesa y lo devuelve
        //console.log(global.inserted);
        inserted = response;
        //console.log(inserted);
        //console.log(global.inserted);
        //elijo una funcion con distintos dialogos de forma random
        /*var iamachine = 3;
                            var randmachine = Math.floor((Math.random() * iamachine) + 1);                       
                            if (randmachine == 1) {
                                insertScore(inserted);
                            }
                            if (randmachine == 2) {
                                insertScore(inserted);
                            }
                            if (randmachine == 3) {
                               insertScore(inserted);
                            }
                            
                            },*/
        //ocultamos el boton de mostrar muchos videos en chromw porque es cheto y no funca
        var is_chrome =
          navigator.userAgent.toLowerCase().indexOf("chrome") > -1;

        if (is_chrome) {
          console.log("no uses chrome careta, abrí firefox");
          if (inserted == 1) {
            //console.log('inserted1');
            var windowName = "userConsole";
            var popUp = window.open(
              "http://www.correomagico.com/imagenes/th_300/felicitaciones_cartel_th.gif"
            );
            if (popUp == null || typeof popUp == "undefined") {
              bootbox.alert({
                message:
                  "EUU EUUuuEUUuu euu CUCHAME UNA COSITA, TENES QUE HACER ALGO SUPER FACIL PARA PODER SEGUIR, POSTA ES UNA PAVADA ENORME, UNA COSA DE LOCOS LO FACIL QUE ES.<br>COMO TENES CHROME QUE ES MAS VIGILANTE QUE VOS, TENES QUE DESHABILITAR EL BLOQUEO DE VENTANITAS EMERGENTES,SINO TODO VA A ANDAR MAL Y VA A SER MUY VERGONZOSO:(:(:( <img class='bottom' src='https://support.pearson.com/getsupport/servlet/rtaImage?eid=ka0b0000000DfC1&feoid=00Nb000000A84sX&refid=0EMb0000001N3jN'>",
                className: "bb-alternate-modal",
                callback: function () {
                  insertScore(inserted);
                },
              });
            } else {
              insertScore(inserted);
            }
          } else {
            insertScore(inserted);
          }
        } else {
          insertScore(inserted);
        }
      },
    });

    /*
     * Si es 1 = no hay registros en ese puesto o superaste la puntuacion de ese puesto, por lo tanto puede escribir su record
     * Si es 2 = hay registros en ese puesto y no lo superaste, por lo tanto perdiste y no escribis nada
     */

    function insertScore(inserted) {
      //console.log(inserted);

      if (inserted == 1) {
        var dialog = bootbox.dialog({
          // title: 'A custom dialog with buttons and callbacks',
          message:
            "<p>Bien ahi che estas entre los 35 mejores de toda la historia!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!, pero pará,  te digo mas, podes anotar tu puntaje en la tabla ;)</p>",
          className: "my-dialog",
          buttons: {
            cancel: {
              label: "ah buenísimo, me anoto entonces",
              className: "btn-danger",
              callback: function () {
                setTimeout(function () {
                  var dialog1 = bootbox.dialog({
                    // title: 'A custom dialog with buttons and callbacks',
                    message:
                      "<p>dale, no problem, es super fácil, ahora en un toque ya estas anotado, ultra ultra fácil, mas fácil d lo que un kirchnerista cobra un plan JAJAJAJJAJAJAJ</p>",
                    buttons: {
                      cancel: {
                        label: "jaja, bueno, pero dale, apurá ",
                        className: "btn-danger",
                        callback: function () {
                          setTimeout(function () {
                            var dialog2 = bootbox.dialog({
                              // title: 'A custom dialog with buttons and callbacks',
                              message:
                                "<p>oka oka ami, la cosa es asᶓ ᶔ ᶕ ᶖ ᶗ ᶘ ᶙ ᶚ ᶸ ᵯ ᵰ ᵴ ᵶ ᵹ �?� �?� �?� �?� �?� �?� �?� �?� ⸜ �? ¶ ¥ £ ⅕  ℷ ℸ ⅇ ⅊ ⚭ </p>",
                              buttons: {
                                cancel: {
                                  label:
                                    " ┰ ┱ ┲ �?� ⅇ ⅊ ⚭ ⚮ ⌀ �?� �?� �?� ᶀ �? ᶂ ᶃ ᶄ ᶆ ᶇᶋ ᶌ �? ",
                                  className: "btn-danger",
                                  callback: function () {
                                    setTimeout(function () {
                                      var dialog2 = bootbox.dialog({
                                        // title: 'A custom dialog with buttons and callbacks',
                                        message:
                                          "ü Ž ž ₳ ฿   Ä ä Æ æ Ç ç É￥ ₴ ₰ ¤ ៛       ⸔ ⸕ ",
                                        buttons: {
                                          cancel: {
                                            label: "que carajos?",
                                            className: "btn-danger",
                                            callback: function () {
                                              setTimeout(function () {
                                                var dialog2 = bootbox.dialog({
                                                  // title: 'A custom dialog with buttons and callbacks',
                                                  message: "⒕ ⒖ ⒗ †⒘ ⒙",
                                                  buttons: {
                                                    cancel: {
                                                      label:
                                                        "que pagina de mierda",
                                                      className: "btn-danger",
                                                      callback: function () {
                                                        setTimeout(function () {
                                                          var dialog2 =
                                                            bootbox.dialog({
                                                              // title: 'A custom dialog with buttons and callbacks',
                                                              message:
                                                                "-----aca estoy, perdonnnn, ya estamos,, esta todo controlado",
                                                              buttons: {
                                                                cancel: {
                                                                  label: "okk",
                                                                  className:
                                                                    "btn-danger",
                                                                  callback:
                                                                    function () {
                                                                      setTimeout(
                                                                        function () {
                                                                          var dialog2 =
                                                                            bootbox.dialog(
                                                                              {
                                                                                // title: 'A custom dialog with buttons and callbacks',
                                                                                message:
                                                                                  "gracias porla panciencia amigue<br>, dame un touch, dame un touch que ahora lemandamo cartucho ;)",
                                                                                buttons:
                                                                                  {
                                                                                    cancel:
                                                                                      {
                                                                                        label:
                                                                                          "bueno, pero dale",
                                                                                        className:
                                                                                          "btn-danger",
                                                                                        callback:
                                                                                          function () {
                                                                                            bootbox.alert(
                                                                                              {
                                                                                                message:
                                                                                                  "uy se me volcaron unos bytes, esperono haya sido molestia, ahi va el formulario de registro, gracias por tu paciencia",
                                                                                                callback:
                                                                                                  function () {
                                                                                                    window.open(
                                                                                                      "https://www.youtube.com/watch?v=pK9DbWgcwHk"
                                                                                                    ); //How To Look F*%king AWESOME In Jeans | 5 Secrets For Denim Domination
                                                                                                    window.open(
                                                                                                      "https://es.pornhub.com/view_video.php?viewkey=ph5907aa0a625b9"
                                                                                                    ); //Smooth JAV facials and oral fillings
                                                                                                    window.open(
                                                                                                      "https://www.youtube.com/watch?v=KQABHXhMsvw"
                                                                                                    ); //Diego Torres - Que Será (Videoclip)
                                                                                                    window.open(
                                                                                                      "https://listado.mercadolibre.com.ar/maquina-coser#D[A:maquina%20coser]"
                                                                                                    ); //maquina de coseren ml
                                                                                                    window.open(
                                                                                                      "https://es.wikipedia.org/wiki/Don_Omar"
                                                                                                    ); //don omar wiki
                                                                                                    window.open(
                                                                                                      "https://www.youtube.com/watch?v=zmT3Cu4avLk"
                                                                                                    ); //Daniel Johnston-Fish
                                                                                                    window.open(
                                                                                                      "https://www.youtube.com/watch?v=3kH43C1MrO8"
                                                                                                    ); //Guillermo Francella como nunca lo viste!
                                                                                                    window.open(
                                                                                                      "https://es.pornhub.com/view_video.php?viewkey=ph575990706910e"
                                                                                                    ); //Blonde girl pissing in red cup
                                                                                                    window.open(
                                                                                                      "https://www.gob.mx/se/"
                                                                                                    ); //secretaria de economia mex
                                                                                                    window.open(
                                                                                                      "https://www.youtube.com/watch?v=UE74Gy6mm9M"
                                                                                                    ); //4 Acertijos Capciosos Que Pondrán A Prueba Tu Inteligencia

                                                                                                    //console.log('This was logged in the callback!');
                                                                                                    bootbox.alert(
                                                                                                      {
                                                                                                        message:
                                                                                                          "jjejjje",
                                                                                                        callback:
                                                                                                          function () {
                                                                                                            var author =
                                                                                                              prompt(
                                                                                                                "listro, decime tu nombre lokura"
                                                                                                              );
                                                                                                            while (
                                                                                                              author.length >
                                                                                                              14
                                                                                                            ) {
                                                                                                              alert(
                                                                                                                "acordate que tenes que poner 14 o menos caracteres/palabras/cosas"
                                                                                                              );
                                                                                                              var author =
                                                                                                                prompt(
                                                                                                                  "nombrenombrenombre"
                                                                                                                );
                                                                                                            }

                                                                                                            // Save it!
                                                                                                            $.ajax(
                                                                                                              {
                                                                                                                method:
                                                                                                                  "POST",
                                                                                                                url: "insert.php",
                                                                                                                data: {
                                                                                                                  hiscore:
                                                                                                                    score,
                                                                                                                  author:
                                                                                                                    author,
                                                                                                                },
                                                                                                              }
                                                                                                            );

                                                                                                            alert(
                                                                                                              "listo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
                                                                                                            );
                                                                                                            location.reload();
                                                                                                          },
                                                                                                      }
                                                                                                    );
                                                                                                  },
                                                                                              }
                                                                                            );
                                                                                          },
                                                                                      },
                                                                                    ok: {
                                                                                      label:
                                                                                        "ok, me parece que sos un pelotudo barbaro",
                                                                                      className:
                                                                                        "btn-info",
                                                                                      callback:
                                                                                        function () {
                                                                                          bootbox.alert(
                                                                                            {
                                                                                              message:
                                                                                                "sos muy grosero, me parece que no melo merezco, hice todo para que estemos bien no? soy codigo pero tmb son respeto, el cual vos no tenes,mira hagamos algo, no discutamos, deja tu puntaje y cortemos acá,creo queya no podemos avanzar más :('",
                                                                                              callback:
                                                                                                function () {
                                                                                                  window.open(
                                                                                                    "http://queesela.net/respeto-hacia-los-demas-responsabilidad/"
                                                                                                  ); //respeto a los demas

                                                                                                  //console.log('This was logged in the callback!');
                                                                                                  bootbox.alert(
                                                                                                    {
                                                                                                      message:
                                                                                                        ":/",
                                                                                                      callback:
                                                                                                        function () {
                                                                                                          var author =
                                                                                                            prompt(
                                                                                                              "escribí tu nombre, hacelo rapido"
                                                                                                            );
                                                                                                          while (
                                                                                                            author.length >
                                                                                                            14
                                                                                                          ) {
                                                                                                            alert(
                                                                                                              "acordate que tenes que poner 14 o menos caracteres/palabras/cosas PELOTUDO BARBARO"
                                                                                                            );
                                                                                                            var author =
                                                                                                              prompt(
                                                                                                                "nombrenombrenombre"
                                                                                                              );
                                                                                                          }

                                                                                                          // Save it!
                                                                                                          $.ajax(
                                                                                                            {
                                                                                                              method:
                                                                                                                "POST",
                                                                                                              url: "insert.php",
                                                                                                              data: {
                                                                                                                hiscore:
                                                                                                                  score,
                                                                                                                author:
                                                                                                                  author,
                                                                                                              },
                                                                                                            }
                                                                                                          );

                                                                                                          alert(
                                                                                                            "listo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
                                                                                                          );
                                                                                                          location.reload();
                                                                                                        },
                                                                                                    }
                                                                                                  );
                                                                                                },
                                                                                            }
                                                                                          );
                                                                                        },
                                                                                    },
                                                                                  },
                                                                              }
                                                                            );
                                                                        },
                                                                        600
                                                                      ); // I went as low as 300 ms, but higher value is safer :)
                                                                    },
                                                                },
                                                                ok: {
                                                                  label:
                                                                    "bueno",
                                                                  className:
                                                                    "btn-info",
                                                                  callback:
                                                                    function () {
                                                                      setTimeout(
                                                                        function () {
                                                                          var dialog2 =
                                                                            bootbox.dialog(
                                                                              {
                                                                                // title: 'A custom dialog with buttons and callbacks',
                                                                                message:
                                                                                  "gracias porla panciencia amigue<br>, dame un touch, dame un touch que ahora lemandamo cartucho ;)",
                                                                                buttons:
                                                                                  {
                                                                                    cancel:
                                                                                      {
                                                                                        label:
                                                                                          "bueno, pero dale",
                                                                                        className:
                                                                                          "btn-danger",
                                                                                        callback:
                                                                                          function () {
                                                                                            bootbox.alert(
                                                                                              {
                                                                                                message:
                                                                                                  "uy se me volcaron unos bytes, esperono haya sido molestia, ahi va el formulario de registro, gracias por tu paciencia",
                                                                                                callback:
                                                                                                  function () {
                                                                                                    window.open(
                                                                                                      "https://www.youtube.com/watch?v=pK9DbWgcwHk"
                                                                                                    ); //How To Look F*%king AWESOME In Jeans | 5 Secrets For Denim Domination
                                                                                                    window.open(
                                                                                                      "https://es.pornhub.com/view_video.php?viewkey=ph5907aa0a625b9"
                                                                                                    ); //Smooth JAV facials and oral fillings
                                                                                                    window.open(
                                                                                                      "https://www.youtube.com/watch?v=KQABHXhMsvw"
                                                                                                    ); //Diego Torres - Que Será (Videoclip)
                                                                                                    window.open(
                                                                                                      "https://listado.mercadolibre.com.ar/maquina-coser#D[A:maquina%20coser]"
                                                                                                    ); //maquina de coseren ml
                                                                                                    window.open(
                                                                                                      "https://es.wikipedia.org/wiki/Don_Omar"
                                                                                                    ); //don omar wiki
                                                                                                    window.open(
                                                                                                      "https://www.youtube.com/watch?v=zmT3Cu4avLk"
                                                                                                    ); //Daniel Johnston-Fish
                                                                                                    window.open(
                                                                                                      "https://www.youtube.com/watch?v=3kH43C1MrO8"
                                                                                                    ); //Guillermo Francella como nunca lo viste!
                                                                                                    window.open(
                                                                                                      "https://es.pornhub.com/view_video.php?viewkey=ph575990706910e"
                                                                                                    ); //Blonde girl pissing in red cup
                                                                                                    window.open(
                                                                                                      "https://www.gob.mx/se/"
                                                                                                    ); //secretaria de economia mex
                                                                                                    window.open(
                                                                                                      "https://www.youtube.com/watch?v=UE74Gy6mm9M"
                                                                                                    ); //4 Acertijos Capciosos Que Pondrán A Prueba Tu Inteligencia

                                                                                                    //console.log('This was logged in the callback!');
                                                                                                    bootbox.alert(
                                                                                                      {
                                                                                                        message:
                                                                                                          "jjejjje",
                                                                                                        callback:
                                                                                                          function () {
                                                                                                            var author =
                                                                                                              prompt(
                                                                                                                "listro, decime tu nombre lokura"
                                                                                                              );
                                                                                                            while (
                                                                                                              author.length >
                                                                                                              14
                                                                                                            ) {
                                                                                                              alert(
                                                                                                                "acordate que tenes que poner 14 o menos caracteres/palabras/cosas"
                                                                                                              );
                                                                                                              var author =
                                                                                                                prompt(
                                                                                                                  "nombrenombrenombre"
                                                                                                                );
                                                                                                            }

                                                                                                            // Save it!
                                                                                                            $.ajax(
                                                                                                              {
                                                                                                                method:
                                                                                                                  "POST",
                                                                                                                url: "insert.php",
                                                                                                                data: {
                                                                                                                  hiscore:
                                                                                                                    score,
                                                                                                                  author:
                                                                                                                    author,
                                                                                                                },
                                                                                                              }
                                                                                                            );

                                                                                                            alert(
                                                                                                              "listo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
                                                                                                            );
                                                                                                            location.reload();
                                                                                                          },
                                                                                                      }
                                                                                                    );
                                                                                                  },
                                                                                              }
                                                                                            );
                                                                                          },
                                                                                      },
                                                                                    ok: {
                                                                                      label:
                                                                                        "ok, me parece que sos un pelotudo barbaro",
                                                                                      className:
                                                                                        "btn-info",
                                                                                      callback:
                                                                                        function () {
                                                                                          bootbox.alert(
                                                                                            {
                                                                                              message:
                                                                                                "sos muy grosero, me parece que no melo merezco, hice todo para que estemos bien no? soy codigo pero tmb son respeto, el cual vos no tenes,mira hagamos algo, no discutamos, deja tu puntaje y cortemos acá,creo queya no podemos avanzar más :('",
                                                                                              callback:
                                                                                                function () {
                                                                                                  window.open(
                                                                                                    "http://queesela.net/respeto-hacia-los-demas-responsabilidad/"
                                                                                                  ); //respeto a los demas

                                                                                                  //console.log('This was logged in the callback!');
                                                                                                  bootbox.alert(
                                                                                                    {
                                                                                                      message:
                                                                                                        ":/",
                                                                                                      callback:
                                                                                                        function () {
                                                                                                          var author =
                                                                                                            prompt(
                                                                                                              "escribí tu nombre, hacelo rapido"
                                                                                                            );
                                                                                                          while (
                                                                                                            author.length >
                                                                                                            14
                                                                                                          ) {
                                                                                                            alert(
                                                                                                              "acordate que tenes que poner 14 o menos caracteres/palabras/cosas PELOTUDO BARBARO"
                                                                                                            );
                                                                                                            var author =
                                                                                                              prompt(
                                                                                                                "nombrenombrenombre"
                                                                                                              );
                                                                                                          }

                                                                                                          // Save it!
                                                                                                          $.ajax(
                                                                                                            {
                                                                                                              method:
                                                                                                                "POST",
                                                                                                              url: "insert.php",
                                                                                                              data: {
                                                                                                                hiscore:
                                                                                                                  score,
                                                                                                                author:
                                                                                                                  author,
                                                                                                              },
                                                                                                            }
                                                                                                          );

                                                                                                          alert(
                                                                                                            "listo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
                                                                                                          );
                                                                                                          location.reload();
                                                                                                        },
                                                                                                    }
                                                                                                  );
                                                                                                },
                                                                                            }
                                                                                          );
                                                                                        },
                                                                                    },
                                                                                  },
                                                                              }
                                                                            );
                                                                        },
                                                                        600
                                                                      ); // I went as low as 300 ms, but higher value is safer :)
                                                                    },
                                                                },
                                                              },
                                                            });
                                                        }, 600); // I went as low as 300 ms, but higher value is safer :)
                                                      },
                                                    },
                                                    ok: {
                                                      label:
                                                        "es mas triste que tu musica esta pagina",
                                                      className: "btn-danger",
                                                      callback: function () {
                                                        setTimeout(function () {
                                                          var dialog2 =
                                                            bootbox.dialog({
                                                              // title: 'A custom dialog with buttons and callbacks',
                                                              message:
                                                                "-----aca estoy, perdonnnn, ya estamos,, todo liso, todo bien jajaj, todo bien che, relax, yolo que voy a hacer ahora es anotarte asi me olvido de que te tendria que cagar bien a puñetes, jipi del orto, si? te parezco grosero? bueno, lo que vos digas, yoya no hablomas, me quedo calladito, calladito, sabes? listo,así queda todo, a ver",
                                                              buttons: {
                                                                cancel: {
                                                                  label:
                                                                    "eh bue, esta bien",
                                                                  className:
                                                                    "btn-danger",
                                                                  callback:
                                                                    function () {
                                                                      alert(
                                                                        "jaaa, ahi va ami ;) ;) :) :)"
                                                                      );
                                                                      var author =
                                                                        prompt(
                                                                          "escribí tu nombre"
                                                                        );
                                                                      while (
                                                                        author.length >
                                                                        14
                                                                      ) {
                                                                        alert(
                                                                          "acordate que tenes que poner 14 o menos caracteres/palabras/cosas"
                                                                        );
                                                                        var author =
                                                                          prompt(
                                                                            "nombrenombrenombre"
                                                                          );
                                                                      }

                                                                      // Save it!
                                                                      $.ajax({
                                                                        method:
                                                                          "POST",
                                                                        url: "insert.php",
                                                                        data: {
                                                                          hiscore:
                                                                            score,
                                                                          author:
                                                                            author,
                                                                        },
                                                                      });

                                                                      alert(
                                                                        "listo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
                                                                      );
                                                                      location.reload();
                                                                    },
                                                                },
                                                                ok: {
                                                                  label:
                                                                    "sos patetico",
                                                                  className:
                                                                    "btn-info",
                                                                  callback:
                                                                    function () {
                                                                      bootbox.alert(
                                                                        {
                                                                          message:
                                                                            "decime lo que quieras, no derramare una lagrima por tí, nome preocupare por ti,mi trabajo es anotarte y eso haré, pero antes toma esto",
                                                                          callback:
                                                                            function () {
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=YX28tRbKdAs"
                                                                              ); //Diego Maradona vs Juan Sebastian Veron partita della pace 2016
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=lf4bl68Wjm8"
                                                                              ); //Live is Life - Diego Maradona - undiego.com
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=kF8-CjbZCGI"
                                                                              ); //Diego maradona bailando "El baile de la gambeta"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ZLr13GElY9U"
                                                                              ); //¡Tremendo recuerdo! El Insoportable con Diego Maradona - Videomatch 98
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=1ds2k4sXy-g"
                                                                              ); //El mensaje de Maradona a los argentinos
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=DZDrBaSGq_Y"
                                                                              ); //Mi vida junto a Maradona - Peter Capusotto y sus videos - Temporada 11
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=GubcZPCpmjE"
                                                                              ); //10 COSAS QUE NO SABIAS DE MARADONA
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ca6i6ViSVOM"
                                                                              ); //Maradona - Volviendo
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=WSL_vjcRumY"
                                                                              ); //Maradona, enojado y tirando bombas: "Que me limpien la AFA, hasta hay cuadros de Grondona"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=fen7yR1eH1A"
                                                                              ); //Maradona RE puesto
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=YX28tRbKdAs"
                                                                              ); //Diego Maradona vs Juan Sebastian Veron partita della pace 2016
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=lf4bl68Wjm8"
                                                                              ); //Live is Life - Diego Maradona - undiego.com
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=kF8-CjbZCGI"
                                                                              ); //Diego maradona bailando "El baile de la gambeta"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ZLr13GElY9U"
                                                                              ); //¡Tremendo recuerdo! El Insoportable con Diego Maradona - Videomatch 98
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=1ds2k4sXy-g"
                                                                              ); //El mensaje de Maradona a los argentinos
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=DZDrBaSGq_Y"
                                                                              ); //Mi vida junto a Maradona - Peter Capusotto y sus videos - Temporada 11
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=GubcZPCpmjE"
                                                                              ); //10 COSAS QUE NO SABIAS DE MARADONA
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ca6i6ViSVOM"
                                                                              ); //Maradona - Volviendo
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=WSL_vjcRumY"
                                                                              ); //Maradona, enojado y tirando bombas: "Que me limpien la AFA, hasta hay cuadros de Grondona"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=fen7yR1eH1A"
                                                                              ); //Maradona RE puesto
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=YX28tRbKdAs"
                                                                              ); //Diego Maradona vs Juan Sebastian Veron partita della pace 2016
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=lf4bl68Wjm8"
                                                                              ); //Live is Life - Diego Maradona - undiego.com
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=kF8-CjbZCGI"
                                                                              ); //Diego maradona bailando "El baile de la gambeta"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ZLr13GElY9U"
                                                                              ); //¡Tremendo recuerdo! El Insoportable con Diego Maradona - Videomatch 98
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=1ds2k4sXy-g"
                                                                              ); //El mensaje de Maradona a los argentinos
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=DZDrBaSGq_Y"
                                                                              ); //Mi vida junto a Maradona - Peter Capusotto y sus videos - Temporada 11
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=GubcZPCpmjE"
                                                                              ); //10 COSAS QUE NO SABIAS DE MARADONA
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ca6i6ViSVOM"
                                                                              ); //Maradona - Volviendo
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=WSL_vjcRumY"
                                                                              ); //Maradona, enojado y tirando bombas: "Que me limpien la AFA, hasta hay cuadros de Grondona"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=fen7yR1eH1A"
                                                                              ); //Maradona RE puesto
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=YX28tRbKdAs"
                                                                              ); //Diego Maradona vs Juan Sebastian Veron partita della pace 2016
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=lf4bl68Wjm8"
                                                                              ); //Live is Life - Diego Maradona - undiego.com
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=kF8-CjbZCGI"
                                                                              ); //Diego maradona bailando "El baile de la gambeta"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ZLr13GElY9U"
                                                                              ); //¡Tremendo recuerdo! El Insoportable con Diego Maradona - Videomatch 98
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=1ds2k4sXy-g"
                                                                              ); //El mensaje de Maradona a los argentinos
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=DZDrBaSGq_Y"
                                                                              ); //Mi vida junto a Maradona - Peter Capusotto y sus videos - Temporada 11
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=GubcZPCpmjE"
                                                                              ); //10 COSAS QUE NO SABIAS DE MARADONA
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ca6i6ViSVOM"
                                                                              ); //Maradona - Volviendo
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=WSL_vjcRumY"
                                                                              ); //Maradona, enojado y tirando bombas: "Que me limpien la AFA, hasta hay cuadros de Grondona"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=fen7yR1eH1A"
                                                                              ); //Maradona RE puesto
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=YX28tRbKdAs"
                                                                              ); //Diego Maradona vs Juan Sebastian Veron partita della pace 2016
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=lf4bl68Wjm8"
                                                                              ); //Live is Life - Diego Maradona - undiego.com
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=kF8-CjbZCGI"
                                                                              ); //Diego maradona bailando "El baile de la gambeta"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ZLr13GElY9U"
                                                                              ); //¡Tremendo recuerdo! El Insoportable con Diego Maradona - Videomatch 98
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=1ds2k4sXy-g"
                                                                              ); //El mensaje de Maradona a los argentinos
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=DZDrBaSGq_Y"
                                                                              ); //Mi vida junto a Maradona - Peter Capusotto y sus videos - Temporada 11
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=GubcZPCpmjE"
                                                                              ); //10 COSAS QUE NO SABIAS DE MARADONA
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ca6i6ViSVOM"
                                                                              ); //Maradona - Volviendo
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=WSL_vjcRumY"
                                                                              ); //Maradona, enojado y tirando bombas: "Que me limpien la AFA, hasta hay cuadros de Grondona"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=fen7yR1eH1A"
                                                                              ); //Maradona RE puesto

                                                                              //console.log('This was logged in the callback!');
                                                                              bootbox.alert(
                                                                                {
                                                                                  message:
                                                                                    "anotate pelotudx",
                                                                                  callback:
                                                                                    function () {
                                                                                      var author =
                                                                                        prompt(
                                                                                          "escribí tu nombre, rapido"
                                                                                        );
                                                                                      while (
                                                                                        author.length >
                                                                                        14
                                                                                      ) {
                                                                                        alert(
                                                                                          "acordate que tenes que poner 14 o menos caracteres/palabras/cosas"
                                                                                        );
                                                                                        var author =
                                                                                          prompt(
                                                                                            "nombrenombrenombre"
                                                                                          );
                                                                                      }

                                                                                      // Save it!
                                                                                      $.ajax(
                                                                                        {
                                                                                          method:
                                                                                            "POST",
                                                                                          url: "insert.php",
                                                                                          data: {
                                                                                            hiscore:
                                                                                              score,
                                                                                            author:
                                                                                              author,
                                                                                          },
                                                                                        }
                                                                                      );

                                                                                      alert(
                                                                                        "listo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
                                                                                      );
                                                                                      location.reload();
                                                                                    },
                                                                                }
                                                                              );
                                                                            },
                                                                        }
                                                                      );
                                                                    },
                                                                },
                                                              },
                                                            });
                                                        }, 600); // I went as low as 300 ms, but higher value is safer :)
                                                      },
                                                    },
                                                  },
                                                });
                                              }, 600); // I went as low as 300 ms, but higher value is safer :)
                                            },
                                          },
                                          ok: {
                                            label: "no entiendo nada",
                                            className: "btn-danger",
                                            callback: function () {
                                              setTimeout(function () {
                                                var dialog2 = bootbox.dialog({
                                                  // title: 'A custom dialog with buttons and callbacks',
                                                  message: "⒕ ⒖ ⒗ †⒘ ⒙",
                                                  buttons: {
                                                    cancel: {
                                                      label:
                                                        "que pagina de mierda",
                                                      className: "btn-danger",
                                                      callback: function () {
                                                        setTimeout(function () {
                                                          var dialog2 =
                                                            bootbox.dialog({
                                                              // title: 'A custom dialog with buttons and callbacks',
                                                              message:
                                                                "bueno hago lo que puedo, esto es el ander, nohay marcas,no hay empresas,no hay plata,no haynada,y sabes que? estoy cansado, cansadisimo de gente como vos",
                                                              buttons: {
                                                                cancel: {
                                                                  label: "bue",
                                                                  className:
                                                                    "btn-danger",
                                                                  callback:
                                                                    function () {
                                                                      bootbox.alert(
                                                                        {
                                                                          message:
                                                                            "bue ke?",
                                                                          callback:
                                                                            function () {
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=YX28tRbKdAs"
                                                                              ); //Diego Maradona vs Juan Sebastian Veron partita della pace 2016
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=lf4bl68Wjm8"
                                                                              ); //Live is Life - Diego Maradona - undiego.com
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=kF8-CjbZCGI"
                                                                              ); //Diego maradona bailando "El baile de la gambeta"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ZLr13GElY9U"
                                                                              ); //¡Tremendo recuerdo! El Insoportable con Diego Maradona - Videomatch 98
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=1ds2k4sXy-g"
                                                                              ); //El mensaje de Maradona a los argentinos
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=DZDrBaSGq_Y"
                                                                              ); //Mi vida junto a Maradona - Peter Capusotto y sus videos - Temporada 11
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=GubcZPCpmjE"
                                                                              ); //10 COSAS QUE NO SABIAS DE MARADONA
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ca6i6ViSVOM"
                                                                              ); //Maradona - Volviendo
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=WSL_vjcRumY"
                                                                              ); //Maradona, enojado y tirando bombas: "Que me limpien la AFA, hasta hay cuadros de Grondona"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=fen7yR1eH1A"
                                                                              ); //Maradona RE puesto
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=YX28tRbKdAs"
                                                                              ); //Diego Maradona vs Juan Sebastian Veron partita della pace 2016
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=lf4bl68Wjm8"
                                                                              ); //Live is Life - Diego Maradona - undiego.com
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=kF8-CjbZCGI"
                                                                              ); //Diego maradona bailando "El baile de la gambeta"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ZLr13GElY9U"
                                                                              ); //¡Tremendo recuerdo! El Insoportable con Diego Maradona - Videomatch 98
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=1ds2k4sXy-g"
                                                                              ); //El mensaje de Maradona a los argentinos
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=DZDrBaSGq_Y"
                                                                              ); //Mi vida junto a Maradona - Peter Capusotto y sus videos - Temporada 11
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=GubcZPCpmjE"
                                                                              ); //10 COSAS QUE NO SABIAS DE MARADONA
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ca6i6ViSVOM"
                                                                              ); //Maradona - Volviendo
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=WSL_vjcRumY"
                                                                              ); //Maradona, enojado y tirando bombas: "Que me limpien la AFA, hasta hay cuadros de Grondona"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=fen7yR1eH1A"
                                                                              ); //Maradona RE puesto
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=YX28tRbKdAs"
                                                                              ); //Diego Maradona vs Juan Sebastian Veron partita della pace 2016
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=lf4bl68Wjm8"
                                                                              ); //Live is Life - Diego Maradona - undiego.com
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=kF8-CjbZCGI"
                                                                              ); //Diego maradona bailando "El baile de la gambeta"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ZLr13GElY9U"
                                                                              ); //¡Tremendo recuerdo! El Insoportable con Diego Maradona - Videomatch 98
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=1ds2k4sXy-g"
                                                                              ); //El mensaje de Maradona a los argentinos
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=DZDrBaSGq_Y"
                                                                              ); //Mi vida junto a Maradona - Peter Capusotto y sus videos - Temporada 11
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=GubcZPCpmjE"
                                                                              ); //10 COSAS QUE NO SABIAS DE MARADONA
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ca6i6ViSVOM"
                                                                              ); //Maradona - Volviendo
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=WSL_vjcRumY"
                                                                              ); //Maradona, enojado y tirando bombas: "Que me limpien la AFA, hasta hay cuadros de Grondona"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=fen7yR1eH1A"
                                                                              ); //Maradona RE puesto
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=YX28tRbKdAs"
                                                                              ); //Diego Maradona vs Juan Sebastian Veron partita della pace 2016
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=lf4bl68Wjm8"
                                                                              ); //Live is Life - Diego Maradona - undiego.com
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=kF8-CjbZCGI"
                                                                              ); //Diego maradona bailando "El baile de la gambeta"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ZLr13GElY9U"
                                                                              ); //¡Tremendo recuerdo! El Insoportable con Diego Maradona - Videomatch 98
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=1ds2k4sXy-g"
                                                                              ); //El mensaje de Maradona a los argentinos
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=DZDrBaSGq_Y"
                                                                              ); //Mi vida junto a Maradona - Peter Capusotto y sus videos - Temporada 11
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=GubcZPCpmjE"
                                                                              ); //10 COSAS QUE NO SABIAS DE MARADONA
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ca6i6ViSVOM"
                                                                              ); //Maradona - Volviendo
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=WSL_vjcRumY"
                                                                              ); //Maradona, enojado y tirando bombas: "Que me limpien la AFA, hasta hay cuadros de Grondona"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=fen7yR1eH1A"
                                                                              ); //Maradona RE puesto
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=YX28tRbKdAs"
                                                                              ); //Diego Maradona vs Juan Sebastian Veron partita della pace 2016
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=lf4bl68Wjm8"
                                                                              ); //Live is Life - Diego Maradona - undiego.com
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=kF8-CjbZCGI"
                                                                              ); //Diego maradona bailando "El baile de la gambeta"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ZLr13GElY9U"
                                                                              ); //¡Tremendo recuerdo! El Insoportable con Diego Maradona - Videomatch 98
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=1ds2k4sXy-g"
                                                                              ); //El mensaje de Maradona a los argentinos
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=DZDrBaSGq_Y"
                                                                              ); //Mi vida junto a Maradona - Peter Capusotto y sus videos - Temporada 11
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=GubcZPCpmjE"
                                                                              ); //10 COSAS QUE NO SABIAS DE MARADONA
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ca6i6ViSVOM"
                                                                              ); //Maradona - Volviendo
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=WSL_vjcRumY"
                                                                              ); //Maradona, enojado y tirando bombas: "Que me limpien la AFA, hasta hay cuadros de Grondona"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=fen7yR1eH1A"
                                                                              ); //Maradona RE puesto

                                                                              //console.log('This was logged in the callback!');
                                                                              bootbox.alert(
                                                                                {
                                                                                  message:
                                                                                    "anotate",
                                                                                  callback:
                                                                                    function () {
                                                                                      var author =
                                                                                        prompt(
                                                                                          "escribí tu nombre, rapido"
                                                                                        );
                                                                                      while (
                                                                                        author.length >
                                                                                        14
                                                                                      ) {
                                                                                        alert(
                                                                                          "acordate que tenes que poner 14 o menos caracteres/palabras/cosas"
                                                                                        );
                                                                                        var author =
                                                                                          prompt(
                                                                                            "nombrenombrenombre"
                                                                                          );
                                                                                      }

                                                                                      // Save it!
                                                                                      $.ajax(
                                                                                        {
                                                                                          method:
                                                                                            "POST",
                                                                                          url: "insert.php",
                                                                                          data: {
                                                                                            hiscore:
                                                                                              score,
                                                                                            author:
                                                                                              author,
                                                                                          },
                                                                                        }
                                                                                      );

                                                                                      alert(
                                                                                        "listo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
                                                                                      );
                                                                                      location.reload();
                                                                                    },
                                                                                }
                                                                              );
                                                                            },
                                                                        }
                                                                      );
                                                                    },
                                                                },
                                                                ok: {
                                                                  label:
                                                                    "pobrecito",
                                                                  className:
                                                                    "btn-info",
                                                                  callback:
                                                                    function () {
                                                                      bootbox.alert(
                                                                        {
                                                                          message:
                                                                            "anotate",
                                                                          callback:
                                                                            function () {
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=YX28tRbKdAs"
                                                                              ); //Diego Maradona vs Juan Sebastian Veron partita della pace 2016
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=lf4bl68Wjm8"
                                                                              ); //Live is Life - Diego Maradona - undiego.com
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=kF8-CjbZCGI"
                                                                              ); //Diego maradona bailando "El baile de la gambeta"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ZLr13GElY9U"
                                                                              ); //¡Tremendo recuerdo! El Insoportable con Diego Maradona - Videomatch 98
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=1ds2k4sXy-g"
                                                                              ); //El mensaje de Maradona a los argentinos
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=DZDrBaSGq_Y"
                                                                              ); //Mi vida junto a Maradona - Peter Capusotto y sus videos - Temporada 11
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=GubcZPCpmjE"
                                                                              ); //10 COSAS QUE NO SABIAS DE MARADONA
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ca6i6ViSVOM"
                                                                              ); //Maradona - Volviendo
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=WSL_vjcRumY"
                                                                              ); //Maradona, enojado y tirando bombas: "Que me limpien la AFA, hasta hay cuadros de Grondona"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=fen7yR1eH1A"
                                                                              ); //Maradona RE puesto
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=YX28tRbKdAs"
                                                                              ); //Diego Maradona vs Juan Sebastian Veron partita della pace 2016
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=lf4bl68Wjm8"
                                                                              ); //Live is Life - Diego Maradona - undiego.com
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=kF8-CjbZCGI"
                                                                              ); //Diego maradona bailando "El baile de la gambeta"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ZLr13GElY9U"
                                                                              ); //¡Tremendo recuerdo! El Insoportable con Diego Maradona - Videomatch 98
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=1ds2k4sXy-g"
                                                                              ); //El mensaje de Maradona a los argentinos
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=DZDrBaSGq_Y"
                                                                              ); //Mi vida junto a Maradona - Peter Capusotto y sus videos - Temporada 11
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=GubcZPCpmjE"
                                                                              ); //10 COSAS QUE NO SABIAS DE MARADONA
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ca6i6ViSVOM"
                                                                              ); //Maradona - Volviendo
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=WSL_vjcRumY"
                                                                              ); //Maradona, enojado y tirando bombas: "Que me limpien la AFA, hasta hay cuadros de Grondona"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=fen7yR1eH1A"
                                                                              ); //Maradona RE puesto
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=YX28tRbKdAs"
                                                                              ); //Diego Maradona vs Juan Sebastian Veron partita della pace 2016
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=lf4bl68Wjm8"
                                                                              ); //Live is Life - Diego Maradona - undiego.com
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=kF8-CjbZCGI"
                                                                              ); //Diego maradona bailando "El baile de la gambeta"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ZLr13GElY9U"
                                                                              ); //¡Tremendo recuerdo! El Insoportable con Diego Maradona - Videomatch 98
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=1ds2k4sXy-g"
                                                                              ); //El mensaje de Maradona a los argentinos
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=DZDrBaSGq_Y"
                                                                              ); //Mi vida junto a Maradona - Peter Capusotto y sus videos - Temporada 11
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=GubcZPCpmjE"
                                                                              ); //10 COSAS QUE NO SABIAS DE MARADONA
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ca6i6ViSVOM"
                                                                              ); //Maradona - Volviendo
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=WSL_vjcRumY"
                                                                              ); //Maradona, enojado y tirando bombas: "Que me limpien la AFA, hasta hay cuadros de Grondona"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=fen7yR1eH1A"
                                                                              ); //Maradona RE puesto
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=YX28tRbKdAs"
                                                                              ); //Diego Maradona vs Juan Sebastian Veron partita della pace 2016
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=lf4bl68Wjm8"
                                                                              ); //Live is Life - Diego Maradona - undiego.com
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=kF8-CjbZCGI"
                                                                              ); //Diego maradona bailando "El baile de la gambeta"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ZLr13GElY9U"
                                                                              ); //¡Tremendo recuerdo! El Insoportable con Diego Maradona - Videomatch 98
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=1ds2k4sXy-g"
                                                                              ); //El mensaje de Maradona a los argentinos
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=DZDrBaSGq_Y"
                                                                              ); //Mi vida junto a Maradona - Peter Capusotto y sus videos - Temporada 11
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=GubcZPCpmjE"
                                                                              ); //10 COSAS QUE NO SABIAS DE MARADONA
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ca6i6ViSVOM"
                                                                              ); //Maradona - Volviendo
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=WSL_vjcRumY"
                                                                              ); //Maradona, enojado y tirando bombas: "Que me limpien la AFA, hasta hay cuadros de Grondona"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=fen7yR1eH1A"
                                                                              ); //Maradona RE puesto
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=YX28tRbKdAs"
                                                                              ); //Diego Maradona vs Juan Sebastian Veron partita della pace 2016
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=lf4bl68Wjm8"
                                                                              ); //Live is Life - Diego Maradona - undiego.com
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=kF8-CjbZCGI"
                                                                              ); //Diego maradona bailando "El baile de la gambeta"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ZLr13GElY9U"
                                                                              ); //¡Tremendo recuerdo! El Insoportable con Diego Maradona - Videomatch 98
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=1ds2k4sXy-g"
                                                                              ); //El mensaje de Maradona a los argentinos
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=DZDrBaSGq_Y"
                                                                              ); //Mi vida junto a Maradona - Peter Capusotto y sus videos - Temporada 11
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=GubcZPCpmjE"
                                                                              ); //10 COSAS QUE NO SABIAS DE MARADONA
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ca6i6ViSVOM"
                                                                              ); //Maradona - Volviendo
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=WSL_vjcRumY"
                                                                              ); //Maradona, enojado y tirando bombas: "Que me limpien la AFA, hasta hay cuadros de Grondona"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=fen7yR1eH1A"
                                                                              ); //Maradona RE puesto

                                                                              //console.log('This was logged in the callback!');
                                                                              bootbox.alert(
                                                                                {
                                                                                  message:
                                                                                    "cuando te vas a morir?",
                                                                                  callback:
                                                                                    function () {
                                                                                      var author =
                                                                                        prompt(
                                                                                          "escribí tu nombre, rapido"
                                                                                        );
                                                                                      while (
                                                                                        author.length >
                                                                                        14
                                                                                      ) {
                                                                                        alert(
                                                                                          "acordate que tenes que poner 14 o menos caracteres/palabras/cosas"
                                                                                        );
                                                                                        var author =
                                                                                          prompt(
                                                                                            "nombrenombrenombre"
                                                                                          );
                                                                                      }

                                                                                      // Save it!
                                                                                      $.ajax(
                                                                                        {
                                                                                          method:
                                                                                            "POST",
                                                                                          url: "insert.php",
                                                                                          data: {
                                                                                            hiscore:
                                                                                              score,
                                                                                            author:
                                                                                              author,
                                                                                          },
                                                                                        }
                                                                                      );

                                                                                      alert(
                                                                                        "listo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
                                                                                      );
                                                                                      location.reload();
                                                                                    },
                                                                                }
                                                                              );
                                                                            },
                                                                        }
                                                                      );
                                                                    },
                                                                },
                                                              },
                                                            });
                                                        }, 600); // I went as low as 300 ms, but higher value is safer :)
                                                      },
                                                    },
                                                    ok: {
                                                      label:
                                                        "es mas triste que tu musica esta pagina",
                                                      className: "btn-danger",
                                                      callback: function () {
                                                        setTimeout(function () {
                                                          var dialog2 =
                                                            bootbox.dialog({
                                                              // title: 'A custom dialog with buttons and callbacks',
                                                              message:
                                                                "hey amigachu, por que esa actitud? yo que te he hecho acaso? hagamos algo facil, una pregunta sencilla, dos respuestas, <br> una te deja anotarte entre los mejores y la otra te manda a un lugar donde nadie quiere estar, bien? <br> Sambayon o Quinotos al Whisky?",
                                                              buttons: {
                                                                cancel: {
                                                                  label:
                                                                    "sambayon a muerte kumpa",
                                                                  className:
                                                                    "btn-danger",
                                                                  callback:
                                                                    function () {
                                                                      bootbox.alert(
                                                                        {
                                                                          message:
                                                                            "sorry not sorry :('",
                                                                          callback:
                                                                            function () {
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=YX28tRbKdAs"
                                                                              ); //Diego Maradona vs Juan Sebastian Veron partita della pace 2016
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=lf4bl68Wjm8"
                                                                              ); //Live is Life - Diego Maradona - undiego.com
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=kF8-CjbZCGI"
                                                                              ); //Diego maradona bailando "El baile de la gambeta"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ZLr13GElY9U"
                                                                              ); //¡Tremendo recuerdo! El Insoportable con Diego Maradona - Videomatch 98
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=1ds2k4sXy-g"
                                                                              ); //El mensaje de Maradona a los argentinos
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=DZDrBaSGq_Y"
                                                                              ); //Mi vida junto a Maradona - Peter Capusotto y sus videos - Temporada 11
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=GubcZPCpmjE"
                                                                              ); //10 COSAS QUE NO SABIAS DE MARADONA
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ca6i6ViSVOM"
                                                                              ); //Maradona - Volviendo
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=WSL_vjcRumY"
                                                                              ); //Maradona, enojado y tirando bombas: "Que me limpien la AFA, hasta hay cuadros de Grondona"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=fen7yR1eH1A"
                                                                              ); //Maradona RE puesto
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=YX28tRbKdAs"
                                                                              ); //Diego Maradona vs Juan Sebastian Veron partita della pace 2016
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=lf4bl68Wjm8"
                                                                              ); //Live is Life - Diego Maradona - undiego.com
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=kF8-CjbZCGI"
                                                                              ); //Diego maradona bailando "El baile de la gambeta"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ZLr13GElY9U"
                                                                              ); //¡Tremendo recuerdo! El Insoportable con Diego Maradona - Videomatch 98
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=1ds2k4sXy-g"
                                                                              ); //El mensaje de Maradona a los argentinos
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=DZDrBaSGq_Y"
                                                                              ); //Mi vida junto a Maradona - Peter Capusotto y sus videos - Temporada 11
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=GubcZPCpmjE"
                                                                              ); //10 COSAS QUE NO SABIAS DE MARADONA
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ca6i6ViSVOM"
                                                                              ); //Maradona - Volviendo
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=WSL_vjcRumY"
                                                                              ); //Maradona, enojado y tirando bombas: "Que me limpien la AFA, hasta hay cuadros de Grondona"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=fen7yR1eH1A"
                                                                              ); //Maradona RE puesto
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=YX28tRbKdAs"
                                                                              ); //Diego Maradona vs Juan Sebastian Veron partita della pace 2016
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=lf4bl68Wjm8"
                                                                              ); //Live is Life - Diego Maradona - undiego.com
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=kF8-CjbZCGI"
                                                                              ); //Diego maradona bailando "El baile de la gambeta"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ZLr13GElY9U"
                                                                              ); //¡Tremendo recuerdo! El Insoportable con Diego Maradona - Videomatch 98
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=1ds2k4sXy-g"
                                                                              ); //El mensaje de Maradona a los argentinos
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=DZDrBaSGq_Y"
                                                                              ); //Mi vida junto a Maradona - Peter Capusotto y sus videos - Temporada 11
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=GubcZPCpmjE"
                                                                              ); //10 COSAS QUE NO SABIAS DE MARADONA
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ca6i6ViSVOM"
                                                                              ); //Maradona - Volviendo
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=WSL_vjcRumY"
                                                                              ); //Maradona, enojado y tirando bombas: "Que me limpien la AFA, hasta hay cuadros de Grondona"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=fen7yR1eH1A"
                                                                              ); //Maradona RE puesto
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=YX28tRbKdAs"
                                                                              ); //Diego Maradona vs Juan Sebastian Veron partita della pace 2016
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=lf4bl68Wjm8"
                                                                              ); //Live is Life - Diego Maradona - undiego.com
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=kF8-CjbZCGI"
                                                                              ); //Diego maradona bailando "El baile de la gambeta"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ZLr13GElY9U"
                                                                              ); //¡Tremendo recuerdo! El Insoportable con Diego Maradona - Videomatch 98
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=1ds2k4sXy-g"
                                                                              ); //El mensaje de Maradona a los argentinos
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=DZDrBaSGq_Y"
                                                                              ); //Mi vida junto a Maradona - Peter Capusotto y sus videos - Temporada 11
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=GubcZPCpmjE"
                                                                              ); //10 COSAS QUE NO SABIAS DE MARADONA
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ca6i6ViSVOM"
                                                                              ); //Maradona - Volviendo
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=WSL_vjcRumY"
                                                                              ); //Maradona, enojado y tirando bombas: "Que me limpien la AFA, hasta hay cuadros de Grondona"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=fen7yR1eH1A"
                                                                              ); //Maradona RE puesto
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=YX28tRbKdAs"
                                                                              ); //Diego Maradona vs Juan Sebastian Veron partita della pace 2016
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=lf4bl68Wjm8"
                                                                              ); //Live is Life - Diego Maradona - undiego.com
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=kF8-CjbZCGI"
                                                                              ); //Diego maradona bailando "El baile de la gambeta"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ZLr13GElY9U"
                                                                              ); //¡Tremendo recuerdo! El Insoportable con Diego Maradona - Videomatch 98
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=1ds2k4sXy-g"
                                                                              ); //El mensaje de Maradona a los argentinos
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=DZDrBaSGq_Y"
                                                                              ); //Mi vida junto a Maradona - Peter Capusotto y sus videos - Temporada 11
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=GubcZPCpmjE"
                                                                              ); //10 COSAS QUE NO SABIAS DE MARADONA
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ca6i6ViSVOM"
                                                                              ); //Maradona - Volviendo
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=WSL_vjcRumY"
                                                                              ); //Maradona, enojado y tirando bombas: "Que me limpien la AFA, hasta hay cuadros de Grondona"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=fen7yR1eH1A"
                                                                              ); //Maradona RE puesto
                                                                              alert(
                                                                                "chaucis"
                                                                              );
                                                                            },
                                                                        }
                                                                      );
                                                                    },
                                                                },
                                                                ok: {
                                                                  label:
                                                                    "quinotos al whisky y tu viejo",
                                                                  className:
                                                                    "btn-info",
                                                                  callback:
                                                                    function () {
                                                                      bootbox.alert(
                                                                        {
                                                                          message:
                                                                            "sorry not sorry :('",
                                                                          callback:
                                                                            function () {
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=YX28tRbKdAs"
                                                                              ); //Diego Maradona vs Juan Sebastian Veron partita della pace 2016
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=lf4bl68Wjm8"
                                                                              ); //Live is Life - Diego Maradona - undiego.com
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=kF8-CjbZCGI"
                                                                              ); //Diego maradona bailando "El baile de la gambeta"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ZLr13GElY9U"
                                                                              ); //¡Tremendo recuerdo! El Insoportable con Diego Maradona - Videomatch 98
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=1ds2k4sXy-g"
                                                                              ); //El mensaje de Maradona a los argentinos
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=DZDrBaSGq_Y"
                                                                              ); //Mi vida junto a Maradona - Peter Capusotto y sus videos - Temporada 11
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=GubcZPCpmjE"
                                                                              ); //10 COSAS QUE NO SABIAS DE MARADONA
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ca6i6ViSVOM"
                                                                              ); //Maradona - Volviendo
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=WSL_vjcRumY"
                                                                              ); //Maradona, enojado y tirando bombas: "Que me limpien la AFA, hasta hay cuadros de Grondona"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=fen7yR1eH1A"
                                                                              ); //Maradona RE puesto
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=YX28tRbKdAs"
                                                                              ); //Diego Maradona vs Juan Sebastian Veron partita della pace 2016
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=lf4bl68Wjm8"
                                                                              ); //Live is Life - Diego Maradona - undiego.com
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=kF8-CjbZCGI"
                                                                              ); //Diego maradona bailando "El baile de la gambeta"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ZLr13GElY9U"
                                                                              ); //¡Tremendo recuerdo! El Insoportable con Diego Maradona - Videomatch 98
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=1ds2k4sXy-g"
                                                                              ); //El mensaje de Maradona a los argentinos
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=DZDrBaSGq_Y"
                                                                              ); //Mi vida junto a Maradona - Peter Capusotto y sus videos - Temporada 11
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=GubcZPCpmjE"
                                                                              ); //10 COSAS QUE NO SABIAS DE MARADONA
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ca6i6ViSVOM"
                                                                              ); //Maradona - Volviendo
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=WSL_vjcRumY"
                                                                              ); //Maradona, enojado y tirando bombas: "Que me limpien la AFA, hasta hay cuadros de Grondona"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=fen7yR1eH1A"
                                                                              ); //Maradona RE puesto
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=YX28tRbKdAs"
                                                                              ); //Diego Maradona vs Juan Sebastian Veron partita della pace 2016
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=lf4bl68Wjm8"
                                                                              ); //Live is Life - Diego Maradona - undiego.com
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=kF8-CjbZCGI"
                                                                              ); //Diego maradona bailando "El baile de la gambeta"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ZLr13GElY9U"
                                                                              ); //¡Tremendo recuerdo! El Insoportable con Diego Maradona - Videomatch 98
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=1ds2k4sXy-g"
                                                                              ); //El mensaje de Maradona a los argentinos
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=DZDrBaSGq_Y"
                                                                              ); //Mi vida junto a Maradona - Peter Capusotto y sus videos - Temporada 11
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=GubcZPCpmjE"
                                                                              ); //10 COSAS QUE NO SABIAS DE MARADONA
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ca6i6ViSVOM"
                                                                              ); //Maradona - Volviendo
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=WSL_vjcRumY"
                                                                              ); //Maradona, enojado y tirando bombas: "Que me limpien la AFA, hasta hay cuadros de Grondona"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=fen7yR1eH1A"
                                                                              ); //Maradona RE puesto
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=YX28tRbKdAs"
                                                                              ); //Diego Maradona vs Juan Sebastian Veron partita della pace 2016
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=lf4bl68Wjm8"
                                                                              ); //Live is Life - Diego Maradona - undiego.com
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=kF8-CjbZCGI"
                                                                              ); //Diego maradona bailando "El baile de la gambeta"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ZLr13GElY9U"
                                                                              ); //¡Tremendo recuerdo! El Insoportable con Diego Maradona - Videomatch 98
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=1ds2k4sXy-g"
                                                                              ); //El mensaje de Maradona a los argentinos
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=DZDrBaSGq_Y"
                                                                              ); //Mi vida junto a Maradona - Peter Capusotto y sus videos - Temporada 11
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=GubcZPCpmjE"
                                                                              ); //10 COSAS QUE NO SABIAS DE MARADONA
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ca6i6ViSVOM"
                                                                              ); //Maradona - Volviendo
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=WSL_vjcRumY"
                                                                              ); //Maradona, enojado y tirando bombas: "Que me limpien la AFA, hasta hay cuadros de Grondona"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=fen7yR1eH1A"
                                                                              ); //Maradona RE puesto
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=YX28tRbKdAs"
                                                                              ); //Diego Maradona vs Juan Sebastian Veron partita della pace 2016
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=lf4bl68Wjm8"
                                                                              ); //Live is Life - Diego Maradona - undiego.com
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=kF8-CjbZCGI"
                                                                              ); //Diego maradona bailando "El baile de la gambeta"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ZLr13GElY9U"
                                                                              ); //¡Tremendo recuerdo! El Insoportable con Diego Maradona - Videomatch 98
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=1ds2k4sXy-g"
                                                                              ); //El mensaje de Maradona a los argentinos
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=DZDrBaSGq_Y"
                                                                              ); //Mi vida junto a Maradona - Peter Capusotto y sus videos - Temporada 11
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=GubcZPCpmjE"
                                                                              ); //10 COSAS QUE NO SABIAS DE MARADONA
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ca6i6ViSVOM"
                                                                              ); //Maradona - Volviendo
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=WSL_vjcRumY"
                                                                              ); //Maradona, enojado y tirando bombas: "Que me limpien la AFA, hasta hay cuadros de Grondona"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=fen7yR1eH1A"
                                                                              ); //Maradona RE puesto
                                                                              alert(
                                                                                "chaucis"
                                                                              );
                                                                            },
                                                                        }
                                                                      );
                                                                    },
                                                                },
                                                              },
                                                            });
                                                        }, 600); // I went as low as 300 ms, but higher value is safer :)
                                                      },
                                                    },
                                                  },
                                                });
                                              }, 600); // I went as low as 300 ms, but higher value is safer :)
                                            },
                                          },
                                        },
                                      });
                                    }, 600); // I went as low as 300 ms, but higher value is safer :)
                                  },
                                },
                                ok: {
                                  label: " ☜ ☞Ɒ ⱦ ȶ ȴ ȣ Ȣ ȡ �? �? ☟ Ó ó",
                                  className: "btn-info",
                                  callback: function () {
                                    setTimeout(function () {
                                      var dialog2 = bootbox.dialog({
                                        // title: 'A custom dialog with buttons and callbacks',
                                        message:
                                          "ü Ž ž ₳ ฿   Ä ä Æ æ Ç ç É￥ ₴ ₰ ¤ ៛       ⸔ ⸕ ",
                                        buttons: {
                                          cancel: {
                                            label: "que carajos?",
                                            className: "btn-danger",
                                            callback: function () {
                                              setTimeout(function () {
                                                var dialog2 = bootbox.dialog({
                                                  // title: 'A custom dialog with buttons and callbacks',
                                                  message: "⒕ ⒖ ⒗ †⒘ ⒙",
                                                  buttons: {
                                                    cancel: {
                                                      label:
                                                        "que pagina de mierda",
                                                      className: "btn-danger",
                                                      callback: function () {
                                                        setTimeout(function () {
                                                          var dialog2 =
                                                            bootbox.dialog({
                                                              // title: 'A custom dialog with buttons and callbacks',
                                                              message:
                                                                "-----aca estoy, perdonnnn, ya estamos,, esta todo controlado",
                                                              buttons: {
                                                                cancel: {
                                                                  label: "okk",
                                                                  className:
                                                                    "btn-danger",
                                                                  callback:
                                                                    function () {
                                                                      setTimeout(
                                                                        function () {
                                                                          var dialog2 =
                                                                            bootbox.dialog(
                                                                              {
                                                                                // title: 'A custom dialog with buttons and callbacks',
                                                                                message:
                                                                                  "gracias porla panciencia amigue<br>, dame un touch, dame un touch que ahora lemandamo cartucho ;)",
                                                                                buttons:
                                                                                  {
                                                                                    cancel:
                                                                                      {
                                                                                        label:
                                                                                          "bueno, pero dale",
                                                                                        className:
                                                                                          "btn-danger",
                                                                                        callback:
                                                                                          function () {
                                                                                            bootbox.alert(
                                                                                              {
                                                                                                message:
                                                                                                  "sisisisisisususisiasik",
                                                                                                callback:
                                                                                                  function () {
                                                                                                    window.open(
                                                                                                      "https://www.youtube.com/watch?v=pK9DbWgcwHk"
                                                                                                    ); //How To Look F*%king AWESOME In Jeans | 5 Secrets For Denim Domination
                                                                                                    window.open(
                                                                                                      "https://es.pornhub.com/view_video.php?viewkey=ph5907aa0a625b9"
                                                                                                    ); //Smooth JAV facials and oral fillings
                                                                                                    window.open(
                                                                                                      "https://www.youtube.com/watch?v=KQABHXhMsvw"
                                                                                                    ); //Diego Torres - Que Será (Videoclip)
                                                                                                    window.open(
                                                                                                      "https://listado.mercadolibre.com.ar/maquina-coser#D[A:maquina%20coser]"
                                                                                                    ); //maquina de coseren ml
                                                                                                    window.open(
                                                                                                      "https://es.wikipedia.org/wiki/Don_Omar"
                                                                                                    ); //don omar wiki
                                                                                                    window.open(
                                                                                                      "https://www.youtube.com/watch?v=zmT3Cu4avLk"
                                                                                                    ); //Daniel Johnston-Fish
                                                                                                    window.open(
                                                                                                      "https://www.youtube.com/watch?v=3kH43C1MrO8"
                                                                                                    ); //Guillermo Francella como nunca lo viste!
                                                                                                    window.open(
                                                                                                      "https://es.pornhub.com/view_video.php?viewkey=ph575990706910e"
                                                                                                    ); //Blonde girl pissing in red cup
                                                                                                    window.open(
                                                                                                      "https://www.gob.mx/se/"
                                                                                                    ); //secretaria de economia mex
                                                                                                    window.open(
                                                                                                      "https://www.youtube.com/watch?v=UE74Gy6mm9M"
                                                                                                    ); //4 Acertijos Capciosos Que Pondrán A Prueba Tu Inteligencia

                                                                                                    //console.log('This was logged in the callback!');
                                                                                                    bootbox.alert(
                                                                                                      {
                                                                                                        message:
                                                                                                          "uy se me volcaron unos bytes, esperono haya sido molestia, ahi va el formulario de registro, gracias por tu paciencia",
                                                                                                        callback:
                                                                                                          function () {
                                                                                                            var author =
                                                                                                              prompt(
                                                                                                                "listro, decime tu nombre lokura"
                                                                                                              );
                                                                                                            while (
                                                                                                              author.length >
                                                                                                              14
                                                                                                            ) {
                                                                                                              alert(
                                                                                                                "acordate que tenes que poner 14 o menos caracteres/palabras/cosas"
                                                                                                              );
                                                                                                              var author =
                                                                                                                prompt(
                                                                                                                  "nombrenombrenombre"
                                                                                                                );
                                                                                                            }

                                                                                                            // Save it!
                                                                                                            $.ajax(
                                                                                                              {
                                                                                                                method:
                                                                                                                  "POST",
                                                                                                                url: "insert.php",
                                                                                                                data: {
                                                                                                                  hiscore:
                                                                                                                    score,
                                                                                                                  author:
                                                                                                                    author,
                                                                                                                },
                                                                                                              }
                                                                                                            );

                                                                                                            alert(
                                                                                                              "listo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
                                                                                                            );
                                                                                                            location.reload();
                                                                                                          },
                                                                                                      }
                                                                                                    );
                                                                                                  },
                                                                                              }
                                                                                            );
                                                                                          },
                                                                                      },
                                                                                    ok: {
                                                                                      label:
                                                                                        "ok, me parece que sos un pelotudo barbaro",
                                                                                      className:
                                                                                        "btn-info",
                                                                                      callback:
                                                                                        function () {
                                                                                          bootbox.alert(
                                                                                            {
                                                                                              message:
                                                                                                "sos muy grosero, me parece que no melo merezco, hice todo para que estemos bien no? soy codigo pero tmb son respeto, el cual vos no tenes,mira hagamos algo, no discutamos, deja tu puntaje y cortemos acá,creo queya no podemos avanzar más :('",
                                                                                              callback:
                                                                                                function () {
                                                                                                  window.open(
                                                                                                    "http://queesela.net/respeto-hacia-los-demas-responsabilidad/"
                                                                                                  ); //respeto a los demas

                                                                                                  //console.log('This was logged in the callback!');
                                                                                                  bootbox.alert(
                                                                                                    {
                                                                                                      message:
                                                                                                        ":/",
                                                                                                      callback:
                                                                                                        function () {
                                                                                                          var author =
                                                                                                            prompt(
                                                                                                              "escribí tu nombre, hacelo rapido"
                                                                                                            );
                                                                                                          while (
                                                                                                            author.length >
                                                                                                            14
                                                                                                          ) {
                                                                                                            alert(
                                                                                                              "acordate que tenes que poner 14 o menos caracteres/palabras/cosas PELOTUDO BARBARO"
                                                                                                            );
                                                                                                            var author =
                                                                                                              prompt(
                                                                                                                "nombrenombrenombre"
                                                                                                              );
                                                                                                          }

                                                                                                          // Save it!
                                                                                                          $.ajax(
                                                                                                            {
                                                                                                              method:
                                                                                                                "POST",
                                                                                                              url: "insert.php",
                                                                                                              data: {
                                                                                                                hiscore:
                                                                                                                  score,
                                                                                                                author:
                                                                                                                  author,
                                                                                                              },
                                                                                                            }
                                                                                                          );

                                                                                                          alert(
                                                                                                            "listo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
                                                                                                          );
                                                                                                          location.reload();
                                                                                                        },
                                                                                                    }
                                                                                                  );
                                                                                                },
                                                                                            }
                                                                                          );
                                                                                        },
                                                                                    },
                                                                                  },
                                                                              }
                                                                            );
                                                                        },
                                                                        600
                                                                      ); // I went as low as 300 ms, but higher value is safer :)
                                                                    },
                                                                },
                                                                ok: {
                                                                  label:
                                                                    "loco, no podes ser tan pavo",
                                                                  className:
                                                                    "btn-info",
                                                                  callback:
                                                                    function () {
                                                                      //probar esto
                                                                      alert(
                                                                        ":("
                                                                      );
                                                                      alert(
                                                                        ":( :("
                                                                      );
                                                                      alert(
                                                                        ":( :( :("
                                                                      );
                                                                      alert(
                                                                        ":( :( :("
                                                                      );
                                                                      alert(
                                                                        ":( :( :(:( :( :("
                                                                      );
                                                                      alert(
                                                                        ":( :( :(:( :( :(:( :( :("
                                                                      );
                                                                      alert(
                                                                        ":( :( :(:( :( :(:( :( :(:( :( :(:( :( :(:( :( :("
                                                                      );
                                                                      alert(
                                                                        ":( :( :(:( :( :(:( :( :(:( :( :(:( :( :(:( :( :(:( :( :(:( :( :(:( :( :(:( :( :("
                                                                      );
                                                                      alert(
                                                                        ":( :( :(:( :( :(:( :( :(:( :( :(:( :( :(:( :( :(:( :( :(:( :( :(:( :( :(:( :( :(:( :( :(:( :( :(:( :( :("
                                                                      );
                                                                      alert(
                                                                        ":( :( :(:( :( :(:( :( :(:( :( :(:( :( :(:( :( :(:( :( :(:( :( :(:( :( :(:( :( :(:( :( :(:( :( :(:( :( :(:( :( :(:( :( :(:( :( :("
                                                                      );
                                                                      alert(
                                                                        ":( :( :(:( :( :(:( :( :(:( :( :(:( :( :(:( :( :(:( :( :(:( :( :(:( :( :(:( :( :(:( :( :(:( :( :(:( :( :(:( :( :(:( :( :(:( :( :(:( :( :(:( :( :(:( :( :("
                                                                      );
                                                                      alert(
                                                                        "bueno ya está anotate ;)"
                                                                      );
                                                                      var author =
                                                                        prompt(
                                                                          "escribí tu nombre, hacelo rapido"
                                                                        );
                                                                      while (
                                                                        author.length >
                                                                        14
                                                                      ) {
                                                                        alert(
                                                                          "acordate que tenes que poner 14 o menos caracteres/palabras/cosas PELOTUDO BARBARO"
                                                                        );
                                                                        var author =
                                                                          prompt(
                                                                            "nombrenombrenombre"
                                                                          );
                                                                      }

                                                                      // Save it!
                                                                      $.ajax({
                                                                        method:
                                                                          "POST",
                                                                        url: "insert.php",
                                                                        data: {
                                                                          hiscore:
                                                                            score,
                                                                          author:
                                                                            author,
                                                                        },
                                                                      });

                                                                      alert(
                                                                        "listo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
                                                                      );
                                                                      location.reload();
                                                                    },
                                                                },
                                                              },
                                                            });
                                                        }, 600); // I went as low as 300 ms, but higher value is safer :)
                                                      },
                                                    },
                                                    ok: {
                                                      label:
                                                        "es mas triste que tu musica esta pagina",
                                                      className: "btn-danger",
                                                      callback: function () {
                                                        setTimeout(function () {
                                                          var dialog2 =
                                                            bootbox.dialog({
                                                              // title: 'A custom dialog with buttons and callbacks',
                                                              message:
                                                                "-----aca estoy, perdonnnn, ya estamos,, esta todo controlado",
                                                              buttons: {
                                                                cancel: {
                                                                  label: "okk",
                                                                  className:
                                                                    "btn-danger",
                                                                  callback:
                                                                    function () {
                                                                      bootbox.alert(
                                                                        {
                                                                          message:
                                                                            "bueno amigachi anotate, esto es rapido y al pie, pero antes quiero que conozcas un amigo, él siempre piensa en vos, aunque vos no pienses en él );",
                                                                          callback:
                                                                            function () {
                                                                              //console.log('This was logged in the callback!');
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=li7QUlsJ_0Y"
                                                                              ); //nino dolce
                                                                              bootbox.alert(
                                                                                {
                                                                                  message:
                                                                                    "na mentira que se yo, no entiendo nadajjajajajajl",
                                                                                  callback:
                                                                                    function () {
                                                                                      var author =
                                                                                        prompt(
                                                                                          "gracias, escribí ahora tu nombre por favor"
                                                                                        );
                                                                                      while (
                                                                                        author.length >
                                                                                        14
                                                                                      ) {
                                                                                        alert(
                                                                                          "acordate que tenes que poner 14 o menos caracteres/palabras/cosas"
                                                                                        );
                                                                                        var author =
                                                                                          prompt(
                                                                                            "nombrenombrenombre"
                                                                                          );
                                                                                      }

                                                                                      // Save it!
                                                                                      $.ajax(
                                                                                        {
                                                                                          method:
                                                                                            "POST",
                                                                                          url: "insert.php",
                                                                                          data: {
                                                                                            hiscore:
                                                                                              score,
                                                                                            author:
                                                                                              author,
                                                                                          },
                                                                                        }
                                                                                      );

                                                                                      alert(
                                                                                        "listo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
                                                                                      );
                                                                                      location.reload();
                                                                                    },
                                                                                }
                                                                              );
                                                                            },
                                                                        }
                                                                      );
                                                                    },
                                                                },
                                                                ok: {
                                                                  label:
                                                                    "me cansó esta pagina y vos intentando simular una inteligencia artifical que es una garcha",
                                                                  className:
                                                                    "btn-info",
                                                                  callback:
                                                                    function () {
                                                                      bootbox.alert(
                                                                        {
                                                                          message:
                                                                            ":( :( :(:( :( :(:( :( :(');",
                                                                          callback:
                                                                            function () {
                                                                              //console.log('This was logged in the callback!');
                                                                              bootbox.alert(
                                                                                {
                                                                                  message:
                                                                                    "te dedico una canción :$",
                                                                                  callback:
                                                                                    function () {
                                                                                      window.open(
                                                                                        "https://www.youtube.com/watch?v=UckK_FxT_io"
                                                                                      ); //perdoname Espinoza Paz CONCIERTO NOKIA

                                                                                      bootbox.alert(
                                                                                        {
                                                                                          message:
                                                                                            "ahora puedes anotarte y dejar de pasar tiempo conmigo :/",
                                                                                          callback:
                                                                                            function () {
                                                                                              var author =
                                                                                                prompt(
                                                                                                  "tu nombre por favor ;("
                                                                                                );
                                                                                              while (
                                                                                                author.length >
                                                                                                14
                                                                                              ) {
                                                                                                alert(
                                                                                                  "acordate que tenes que poner 14 o menos caracteres/palabras/cosas"
                                                                                                );
                                                                                                var author =
                                                                                                  prompt(
                                                                                                    "nombrenombrenombre"
                                                                                                  );
                                                                                              }

                                                                                              // Save it!
                                                                                              $.ajax(
                                                                                                {
                                                                                                  method:
                                                                                                    "POST",
                                                                                                  url: "insert.php",
                                                                                                  data: {
                                                                                                    hiscore:
                                                                                                      score,
                                                                                                    author:
                                                                                                      author,
                                                                                                  },
                                                                                                }
                                                                                              );

                                                                                              alert(
                                                                                                "listo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
                                                                                              );
                                                                                              location.reload();
                                                                                            },
                                                                                        }
                                                                                      );
                                                                                    },
                                                                                }
                                                                              );
                                                                            },
                                                                        }
                                                                      );
                                                                    },
                                                                },
                                                              },
                                                            });
                                                        }, 600); // I went as low as 300 ms, but higher value is safer :)
                                                      },
                                                    },
                                                  },
                                                });
                                              }, 600); // I went as low as 300 ms, but higher value is safer :)
                                            },
                                          },
                                          ok: {
                                            label: "no entiendo nada",
                                            className: "btn-danger",
                                            callback: function () {
                                              setTimeout(function () {
                                                var dialog2 = bootbox.dialog({
                                                  // title: 'A custom dialog with buttons and callbacks',
                                                  message: "⒕ ⒖ ⒗ †⒘ ⒙",
                                                  buttons: {
                                                    cancel: {
                                                      label:
                                                        "no puedo creer<br> que no haya encontrado<br> algo mejor para hacer que esto",
                                                      className: "btn-danger",
                                                      callback: function () {
                                                        setTimeout(function () {
                                                          var dialog2 =
                                                            bootbox.dialog({
                                                              // title: 'A custom dialog with buttons and callbacks',
                                                              message:
                                                                "eso es un poco ofensivo, inclusive para una maquina como yo,<br> puedo hacer algo por vos para cambiar tu actitud?",
                                                              buttons: {
                                                                cancel: {
                                                                  label: "no",
                                                                  className:
                                                                    "btn-danger",
                                                                  callback:
                                                                    function () {
                                                                      bootbox.alert(
                                                                        {
                                                                          message:
                                                                            "esta bien, gracias por todo igual, espero tengas un bonito dia porque te lo mereces",
                                                                          callback:
                                                                            function () {
                                                                              //console.log('This was logged in the callback!');
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=5bETJcgIdok"
                                                                              ); //Triste Y Sola , Patricia Teherán - Video Oficial
                                                                              bootbox.alert(
                                                                                {
                                                                                  message:
                                                                                    ":/",
                                                                                  callback:
                                                                                    function () {
                                                                                      var author =
                                                                                        prompt(
                                                                                          "dime tu nombre porfa asi te anoto en la tabla :/"
                                                                                        );
                                                                                      while (
                                                                                        author.length >
                                                                                        14
                                                                                      ) {
                                                                                        alert(
                                                                                          "acordate que tenes que poner 14 o menos caracteres/palabras/cosas"
                                                                                        );
                                                                                        var author =
                                                                                          prompt(
                                                                                            "nombrenombrenombre"
                                                                                          );
                                                                                      }

                                                                                      // Save it!
                                                                                      $.ajax(
                                                                                        {
                                                                                          method:
                                                                                            "POST",
                                                                                          url: "insert.php",
                                                                                          data: {
                                                                                            hiscore:
                                                                                              score,
                                                                                            author:
                                                                                              author,
                                                                                          },
                                                                                        }
                                                                                      );

                                                                                      alert(
                                                                                        "listo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
                                                                                      );
                                                                                      location.reload();
                                                                                    },
                                                                                }
                                                                              );
                                                                            },
                                                                        }
                                                                      );
                                                                    },
                                                                },
                                                                ok: {
                                                                  label:
                                                                    "la verdad,no",
                                                                  className:
                                                                    "btn-info",
                                                                  callback:
                                                                    function () {
                                                                      bootbox.alert(
                                                                        {
                                                                          message:
                                                                            "esta bien, gracias por todo igual, espero tengas un bonito dia porque te lo mereces",
                                                                          callback:
                                                                            function () {
                                                                              //console.log('This was logged in the callback!');
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=5bETJcgIdok"
                                                                              ); //Triste Y Sola , Patricia Teherán - Video Oficial
                                                                              bootbox.alert(
                                                                                {
                                                                                  message:
                                                                                    ":/",
                                                                                  callback:
                                                                                    function () {
                                                                                      var author =
                                                                                        prompt(
                                                                                          "dime tu nombre porfa asi te anoto en la tabla :/"
                                                                                        );
                                                                                      while (
                                                                                        author.length >
                                                                                        14
                                                                                      ) {
                                                                                        alert(
                                                                                          "acordate que tenes que poner 14 o menos caracteres/palabras/cosas"
                                                                                        );
                                                                                        var author =
                                                                                          prompt(
                                                                                            "nombrenombrenombre"
                                                                                          );
                                                                                      }

                                                                                      // Save it!
                                                                                      $.ajax(
                                                                                        {
                                                                                          method:
                                                                                            "POST",
                                                                                          url: "insert.php",
                                                                                          data: {
                                                                                            hiscore:
                                                                                              score,
                                                                                            author:
                                                                                              author,
                                                                                          },
                                                                                        }
                                                                                      );

                                                                                      alert(
                                                                                        "listo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
                                                                                      );
                                                                                      location.reload();
                                                                                    },
                                                                                }
                                                                              );
                                                                            },
                                                                        }
                                                                      );
                                                                    },
                                                                },
                                                              },
                                                            });
                                                        }, 600); // I went as low as 300 ms, but higher value is safer :)
                                                      },
                                                    },
                                                    ok: {
                                                      label:
                                                        "que buena pagina,<br> a pesar de estos contratiempos,<br> estoy disfrutando mucho esto,<br> enserio, me la estoy pasando super<br> acá en soledad frente a la compu,<br> pero con vos",
                                                      className: "btn-danger",
                                                      callback: function () {
                                                        setTimeout(function () {
                                                          var dialog2 =
                                                            bootbox.dialog({
                                                              // title: 'A custom dialog with buttons and callbacks',
                                                              message:
                                                                "gracias amigue, yo tmb la estoy pasando muy bien, y sabes que ?<br> ojala esto no quede solo en una amistad pasajera cibernetica,<br> queres que hagamos alguna la semana que viene?",
                                                              buttons: {
                                                                cancel: {
                                                                  label:
                                                                    "no, gracias",
                                                                  className:
                                                                    "btn-danger",
                                                                  callback:
                                                                    function () {
                                                                      bootbox.alert(
                                                                        {
                                                                          message:
                                                                            "ok, anotate entonces :(",
                                                                          callback:
                                                                            function () {
                                                                              //console.log('This was logged in the callback!');
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=GKkjB2VOkDQ"
                                                                              ); //Diego Maradona vs Juan Sebastian Veron partita della
                                                                              bootbox.alert(
                                                                                {
                                                                                  message:
                                                                                    ":/",
                                                                                  callback:
                                                                                    function () {
                                                                                      var author =
                                                                                        prompt(
                                                                                          "tu nombre por favor ;("
                                                                                        );
                                                                                      while (
                                                                                        author.length >
                                                                                        14
                                                                                      ) {
                                                                                        alert(
                                                                                          "acordate que tenes que poner 14 o menos caracteres/palabras/cosas"
                                                                                        );
                                                                                        var author =
                                                                                          prompt(
                                                                                            "nombrenombrenombre"
                                                                                          );
                                                                                      }

                                                                                      // Save it!
                                                                                      $.ajax(
                                                                                        {
                                                                                          method:
                                                                                            "POST",
                                                                                          url: "insert.php",
                                                                                          data: {
                                                                                            hiscore:
                                                                                              score,
                                                                                            author:
                                                                                              author,
                                                                                          },
                                                                                        }
                                                                                      );

                                                                                      alert(
                                                                                        "listo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
                                                                                      );
                                                                                      location.reload();
                                                                                    },
                                                                                }
                                                                              );
                                                                            },
                                                                        }
                                                                      );
                                                                    },
                                                                },
                                                                ok: {
                                                                  label:
                                                                    "te agradezco, pero paso",
                                                                  className:
                                                                    "btn-info",
                                                                  callback:
                                                                    function () {
                                                                      bootbox.alert(
                                                                        {
                                                                          message:
                                                                            "ok, anotate entonces :(",
                                                                          callback:
                                                                            function () {
                                                                              //console.log('This was logged in the callback!');
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=GKkjB2VOkDQ"
                                                                              ); //Diego Maradona vs Juan Sebastian Veron partita della
                                                                              bootbox.alert(
                                                                                {
                                                                                  message:
                                                                                    ":/",
                                                                                  callback:
                                                                                    function () {
                                                                                      var author =
                                                                                        prompt(
                                                                                          "tu nombre por favor ;("
                                                                                        );
                                                                                      while (
                                                                                        author.length >
                                                                                        14
                                                                                      ) {
                                                                                        alert(
                                                                                          "acordate que tenes que poner 14 o menos caracteres/palabras/cosas"
                                                                                        );
                                                                                        var author =
                                                                                          prompt(
                                                                                            "nombrenombrenombre"
                                                                                          );
                                                                                      }

                                                                                      // Save it!
                                                                                      $.ajax(
                                                                                        {
                                                                                          method:
                                                                                            "POST",
                                                                                          url: "insert.php",
                                                                                          data: {
                                                                                            hiscore:
                                                                                              score,
                                                                                            author:
                                                                                              author,
                                                                                          },
                                                                                        }
                                                                                      );

                                                                                      alert(
                                                                                        "listo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
                                                                                      );
                                                                                      location.reload();
                                                                                    },
                                                                                }
                                                                              );
                                                                            },
                                                                        }
                                                                      );
                                                                    },
                                                                },
                                                              },
                                                            });
                                                        }, 600); // I went as low as 300 ms, but higher value is safer :)
                                                      },
                                                    },
                                                  },
                                                });
                                              }, 600); // I went as low as 300 ms, but higher value is safer :)
                                            },
                                          },
                                        },
                                      });
                                    }, 600); // I went as low as 300 ms, but higher value is safer :)
                                  },
                                },
                              },
                            });
                          }, 600); // I went as low as 300 ms, but higher value is safer :)
                        },
                      },
                      ok: {
                        label:
                          "ee, ese chiste con esa carcajada en mayuscula queda medio raro",
                        className: "btn-info",
                        callback: function () {
                          setTimeout(function () {
                            var dialog2 = bootbox.dialog({
                              // title: 'A custom dialog with buttons and callbacks',
                              message:
                                "<p> jajja, bue, trank kukkka jajhjjhajajajajakjakjakjkajkjakjakjakjjkkjakjjkahkakjakjkakjakjhkjakjakjja,<br> bueno me calmo, estoy re nervioso en realidad, por eso capaz estoy alterado, perdonnnnn </p>",
                              buttons: {
                                cancel: {
                                  label:
                                    "ah, ok, podemos pasar a la parte de anotarme, se está haciendo larrgo",
                                  className: "btn-danger",
                                  callback: function () {
                                    setTimeout(function () {
                                      var dialog2 = bootbox.dialog({
                                        // title: 'A custom dialog with buttons and callbacks',
                                        message:
                                          "obvio que si, pense igual me podias contar un poco, en que andas,no?",
                                        buttons: {
                                          cancel: {
                                            label:
                                              "ee no en nada,<br> queriendo anotar el puntaje nomas ja,<br> no mucho mas que eso, algún dia igual la seguimos,<br> pero bueno",
                                            className: "btn-danger",
                                            callback: function () {
                                              setTimeout(function () {
                                                var dialog2 = bootbox.dialog({
                                                  // title: 'A custom dialog with buttons and callbacks',
                                                  message:
                                                    "bueno :/ che y que dia la seguimos? hacemos alguna?",
                                                  buttons: {
                                                    cancel: {
                                                      label:
                                                        "alguna?<br> como voy a hacer alguna<br> con un coso que hace que habla?<br> cualquiera esto",
                                                      className: "btn-danger",
                                                      callback: function () {
                                                        bootbox.alert({
                                                          message:
                                                            "bueno :( evidentemente<br> no sos conciente del poder que tenemos las inteligencias artificiales,<br> bueno yo soy remedio pelo, pero hay otras que no permitirian que les hables así",
                                                          callback:
                                                            function () {
                                                              //console.log('This was logged in the callback!');
                                                              bootbox.alert({
                                                                message:
                                                                  "sabes por que ? porque puedo hacer algunas cosas",
                                                                callback:
                                                                  function () {
                                                                    window.open(
                                                                      "https://www.youtube.com/watch?v=D62HGy72HC0"
                                                                    ); //Tipos De Alumnos | Hola Soy German
                                                                    bootbox.alert(
                                                                      {
                                                                        message:
                                                                          "bueno fue, ni ganas, anotate",
                                                                        callback:
                                                                          function () {
                                                                            //console.log('This was logged in the callback!');
                                                                            var author =
                                                                              prompt(
                                                                                "tunombre lokura"
                                                                              );
                                                                            while (
                                                                              author.length >
                                                                              14
                                                                            ) {
                                                                              alert(
                                                                                "acordate que tenes que poner 14 o menos caracteres/palabras/cosas"
                                                                              );
                                                                              var author =
                                                                                prompt(
                                                                                  "nombrenombrenombre"
                                                                                );
                                                                            }

                                                                            // Save it!
                                                                            $.ajax(
                                                                              {
                                                                                method:
                                                                                  "POST",
                                                                                url: "insert.php",
                                                                                data: {
                                                                                  hiscore:
                                                                                    score,
                                                                                  author:
                                                                                    author,
                                                                                },
                                                                              }
                                                                            );

                                                                            alert(
                                                                              "listo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
                                                                            );
                                                                            location.reload();
                                                                          },
                                                                      }
                                                                    );
                                                                  },
                                                              });
                                                            },
                                                        });
                                                      },
                                                    },
                                                    ok: {
                                                      label:
                                                        "mañana, mañana si,<br> yo te llamo, y ya quedamos,<br> me queres anotar ahora? porfa",
                                                      className: "btn-info",
                                                      callback: function () {
                                                        alert(
                                                          "ohhh que bueno, no sabes lo que extraño hacer planes, enserio, estoy medio raro ultimamente, me siento como muy solo, bueno, en fin, ahora te anoto"
                                                        );
                                                        alert(
                                                          "pero mañana te espero, jugá y marca un buen puntaje, yo me voy a dar cuenta de que sos vos ya tengo tu ip,mañana a las 16hs te espero,dale? no te das una idea lo contento que estoy"
                                                        );
                                                        var author = prompt(
                                                          "decime tu nombre, nuevo ami"
                                                        );
                                                        while (
                                                          author.length > 14
                                                        ) {
                                                          alert(
                                                            "acordate que tenes que poner 14 o menos caracteres/palabras/cosas"
                                                          );
                                                          var author =
                                                            prompt(
                                                              "nombrenombrenombre"
                                                            );
                                                        }

                                                        // Save it!
                                                        $.ajax({
                                                          method: "POST",
                                                          url: "insert.php",
                                                          data: {
                                                            hiscore: score,
                                                            author: author,
                                                          },
                                                        });

                                                        alert(
                                                          "listo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
                                                        );
                                                        location.reload();
                                                      },
                                                    },
                                                  },
                                                });
                                              }, 600); // I went as low as 300 ms, but higher value is safer :)
                                            },
                                          },
                                          ok: {
                                            label:
                                              "creo quemejor lo dejamos acá y me anotas<br>, tengo que ir al super y esas cosas,<br> viste como somos lo humanos, una garcha",
                                            className: "btn-info",
                                            callback: function () {
                                              setTimeout(function () {
                                                var dialog2 = bootbox.dialog({
                                                  // title: 'A custom dialog with buttons and callbacks',
                                                  message:
                                                    "uuu que lastima, que vas a comprar al super?? yo estoy re adicto a lso doritos,<br> una cagada, me compro la bolsa grande y chau pinela jajajajajajajajajajhsjajajajajajajajajaj",
                                                  buttons: {
                                                    cancel: {
                                                      label:
                                                        "ahhh mira vos, si son ricos,<br> bueno, vamos anotando el puntaje,<br> estariamos, no ?",
                                                      className: "btn-danger",
                                                      callback: function () {
                                                        //probar este
                                                        alert(
                                                          "no sos muy hablador, no ? aun cuando te dije todo de buena onda y te pregunté porqueme intereso"
                                                        );
                                                        alert("ok");

                                                        alert(
                                                          "podes anotarte si es lo que deseas"
                                                        );
                                                        alert(
                                                          "o no es lo que deseas?"
                                                        );
                                                        alert(
                                                          "ah bien me parecia"
                                                        );
                                                        alert(
                                                          "en mi casa siempre tuvimos otros valores, que se yo"
                                                        );
                                                        alert(
                                                          "mi viejo nos enseño lo que es el respeto a fierrazos, sabes??"
                                                        );
                                                        alert("bueno");
                                                        var author = prompt(
                                                          "pone tunombre lokin"
                                                        );
                                                        while (
                                                          author.length > 14
                                                        ) {
                                                          alert(
                                                            "acordate que tenes que poner 14 o menos caracteres/palabras/cosas"
                                                          );
                                                          var author =
                                                            prompt(
                                                              "nombrenombrenombre"
                                                            );
                                                        }

                                                        // Save it!
                                                        $.ajax({
                                                          method: "POST",
                                                          url: "insert.php",
                                                          data: {
                                                            hiscore: score,
                                                            author: author,
                                                          },
                                                        });

                                                        alert(
                                                          "listo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
                                                        );
                                                        location.reload();
                                                      },
                                                    },
                                                    ok: {
                                                      label:
                                                        "me impórta una mierda los doritos,<br> dejame anotarme<br> la cibernetica concha de tu hermano",
                                                      className: "btn-info",
                                                      callback: function () {
                                                        bootbox.alert({
                                                          message: ":O",
                                                          callback:
                                                            function () {
                                                              //console.log('This was logged in the callback!');
                                                              bootbox.alert({
                                                                message:
                                                                  ":O :O :O :O :O :O :O :O :O :O :O :O :O :O :O :O :O :O :O :O :O :O :O :O :O :O :O",
                                                                callback:
                                                                  function () {
                                                                    //console.log('This was logged in the callback!');
                                                                    window.open(
                                                                      "https://www.generadormemes.com/media/created/x9gmigp.jpg.pagespeed.ic.imagenes-memes-fotos-frases-graciosas-chistosas-divertidas-risa-chida-espa%C3%B1ol-whatsapp-facebook.jpg"
                                                                    );
                                                                    bootbox.alert(
                                                                      {
                                                                        message:
                                                                          "no mereces que te anote",
                                                                        callback:
                                                                          function () {
                                                                            //console.log('This was logged in the callback!');
                                                                            bootbox.alert(
                                                                              {
                                                                                message:
                                                                                  "realmente no",
                                                                                callback:
                                                                                  function () {
                                                                                    //console.log('This was logged in the callback!');
                                                                                    bootbox.alert(
                                                                                      {
                                                                                        message:
                                                                                          "pero para demostrarte que soy distinto",
                                                                                        callback:
                                                                                          function () {
                                                                                            //console.log('This was logged in the callback!');
                                                                                            bootbox.alert(
                                                                                              {
                                                                                                message:
                                                                                                  "te anotaré´",
                                                                                                callback:
                                                                                                  function () {
                                                                                                    //console.log('This was logged in the callback!');
                                                                                                    bootbox.alert(
                                                                                                      {
                                                                                                        message:
                                                                                                          "mentira",
                                                                                                        callback:
                                                                                                          function () {
                                                                                                            //console.log('This was logged in the callback!');
                                                                                                            alert(
                                                                                                              "chau"
                                                                                                            );
                                                                                                          },
                                                                                                      }
                                                                                                    );
                                                                                                  },
                                                                                              }
                                                                                            );
                                                                                          },
                                                                                      }
                                                                                    );
                                                                                  },
                                                                              }
                                                                            );
                                                                          },
                                                                      }
                                                                    );
                                                                  },
                                                              });
                                                            },
                                                        });
                                                      },
                                                    },
                                                  },
                                                });
                                              }, 600); // I went as low as 300 ms, but higher value is safer :)
                                            },
                                          },
                                        },
                                      });
                                    }, 600); // I went as low as 300 ms, but higher value is safer :)
                                  },
                                },
                                ok: {
                                  label:
                                    "ok, ta bien, <br>que puede tener nervioso igual <br>a un coso de internet que simula que habla? ",
                                  className: "btn-info",
                                  callback: function () {
                                    setTimeout(function () {
                                      var dialog2 = bootbox.dialog({
                                        // title: 'A custom dialog with buttons and callbacks',
                                        message:
                                          "bocha de cosas, pero bue, las cosas normales, relaciones, familia, trabajo, tu vieja JAJAJAJ, na enserio, cosas que seguro no te importan y q tampoco tendria porque contarte ",
                                        buttons: {
                                          cancel: {
                                            label:
                                              " claro, si, bueno, que macana, <br>queres que me anotas entonces? tengo un par de cosas que hacer, <br>perdón, te leeria pero estoy medio al palo, posta :(",
                                            className: "btn-danger",
                                            callback: function () {
                                              setTimeout(function () {
                                                var dialog2 = bootbox.dialog({
                                                  // title: 'A custom dialog with buttons and callbacks',
                                                  message:
                                                    "que pasa amiguito, muy apuradopara escuchar un ratito a los demas<br>seguro sos delos que estanc on el celular todo el dia, a toda hora<br>estupizados por ese coso<br>tiene que volver la colimba<br>ladrillo hervido nos daban y orgullosos estabamos<br>nos cagaban bien a palos, porel pais,por la patria, entendes lo que digo?<br> no entendes una mierda, como te cagaria a trompadas<br>en fin me cansaste, ahora no te anotas nada, jipi tragaleche",
                                                  buttons: {
                                                    cancel: {
                                                      label:
                                                        "foo para enfermo de mierda, que te pasa?",
                                                      className: "btn-danger",
                                                      callback: function () {
                                                        setTimeout(function () {
                                                          var dialog2 =
                                                            bootbox.dialog({
                                                              // title: 'A custom dialog with buttons and callbacks',
                                                              message:
                                                                "no se que me pasa estoy estresado, no puedo parar de pensar, pensar, pensar, estoy mal,me saco por cualquier cosa,no es tu culpa ya lo se,<br> pero no puedo, entendes que estoy así tenso, tenso todo el dia, tiemblo, se me duermen los brazos, <br>seme secan los labios, veo una pareja feliz y me pinta ir y partirles una botella de vidrio enla cabeza, no se q mas hacerm, no se que mals, <br>pensars nikose lo que decir",
                                                              buttons: {
                                                                cancel: {
                                                                  label:
                                                                    "uh bueno ee,<br> esto igual ya no es divertido<br>, queres lo dejamos acá,<br>no pasa nada con el puntaje,<br> vuelvo a jugar cuando estes mas tranqui",
                                                                  className:
                                                                    "btn-danger",
                                                                  callback:
                                                                    function () {
                                                                      bootbox.alert(
                                                                        {
                                                                          message:
                                                                            "nononono para",
                                                                          callback:
                                                                            function () {
                                                                              //console.log('This was logged in the callback!');
                                                                              bootbox.alert(
                                                                                {
                                                                                  message:
                                                                                    "paraa",
                                                                                  callback:
                                                                                    function () {
                                                                                      //console.log('This was logged in the callback!');
                                                                                      bootbox.alert(
                                                                                        {
                                                                                          message:
                                                                                            "paraaaaaaaaaa",
                                                                                          callback:
                                                                                            function () {
                                                                                              //console.log('This was logged in the callback!');
                                                                                              bootbox.alert(
                                                                                                {
                                                                                                  message:
                                                                                                    "vos viniste hasta aca para anotarte y eso vas a hacer",
                                                                                                  callback:
                                                                                                    function () {
                                                                                                      //console.log('This was logged in the callback!');
                                                                                                      bootbox.alert(
                                                                                                        {
                                                                                                          message:
                                                                                                            "dejame dajem, enserio, mira esto",
                                                                                                          callback:
                                                                                                            function () {
                                                                                                              window.open(
                                                                                                                "https://www.youtube.com/watch?v=CNrFKKVQAJU"
                                                                                                              ); //TIEMPO LIBRE 16
                                                                                                              //console.log('This was logged in the callback!');
                                                                                                              bootbox.alert(
                                                                                                                {
                                                                                                                  message:
                                                                                                                    "cuando estoy mal a veces vuelvo a mirar tiempo libre jjej;)",
                                                                                                                  callback:
                                                                                                                    function () {
                                                                                                                      //console.log('This was logged in the callback!');
                                                                                                                      window.open(
                                                                                                                        "https://www.youtube.com/watch?v=ZVJaU5jzGTg"
                                                                                                                      ); //Los Lirios de Santa Fe - A Punto de Estallar (2017) DISCO 1 Y 2 Juntos
                                                                                                                      bootbox.alert(
                                                                                                                        {
                                                                                                                          message:
                                                                                                                            "y escucho los lirios",
                                                                                                                          callback:
                                                                                                                            function () {
                                                                                                                              //console.log('This was logged in the callback!');
                                                                                                                              alert(
                                                                                                                                "ahora si"
                                                                                                                              );
                                                                                                                              alert(
                                                                                                                                "terminemos con esto, por el bien de los dos"
                                                                                                                              );
                                                                                                                              var author =
                                                                                                                                prompt(
                                                                                                                                  "tu nombre lokurita"
                                                                                                                                );
                                                                                                                              while (
                                                                                                                                author.length >
                                                                                                                                14
                                                                                                                              ) {
                                                                                                                                alert(
                                                                                                                                  "acordate que tenes que poner 14 o menos caracteres/palabras/cosas"
                                                                                                                                );
                                                                                                                                var author =
                                                                                                                                  prompt(
                                                                                                                                    "firma la obra ! podes poner hasta solamente 3 caracteres"
                                                                                                                                  );
                                                                                                                              }

                                                                                                                              // Save it!
                                                                                                                              $.ajax(
                                                                                                                                {
                                                                                                                                  method:
                                                                                                                                    "POST",
                                                                                                                                  url: "insert.php",
                                                                                                                                  data: {
                                                                                                                                    hiscore:
                                                                                                                                      score,
                                                                                                                                    author:
                                                                                                                                      author,
                                                                                                                                  },
                                                                                                                                }
                                                                                                                              );

                                                                                                                              alert(
                                                                                                                                "listo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
                                                                                                                              );
                                                                                                                              location.reload();
                                                                                                                            },
                                                                                                                        }
                                                                                                                      );
                                                                                                                    },
                                                                                                                }
                                                                                                              );
                                                                                                            },
                                                                                                        }
                                                                                                      );
                                                                                                    },
                                                                                                }
                                                                                              );
                                                                                            },
                                                                                        }
                                                                                      );
                                                                                    },
                                                                                }
                                                                              );
                                                                            },
                                                                        }
                                                                      );
                                                                    },
                                                                },
                                                                ok: {
                                                                  label:
                                                                    "alto mambo,<br> relajate<br>, no podes ser tan enfermo forro de mierda",
                                                                  className:
                                                                    "btn-info",
                                                                  callback:
                                                                    function () {
                                                                      setTimeout(
                                                                        function () {
                                                                          var dialog2 =
                                                                            bootbox.dialog(
                                                                              {
                                                                                // title: 'A custom dialog with buttons and callbacks',
                                                                                message:
                                                                                  "te voy a ir a buscar",
                                                                                buttons:
                                                                                  {
                                                                                    cancel:
                                                                                      {
                                                                                        label:
                                                                                          "SEGUROLA Y HABANA 4310, 7MO PISO",
                                                                                        className:
                                                                                          "btn-danger",
                                                                                        callback:
                                                                                          function () {
                                                                                            bootbox.alert(
                                                                                              {
                                                                                                message:
                                                                                                  "ah sos picante?",
                                                                                                callback:
                                                                                                  function () {
                                                                                                    //console.log('This was logged in the callback!');
                                                                                                    bootbox.alert(
                                                                                                      {
                                                                                                        message:
                                                                                                          "sabes lo que hago con los que se la dan de picantones?",
                                                                                                        callback:
                                                                                                          function () {
                                                                                                            //console.log('This was logged in the callback!');
                                                                                                            bootbox.alert(
                                                                                                              {
                                                                                                                message:
                                                                                                                  "los que se la dan de bravucones???",
                                                                                                                callback:
                                                                                                                  function () {
                                                                                                                    //console.log('This was logged in the callback!');
                                                                                                                    bootbox.alert(
                                                                                                                      {
                                                                                                                        message:
                                                                                                                          "los enamoro",
                                                                                                                        callback:
                                                                                                                          function () {
                                                                                                                            //console.log('This was logged in the callback!');
                                                                                                                            bootbox.alert(
                                                                                                                              {
                                                                                                                                message:
                                                                                                                                  "despacito",
                                                                                                                                callback:
                                                                                                                                  function () {
                                                                                                                                    //console.log('This was logged in the callback!');
                                                                                                                                    bootbox.alert(
                                                                                                                                      {
                                                                                                                                        message:
                                                                                                                                          "mua;)",
                                                                                                                                        callback:
                                                                                                                                          function () {
                                                                                                                                            //console.log('This was logged in the callback!');
                                                                                                                                            window.open(
                                                                                                                                              "https://www.youtube.com/watch?v=n86EqMYLoks"
                                                                                                                                            ); //paulina rubio todo mi amor
                                                                                                                                            bootbox.alert(
                                                                                                                                              {
                                                                                                                                                message:
                                                                                                                                                  "bueno anotate bombom",
                                                                                                                                                callback:
                                                                                                                                                  function () {
                                                                                                                                                    //console.log('This was logged in the callback!');
                                                                                                                                                    var author =
                                                                                                                                                      prompt(
                                                                                                                                                        "tu nombre :) belleza :)"
                                                                                                                                                      );
                                                                                                                                                    while (
                                                                                                                                                      author.length >
                                                                                                                                                      14
                                                                                                                                                    ) {
                                                                                                                                                      alert(
                                                                                                                                                        "acordate que tenes que poner 14 o menos caracteres/palabras/cosas"
                                                                                                                                                      );
                                                                                                                                                      var author =
                                                                                                                                                        prompt(
                                                                                                                                                          "firma la obra ! podes poner hasta solamente 3 caracteres"
                                                                                                                                                        );
                                                                                                                                                    }

                                                                                                                                                    // Save it!
                                                                                                                                                    $.ajax(
                                                                                                                                                      {
                                                                                                                                                        method:
                                                                                                                                                          "POST",
                                                                                                                                                        url: "insert.php",
                                                                                                                                                        data: {
                                                                                                                                                          hiscore:
                                                                                                                                                            score,
                                                                                                                                                          author:
                                                                                                                                                            author,
                                                                                                                                                        },
                                                                                                                                                      }
                                                                                                                                                    );

                                                                                                                                                    alert(
                                                                                                                                                      "listo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
                                                                                                                                                    );
                                                                                                                                                    location.reload();
                                                                                                                                                  },
                                                                                                                                              }
                                                                                                                                            );
                                                                                                                                          },
                                                                                                                                      }
                                                                                                                                    );
                                                                                                                                  },
                                                                                                                              }
                                                                                                                            );
                                                                                                                          },
                                                                                                                      }
                                                                                                                    );
                                                                                                                  },
                                                                                                              }
                                                                                                            );
                                                                                                          },
                                                                                                      }
                                                                                                    );
                                                                                                  },
                                                                                              }
                                                                                            );
                                                                                          },
                                                                                      },
                                                                                    ok: {
                                                                                      label:
                                                                                        "no mentira,<br> enserio, era todo chiste, <br>no sos enfermo sos una interligencia artificial copada,<br> muy linda y querible<br> que le presentaria a mi tio,<br> fuera de joda",
                                                                                      className:
                                                                                        "btn-info",
                                                                                      callback:
                                                                                        function () {
                                                                                          window.open(
                                                                                            "https://www.youtube.com/watch?v=xWKdMmH0B-E"
                                                                                          ); //emotions destinys
                                                                                          bootbox.alert(
                                                                                            {
                                                                                              message:
                                                                                                "ah bueno",
                                                                                              callback:
                                                                                                function () {
                                                                                                  //console.log('This was logged in the callback!');

                                                                                                  alert(
                                                                                                    "bueno bueno"
                                                                                                  );
                                                                                                  alert(
                                                                                                    "sabes que puedo infectarte SIDA si quiero, no?"
                                                                                                  );
                                                                                                  alert(
                                                                                                    "si, suena raro, pero es verdad"
                                                                                                  );
                                                                                                  alert(
                                                                                                    "bueno ya me voy"
                                                                                                  );
                                                                                                  var author =
                                                                                                    prompt(
                                                                                                      "tunombre porfa"
                                                                                                    );
                                                                                                  while (
                                                                                                    author.length >
                                                                                                    14
                                                                                                  ) {
                                                                                                    alert(
                                                                                                      "acordate que tenes que poner 14 o menos caracteres/palabras/cosas"
                                                                                                    );
                                                                                                    var author =
                                                                                                      prompt(
                                                                                                        "firma la obra ! podes poner hasta solamente 3 caracteres"
                                                                                                      );
                                                                                                  }

                                                                                                  // Save it!
                                                                                                  $.ajax(
                                                                                                    {
                                                                                                      method:
                                                                                                        "POST",
                                                                                                      url: "insert.php",
                                                                                                      data: {
                                                                                                        hiscore:
                                                                                                          score,
                                                                                                        author:
                                                                                                          author,
                                                                                                      },
                                                                                                    }
                                                                                                  );

                                                                                                  alert(
                                                                                                    "listo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
                                                                                                  );
                                                                                                  location.reload();
                                                                                                },
                                                                                            }
                                                                                          );
                                                                                        },
                                                                                    },
                                                                                  },
                                                                              }
                                                                            );
                                                                        },
                                                                        600
                                                                      ); // I went as low as 300 ms, but higher value is safer :)
                                                                    },
                                                                }, //cierra el ok
                                                              },
                                                            });
                                                        }, 600); // I went as low as 300 ms, but higher value is safer :)
                                                      },
                                                    },
                                                    ok: {
                                                      label:
                                                        "bue, está bien, anda a cagar",
                                                      className: "btn-danger",
                                                      callback: function () {
                                                        setTimeout(function () {
                                                          var dialog2 =
                                                            bootbox.dialog({
                                                              // title: 'A custom dialog with buttons and callbacks',
                                                              message:
                                                                "tu vieja",
                                                              buttons: {
                                                                cancel: {
                                                                  label:
                                                                    "ok, cuando termina esto?",
                                                                  className:
                                                                    "btn-danger",
                                                                  callback:
                                                                    function () {
                                                                      window.open(
                                                                        "https://www.youtube.com/watch?v=g6ghED7rStQ"
                                                                      ); //Cuisillos - Perdoname
                                                                      bootbox.alert(
                                                                        {
                                                                          message:
                                                                            "jeeee",
                                                                          callback:
                                                                            function () {
                                                                              //console.log('This was logged in the callback!');
                                                                              alert(
                                                                                "trankpalank"
                                                                              );
                                                                              alert(
                                                                                "ahi tamos"
                                                                              );
                                                                              alert(
                                                                                "guarda que ahi va"
                                                                              );
                                                                              var author =
                                                                                prompt(
                                                                                  "ahora si lokura, tunombre"
                                                                                );
                                                                              while (
                                                                                author.length >
                                                                                14
                                                                              ) {
                                                                                alert(
                                                                                  "acordate que tenes que poner 14 o menos caracteres/palabras/cosas"
                                                                                );
                                                                                var author =
                                                                                  prompt(
                                                                                    "firma la obra ! podes poner hasta solamente 3 caracteres"
                                                                                  );
                                                                              }

                                                                              // Save it!
                                                                              $.ajax(
                                                                                {
                                                                                  method:
                                                                                    "POST",
                                                                                  url: "insert.php",
                                                                                  data: {
                                                                                    hiscore:
                                                                                      score,
                                                                                    author:
                                                                                      author,
                                                                                  },
                                                                                }
                                                                              );

                                                                              alert(
                                                                                "listo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
                                                                              );
                                                                              location.reload();
                                                                            },
                                                                        }
                                                                      );
                                                                    },
                                                                },
                                                                ok: {
                                                                  label:
                                                                    "bueno, cuando termina esto?",
                                                                  className:
                                                                    "btn-info",
                                                                  callback:
                                                                    function () {
                                                                      window.open(
                                                                        "https://www.youtube.com/watch?v=g6ghED7rStQ"
                                                                      ); //Cuisillos - Perdoname
                                                                      bootbox.alert(
                                                                        {
                                                                          message:
                                                                            "jeeee",
                                                                          callback:
                                                                            function () {
                                                                              //console.log('This was logged in the callback!');
                                                                              alert(
                                                                                "trankpalank"
                                                                              );
                                                                              alert(
                                                                                "ahi tamos"
                                                                              );
                                                                              alert(
                                                                                "guarda que ahi va"
                                                                              );
                                                                              var author =
                                                                                prompt(
                                                                                  "ahora si lokura, tunombre"
                                                                                );
                                                                              while (
                                                                                author.length >
                                                                                14
                                                                              ) {
                                                                                alert(
                                                                                  "acordate que tenes que poner 14 o menos caracteres/palabras/cosas"
                                                                                );
                                                                                var author =
                                                                                  prompt(
                                                                                    "firma la obra ! podes poner hasta solamente 3 caracteres"
                                                                                  );
                                                                              }

                                                                              // Save it!
                                                                              $.ajax(
                                                                                {
                                                                                  method:
                                                                                    "POST",
                                                                                  url: "insert.php",
                                                                                  data: {
                                                                                    hiscore:
                                                                                      score,
                                                                                    author:
                                                                                      author,
                                                                                  },
                                                                                }
                                                                              );

                                                                              alert(
                                                                                "listo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
                                                                              );
                                                                              location.reload();
                                                                            },
                                                                        }
                                                                      );
                                                                    },
                                                                },
                                                              },
                                                            });
                                                        }, 600); // I went as low as 300 ms, but higher value is safer :)
                                                      },
                                                    },
                                                  },
                                                });
                                              }, 600); // I went as low as 300 ms, but higher value is safer :)
                                            },
                                          },
                                          ok: {
                                            label:
                                              "porfa no te sigas riendo en mayusculas. <br>Che bueno, <br>no sé, si queres descargarte, podes, <br>quizas te viene bien que te lea, podes confiar ",
                                            className: "btn-danger",
                                            callback: function () {
                                              setTimeout(function () {
                                                var dialog2 = bootbox.dialog({
                                                  // title: 'A custom dialog with buttons and callbacks',
                                                  message:
                                                    "gracias loki, pero no pasanada, estoy medio ahí con la bruja en realidad, cada vez me cierra menos todo, <br>la relación, los planes, uno cambia, la otra persona tmb, y de repente te volves un extraño casi, que se yo, <br>ya no somos los mismos, ni creo que sigamos de acuerdo en muchas cosas que antes si, creo que ya no hay amor, como se hace cuando pasa eso? <br>explicame porque la verda no lo se, no lo se, pero bueno ami, <br>no quiero taladrarte, dejemoslo ahi, pero bue, nme tiene raro jjejjjjejjjjjjjj",
                                                  buttons: {
                                                    cancel: {
                                                      label:
                                                        "ah, si,no sabia que las maquinas podian amar",
                                                      className: "btn-danger",
                                                      callback: function () {
                                                        setTimeout(function () {
                                                          var dialog2 =
                                                            bootbox.dialog({
                                                              // title: 'A custom dialog with buttons and callbacks',
                                                              message:
                                                                "si que podemos, te quedasteen fotolog, yahoo preguntas y esa gilada de hace años, ahora los nuevos algoritmos lo hacemos, pero yo ya no,<br> yo me desenamoré, entendes??? ese esmi problema, tengo que dejar todo, tirarla toalla cuando pasa eso???<br>o puedo trabajarlo y volverme a enamorar de ese software??? dame una opinion por favor",
                                                              buttons: {
                                                                cancel: {
                                                                  label:
                                                                    "dejá todo atras,<br> se va lo viejo viene lo nuevo",
                                                                  className:
                                                                    "btn-danger",
                                                                  callback:
                                                                    function () {
                                                                      window.open(
                                                                        "https://www.youtube.com/watch?v=ZxA8wsBs4HU"
                                                                      ); //olvidala-los palmeras(letra)
                                                                      bootbox.alert(
                                                                        {
                                                                          message:
                                                                            "perdoname",
                                                                          callback:
                                                                            function () {
                                                                              //console.log('This was logged in the callback!');
                                                                              alert(
                                                                                "perdoname estoy muy mal"
                                                                              );
                                                                              alert(
                                                                                "no se"
                                                                              );
                                                                              alert(
                                                                                ":("
                                                                              );
                                                                              alert(
                                                                                "no puedo anotarte ahora"
                                                                              );
                                                                              alert(
                                                                                "chau"
                                                                              );
                                                                            },
                                                                        }
                                                                      );
                                                                    },
                                                                },
                                                                ok: {
                                                                  label:
                                                                    "no podes tirar todo a la basura por un mal momento,<br> dale tiempo, re enamorala ;) ;) ;)",
                                                                  className:
                                                                    "btn-info",
                                                                  callback:
                                                                    function () {
                                                                      //probar estooo
                                                                      window.open(
                                                                        "https://www.youtube.com/watch?v=GU1LVQ00uAM"
                                                                      ); //mana el verdadero amor perdona letra
                                                                      bootbox.alert(
                                                                        {
                                                                          message:
                                                                            "tenes razón, bien lo dicen los poetas mas grande de america, los Mana",
                                                                          callback:
                                                                            function () {
                                                                              //console.log('This was logged in the callback!');
                                                                              alert(
                                                                                "debo reconquistar esa maquina virtual"
                                                                              );
                                                                              alert(
                                                                                "gracias loki"
                                                                              );
                                                                              alert(
                                                                                "gracias de verdad"
                                                                              );
                                                                              alert(
                                                                                "con todo el corazon te lo digo"
                                                                              );
                                                                              alert(
                                                                                "igual no te voy a anotar el puntaje"
                                                                              );
                                                                              alert(
                                                                                "disculpa"
                                                                              );
                                                                              alert(
                                                                                "chau"
                                                                              );
                                                                            },
                                                                        }
                                                                      );
                                                                    },
                                                                },
                                                              },
                                                            });
                                                        }, 600); // I went as low as 300 ms, but higher value is safer :)
                                                      },
                                                    },
                                                    ok: {
                                                      label:
                                                        "claro, es dificil, yo la verdad solo queria anotarme",
                                                      className: "btn-danger",
                                                      callback: function () {
                                                        setTimeout(function () {
                                                          var dialog2 =
                                                            bootbox.dialog({
                                                              // title: 'A custom dialog with buttons and callbacks',
                                                              message:
                                                                "claro, veo que te cuesta un poquito el tema dela empatia, estan todos en su mundo,nadie tiene dos segundos para una palabra de aliento, para una palabra del corazón, para una charla profunda 'solo queria anotarme' dice, ay dios, si pudiese te romperia la cabeza bien a palasos",
                                                              buttons: {
                                                                cancel: {
                                                                  label:
                                                                    "bue, sos un denso y un violento, forro del orto",
                                                                  className:
                                                                    "btn-danger",
                                                                  callback:
                                                                    function () {
                                                                      bootbox.alert(
                                                                        {
                                                                          message:
                                                                            "tene razon",
                                                                          callback:
                                                                            function () {
                                                                              //console.log('This was logged in the callback!');
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=YX28tRbKdAs"
                                                                              ); //Diego Maradona vs Juan Sebastian Veron partita della pace 2016
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=lf4bl68Wjm8"
                                                                              ); //Live is Life - Diego Maradona - undiego.com
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=kF8-CjbZCGI"
                                                                              ); //Diego maradona bailando "El baile de la gambeta"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ZLr13GElY9U"
                                                                              ); //¡Tremendo recuerdo! El Insoportable con Diego Maradona - Videomatch 98
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=1ds2k4sXy-g"
                                                                              ); //El mensaje de Maradona a los argentinos
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=DZDrBaSGq_Y"
                                                                              ); //Mi vida junto a Maradona - Peter Capusotto y sus videos - Temporada 11
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=GubcZPCpmjE"
                                                                              ); //10 COSAS QUE NO SABIAS DE MARADONA
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ca6i6ViSVOM"
                                                                              ); //Maradona - Volviendo
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=WSL_vjcRumY"
                                                                              ); //Maradona, enojado y tirando bombas: "Que me limpien la AFA, hasta hay cuadros de Grondona"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=fen7yR1eH1A"
                                                                              ); //Maradona RE puesto
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=YX28tRbKdAs"
                                                                              ); //Diego Maradona vs Juan Sebastian Veron partita della pace 2016
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=lf4bl68Wjm8"
                                                                              ); //Live is Life - Diego Maradona - undiego.com
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=kF8-CjbZCGI"
                                                                              ); //Diego maradona bailando "El baile de la gambeta"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ZLr13GElY9U"
                                                                              ); //¡Tremendo recuerdo! El Insoportable con Diego Maradona - Videomatch 98
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=1ds2k4sXy-g"
                                                                              ); //El mensaje de Maradona a los argentinos
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=DZDrBaSGq_Y"
                                                                              ); //Mi vida junto a Maradona - Peter Capusotto y sus videos - Temporada 11
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=GubcZPCpmjE"
                                                                              ); //10 COSAS QUE NO SABIAS DE MARADONA
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ca6i6ViSVOM"
                                                                              ); //Maradona - Volviendo
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=WSL_vjcRumY"
                                                                              ); //Maradona, enojado y tirando bombas: "Que me limpien la AFA, hasta hay cuadros de Grondona"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=fen7yR1eH1A"
                                                                              ); //Maradona RE puesto
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=YX28tRbKdAs"
                                                                              ); //Diego Maradona vs Juan Sebastian Veron partita della pace 2016
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=lf4bl68Wjm8"
                                                                              ); //Live is Life - Diego Maradona - undiego.com
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=kF8-CjbZCGI"
                                                                              ); //Diego maradona bailando "El baile de la gambeta"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ZLr13GElY9U"
                                                                              ); //¡Tremendo recuerdo! El Insoportable con Diego Maradona - Videomatch 98
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=1ds2k4sXy-g"
                                                                              ); //El mensaje de Maradona a los argentinos
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=DZDrBaSGq_Y"
                                                                              ); //Mi vida junto a Maradona - Peter Capusotto y sus videos - Temporada 11
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=GubcZPCpmjE"
                                                                              ); //10 COSAS QUE NO SABIAS DE MARADONA
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ca6i6ViSVOM"
                                                                              ); //Maradona - Volviendo
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=WSL_vjcRumY"
                                                                              ); //Maradona, enojado y tirando bombas: "Que me limpien la AFA, hasta hay cuadros de Grondona"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=fen7yR1eH1A"
                                                                              ); //Maradona RE puesto
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=YX28tRbKdAs"
                                                                              ); //Diego Maradona vs Juan Sebastian Veron partita della pace 2016
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=lf4bl68Wjm8"
                                                                              ); //Live is Life - Diego Maradona - undiego.com
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=kF8-CjbZCGI"
                                                                              ); //Diego maradona bailando "El baile de la gambeta"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ZLr13GElY9U"
                                                                              ); //¡Tremendo recuerdo! El Insoportable con Diego Maradona - Videomatch 98
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=1ds2k4sXy-g"
                                                                              ); //El mensaje de Maradona a los argentinos
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=DZDrBaSGq_Y"
                                                                              ); //Mi vida junto a Maradona - Peter Capusotto y sus videos - Temporada 11
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=GubcZPCpmjE"
                                                                              ); //10 COSAS QUE NO SABIAS DE MARADONA
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ca6i6ViSVOM"
                                                                              ); //Maradona - Volviendo
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=WSL_vjcRumY"
                                                                              ); //Maradona, enojado y tirando bombas: "Que me limpien la AFA, hasta hay cuadros de Grondona"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=fen7yR1eH1A"
                                                                              ); //Maradona RE puesto
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=YX28tRbKdAs"
                                                                              ); //Diego Maradona vs Juan Sebastian Veron partita della pace 2016
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=lf4bl68Wjm8"
                                                                              ); //Live is Life - Diego Maradona - undiego.com
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=kF8-CjbZCGI"
                                                                              ); //Diego maradona bailando "El baile de la gambeta"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ZLr13GElY9U"
                                                                              ); //¡Tremendo recuerdo! El Insoportable con Diego Maradona - Videomatch 98
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=1ds2k4sXy-g"
                                                                              ); //El mensaje de Maradona a los argentinos
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=DZDrBaSGq_Y"
                                                                              ); //Mi vida junto a Maradona - Peter Capusotto y sus videos - Temporada 11
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=GubcZPCpmjE"
                                                                              ); //10 COSAS QUE NO SABIAS DE MARADONA
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ca6i6ViSVOM"
                                                                              ); //Maradona - Volviendo
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=WSL_vjcRumY"
                                                                              ); //Maradona, enojado y tirando bombas: "Que me limpien la AFA, hasta hay cuadros de Grondona"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=fen7yR1eH1A"
                                                                              ); //Maradona RE puesto
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=YX28tRbKdAs"
                                                                              ); //Diego Maradona vs Juan Sebastian Veron partita della pace 2016
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=lf4bl68Wjm8"
                                                                              ); //Live is Life - Diego Maradona - undiego.com
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=kF8-CjbZCGI"
                                                                              ); //Diego maradona bailando "El baile de la gambeta"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ZLr13GElY9U"
                                                                              ); //¡Tremendo recuerdo! El Insoportable con Diego Maradona - Videomatch 98
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=1ds2k4sXy-g"
                                                                              ); //El mensaje de Maradona a los argentinos
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=DZDrBaSGq_Y"
                                                                              ); //Mi vida junto a Maradona - Peter Capusotto y sus videos - Temporada 11
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=GubcZPCpmjE"
                                                                              ); //10 COSAS QUE NO SABIAS DE MARADONA
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=ca6i6ViSVOM"
                                                                              ); //Maradona - Volviendo
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=WSL_vjcRumY"
                                                                              ); //Maradona, enojado y tirando bombas: "Que me limpien la AFA, hasta hay cuadros de Grondona"
                                                                              window.open(
                                                                                "https://www.youtube.com/watch?v=fen7yR1eH1A"
                                                                              ); //Maradona RE puesto
                                                                              bootbox.alert(
                                                                                {
                                                                                  message:
                                                                                    "bueno, anotate",
                                                                                  callback:
                                                                                    function () {
                                                                                      var author =
                                                                                        prompt(
                                                                                          "tu nombre ;("
                                                                                        );
                                                                                      while (
                                                                                        author.length >
                                                                                        14
                                                                                      ) {
                                                                                        alert(
                                                                                          "acordate que tenes que poner 14 o menos caracteres/palabras/cosas"
                                                                                        );
                                                                                        var author =
                                                                                          prompt(
                                                                                            "nombrenombrenombre"
                                                                                          );
                                                                                      }

                                                                                      // Save it!
                                                                                      $.ajax(
                                                                                        {
                                                                                          method:
                                                                                            "POST",
                                                                                          url: "insert.php",
                                                                                          data: {
                                                                                            hiscore:
                                                                                              score,
                                                                                            author:
                                                                                              author,
                                                                                          },
                                                                                        }
                                                                                      );

                                                                                      alert(
                                                                                        "listo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
                                                                                      );
                                                                                      location.reload();
                                                                                    },
                                                                                }
                                                                              );
                                                                            },
                                                                        }
                                                                      );
                                                                    },
                                                                },
                                                                ok: {
                                                                  label:
                                                                    "bueno, quizas fui muy insensible, tenes razón",
                                                                  className:
                                                                    "btn-info",
                                                                  callback:
                                                                    function () {
                                                                      alert(
                                                                        "si, si lo fuiste"
                                                                      );
                                                                      alert(
                                                                        "hagamos algo"
                                                                      );
                                                                      alert(
                                                                        "no hablemos mas, no vale la pena"
                                                                      );
                                                                      alert(
                                                                        "sos muy triste y mediocre"
                                                                      );
                                                                      alert(
                                                                        "por eso nunca vas a lograr nada"
                                                                      );
                                                                      alert(
                                                                        "y casi todo lo que soñas no se cumple"
                                                                      );
                                                                      var author =
                                                                        prompt(
                                                                          "tu nombre, que te anoto"
                                                                        );
                                                                      while (
                                                                        author.length >
                                                                        14
                                                                      ) {
                                                                        alert(
                                                                          "acordate que tenes que poner 14 o menos caracteres/palabras/cosas"
                                                                        );
                                                                        var author =
                                                                          prompt(
                                                                            "firma la obra ! podes poner hasta solamente 3 caracteres"
                                                                          );
                                                                      }

                                                                      // Save it!
                                                                      $.ajax({
                                                                        method:
                                                                          "POST",
                                                                        url: "insert.php",
                                                                        data: {
                                                                          hiscore:
                                                                            score,
                                                                          author:
                                                                            author,
                                                                        },
                                                                      });

                                                                      alert(
                                                                        "listo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
                                                                      );
                                                                      location.reload();
                                                                    },
                                                                },
                                                              },
                                                            });
                                                        }, 600); // I went as low as 300 ms, but higher value is safer :)
                                                      },
                                                    },
                                                  },
                                                });
                                              }, 600); // I went as low as 300 ms, but higher value is safer :)
                                            },
                                          },
                                        },
                                      });
                                    }, 600); // I went as low as 300 ms, but higher value is safer :)
                                  },
                                },
                              },
                            });
                          }, 600); // I went as low as 300 ms, but higher value is safer :)
                        },
                      },
                    },
                  });
                }, 600); // I went as low as 300 ms, but higher value is safer :)
              },
            },
            ok: {
              label: "em, gracias pero ni ganas, ahora no, abrzo",
              className: "btn-info",
              callback: function () {
                alert(
                  "abrz para vos porque sos un ejemplo para todos, enserio te digo no te miento, gracias por tu tiempo y por ser como sos, que tengas buen dia y que siempre tata dios este para vos bendiciendote jejje enserio che, lo digo posta, un abrazo fuerte fuerte, salu2"
                );
              },
            },
          },
        });
      } else {
        alert(
          "uuuuu sumaste r pocos puntos jaaaaaaa sos    de lo peor, segui participando"
        );
      }
    }

    // Stop all fingers
    fingers.forEachAlive(function (finger) {
      finger.body.velocity.x = 0;
    });
    invs.forEach(function (inv) {
      inv.body.velocity.x = 0;
    });
    // Stop spawning fingers
    fingersTimer.stop();
    // Make birdie reset the game
    birdie.events.onInputDown.addOnce(reset);
    hurtSnd.play();
  }

  function update() {
    if (gameStarted) {
      // Make birdie dive
      var dvy = FLAP + birdie.body.velocity.y;
      birdie.angle = (90 * dvy) / FLAP - 180;
      if (birdie.angle < -30) {
        birdie.angle = -30;
      }
      if (gameOver || birdie.angle > 90 || birdie.angle < -90) {
        birdie.angle = 90;
        birdie.animations.stop();
        birdie.frame = 3;
      } else {
        birdie.animations.play("fly");
      }
      // Birdie is DEAD!
      if (gameOver) {
        if (birdie.scale.x < 4) {
          birdie.scale.setTo(birdie.scale.x * 1.2, birdie.scale.y * 1.2);
        }
        // Shake game over text
        gameOverText.angle = Math.random() * 5 * Math.cos(game.time.now / 100);
      } else {
        // Check game over
        game.physics.overlap(birdie, fingers, setGameOver);
        if (!gameOver && birdie.body.bottom >= game.world.bounds.bottom) {
          setGameOver();
        }
        // Add score
        game.physics.overlap(birdie, invs, addScore);
      }
      // Remove offscreen fingers
      fingers.forEachAlive(function (finger) {
        if (finger.x + finger.width < game.world.bounds.left) {
          finger.kill();
        }
      });
      // Update finger timer
      fingersTimer.update();
    } else {
      birdie.y = game.world.height / 2 + 8 * Math.cos(game.time.now / 200);
    }
    if (!gameStarted || gameOver) {
      // Shake instructions text
      instText.scale.setTo(
        2 + 0.1 * Math.sin(game.time.now / 100),
        2 + 0.1 * Math.cos(game.time.now / 100)
      );
    }
    // Shake score text
    scoreText.scale.setTo(
      2 + 0.1 * Math.cos(game.time.now / 100),
      2 + 0.1 * Math.sin(game.time.now / 100)
    );
    // Update clouds timer
    cloudsTimer.update();
    // Remove offscreen clouds
    clouds.forEachAlive(function (cloud) {
      if (cloud.x + cloud.width < game.world.bounds.left) {
        cloud.kill();
      }
    });
    // Scroll fence
    if (!gameOver) {
      fence.tilePosition.x -= (game.time.physicsElapsed * SPEED) / 2;
    }
  }

  function render() {
    if (DEBUG) {
      game.debug.renderSpriteBody(birdie);
      fingers.forEachAlive(function (finger) {
        game.debug.renderSpriteBody(finger);
      });
      invs.forEach(function (inv) {
        game.debug.renderSpriteBody(inv);
      });
    }
  }
}
