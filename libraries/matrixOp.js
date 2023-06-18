class matrixOp {
    static identity(out) {
        out[0] = 1;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = 1;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = 1;
        out[11] = 0;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 1;
        return out;
    }
    static translate(out, input, v) {
        var x = v[0],
            y = v[1],
            z = v[2];
        out[0] = input[0];
        out[1] = input[1];
        out[2] = input[2];
        out[3] = input[3];
        out[4] = input[4];
        out[5] = input[5];
        out[6] = input[6];
        out[7] = input[7];
        out[8] = input[8];
        out[9] = input[9];
        out[10] = input[10];
        out[11] = input[11];
        out[12] = input[12] + input[0] * x + input[4] * y + input[8] * z;
        out[13] = input[13] + input[1] * x + input[5] * y + input[9] * z;
        out[14] = input[14] + input[2] * x + input[6] * y + input[10] * z;
        out[15] = input[15];
        return out;
    }
    static rotate(out, input, rad, v) {
        var x = v[0],
            y = v[1],
            z = v[2];

        var len = Math.hypot(x, y, z);
        if (len < 0.000001) {
            return null;
        }
        len = 1 / len;

        x *= len;
        y *= len;
        z *= len;

        var s = Math.sin(rad),
            c = Math.cos(rad),
            t = 1 - c;

        var a00 = input[0],
            a01 = input[1],
            a02 = input[2],
            a03 = input[3],
            a10 = input[4],
            a11 = input[5],
            a12 = input[6],
            a13 = input[7],
            a20 = input[8],
            a21 = input[9],
            a22 = input[10],
            a23 = input[11];

        var m00 = x * x * t + c,
            m01 = y * x * t + z * s,
            m02 = z * x * t - y * s,
            m10 = x * y * t - z * s,
            m11 = y * y * t + c,
            m12 = z * y * t + x * s,
            m20 = x * z * t + y * s,
            m21 = y * z * t - x * s,
            m22 = z * z * t + c;

        out[0] = a00 * m00 + a10 * m01 + a20 * m02;
        out[1] = a01 * m00 + a11 * m01 + a21 * m02;
        out[2] = a02 * m00 + a12 * m01 + a22 * m02;
        out[3] = a03 * m00 + a13 * m01 + a23 * m02;
        out[4] = a00 * m10 + a10 * m11 + a20 * m12;
        out[5] = a01 * m10 + a11 * m11 + a21 * m12;
        out[6] = a02 * m10 + a12 * m11 + a22 * m12;
        out[7] = a03 * m10 + a13 * m11 + a23 * m12;
        out[8] = a00 * m20 + a10 * m21 + a20 * m22;
        out[9] = a01 * m20 + a11 * m21 + a21 * m22;
        out[10] = a02 * m20 + a12 * m21 + a22 * m22;
        out[11] = a03 * m20 + a13 * m21 + a23 * m22;

        if (input != out) {
            out[12] = input[12];
            out[13] = input[13];
            out[14] = input[14];
            out[15] = input[15];
        }
        return out;
    }

    static scale(out, input, v) {
        var x = v[0],
            y = v[1],
            z = v[2];
        out[0] = input[0] * x;
        out[1] = input[1] * x;
        out[2] = input[2] * x;
        out[3] = input[3] * x;
        out[4] = input[4] * y;
        out[5] = input[5] * y;
        out[6] = input[6] * y;
        out[7] = input[7] * y;
        out[8] = input[8] * z;
        out[9] = input[9] * z;
        out[10] = input[10] * z;
        out[11] = input[11] * z;
        out[12] = input[12];
        out[13] = input[13];
        out[14] = input[14];
        out[15] = input[15];
        return out;
    }

    static lookAt(out, eye, center, up) {
        var x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
        var eyex = eye[0];
        var eyey = eye[1];
        var eyez = eye[2];
        var upx = up[0];
        var upy = up[1];
        var upz = up[2];
        var centerx = center[0];
        var centery = center[1];
        var centerz = center[2];

        if (Math.abs(eyex - centerx) < 0.00001 && Math.abs(eyey - centery) < 0.00001 && Math.abs(eyez - centerz) < 0.00001) {
            return identity$2(out);
        }

        z0 = eyex - centerx;
        z1 = eyey - centery;
        z2 = eyez - centerz;
        len = 1 / Math.hypot(z0, z1, z2);
        z0 *= len;
        z1 *= len;
        z2 *= len;
        x0 = upy * z2 - upz * z1;
        x1 = upz * z0 - upx * z2;
        x2 = upx * z1 - upy * z0;
        len = Math.hypot(x0, x1, x2);

        if (!len) {
            x0 = 0;
            x1 = 0;
            x2 = 0;
        } else {
            len = 1 / len;
            x0 *= len;
            x1 *= len;
            x2 *= len;
        }

        y0 = z1 * x2 - z2 * x1;
        y1 = z2 * x0 - z0 * x2;
        y2 = z0 * x1 - z1 * x0;
        len = Math.hypot(y0, y1, y2);

        if (!len) {
            y0 = 0;
            y1 = 0;
            y2 = 0;
        } else {
            len = 1 / len;
            y0 *= len;
            y1 *= len;
            y2 *= len;
        }

        out[0] = x0;
        out[1] = y0;
        out[2] = z0;
        out[3] = 0;
        out[4] = x1;
        out[5] = y1;
        out[6] = z1;
        out[7] = 0;
        out[8] = x2;
        out[9] = y2;
        out[10] = z2;
        out[11] = 0;
        out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
        out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
        out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
        out[15] = 1;
        return out;
    }
    static perspective(out, fovy, aspect, near, far) {
        var f = 1.0 / Math.tan(fovy / 2);
        out[0] = f / aspect;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = f;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[11] = -1;
        out[12] = 0;
        out[13] = 0;
        out[15] = 0;

        if (far != null && far !== Infinity) {
            var nf = 1 / (near - far);
            out[10] = far * nf;
            out[14] = far * near * nf;
        } else {
            out[10] = -1;
            out[14] = -near;
        }

        return out;
    }
    static invert(input) {
        const [a, b, c, d, e, f, g, h, i] = input;
        const determinant = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
        // Die inverse Matrix berechnen
        const inverseMatrix = [
            (e * i - f * h) / determinant,
            -(b * i - c * h) / determinant,
            (b * f - c * e) / determinant,
            -(d * i - f * g) / determinant,
            (a * i - c * g) / determinant,
            -(a * f - c * d) / determinant,
            (d * h - e * g) / determinant,
            -(a * h - b * g) / determinant,
            (a * e - b * d) / determinant,
        ];
        return inverseMatrix;
    }
    static normalize(input) {
        const inverseMatrix = this.invert(input);
        const normalMatrix = [
            inverseMatrix[0], inverseMatrix[3], inverseMatrix[6], 0,
            inverseMatrix[1], inverseMatrix[4], inverseMatrix[7], 0,
            inverseMatrix[2], inverseMatrix[5], inverseMatrix[8], 0,
            0, 0, 0, 1,
        ];
        return normalMatrix;
    }
    static toRadian(a) {
        return a * Math.PI / 180;
    }
    static getTranslation(out, mat) {
        out[0] = mat[12];
        out[1] = mat[13];
        out[2] = mat[14];
        return out;
    }
    static fromTranslation(out, v) {
        out[0] = 1;
        out[1] = 0;
        out[2] = 0;
        out[3] = 1;
        out[4] = v[0];
        out[5] = v[1];
        return out;
    }
    static fromValues(x, y, z) {
        var out = new Array;
        out[0] = x;
        out[1] = y;
        out[2] = z;
        return out;
    }
    static create() {
        var out = new Array;

        out[0] = 0;
        out[1] = 0;
        out[2] = 0;

        return out;
    }
    static rotateY(out, a, b, rad) {
        var p = [],
            r = []; //Translate point to the origin

        p[0] = a[0] - b[0];
        p[1] = a[1] - b[1];
        p[2] = a[2] - b[2]; //perform rotation

        r[0] = p[2] * Math.sin(rad) + p[0] * Math.cos(rad);
        r[1] = p[1];
        r[2] = p[2] * Math.cos(rad) - p[0] * Math.sin(rad); //translate to correct position

        out[0] = r[0] + b[0];
        out[1] = r[1] + b[1];
        out[2] = r[2] + b[2];
        return out;
    }
};