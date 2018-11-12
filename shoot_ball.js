
var gl;
var points;
var vertices=[];

var radius = 0.5;
var verticesLength;

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
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    verticesLength = vertices.length;

    render();


};




function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );

    //gl.uniform1f(xRotationLoc, x_rotation);
   // gl.uniform1f(yRotationLoc, y_rotation);
   // gl.uniform1f(zRotationLoc, z_rotation);
    
    gl.drawArrays( gl.TRIANGLE_FAN, 0, verticesLength );
}

