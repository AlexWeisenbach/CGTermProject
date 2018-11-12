"use strict";

var canvas;
var gl;

var maxNumTargets = 5;
var currentTargets = maxNumTargets;

var index = 102*maxNumTargets;
var targetRadius = 0.2;
var currentIndex = 0;

window.onload = function init() {
	canvas = document.getElementById("gl-canvas");

	gl = WebGLUtils.setupWebGL( canvas );
	if ( !gl ) { alert( "WebGL isn't available" ); }

	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


	var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var targetPoints = [];
    
	for(var x = 0; x < maxNumTargets; x++)
	{
		let randomX = Math.random() - Math.random();
		let randomY = Math.random() - Math.random();
		var center = vec3(randomX, randomY, 0);
		//let randomZ = Math.random() * 20;
		//var points = [center];
		targetPoints.push(center);
		console.log(center);
		gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
		for(var i = 0; i <= 100; i++)
		{

			targetPoints.push(center + targetRadius * vec3(3*Math.cos(i*2*Math.PI/200), 3*Math.sin(i*2*Math.PI/200), 0));
			//points.push(center + vec3(3*Math.cos(i*2*Math.PI/200), 3*Math.sin(i*2*Math.PI/200), 0));

		}
		//console.log(points.length);
		//console.log(points.length * 5);
		//gl.bufferSubData(gl.ARRAY_BUFFER, 12 * 101 * x, flatten(points));
        
	}


	gl.bufferData(gl.ARRAY_BUFFER, flatten(targetPoints), gl.STATIC_DRAW);


	render();
}



function render() {

    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLE_FAN, 0, index);
   // console.log(index);
    window.requestAnimFrame(render);
}