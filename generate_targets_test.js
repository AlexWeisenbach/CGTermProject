"use strict";

var canvas;
var gl;

var maxNumTargets = 1;
var currentTargets = maxNumTargets;

var index = 102*maxNumTargets;
var targetRadius = 0.1;
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
		let randomX = (Math.random() * 2) - 1;
		let randomY = (Math.random() * 2) - 1;
		//let randomZ = Math.random() * (maxZ - 1) + 1;
		let randomZ = Math.random() * 19 + 1;
		var center = vec4(randomX*randomZ, randomY*randomZ, randomZ, randomZ);
		
		//var points = [center];
		targetPoints.push(center);
		console.log(center);
		gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
		for(var i = 0.0; i <= 100.0; i+=1.0)
		{

			//targetPoints.push(vec3(center[0] + targetRadius * Math.cos(i*2.0*Math.PI/100.0), center[1] + targetRadius * Math.sin(i*2.0*Math.PI/100.0), center[2]));
			targetPoints.push(vec4(center[0] + (targetRadius* Math.cos(i*2.0*Math.PI/100.0) /** center[2]*/),  center[1] + (targetRadius * Math.sin(i*2.0*Math.PI/100.0) /** center[2]*/), center[2], center[2]));
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
    for(var i = 0; i < maxNumTargets; i++){
    	gl.drawArrays(gl.TRIANGLE_FAN, i * index/maxNumTargets, index/maxNumTargets)
    }
    //gl.drawArrays( gl.TRIANGLE_FAN, 0, index);
   // console.log(index);
    window.requestAnimFrame(render);
}