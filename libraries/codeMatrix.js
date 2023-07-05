const EPSILON = 0.0001;

// Grundlegende Vectoroperationen
function subtractVectors(a, b) {
    return [
        a[0] - b[0],
        a[1] - b[1],
        a[2] - b[2]
    ];
}
function cross(a, b) {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
    ];
}
function normalize(v) {
    const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    return [
        v[0] / length,
        v[1] / length,
        v[2] / length
    ];
}
function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

/**
 *  Transforms a point vec3 with m3
 * @param vec3 Vektor3
 * @param m3 3x3 Matrix
 * @returns {[]} Transformed vec3
 */
export function transform(vec3, m3) {
    let out = [];
    out[0] = m3[0] * vec3[0] + m3[3] * vec3[1] + m3[6] * vec3[2];
    out[1] = m3[1] * vec3[0] + m3[4] * vec3[1] + m3[7] * vec3[2];
    out[2] = m3[2] * vec3[0] + m3[5] * vec3[1] + m3[8] * vec3[2];
    return out;
}

/**
 * calculate normal from 4x4 matrix
 * @param m4
 * @returns {[]}
 */
export function normalFromMatrix4(m4) {
    let normal = [];
    const determinant = this.determinant(m4);
    normal[0] = (m4[5] * m4[10] - m4[9] * m4[6]) / determinant;
    normal[3] = (m4[9] * m4[2] - m4[1] * m4[10]) / determinant;
    normal[6] = (m4[1] * m4[6] - m4[5] * m4[2]) / determinant;
    normal[1] = (m4[8] * m4[6] - m4[4] * m4[10]) / determinant;
    normal[4] = (m4[0] * m4[10] - m4[8] * m4[2]) / determinant;
    normal[7] = (m4[4] * m4[2] - m4[0] * m4[6]) / determinant;
    normal[2] = (m4[4] * m4[9] - m4[8] * m4[5]) / determinant;
    normal[5] = (m4[8] * m4[1] - m4[0] * m4[9]) / determinant;
    normal[8] = (m4[0] * m4[5] - m4[4] * m4[1]) / determinant;
    return normal;
}


export class Code3x3 {
    determinant(matrix) {
        const [m00, m01, m02, m10, m11, m12, m20, m21, m22] = matrix;
        return (
            m00 * (m11 * m22 - m12 * m21) -
            m01 * (m10 * m22 - m12 * m20) +
            m02 * (m10 * m21 - m11 * m20)
        );
    }
    invert(output, matrix) {
        const [m00, m01, m02, m10, m11, m12, m20, m21, m22] = matrix;
        const det = determinantMatrix3x3(matrix);
        const invDet = 1 / det;

        output[0] = (m11 * m22 - m12 * m21) * invDet;
        output[1] = (m02 * m21 - m01 * m22) * invDet;
        output[2] = (m01 * m12 - m02 * m11) * invDet;
        output[3] = (m12 * m20 - m10 * m22) * invDet;
        output[4] = (m00 * m22 - m02 * m20) * invDet;
        output[5] = (m02 * m10 - m00 * m12) * invDet;
        output[6] = (m10 * m21 - m11 * m20) * invDet;
        output[7] = (m01 * m20 - m00 * m21) * invDet;
        output[8] = (m00 * m11 - m01 * m10) * invDet;
        return output;
    }
}

// Berechnungen in Column-Major-Order für 4x4 Matrizen
export class Code4x4 {
    multiply(output, inputA, inputB) {
        for (let i = 0; i < 4; i++) {
            const ai0 = inputA[i], ai1 = inputA[i + 4], ai2 = inputA[i + 8], ai3 = inputA[i + 12];
            output[i] = ai0 * inputB[0] + ai1 * inputB[1] + ai2 * inputB[2] + ai3 * inputB[3];
            output[i + 4] = ai0 * inputB[4] + ai1 * inputB[5] + ai2 * inputB[6] + ai3 * inputB[7];
            output[i + 8] = ai0 * inputB[8] + ai1 * inputB[9] + ai2 * inputB[10] + ai3 * inputB[11];
            output[i + 12] = ai0 * inputB[12] + ai1 * inputB[13] + ai2 * inputB[14] + ai3 * inputB[15];
        }
    }
    transpose(input, output) {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                output[i * 4 + j] = input[j * 4 + i];
            }
        }

        return output;
    }
    determinant(input) {
        const [
            m00, m01, m02, m03,
            m10, m11, m12, m13,
            m20, m21, m22, m23,
            m30, m31, m32, m33
        ] = input;

        const det =
            m00 * (m11 * (m22 * m33 - m32 * m23) - m12 * (m21 * m33 - m31 * m23) + m13 * (m21 * m32 - m31 * m22)) -
            m01 * (m10 * (m22 * m33 - m32 * m23) - m12 * (m20 * m33 - m30 * m23) + m13 * (m20 * m32 - m30 * m22)) +
            m02 * (m10 * (m21 * m33 - m31 * m23) - m11 * (m20 * m33 - m30 * m23) + m13 * (m20 * m31 - m30 * m21)) -
            m03 * (m10 * (m21 * m32 - m31 * m22) - m11 * (m20 * m32 - m30 * m22) + m12 * (m20 * m31 - m30 * m21));

        return det;
    }
    identity(output) {
        output = new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
        return output;
    }
    translate(output, input, v) {
        const [tx, ty, tz] = v;
        const translationMatrix = new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            tx, ty, tz, 1
        ]);
        this.multiply(output, input, translationMatrix);
        return output;
    }
    scale(output, input, v) {
        const [sx, sy, sz] = v;
        const scalingMatrix = new Float32Array([
            sx, 0, 0, 0,
            0, sy, 0, 0,
            0, 0, sz, 0,
            0, 0, 0, 1
        ]);
        this.multiply(output, input, scalingMatrix);
        return output;
    }
    rotate(output, input, rad, v) {
        let [rx, ry, rz] = v;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        let len = Math.hypot(rx, ry, rz);
        len = 1 / len;
        rx = rx * len;
        ry = ry * len;
        rz = rz * len;
        const t = 1 - cos;
        const rotationMatrix = [
            cos + rx * rx * t, rx * ry * t - rz * sin, rx * rz * t + ry * sin, 0,
            ry * rx * t + rz * sin, cos + ry * ry * t, ry * rz * t - rx * sin, 0,
            rz * rx * t - ry * sin, rz * ry * t + rx * sin, cos + rz * rz * t, 0,
            0, 0, 0, 1
        ];
        this.multiply(output, input, rotationMatrix);
        return output;
    }
    lookAt(output, eye, center, up) {
        const u = normalize(subtractVectors(eye, center));
        const v = normalize(cross(up, u));
        const n = cross(u, v);
        output.set([
            v[0], n[0], u[0], 0,
            v[1], n[1], u[1], 0,
            v[2], n[2], u[2], 0,
            -dot(v, eye), -dot(n, eye), -dot(u, eye), 1
        ]);
        return output;
    }
    perspective(output, fovy, aspect, near, far) {
        const f = 1.0 / Math.tan(fovy / 2);
        output.set([
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, -(far + near) / (far - near), -1,
            0, 0, (-2 * far * near) / (far - near), 0
        ]);
        return output;
    }
}