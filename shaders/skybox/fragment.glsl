precision mediump float;

varying vec3 fragTexCoord;
uniform samplerCube skybox;

void main() {
    gl_FragColor = textureCube(skybox, fragTexCoord);
}
