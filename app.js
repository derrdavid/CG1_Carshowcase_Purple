async function init() {
    vertexShaderTextGouraud = await ((await fetch('./shaders/gouraud/vertexGouraud.glsl')).text());
    fragmentShaderTextGouraud = await ((await fetch('./shaders/gouraud/fragmentGouraud.glsl')).text());

    vertexShaderTextSkybox = await ((await fetch('./shaders/gouraud/vertexSkybox.glsl')).text());
    fragmentShaderTextSkybox = await ((await fetch('./shaders/gouraud/fragmentSkybox.glsl')).text());

    vbo = await parseOBJ('./assets/teapot.obj');
}
var InitDemo = async function () {
    await init();

    //
    // initialisiere WebGL
    //
    var canvas = document.getElementById('surface');
    var gl = canvas.getContext('webgl');

    if (!gl) {
        gl = canvas.getContext('experimental-webgl');
        alert('your browser does not support WebGl');
    }

    //create Gouraud Program
    var programGouraud = gl.createProgram();
    programGouraud = createShaderProgram(gl, programGouraud, vertexShaderTextGouraud, fragmentShaderTextGouraud);


    gl.useProgram(programGouraud);

    //
    // create Buffer
    //
    var boxColorBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, boxColorBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vbo), gl.STATIC_DRAW);

    var positionAttributeLocation = gl.getAttribLocation(programGouraud, 'vertPosition');
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 4, gl.FLOAT, false, 8 * Float32Array.BYTES_PER_ELEMENT, 0);

    var colorAttributeLocation = gl.getAttribLocation(programGouraud, 'vertNormal');
    gl.enableVertexAttribArray(colorAttributeLocation);
    gl.vertexAttribPointer(colorAttributeLocation, 4, gl.FLOAT, false, 8 * Float32Array.BYTES_PER_ELEMENT, 5 * Float32Array.BYTES_PER_ELEMENT);

    //
    // Activate program
    //

    // get Matrix-Locations
    var matWorldUniformLocation = gl.getUniformLocation(programGouraud, 'mWorld');
    var matViewUniformLocation = gl.getUniformLocation(programGouraud, 'mView');
    var matProjUniformLocation = gl.getUniformLocation(programGouraud, 'mProj');
    var matNormalUniformLocation = gl.getUniformLocation(programGouraud, 'mNormal');

    // init Matrices
    var worldMatrix = new Float32Array(16);
    var viewMatrix = new Float32Array(16);
    var projMatrix = new Float32Array(16);

    matrixOp.identity(worldMatrix);
    matrixOp.lookAt(viewMatrix, [0, 0, 30], [0, -10, 0], [0, 1, 0]);
    matrixOp.perspective(projMatrix, matrixOp.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);

    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
    gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);

    //
    // Main render loop
    //
    var angle = 0;
    var loop = function () {
        angle = performance.now() / 1000 / 6 * 2 * Math.PI;
        matrixOp.lookAt(viewMatrix, [0, 0, 10], [0, 0, 0], [0, 1, 0]);
        matrixOp.perspective(projMatrix, matrixOp.toRadian(45), canvas.width / canvas.height, 0.1, 1000.0);
        matrixOp.translate(viewMatrix, viewMatrix, [0, 0, 0]);
        matrixOp.rotate(viewMatrix, viewMatrix, angle, [0, 1, 0]);
        gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
        var worldMatrixNormal = matrixOp.normalize(worldMatrix);
        gl.uniformMatrix4fv(matNormalUniformLocation, gl.FALSE, worldMatrixNormal);
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, vbo.length / 8);
        //gl.drawElements(gl.TRIANGLES, myObj.index.length, gl.UNSIGNED_SHORT, 0);
        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
};