"use strict";

var canvas;
var gl;

var maxNumTargets = 5;
var currentTargets = maxNumTargets;

var index = 4*maxNumTargets;
var targetRadius = .3;
var currentIndex = 0;

window.onload = function init() {
	canvas = document.getElementById("gl-canvas");

	gl = WebGLUtils.setupWebGL( canvas );
	if ( !gl ) { alert( "WebGL isn't available" ); }

	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    gl.depthMask(true);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);


	var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var texBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);

    var vTextureCoord = gl.getAttribLocation(program, "vTextureCoord");
    gl.vertexAttribPointer(vTextureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTextureCoord);

    //Load texture and stuff
    gl.activeTexture(gl.TEXTURE0);
    var tex = loadTexture(gl, "target_texture.png");
    gl.bindTexture(gl.TEXTURE_2D, tex);

    const samplerLoc = gl.getUniformLocation(program, "smplr");
    gl.uniform1i(samplerLoc, 0);

    var targetPoints = [];

    var texturePoints = [];
    
	for(var x = 0; x < maxNumTargets; x++)
	{
		let randomX = (Math.random() * 2) - 1;
		let randomY = (Math.random() * 2) - 1;
		//let randomZ = Math.random() * (maxZ - 1) + 1;
		let randomZ = (Math.random() * 30)/10 + 1;
		var center = vec3(randomX*randomZ, randomY*randomZ, randomZ);
		
		//var points = [center];
		//targetPoints.push(center);
		console.log(center);
		//gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
		//for(var i = 0.0; i <= 100.0; i+=1.0)
		//{

			//targetPoints.push(vec3(center[0] + targetRadius * Math.cos(i*2.0*Math.PI/100.0), center[1] + targetRadius * Math.sin(i*2.0*Math.PI/100.0), center[2]));
		//	targetPoints.push(vec3(center[0] + (targetRadius* Math.cos(i*2.0*Math.PI/100.0) /** center[2]*/),  center[1] + (targetRadius * Math.sin(i*2.0*Math.PI/100.0) /** center[2]*/), center[2]));
			//points.push(center + vec3(3*Math.cos(i*2*Math.PI/200), 3*Math.sin(i*2*Math.PI/200), 0));

		//}


		targetPoints.push(vec3(center[0] - targetRadius, center[1] + targetRadius, center[2]));
		targetPoints.push(vec3(center[0] + targetRadius, center[1] + targetRadius, center[2]));
		targetPoints.push(vec3(center[0] - targetRadius, center[1] - targetRadius, center[2]));
		targetPoints.push(vec3(center[0] + targetRadius, center[1] - targetRadius, center[2]));

		texturePoints.push(vec2(0,1));
		texturePoints.push(vec2(1,1));
		texturePoints.push(vec2(0,0));
		texturePoints.push(vec2(1,0));
		
		//console.log(points.length);
		//console.log(points.length * 5);
		//gl.bufferSubData(gl.ARRAY_BUFFER, 12 * 101 * x, flatten(points));
        
	}
	//console.log("Let's try this " + Object.values(targetPoints[0])[2]);

	/*console.log("Now printing the unsorted points:")
	for(let x = 0; x < targetPoints.length; x++)
	{
		console.log(targetPoints[x]);
	}

	console.log("Now printing the sorted points:")

	targetPoints.sort(compareZVals);
	for(let x = 0; x < targetPoints.length; x++)
	{
		console.log(targetPoints[x]);
	}*/
	targetPoints.sort(compareZVals);

	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(targetPoints), gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(texturePoints), gl.STATIC_DRAW);


	render();
}



function render() {

    gl.clear( gl.COLOR_BUFFER_BIT );
    /*for(var i = 0; i < maxNumTargets; i++){
    	gl.drawArrays(gl.TRIANGLE_FAN, i * index/maxNumTargets, index/maxNumTargets)
    }*/

    for(var i = 0; i < maxNumTargets; i++){
    	gl.drawArrays(gl.TRIANGLE_STRIP, i * 4, 4)
    }

    //gl.drawArrays( gl.TRIANGLE_FAN, 0, index);
   // console.log(index);
    window.requestAnimFrame(render);
}

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
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}

function compareZVals(a,b){
	let aVal = Object.values(a)[2];
	let bVal = Object.values(b)[2];
	if(aVal > bVal)
		return -1;
	else if(aVal < bVal)
		return 1;
	else return 0;
}