
var gl;

var targetVertices=[];
var targetUVs = [];

//Ball Arrays
var ballVertices=[];
var ballUVs = [];
var velocities = [];

//Ball constants
var maxBalls = 500;
var radius = 0.2;
var ballIndex = 0;
var maxZ = 20;
var minY = -50;
var initVel = 1.1;
var gravity = vec3(0, -0.01, 0);
var powerScale = 0.01;
var pointsAroundCircle = 100;


var maxNumTargets = 5;
var currentTargets = maxNumTargets;
var index = 4 * maxNumTargets;
var targetRadius = 0.3;

//Buffers
var vBuffer;
var texBuffer;

var centerList = [];
var check = 0;

var scoreCounter;
var actualScore = 0;
var missCounter;
var actualMissCount = 5;
var highScore;
var actualhighScore = 0;;
window.onload = function init()
{
    
   var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //

    gl.enable(gl.DEPTH_TEST);
    gl.depthMask(true);

    gl.depthFunc(gl.LEQUAL);
    gl.depthRange(0.0, 1.0);

    //Init score stuff
    scoreCounter = document.getElementById("scoreCounter");
    scoreCounter.innerHTML = "Score: " + actualScore;

    missCounter = document.getElementById("missCounter");
    missCounter.innerHTML = "Misses left: " + actualMissCount;

    highScore = document.getElementById("highScore");
    highScore.innerHTML = "High Score this session: " + actualhighScore;

    
    //Spawns a ball with the initial conditions given by the sliders
    document.getElementById("fireButton").onclick = function(){

    	var power = document.getElementById("power").value;
    	var angleY = document.getElementById("angleY").value;
    	var angleX = document.getElementById("angleX").value;
    	var velMagnitude = initVel * power;
    	var xVel = velMagnitude * Math.sin(radians(angleY)) * Math.sin(radians(angleX));
    	var yVel = velMagnitude * Math.cos(radians(angleX));
    	var zVel = velMagnitude * Math.cos(radians(angleY)) * Math.sin(radians(angleX));

    	
  		velocities.push(vec3(xVel, yVel, zVel));
  		ballVertices.push(vec3(0, 0, 0));
  		ballUVs.push(vec2(-1, -1));
  		for(var i = 0.0; i <= pointsAroundCircle; i += 1.0){
  	        ballVertices.push(vec3(radius * Math.cos(i * (2.0 * Math.PI)/100.0), radius * Math.sin(i * (2.0 * Math.PI)/100.0), 0));
  	    	ballUVs.push(vec2(-1, -1));
  	    }
  	    ballIndex++;
    };
  

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, maxNumTargets * maxBalls * (pointsAroundCircle + 2) * 12, gl.STREAM_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    texBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, maxNumTargets * maxBalls * (pointsAroundCircle + 2) * 8, gl.STATIC_DRAW);

    var vTextureCoord = gl.getAttribLocation(program, "vTextureCoord");
    gl.vertexAttribPointer(vTextureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTextureCoord);


    //Load texture and stuff
    gl.activeTexture(gl.TEXTURE0);
    var tex = loadTexture(gl, "target_texture.png");
    gl.bindTexture(gl.TEXTURE_2D, tex);

    const samplerLoc = gl.getUniformLocation(program, "smplr");
    gl.uniform1i(samplerLoc, 0);

    var maxZLoc = gl.getUniformLocation( program, "maxZ" );

    gl.uniform1f(maxZLoc, maxZ);

    alert("Use the sliders to aim a ball and hit the targets. Miss too many and you have to restart, but each target you hit gives you more chances. Try to score as many points as you can!");

    initTargets();
    runPhysics();


};


//Initialize the targets and reset the balls
function initTargets(){

  centerList = [];
  targetVertices = [];

  ballVertices=[];
  ballUVs = [];
  velocities = [];
  ballIndex = 0;

	for(var x = 0; x < maxNumTargets; x++){
    //Set to random position
		let randomX = Math.random() - Math.random();
		let randomY = Math.random() - Math.random();
			
		let randomZ = Math.random() * maxZ/2 + 1;
		var center = vec3(randomX*randomZ, randomY*randomZ, randomZ);
    //keep track of the centers for collision purposes
    centerList.push(center);

    //Generate the four corners of the target (a square texture with transparent non-circle parts)
		targetVertices.push(vec3(center[0] - targetRadius, center[1] + targetRadius, center[2]));
		targetVertices.push(vec3(center[0] + targetRadius, center[1] + targetRadius, center[2]));
		targetVertices.push(vec3(center[0] - targetRadius, center[1] - targetRadius, center[2]));
		targetVertices.push(vec3(center[0] + targetRadius, center[1] - targetRadius, center[2]));

    //Generate the texture coordinates for each vertice in order
		targetUVs.push(vec2(0,1));
		targetUVs.push(vec2(1,1));
		targetUVs.push(vec2(0,0));
		targetUVs.push(vec2(1,0));
	}
};


//The the code to run in each update
function runPhysics(){
	for(var i = 0; i < velocities.length; i++){

      //Move the ball by its velocity
    	for(var j = 0; j < (pointsAroundCircle + 2); j++){
    		ballVertices[(pointsAroundCircle + 2) * i + j] = add(ballVertices[(pointsAroundCircle + 2) * i + j], velocities[i]);
    	}

      //Add acceleration to the velocity
    	velocities[i] = add(velocities[i], gravity);

      //Check if the ball is out of bounds
    	if(ballVertices[(pointsAroundCircle + 2) * i][2] > maxZ || ballVertices[(pointsAroundCircle + 2) * i][1] < minY){
  			velocities.splice(i, 1);
  			ballVertices.splice((pointsAroundCircle + 2) * i, pointsAroundCircle + 2);
  			ballUVs.splice((pointsAroundCircle + 2) * i, pointsAroundCircle + 2);
  			i--;
  			ballIndex--;
        actualMissCount--;
        missCounter.innerHTML = "Misses left: " + actualMissCount;
        //If out of misses, reset game state while saving the new high score if necessary
        if(actualMissCount == 0)
        {
          if(actualScore > actualhighScore)
          {
            actualhighScore = actualScore;
          }
          alert("Out of misses! You got " + actualScore + " points this round.");
          actualScore = 0;
          scoreCounter.innerHTML = "Score: " + actualScore;
          actualMissCount = 5;
          missCounter.innerHTML = "Misses left: " + actualMissCount;
          highScore.innerHTML = "High Score this session: " + actualhighScore;
          initTargets();
        }
			
		  }

      //Check for collisions
      else{
        let ballCenter = ballVertices[(pointsAroundCircle + 2) * i];
        for(let x = 0; x < centerList.length; x++)
        {
         let a = centerList[x][0] - ballCenter[0];
         let b = centerList[x][1] - ballCenter[1];
         let c = centerList[x][2] - ballCenter[2];
         //Check if the center of the ball is within range of the center of the target
         if(Math.sqrt(a * a + b * b + c * c) < (radius + targetRadius)/* && Math.abs(ballCenter[2] - centerList[x][2]) <= .5*/)
         {
            centerList[x] = vec3 (25, 25, 1000);
            targetVertices[x*4] = vec3(25,25,1000);
            targetVertices[x*4 + 1] = vec3(25,25,1000);
            targetVertices[x*4 + 2] = vec3(25,25,1000);
            targetVertices[x*4 + 3] = vec3(25,25,1000);//basically just sets this target to a place off screen
            currentTargets--;
            console.log("Hit! " + currentTargets + " remaining");
            actualScore++;
            scoreCounter.innerHTML = "Score: " + actualScore;
            actualMissCount = actualMissCount + 2;
            missCounter.innerHTML = "Misses left: " + actualMissCount;

            //If there are no remaining targets, spawn more
            if(currentTargets === 0)
            {
              currentTargets = maxNumTargets;
              initTargets();
            }
         }
        }
      }
    }

    //Add the vertices to the buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer );
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(ballVertices));
    gl.bufferSubData(gl.ARRAY_BUFFER, ballVertices.length * 12, flatten(targetVertices));

    gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(ballUVs));
    gl.bufferSubData(gl.ARRAY_BUFFER, ballUVs.length * 8, flatten(targetUVs));
    render();
};




function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    //Draw each ball
    for(var i = 0; i < ballIndex; i++){
    	gl.drawArrays( gl.TRIANGLE_FAN, i * (pointsAroundCircle + 2), pointsAroundCircle + 2);
    }
    //Draw each target
    for(var i = 0; i < maxNumTargets; i++){
    	gl.drawArrays(gl.TRIANGLE_STRIP, ballIndex * (pointsAroundCircle + 2) + i * 4, 4);
    }
    
    window.requestAnimFrame(runPhysics);
};



//Function from developer.mozilla.org webgl tutorial
function loadTexture(gl, url) {
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	//Initialize texture with one blue pixel
	const level = 0;
  	const internalFormat = gl.RGBA;
  	const width = 1;
  	const height = 1;
  	const border = 0;
  	const srcFormat = gl.RGBA;
  	const srcType = gl.UNSIGNED_BYTE;
  	const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
  	gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);

  	const image = new Image();
    image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  srcFormat, srcType, image);

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
       // Yes, it's a power of 2. Generate mips.
       gl.generateMipmap(gl.TEXTURE_2D);
    } else {
       // No, it's not a power of 2. Turn of mips and set
       // wrapping to clamp to edge
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = url;

  return texture;
};

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
};