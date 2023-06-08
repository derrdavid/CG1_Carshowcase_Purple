precision mediump float;
attribute vec3 vertPosition;
attribute vec3 vertNormal;
uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;
varying vec3 fragColor;
uniform mat4 mNormal;
void main() {
    gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
    vec3 emat = vec3(0.0, 0.0, 0.0);
    vec3 alight = vec3(0.2, 0.2, 0.2);
    vec3 amat = vec3(1.0, 0.0, 1.0);
    vec3 dlight = vec3(0.5, 0.5, 0.5);
    vec3 dmat = vec3(1.0, 0.0, 1.0);
    vec3 slight = vec3(1.0, 1.0, 1.0);
    vec3 smat = vec3(1.0, 1.0, 1.0);

    vec3 l = vec3(1.0, 1.0, 1.0);
    vec3 n = normalize((mView * mWorld * vec4(vertNormal, 0.0)).xyz);
    vec3 pos = normalize(mView * (vec4(vertPosition, 0.0))).xyz;
    vec3 v = normalize(-pos);
    vec3 r = normalize(l + v);

    fragColor = emat;
    fragColor += alight * amat;
    fragColor += max(dot(l, n), 0.0) * dlight * dmat;
    fragColor += pow(max(dot(n, r), 0.0), 5.0) * slight * smat;
}