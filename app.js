import {getGlContext, createShaderProgram, parseOBJ, generateSkyboxTexture, createSkybox, createTeapot} from "./libraries/utils.js";
import { getSkyboxImages } from "./libraries/utils.js";
import {Matrix3, Matrix4, Vector3, toRadian} from './libraries/matrix.js';

async function createSkyBoxTexture(gl) {
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

	const sides = [
		{ src: '/assets/skybox/right.jpg', target: gl.TEXTURE_CUBE_MAP_POSITIVE_X },
		{ src: '/assets/skybox/left.jpg', target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X },
		{ src: '/assets/skybox/top.jpg', target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y },
		{ src: '/assets/skybox/bottom.jpg', target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y },
		{ src: '/assets/skybox/front.jpg', target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z },
		{ src: '/assets/skybox/back.jpg', target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z }
	];

	function loadSide(side) {
		return new Promise( (resolve, reject) => {
				const img = new Image();
				img.onload = () => { 
					gl.texImage2D(side.target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
					resolve();
				};
				img.onerror = reject;
				img.src = side.src;
			}
		)
	}

	const promises = sides.map(loadSide);
	await Promise.all(promises);

	gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	//gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

	return texture;
}
const canvas = document.getElementById('canvas');
const gl = getGlContext(canvas);

const imgArray = await getSkyboxImages();
const texture = await generateSkyboxTexture(gl, imgArray);

const skybox = await createSkybox(gl);
skybox.texture = texture;
skybox.program = await createShaderProgram(gl, './shaders/skybox/vertex.glsl', './shaders/skybox/fragment.glsl');

const teapot = await createTeapot(gl);
teapot.texture = texture;
teapot.program = await createShaderProgram(gl,'./shaders/envmap/vertex.glsl', "./shaders/envmap/fragment.glsl");

const worldMatrix = new Matrix4();
const viewMatrix = new Matrix4();
const projMatrix = new Matrix4();

projMatrix.perspective(toRadian(45), canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);

const loop = function(){
     const angle = performance.now() / 1000 / 6 * 2 * Math.PI;
	viewMatrix.lookAt([0, 3, 15], [0, 0, 0], [0, 1, 0]);
	viewMatrix.rotate(angle/4, [0, -1, 0]);
    
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
    // draw skybox
	gl.disable(gl.DEPTH_TEST);
	gl.useProgram(skybox.program);
    
    let matProjUniformLocation = gl.getUniformLocation(skybox.program, 'mProj');
    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

    let matViewUniformLocation = gl.getUniformLocation(skybox.program, 'mView');
    gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);

    matrixOp.identity(worldMatrix);
	let matWorldUniformLocation = gl.getUniformLocation(skybox.program, 'mWorld');
	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

	skybox.draw();

    gl.enable(gl.DEPTH_TEST);
	gl.useProgram(teapot.program);

	const invViewMatrix = new Matrix3;
	invViewMatrix.invertFromMatrix4(viewMatrix);
	//invViewMatrix.invert();
	const eyeDir = new Vector3(0.0,0.0,1.0);
	eyeDir.transform(invViewMatrix);
	let eyeDirUniformLocation = gl.getUniformLocation(teapot.program, 'uEyeDir');
	gl.uniform3fv(eyeDirUniformLocation, eyeDir);

	matProjUniformLocation = gl.getUniformLocation(teapot.program, 'mProj');
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

	matViewUniformLocation = gl.getUniformLocation(teapot.program, 'mView');
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);

    matrixOp.identity(worldMatrix);
	matWorldUniformLocation = gl.getUniformLocation(teapot.program, 'mWorld');
	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

    teapot.draw();

    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

