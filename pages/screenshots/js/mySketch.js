let img, img1;

function preload() {
    // preload() runs once
    img = loadImage('img/screenshots-1.jpg'); 
    img1 = loadImage('img/screenshots-2.jpg'); 
}

function setup() {
    createCanvas(windowWidth, windowHeight, WEBGL);


	
	// Ignore this, fix for easyCam in p5 version 0.7
	Dw.EasyCam.prototype.apply = function(n) {
    var o = this.cam;
    n = n || o.renderer,
    n && (this.camEYE = this.getPosition(this.camEYE), this.camLAT = this.getCenter(this.camLAT), this.camRUP = this.getUpVector(this.camRUP), n._curCamera.camera(this.camEYE[0], this.camEYE[1], this.camEYE[2], this.camLAT[0], this.camLAT[1], this.camLAT[2], this.camRUP[0], this.camRUP[1], this.camRUP[2]))
    };
	
	cam = createEasyCam();
	cam.zoom(100);
	
	word = new Word3D(
  	"SCREENSHOTS",       // The actual character that you want to draw (anything that can be passed into "text()")
  	4,             // How thick the 3D rendered letter is (i.e. how many cube pixels of size "size" it is on z-axis)  
  	width/300,     // The size of a unit "box()" making up part of the letter  
  	40,            // The size of the canvas it renders the letter on (higher is more detailed, 30-40 is a good range)  
  	true,          // [OPTIONAL, default = true] Gives the bevelled, embossed 3D look (as seen in screenshot)  
  	"Arial",     // [OPTIONAL, default = "Georgia"] Gives the font uses, can be any default ones or anything added  
  	BOLD           // [OPTIONAL, default = BOLD] Gives the chosen style out of BOLD, NORMAL, ITALIC  
	);
}

function draw() {
    //background(175);
    background(52, 235, 219); 

    image(img, -2600, 100);
    image(img1, 0, 100);

    //IZQ POSIT: DERECHA. IZQ NEG: IZQUI, DERECH POS: ABAJO. DERECHA NEG: ARRIBA


	
	normalMaterial();
	word.show(); // Displays all the boxes making up the word
}