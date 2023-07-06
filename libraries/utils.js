// vearbeitet Tastatureingaben von left-und rightArrow
export class InputHandler {
	constructor(lerped, target, speed, max) {
		this.lerpedValue = lerped;
		this.targetValue = target;
		this.lerpSpeed = speed;
		this.maxSpeed = max;
		document.addEventListener('keydown', (event) => {
			if (event.keyCode === 37) {
				// links
				this.targetValue -= 0.01;
			} else if (event.keyCode === 39) {
				// rechts
				this.targetValue += 0.01;
			}
		});
	}
	updateLerpedValue() {
		if (this.lerpedValue >= this.maxSpeed) {
			this.lerpedValue = this.maxSpeed;
		} else if (this.lerpedValue <= -this.maxSpeed) {
			this.lerpedValue = -this.maxSpeed;
		}
		this.lerpedValue = this.lerp(this.lerpedValue, this.targetValue, this.lerpSpeed);
		if (Math.abs(this.lerpedValue - this.targetValue) > 0.01) {
			requestAnimationFrame(this.updateLerpedValue.bind(this));
		}
	}
	lerp(a, b, t) {
		return a * (1 - t) + b * t;
	}
}

export function getGlContext(canvas) {
	let gl = canvas.getContext('webgl');
	//gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	if (!gl) {
		gl = canvas.getContext('experimental-webgl');
		alert('your browser does not support WebGl');
	}
	return gl;
}

export async function parseOBJ(location) {
	const response = await fetch(location);
	const txt = await response.text();
	const lines = txt.split(/\r*\n/);

	const v = [];
	const vt = [];
	const vn = [];
	const buffer = [];

	lines.forEach((line) => {
		let data = line.trim().split(/\s+/);
		let type = data.shift();
		if (type === 'v') {
			v.push(data.map(parseFloat));
		}
		else if (type === 'vt') {
			vt.push(data.map(parseFloat));
		}
		else if (type === 'vn') {
			vn.push(data.map(parseFloat));
		}
		else if (type === 'f') {
			data.forEach((fp) => {
				let idx = fp.split('/').map((x) => { return parseInt(x) });
				v[idx[0] - 1].forEach((x) => { buffer.push(x) });
				vt[idx[1] - 1].forEach((x) => { buffer.push(x) });
				vn[idx[2] - 1].forEach((x) => { buffer.push(x) });
			})
		}
	})
	return buffer;
}

// Liest Datei mittels Pfad ein und konvertiert sie in Textform
async function loadShader(path) {
	return (await fetch(path)).text();
}

// Erstellt ein Shader-Programm mit dem angegebenen Vertex- und Fragment-Shader
export async function createShaderProgram(gl, vertexShaderPath, fragmentShaderPath) {
	const vertexShaderText = await loadShader(vertexShaderPath);
	const fragmentShaderText = await loadShader(fragmentShaderPath);

	let program = gl.createProgram();
	let vertexShader = gl.createShader(gl.VERTEX_SHADER);
	let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

	gl.shaderSource(vertexShader, vertexShaderText);
	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling vertexShader !', gl.getShaderInfoLog(vertexShader));
		return;
	}
	gl.shaderSource(fragmentShader, fragmentShaderText);
	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		console.error('ERROR compiling fragmentShader', gl.getShaderInfoLog(fragmentShader));
		return;
	}
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error('ERROR linking program!', gl.getProgramInfoLog(program));
		return;
	}

	gl.validateProgram(program);
	if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
		console.error('ERROR validating program!', gl.getProgramInfoLog(program));
		return;
	}

	return program;
}

// Holt die Referenzen auf die Skybox-Images und gibt sie als Array zurück.
export function getSkyboxImages() {
	let skyboxTextures = [];
	skyboxTextures.push(document.getElementById("skybox-right"));
	skyboxTextures.push(document.getElementById("skybox-left"));
	skyboxTextures.push(document.getElementById("skybox-top"));
	skyboxTextures.push(document.getElementById("skybox-bottom"));
	skyboxTextures.push(document.getElementById("skybox-front"));
	skyboxTextures.push(document.getElementById("skybox-back"));
	return skyboxTextures;
}

// Generiert eine Skybox-Textur im Grafikspeicher aus einem Array von Images 
export async function generateSkyboxTexture(gl, imgArray) {
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

	for (var i = 0; i < 6; i++) {
		gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgArray[i]);
	}
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

	return texture;
}
export async function createTyres(gl,OBJ_Path) {
	let tyres = {};
	const vertices = await parseOBJ(OBJ_Path);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

	let tyreTexture = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0 + 4);
	gl.bindTexture(gl.TEXTURE_2D, tyreTexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById('tyreTexture'));

	tyres.vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, tyres.vbo);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	tyres.draw = function () {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);

		const textureSampler = gl.getUniformLocation(this.program, "textureSampler");
		gl.uniform1i(textureSampler, 4);
		const maskSampler = gl.getUniformLocation(this.program, "maskSampler");
		gl.uniform1i(maskSampler, 2);
		const windowMaskSampler = gl.getUniformLocation(this.program, "windowMaskSampler");
		gl.uniform1i(windowMaskSampler, 2);

		const texAttribLocation = gl.getAttribLocation(this.program, 'vTexCoord');
		gl.enableVertexAttribArray(texAttribLocation);
		gl.vertexAttribPointer(texAttribLocation, 2, gl.FLOAT, false, 8 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);

		const positionAttribLocation = gl.getAttribLocation(this.program, 'vPosition');
		gl.vertexAttribPointer(
			positionAttribLocation,
			3,
			gl.FLOAT,
			gl.FALSE,
			8 * Float32Array.BYTES_PER_ELEMENT,
			0
		);
		gl.enableVertexAttribArray(positionAttribLocation);

		const normalAttribLocation = gl.getAttribLocation(this.program, 'vNormal');
		gl.vertexAttribPointer(
			normalAttribLocation,
			3,
			gl.FLOAT,
			gl.FALSE,
			8 * Float32Array.BYTES_PER_ELEMENT,
			5 * Float32Array.BYTES_PER_ELEMENT
		);
		gl.enableVertexAttribArray(normalAttribLocation);

		gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 8);

		gl.disableVertexAttribArray(positionAttribLocation);
		gl.disableVertexAttribArray(normalAttribLocation);
		gl.disableVertexAttribArray(texAttribLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

	}
	return tyres;
}

export async function createChromeBody(gl,OBJ_Path) {
	let chromeBody = {};
	const vertices = await parseOBJ(OBJ_Path);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

	let bodyTexture = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0 + 1);
	gl.bindTexture(gl.TEXTURE_2D, bodyTexture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById('bodyTexture'));

	let bodyMask = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0 + 2);
	gl.bindTexture(gl.TEXTURE_2D, bodyMask);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById('bodyMask'));

	let windowMask = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0 + 3);
	gl.bindTexture(gl.TEXTURE_2D, windowMask);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById('windowMask'));

	chromeBody.vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, chromeBody.vbo);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	chromeBody.draw = function () {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);

		const textureSamplerUniformLocation = gl.getUniformLocation(this.program, "textureSampler");
		gl.uniform1i(textureSamplerUniformLocation, 1);
		const maskSamplerUniformLocation = gl.getUniformLocation(this.program, "maskSampler");
		gl.uniform1i(maskSamplerUniformLocation, 2);
		const windowSamplerUniformLocation = gl.getUniformLocation(this.program, "windowMaskSampler");
		gl.uniform1i(windowSamplerUniformLocation, 3);


		const texAttribLocation = gl.getAttribLocation(this.program, 'vTexCoord');
		gl.enableVertexAttribArray(texAttribLocation);
		gl.vertexAttribPointer(texAttribLocation, 2, gl.FLOAT, false, 8 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);

		const positionAttribLocation = gl.getAttribLocation(this.program, 'vPosition');
		gl.vertexAttribPointer(
			positionAttribLocation,
			3,
			gl.FLOAT,
			gl.FALSE,
			8 * Float32Array.BYTES_PER_ELEMENT,
			0
		);
		gl.enableVertexAttribArray(positionAttribLocation);

		const normalAttribLocation = gl.getAttribLocation(this.program, 'vNormal');
		gl.vertexAttribPointer(
			normalAttribLocation,
			3,
			gl.FLOAT,
			gl.FALSE,
			8 * Float32Array.BYTES_PER_ELEMENT,
			5 * Float32Array.BYTES_PER_ELEMENT
		);
		gl.enableVertexAttribArray(normalAttribLocation);

		gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 8);

		gl.disableVertexAttribArray(positionAttribLocation);
		gl.disableVertexAttribArray(normalAttribLocation);
		gl.disableVertexAttribArray(texAttribLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

	}
	return chromeBody;
}

export function createSkybox(gl) {
	var skybox = {};

	var vertices =
		[
			-1.0, -1.0, 1.0,
			1.0, -1.0, 1.0,
			1.0, 1.0, 1.0,
			-1.0, 1.0, 1.0,
			-1.0, -1.0, -1.0,
			1.0, -1.0, -1.0,
			1.0, 1.0, -1.0,
			-1.0, 1.0, -1.0,
		];

	var indices =
		[
			// front
			0, 1, 2,
			2, 3, 0,
			// top
			3, 2, 6,
			6, 7, 3,
			// back
			7, 6, 5,
			5, 4, 7,
			// bottom
			4, 5, 1,
			1, 0, 4,
			// left
			4, 0, 3,
			3, 7, 4,
			// right
			1, 5, 6,
			6, 2, 1,
		];

	skybox.vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, skybox.vbo);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	skybox.ibo = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, skybox.ibo);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	skybox.draw = function () {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);

		const positionAttribLocation = gl.getAttribLocation(skybox.program, 'vPosition');
		gl.vertexAttribPointer(
			positionAttribLocation, // Attribute location
			3,
			gl.FLOAT,
			gl.FALSE,
			3 * Float32Array.BYTES_PER_ELEMENT,
			0
		);
		gl.enableVertexAttribArray(positionAttribLocation);

		gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

		gl.disableVertexAttribArray(positionAttribLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	}
	return skybox;
}

export async function createPhong(gl) {
	let carPaint = {};
	const vertices = await parseOBJ('./assets/body.obj');

	var mask = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, mask);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, document.getElementById('bodyMask'));

	carPaint.vertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, carPaint.vertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	carPaint.draw = function () {
		const lightPositionUniformLocation = gl.getUniformLocation(carPaint.program, 'light.position');
		gl.uniform3f(lightPositionUniformLocation, -2.5, 3.0, -1.0);
		const lightColorUniformLocation = gl.getUniformLocation(carPaint.program, 'light.color');
		gl.uniform3f(lightColorUniformLocation, 1.0, 1.0, 1.0);
		const lightAmbientUniformLocation = gl.getUniformLocation(carPaint.program, 'light.ambient');
		gl.uniform3f(lightAmbientUniformLocation, 0.2, 0.2, 0.2);
		const ambientUniformLocation = gl.getUniformLocation(this.program, 'mat.ambient');
		gl.uniform3f(ambientUniformLocation, 0.0, 0.05, 0.0);
		const diffuseUniformLocation = gl.getUniformLocation(this.program, 'mat.diffuse');
		gl.uniform3f(diffuseUniformLocation, 0.0, 0.05, 0.0);
		const specularUniformLocation = gl.getUniformLocation(this.program, 'mat.specular');
		gl.uniform3f(specularUniformLocation, 1.0, 1.0, 1.0);
		const shininessUniformLocation = gl.getUniformLocation(this.program, 'mat.shininess');
		gl.uniform1f(shininessUniformLocation, 2);

		const textureMask = gl.getUniformLocation(this.program, "sampler");
		gl.uniform1i(textureMask, 0);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBufferObject);

		const texAttribLocation = gl.getAttribLocation(this.program, 'vTexCoord');
		gl.enableVertexAttribArray(texAttribLocation);
		gl.vertexAttribPointer(texAttribLocation, 2, gl.FLOAT, false, 8 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);

		const positionAttribLocation = gl.getAttribLocation(this.program, 'vPosition');
		gl.vertexAttribPointer(
			positionAttribLocation, // Attribute location
			3, // Number of elements per attribute
			gl.FLOAT, // Type of elements
			gl.FALSE,
			8 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
			0 // Offset from the beginning of a single vertex to this attribute
		);
		gl.enableVertexAttribArray(positionAttribLocation);

		const normalAttribLocation = gl.getAttribLocation(this.program, 'vNormal');
		gl.vertexAttribPointer(
			normalAttribLocation, // Attribute location
			3, // Number of elements per attribute
			gl.FLOAT, // Type of elements
			gl.FALSE,
			8 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
			5 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
		);
		gl.enableVertexAttribArray(normalAttribLocation);

		gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 8);

		gl.disableVertexAttribArray(positionAttribLocation);
		gl.disableVertexAttribArray(normalAttribLocation);
		gl.disableVertexAttribArray(texAttribLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}
	return carPaint;
}

