
var gl;
var points;
var vertices=[];

var radius = 0.2;
var verticesLength;

var maxZ = 400;

var vel = vec3(0, 0.1, 0.2);

var gravity = vec3(0, -0.01, 0);

var vBuffer;

window.onload = function init()
{
    
   var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //


    vertices.push(vec3(0, 0, 0));

    for(var i = 0.0; i <= 100; i += 1.0){
        vertices.push(vec3(radius * Math.cos(i * (2.0 * Math.PI)/100.0), radius * Math.sin(i * (2.0 * Math.PI)/100.0), 0));
    }


    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, vertices.length * 12, gl.STREAM_DRAW );

    
    // Associate out shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    verticesLength = vertices.length;


    var maxZLoc = gl.getUniformLocation( program, "maxZ" );

    gl.uniform1f(maxZLoc, maxZ);

    runPhysics();


};



function runPhysics(){
	for(var i = 0; i < verticesLength; i++){
    	vertices[i] = add(vertices[i], vel);
    }
    vel = add(vel, gravity);
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferSubData( gl.ARRAY_BUFFER, 0, flatten(vertices));
    
    
    render();
}




function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );

    
    gl.drawArrays( gl.TRIANGLE_FAN, 0, verticesLength );
    window.requestAnimFrame(runPhysics);
}

