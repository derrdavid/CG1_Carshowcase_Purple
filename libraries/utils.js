export function getGlContext(canvas) {
	const gl = canvas.getContext('webgl');
	if (!gl) {
		gl = canvas.getContext('experimental-webgl');
		alert('your browser does not support WebGl');
	}
	return gl;
}

export async function parseOBJ(location) {
	// fetch is explained at https://www.youtube.com/watch?v=tc8DU14qX6I.
	let response = await fetch(location);
	let txt = await response.text();
	let lines = txt.split(/\r*\n/);

	let v = [];
	let vt = [];
	let vn = [];
	let buffer = [];

	for (let line of lines) {
		let data = line.trim().split(/\s+/);
		let type = data.shift();
		if (type == 'v') {
			v.push(data.map(parseFloat));
		}
		else if (type == 'vt') {
			vt.push(data.map(parseFloat));
		}
		else if (type == 'vn') {
			vn.push(data.map(parseFloat));
		}
		else if (type == 'f') {
			for (let fp of data) {
				let idx = fp.split('/').map((x) => { return parseInt(x) });
				v[idx[0] - 1].forEach((x) => { buffer.push(x) });
				vt[idx[1] - 1].forEach((x) => { buffer.push(x) });
				vn[idx[2] - 1].forEach((x) => { buffer.push(x) });
			}
		}
	}
	return buffer;
};

async function loadShader(path) {
	return (await fetch(path)).text();
}

// Erstellt ein Shader-Programm mit den angegebenen Vertex- und Fragment-Shadern und gibt es zurück.
export async function createShaderProgram(gl, vertexShaderPath, fragmentShaderPath) {
	const vertexShaderText = await loadShader(vertexShaderPath);
	const fragmentShaderText = await loadShader(fragmentShaderPath);
	var program = gl.createProgram();
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
};
// Holt die Referenzen auf die Skyskybox-Bilder und gibt sie als Array zurück.
export function getSkyboxImages() {
	var skyboxTextures = [];
	skyboxTextures.push(document.getElementById("skybox-right"));
	skyboxTextures.push(document.getElementById("skybox-left"));
	skyboxTextures.push(document.getElementById("skybox-top"));
	skyboxTextures.push(document.getElementById("skybox-bottom"));
	skyboxTextures.push(document.getElementById("skybox-front"));
	skyboxTextures.push(document.getElementById("skybox-back"));
	return skyboxTextures;
}

// Generiert eine Skyskybox-Textur im Grafikspeicher aus einem Array von Bildern und gibt die Textur zurück.
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
export async function createTeapot(gl) {
	let teapot = {};

	const vertices = await parseOBJ('./assets/teapot.obj');

	teapot.vertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, teapot.vertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	teapot.draw = function () {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBufferObject);

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

		gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);

		gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 8);

		gl.disableVertexAttribArray(positionAttribLocation);
		gl.disableVertexAttribArray(normalAttribLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}
	return teapot;
}

export function createSkybox(gl) {
	var skybox = {};

	var vertices =
		[
			-1.0, 1.0, -1.0,  // 0
			-1.0, 1.0, 1.0,  // 1
			1.0, 1.0, 1.0,  // 2
			1.0, 1.0, -1.0,  // 3
			-1.0, -1.0, -1.0,  // 4
			-1.0, -1.0, 1.0,  // 5
			1.0, -1.0, 1.0,  // 6
			1.0, -1.0, -1.0,  // 7
		];

	var indices =
		[
			6, 2, 5, 1, 5, 2,   // front
			0, 1, 2, 0, 2, 3,   // top
			5, 1, 4, 4, 1, 0,   // left
			2, 6, 7, 2, 7, 3,   // right
			3, 7, 4, 3, 4, 0,   // back
			5, 4, 6, 6, 4, 7    // bottom
		];

	skybox.vertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, skybox.vertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	skybox.indexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, skybox.indexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	skybox.draw = function () {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBufferObject);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBufferObject);

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
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.texture);

		gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
		//gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

		gl.disableVertexAttribArray(positionAttribLocation);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	}
	return skybox;
}

export async function createPhong(gl) {
	let teapot = {};

	const vertices = await parseOBJ('./assets/teapot.obj');

	teapot.vertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, teapot.vertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	teapot.draw = function () {
		const ambientUniformLocation = gl.getUniformLocation(this.program, 'mat.ambient');
		const diffuseUniformLocation = gl.getUniformLocation(this.program, 'mat.diffuse');
		const specularUniformLocation = gl.getUniformLocation(this.program, 'mat.specular');
		const shininessUniformLocation = gl.getUniformLocation(this.program, 'mat.shininess');

		gl.uniform3f(ambientUniformLocation, 0.23, 0.09, 0.03);
		gl.uniform3f(diffuseUniformLocation, 0.55, 0.21, 0.07);
		gl.uniform3f(specularUniformLocation, 0.58, 0.22, 0.07);
		gl.uniform1f(shininessUniformLocation, 51.2);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBufferObject);

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
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}
	return teapot;
}

