precision mediump float;

attribute vec2 vTexCoord;
attribute vec3 vPosition;
attribute vec3 vNormal;

varying vec3 fPosition;
varying vec3 fNormal;
varying vec2 fTexCoord;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

void main() {
  fTexCoord = vTexCoord;
  gl_Position = mProj * mView * mWorld * vec4(vPosition, 1.0);
  vec4 pos = mView * mWorld * vec4(vPosition, 1.0);
  fPosition = pos.xyz / pos.w;
  fNormal = (mView * mWorld * vec4(vNormal, 0.0)).xyz;
}
