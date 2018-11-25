
var gl;
var points;
var vertices=[];


var maxBalls = 500;


var radius = 0.2;



var ballIndex = 0;

var maxZ = 50;

var velocities = [];

var initVel = 1.1;

var gravity = vec3(0, -0.01, 0);

var vBuffer;

var powerScale = 0.01;


var pointsAroundCircle = 100;

window.onload = function init()
{
    
   var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    document.getElementById("fireButton").onclick = function(){

    	var power = document.getElementById("power").value;
    	var angleY = document.getElementById("angleY").value;
    	var angleX = document.getElementById("angleX").value;
    	var velMagnitude = initVel * power;
    	var xVel = velMagnitude * Math.sin(radians(angleY)) * Math.sin(radians(angleX));
    	var yVel = velMagnitude * Math.cos(radians(angleX));
    	var zVel = velMagnitude * Math.cos(radians(angleY)) * Math.sin(radians(angleX));

    	
		velocities.push(vec3(xVel, yVel, zVel));
		vertices.push(vec3(0, 0, 0));
		for(var i = 0.0; i <= pointsAroundCircle; i += 1.0){
	        vertices.push(vec3(radius * Math.cos(i * (2.0 * Math.PI)/100.0), radius * Math.sin(i * (2.0 * Math.PI)/100.0), 0));
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
    gl.bufferData( gl.ARRAY_BUFFER, maxBalls * (pointsAroundCircle + 2) * 12, gl.STREAM_DRAW );

    
    // Associate out shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );


    var maxZLoc = gl.getUniformLocation( program, "maxZ" );

    gl.uniform1f(maxZLoc, maxZ);

    runPhysics();


};





function runPhysics(){
	for(var i = 0; i < velocities.length; i++){




    	for(var j = 0; j < (pointsAroundCircle + 2); j++){
    		vertices[(pointsAroundCircle + 2) * i + j] = add(vertices[(pointsAroundCircle + 2) * i + j], velocities[i]);
    	}
    	velocities[i] = add(velocities[i], gravity);

    	if(vertices[(pointsAroundCircle + 2) * i][2] > maxZ){
			velocities.splice(i, 1);
			vertices.splice((pointsAroundCircle + 2) * i, pointsAroundCircle + 2);
			i--;
			ballIndex--;
			
		}

    }
    
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferSubData( gl.ARRAY_BUFFER, 0, flatten(vertices));
    
    
    render();
};




function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );

    for(var i = 0; i < ballIndex; i++){
    	gl.drawArrays( gl.TRIANGLE_FAN, i * (pointsAroundCircle + 2), pointsAroundCircle + 2);
    }
    
    window.requestAnimFrame(runPhysics);
};

