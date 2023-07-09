precision mediump float;

uniform samplerCube skybox;
uniform sampler2D textureSampler;
uniform sampler2D maskSampler;
uniform sampler2D windowMaskSampler;
uniform bool useMask;

varying vec3 fN;
varying vec2 fTexCoord;
varying vec3 fEyeDir;

void main() {
  // Erstellen der Texturen
  vec4 texture = texture2D(textureSampler, fTexCoord);
  vec4 mask = texture2D(maskSampler, fTexCoord);
  vec4 windowMask = texture2D(windowMaskSampler, fTexCoord);
  float opacity = 1.0;

  if(useMask) {
    opacity = 0.7;

    if(length(mask.rgb) >= 1.4) {
      discard;
    }

    if(length(windowMask.rgb) <= 0.0) {
      opacity = 1.0;
    }
  }
  // Die Normalisierung ist wichtig, um genaue Berechnungen
  vec3 V = normalize(fEyeDir);
  vec3 N = normalize(fN);
  // Relexionsvektor (Eingangs- = Ausgangswinkel)
  // -V Konvention
  vec3 R = normalize(reflect(-V, N));
  // Skybox wird an Relektierenden Vektor gemappt
  vec4 reflection = textureCube(skybox, R);

  vec3 mixedColor = mix(reflection.rgb, texture.rgb, 0.2);
  gl_FragColor = vec4(mixedColor, opacity);
}
