async function parseOBJ(location) {
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
function createShaderProgram(gl, vertexShaderText, fragmentShaderText) {
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

// Generiert ein 3D-Würfelobjekt mit den definierten Eckpunkten (Vertices) und Indizes (Indices) und gibt es zurück.
function generateCube() {
	var boxVertices =
		[ // X, Y, Z            U, V
			// Top
			-1.0, 1.0, -1.0, 0, 0,
			-1.0, 1.0, 1.0, 0, 1,
			1.0, 1.0, 1.0, 1, 1,
			1.0, 1.0, -1.0, 1, 0,

			// Left
			-1.0, 1.0, 1.0, 0, 0,
			-1.0, -1.0, 1.0, 1, 0,
			-1.0, -1.0, -1.0, 1, 1,
			-1.0, 1.0, -1.0, 0, 1,

			// Right
			1.0, 1.0, 1.0, 1, 1,
			1.0, -1.0, 1.0, 0, 1,
			1.0, -1.0, -1.0, 0, 0,
			1.0, 1.0, -1.0, 1, 0,

			// Front
			1.0, 1.0, 1.0, 1, 1,
			1.0, -1.0, 1.0, 1, 0,
			-1.0, -1.0, 1.0, 0, 0,
			-1.0, 1.0, 1.0, 0, 1,

			// Back
			1.0, 1.0, -1.0, 0, 0,
			1.0, -1.0, -1.0, 0, 1,
			-1.0, -1.0, -1.0, 1, 1,
			-1.0, 1.0, -1.0, 1, 0,

			// Bottom
			-1.0, -1.0, -1.0, 1, 1,
			-1.0, -1.0, 1.0, 1, 0,
			1.0, -1.0, 1.0, 0, 0,
			1.0, -1.0, -1.0, 0, 1,
		];

	var boxIndices =
		[
			// Top
			0, 1, 2,
			0, 2, 3,

			// Left
			5, 4, 6,
			6, 4, 7,

			// Right
			8, 9, 10,
			8, 10, 11,

			// Front
			13, 12, 14,
			15, 14, 12,

			// Back
			16, 17, 18,
			16, 18, 19,

			// Bottom
			21, 20, 22,
			22, 20, 23
		];
	return {
		vertices: boxVertices,
		indices: boxIndices
	};
}

// Holt die Referenzen auf die Skybox-Bilder und gibt sie als Array zurück.
function getSkyboxImages() {
	var skyboxTextures = [];
	skyboxTextures.push(document.getElementById("skybox-right"));
	skyboxTextures.push(document.getElementById("skybox-left"));
	skyboxTextures.push(document.getElementById("skybox-top"));
	skyboxTextures.push(document.getElementById("skybox-bottom"));
	skyboxTextures.push(document.getElementById("skybox-front"));
	skyboxTextures.push(document.getElementById("skybox-back"));
	return skyboxTextures;
}

// Generiert eine Skybox-Textur im Grafikspeicher aus einem Array von Bildern und gibt die Textur zurück.
function generateSkybox(gl, imgArray) {
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

// Funktionen zum Erstellen, Binden und Übertragen von Buffern im Grafikspeicher.
function createBuffer(gl, target, size, usage) {
	var bufferObject = gl.createBuffer();
	gl.bindBuffer(target, bufferObject);
	gl.bufferData(target, size, usage);
	return bufferObject;
}