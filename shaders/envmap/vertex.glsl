precision mediump float;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;
uniform vec3 vEyeDir;

attribute vec3 vPosition;
attribute vec3 vNormal;
attribute vec2 vTexCoord;

varying vec3 fN;
varying vec2 fTexCoord;
varying vec3 fEyeDir;

void main() {
  // übergebe an FragmentShader
  fEyeDir = vEyeDir;
  // berechne OberflächenNormale
  fN = (mWorld * vec4(vNormal, 0.0)).xyz;
  gl_Position = mProj * mView * mWorld * vec4(vPosition, 1.0);
  fTexCoord = vTexCoord;
}
