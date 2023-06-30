import { getGlContext, createShaderProgram, parseOBJ, generateSkyboxTexture, createSkybox, createTeapot, createPhong } from "./libraries/utils.js";
import { getSkyboxImages } from "./libraries/utils.js";
import { Matrix3, Matrix4, Vector3, toRadian } from './libraries/matrix.js';
let lerpedValue = 0.0;
let targetValue = 0.5;
let lerpSpeed = 0.001; // Anpassbare Geschwindigkeit des Übergangs
let maxSpeed = 5;
document.addEventListener('keydown', function (event) {
	if (event.keyCode == 37) {
		// Tastatur nach links gedrückt
		targetValue -= 0.01;

	} else if (event.keyCode == 39) {
		// Tastatur nach rechts gedrückt
		targetValue += 0.01;

	}
});

function updateLerpedValue() {
	if (lerpedValue >= maxSpeed) {
		lerpedValue = maxSpeed;
	} else if (lerpedValue <= -maxSpeed) {
		lerpedValue = -maxSpeed;
	}
	lerpedValue = lerp(lerpedValue, targetValue, lerpSpeed);
	// Prüfen, ob der Übergang abgeschlossen ist
	if (Math.abs(lerpedValue - targetValue) > 0.01) {
		// Wenn nicht, die Funktion erneut aufrufen
		requestAnimationFrame(updateLerpedValue);

	}
}
function lerp(a, b, t) {
	return a * (1 - t) + b * t;
}

// Starten Sie den Update-Prozess für den weichen Übergang

const canvas = document.getElementById('canvas');
const gl = getGlContext(canvas);

const imgArray = await getSkyboxImages();
const texture = await generateSkyboxTexture(gl, imgArray);

const skybox = await createSkybox(gl);
skybox.texture = texture;
skybox.program = await createShaderProgram(gl, './shaders/skybox/vertex.glsl', './shaders/skybox/fragment.glsl');

const teapot = await createTeapot(gl);
teapot.texture = texture;
teapot.program = await createShaderProgram(gl, './shaders/envmap/vertex.glsl', "./shaders/envmap/fragment.glsl");

const phong = await createPhong(gl);
phong.program = await createShaderProgram(gl, './shaders/phong/vertex.glsl', "./shaders/phong/fragment.glsl");

const worldMatrix = new Matrix4();
const viewMatrix = new Matrix4();
const projMatrix = new Matrix4();

projMatrix.perspective(toRadian(45), canvas.clientWidth / canvas.clientHeight, 0.1, 1000.0);

const lightPositionUniformLocation = gl.getUniformLocation(phong.program, 'light.position');
const lightColorUniformLocation = gl.getUniformLocation(phong.program, 'light.color');
const lightAmbientUniformLocation = gl.getUniformLocation(phong.program, 'light.ambient');

const loop = function () {
	const angle = performance.now() / 1000 / 6 * 2 * Math.PI;
	const speed = lerpedValue * angle;
	viewMatrix.lookAt([0, 3, 10], [0, 0, 0], [0, 1, 0]);
	viewMatrix.rotate(speed / 8, [0, -1, 0]);

	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
	// draw skybox
	gl.enable(gl.BLEND); // Aktiviert das Mischen von Farben
	gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); // Definiert die Mischfunktion

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

	//gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
	gl.enable(gl.BLEND);
	gl.enable(gl.DEPTH_TEST);
	gl.useProgram(teapot.program);
	const invViewMatrix = new Matrix3;
	invViewMatrix.invertFromMatrix4(viewMatrix);
	//invViewMatrix.invert();
	const eyeDir = new Vector3(0.0, 0.0, 1.0);
	eyeDir.transform(invViewMatrix);
	viewMatrix.scale([1.5, 1.5, 1.5]);
	viewMatrix.rotate(angle / 8, [0, 0, 0]);

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

	gl.useProgram(phong.program);

	matProjUniformLocation = gl.getUniformLocation(phong.program, 'mProj');
	gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);
	viewMatrix.translate(new Vector3(0.0, 0.0, 0.0));
	matViewUniformLocation = gl.getUniformLocation(phong.program, 'mView');
	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	matWorldUniformLocation = gl.getUniformLocation(phong.program, 'mWorld');
	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

	gl.uniform3f(lightPositionUniformLocation, 1.0, 1.0, 0.0);
	gl.uniform3f(lightColorUniformLocation, 1.0, 1.0, 1.0);
	gl.uniform3f(lightAmbientUniformLocation, 0.2, 0.2, 0.2);

	gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
	worldMatrix.identity();
	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
	phong.draw();

	requestAnimationFrame(loop);
	updateLerpedValue();

}
requestAnimationFrame(loop);

