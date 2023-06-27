precision mediump float;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

attribute vec3 vPosition;
attribute vec3 vNormal;

varying vec3 fPosition;
varying vec3 fNormal;

attribute vec2 vertTexCoord;
varying vec2 fragTexCoord;

void main() {
  vec4 pos = mView * mWorld * vec4(vPosition, 1.0);
  fPosition = pos.xyz / pos.w;
  fragTexCoord = vertTexCoord;
  fNormal = (mView * mWorld * vec4(vNormal, 0.0)).xyz;
  gl_Position = mProj * mView * mWorld * vec4(vPosition, 1.0);
}
