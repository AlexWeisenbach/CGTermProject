
var gl;
var points;

var targetVertices=[];
var targetUVs = [];

var ballVertices=[];
var ballUVs = [];


var maxBalls = 500;


var radius = 0.2;
var ballIndex = 0;
var maxZ = 20;
var velocities = [];
var initVel = 1.1;
var gravity = vec3(0, -0.01, 0);
var vBuffer;
var powerScale = 0.01;
var pointsAroundCircle = 100;


var maxNumTargets = 1;
var currentTargets = maxNumTargets;
var index = 4 * maxNumTargets;
var targetRadius = 0.3;

var vBuffer;
var texBuffer;

var centerList = [];
var check = 0;
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

    
    // Associate out shader variables with our data buffer
    
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

    initTargets();
    runPhysics();


};


function initTargets(){

  centerList = [];

	for(var x = 0; x < maxNumTargets; x++){
		let randomX = Math.random() - Math.random();
		let randomY = Math.random() - Math.random();
			
		let randomZ = Math.random() * maxZ/2 + 1;
		var center = vec3(randomX*randomZ, randomY*randomZ, randomZ);
    centerList.push(center);

		targetVertices.push(vec3(center[0] - targetRadius, center[1] + targetRadius, center[2]));
		targetVertices.push(vec3(center[0] + targetRadius, center[1] + targetRadius, center[2]));
		targetVertices.push(vec3(center[0] - targetRadius, center[1] - targetRadius, center[2]));
		targetVertices.push(vec3(center[0] + targetRadius, center[1] - targetRadius, center[2]));

		targetUVs.push(vec2(0,1));
		targetUVs.push(vec2(1,1));
		targetUVs.push(vec2(0,0));
		targetUVs.push(vec2(1,0));
	}
};


function runPhysics(){
	for(var i = 0; i < velocities.length; i++){

    	for(var j = 0; j < (pointsAroundCircle + 2); j++){
    		ballVertices[(pointsAroundCircle + 2) * i + j] = add(ballVertices[(pointsAroundCircle + 2) * i + j], velocities[i]);
    	}
    	velocities[i] = add(velocities[i], gravity);

    	if(ballVertices[(pointsAroundCircle + 2) * i][2] > maxZ){
			velocities.splice(i, 1);
			ballVertices.splice((pointsAroundCircle + 2) * i, pointsAroundCircle + 2);
			ballUVs.splice((pointsAroundCircle + 2) * i, pointsAroundCircle + 2);
			i--;
			ballIndex--;
			
		}
    }

    if(ballVertices.length > 0)
    {
      let ballCenter = ballVertices[pointsAroundCircle + 1];
      for(let x = 0; x < centerList.length; x++)
      {
       let a = centerList[x][0] - ballCenter[0];
       let b = centerList[x][1] - ballCenter[1];
       //console.log("distance to target " + x + ": " + Math.sqrt(a * a + b * b));
       //console.log(ballCenter[2]);
       //console.log(centerList[x][2]);
       //console.log("z dif is " + (ballCenter[2] - centerList[x][2]));
       if(Math.sqrt(a * a + b * b) < (radius + targetRadius) && Math.abs(ballCenter[2] - centerList[x][2]) <= .5)//.5 is arbitrary, but feels good from testing
       {
          targetVertices[x*4] = vec3(5,5,5);
          targetVertices[x*4 + 1] = vec3(5,5,5);
          targetVertices[x*4 + 2] = vec3(5,5,5);
          targetVertices[x*4 + 3] = vec3(5,5,5);//basically just sets this target to a place off screen
          currentTargets--;
          console.log("Hit! " + currentTargets + " remaining");
          if(currentTargets == 0)
          {
            currentTargets = maxNumTargets;
            initTargets();
          }
       }
      }
    }
    
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

    for(var i = 0; i < ballIndex; i++){
    	gl.drawArrays( gl.TRIANGLE_FAN, i * (pointsAroundCircle + 2), pointsAroundCircle + 2);
    }
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