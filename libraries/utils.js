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

/// shaderType should be gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
function createShaderProgram(gl, program, vertexShaderText, fragmentShaderText) {
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