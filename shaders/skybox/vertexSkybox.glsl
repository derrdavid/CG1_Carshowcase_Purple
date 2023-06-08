precision mediump float;

attribute vec3 vertPosition;
attribute vec3 vertTexCoord;
varying vec3 fragTexCoord;
uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

void main() {
    fragTexCoord = vertPosition;
    gl_Position = mProj * mView * vec4(vertPosition, 1.0);
}