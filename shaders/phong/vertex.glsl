precision mediump float;

attribute vec2 vTexCoord;
attribute vec3 vPosition;
attribute vec3 vNormal;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

varying vec3 fPosition;
varying vec3 fNormal;
varying vec2 fTexCoord;

void main() {
  gl_Position = mProj * mView * mWorld * vec4(vPosition, 1.0);
  fTexCoord = vTexCoord;
  // Oberflächennormale berechnen
  fNormal = (mView * mWorld * vec4(vNormal, 0.0)).xyz;
  vec4 viewPos = mView * mWorld * vec4(vPosition, 1.0);
  /// Umrechnung in Mat3
  fPosition = viewPos.xyz / viewPos.w;
}
