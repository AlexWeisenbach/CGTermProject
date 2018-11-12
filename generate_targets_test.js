"use strict";

var canvas;
var gl;

var maxNumTargets = 5;
var currentTargets = maxNumTargets;

var index = 102*maxNumTargets*8;



window.onload = function init() {
	canvas = document.getElementById("gl-canvas");

	gl = WebGLUtils.setupWebGL( canvas );
	if ( !gl ) { alert( "WebGL isn't available" ); }

	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


	var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, index, gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    
	for(var x = 0; x < maxNumTargets; x++)
	{
		let randomX = Math.random() * canvas.width;
		let randomY = Math.random() * canvas.height;
		var center = vec2(randomX, randomY);
		//let randomZ = Math.random() * 20;
		var points = [center];
		for(var i = 0; i <= 100; i++)
		{
			points.push(vec2(center + vec2(3*Math.cos(i*2*Math.PI/200), 3*Math.sin(i*2*Math.PI/200))));
		}

		gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, (x/5) * index, flatten(points));
	}





	render();
}



function render() {

    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLE_FAN, 0, index);

    window.requestAnimFrame(render);
}