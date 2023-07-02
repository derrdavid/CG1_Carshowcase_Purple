const EPSILON = 0.000001;

export class Vector3 extends Float32Array {
	constructor() {
		super(3);
		if (arguments.length == 3) {
			this[0] = arguments[0];
			this[1] = arguments[1];
			this[2] = arguments[2];
		}
	}

	transform(m) {
		const c = Float32Array.from(this);
		this[0] = m[0] * c[0] + m[3] * c[1] + m[6] * c[2];
		this[1] = m[1] * c[0] + m[4] * c[1] + m[7] * c[2];
		this[2] = m[2] * c[0] + m[5] * c[1] + m[8] * c[2];
	}

}

export class Matrix3 extends Float32Array {
	constructor() {
		super(9);
	}

	identity() {
		this[0] = 1;
		this[1] = 0;
		this[2] = 0;
		this[3] = 0;
		this[4] = 1;
		this[5] = 0;
		this[6] = 0;
		this[7] = 0;
		this[8] = 1;
	}

	fromMatrix4(m) {
		this[0] = m[0];
		this[1] = m[1];
		this[2] = m[2];
		this[3] = m[4];
		this[4] = m[5];
		this[5] = m[6];
		this[6] = m[8];
		this[7] = m[9];
		this[8] = m[10];
	}

	invert() {
		const m = Float32Array.from(this);
		const det = m[0] * m[4] * m[8] - m[0] * m[7] * m[5] - m[3] * m[1] * m[8] + m[3] * m[7] * m[2] + m[6] * m[1] * m[5] - m[6] * m[4] * m[2];
		this[0] = (m[4] * m[8] - m[7] * m[5]) / det;
		this[1] = (m[7] * m[2] - m[1] * m[8]) / det;
		this[2] = (m[1] * m[5] - m[4] * m[2]) / det;
		this[3] = (m[6] * m[5] - m[3] * m[8]) / det;
		this[4] = (m[0] * m[8] - m[6] * m[2]) / det;
		this[5] = (m[3] * m[2] - m[0] * m[5]) / det;
		this[6] = (m[3] * m[7] - m[6] * m[4]) / det;
		this[7] = (m[6] * m[1] - m[0] * m[7]) / det;
		this[8] = (m[0] * m[4] - m[3] * m[1]) / det;
	}

	invertFromMatrix4(m) {
		// https://mathworld.wolfram.com/MatrixInverse.html
		// https://mathworld.wolfram.com/Determinant.html
		// this = inv(m)
		const det = m[0] * m[5] * m[10] - m[0] * m[9] * m[6] - m[4] * m[1] * m[10] + m[4] * m[9] * m[2] + m[8] * m[1] * m[6] - m[8] * m[5] * m[2];
		this[0] = (m[5] * m[10] - m[9] * m[6]) / det;
		this[1] = (m[9] * m[2] - m[1] * m[10]) / det;
		this[2] = (m[1] * m[6] - m[5] * m[2]) / det;
		this[3] = (m[8] * m[6] - m[4] * m[10]) / det;
		this[4] = (m[0] * m[10] - m[8] * m[2]) / det;
		this[5] = (m[4] * m[2] - m[0] * m[6]) / det;
		this[6] = (m[4] * m[9] - m[8] * m[5]) / det;
		this[7] = (m[8] * m[1] - m[0] * m[9]) / det;
		this[8] = (m[0] * m[5] - m[4] * m[1]) / det;
	}

	normalFromMatrix4(m) {
		// https://mathworld.wolfram.com/MatrixInverse.html
		// https://mathworld.wolfram.com/Determinant.html
		// this = transpose(inv(m))
		const det = m[0] * m[5] * m[10] - m[0] * m[9] * m[6] - m[4] * m[1] * m[10] + m[4] * m[9] * m[2] + m[8] * m[1] * m[6] - m[8] * m[5] * m[2];
		this[0] = (m[5] * m[10] - m[9] * m[6]) / det;
		this[3] = (m[9] * m[2] - m[1] * m[10]) / det;
		this[6] = (m[1] * m[6] - m[5] * m[2]) / det;
		this[1] = (m[8] * m[6] - m[4] * m[10]) / det;
		this[4] = (m[0] * m[10] - m[8] * m[2]) / det;
		this[7] = (m[4] * m[2] - m[0] * m[6]) / det;
		this[2] = (m[4] * m[9] - m[8] * m[5]) / det;
		this[5] = (m[8] * m[1] - m[0] * m[9]) / det;
		this[8] = (m[0] * m[5] - m[4] * m[1]) / det;
	}
}

export class Matrix4 extends Float32Array {
	constructor() {
		super(16);
	}

	identity() {
		this[0] = 1;
		this[1] = 0;
		this[2] = 0;
		this[3] = 0;
		this[4] = 0;
		this[5] = 1;
		this[6] = 0;
		this[7] = 0;
		this[8] = 0;
		this[9] = 0;
		this[10] = 1;
		this[11] = 0;
		this[12] = 0;
		this[13] = 0;
		this[14] = 0;
		this[15] = 1;
	}

	lookAt(eye, center, up) {
		let z0 = eye[0] - center[0];
		let z1 = eye[1] - center[1];
		let z2 = eye[2] - center[2];
		const lengthZ = Math.hypot(z0, z1, z2);
		z0 /= lengthZ;
		z1 /= lengthZ;
		z2 /= lengthZ;

		let x0 = up[1] * z2 - up[2] * z1;
		let x1 = up[2] * z0 - up[0] * z2;
		let x2 = up[0] * z1 - up[1] * z0;
		const lengthX = Math.hypot(x0, x1, x2);
		if (!lengthX) {
			x0 = 0;
			x1 = 0;
			x2 = 0;
		} else {
			x0 /= lengthX;
			x1 /= lengthX;
			x2 /= lengthX;
		}

		let y0 = z1 * x2 - z2 * x1;
		let y1 = z2 * x0 - z0 * x2;
		let y2 = z0 * x1 - z1 * x0;
		const lengthY = Math.hypot(y0, y1, y2);
		if (!lengthY) {
			y0 = 0;
			y1 = 0;
			y2 = 0;
		} else {
			y0 /= lengthY;
			y1 /= lengthY;
			y2 /= lengthY;
		}

		this[0] = x0;
		this[1] = y0;
		this[2] = z0;
		this[3] = 0;
		this[4] = x1;
		this[5] = y1;
		this[6] = z1;
		this[7] = 0;
		this[8] = x2;
		this[9] = y2;
		this[10] = z2;
		this[11] = 0;
		this[12] = -(x0 * eye[0] + x1 * eye[1] + x2 * eye[2]);
		this[13] = -(y0 * eye[0] + y1 * eye[1] + y2 * eye[2]);
		this[14] = -(z0 * eye[0] + z1 * eye[1] + z2 * eye[2]);
		this[15] = 1;
	}

	perspective(fovy, aspect, near, far) {
		const f = 1.0 / Math.tan(fovy / 2);
		this[0] = f / aspect;
		this[1] = 0;
		this[2] = 0;
		this[3] = 0;
		this[4] = 0;
		this[5] = f;
		this[6] = 0;
		this[7] = 0;
		this[8] = 0;
		this[9] = 0;
		this[11] = -1;
		this[12] = 0;
		this[13] = 0;
		this[15] = 0;

		if (far != null && far !== Infinity) {
			const nf = 1 / (near - far);
			this[10] = (far + near) * nf;
			this[14] = 2 * far * near * nf;
		} else {
			this[10] = -1;
			this[14] = -2 * near;
		}
	}

	translate(v) {
		const [x, y, z] = v;
		this[12] += this[0] * x + this[4] * y + this[8] * z;
		this[13] += this[1] * x + this[5] * y + this[9] * z;
		this[14] += this[2] * x + this[6] * y + this[10] * z;
		this[15] += this[3] * x + this[7] * y + this[11] * z;
	}

	scale(v) {
		const [x, y, z] = v;
		this[0] *= x;
		this[1] *= x;
		this[2] *= x;
		this[3] *= x;
		this[4] *= y;
		this[5] *= y;
		this[6] *= y;
		this[7] *= y;
		this[8] *= z;
		this[9] *= z;
		this[10] *= z;
		this[11] *= z;
	}

	rotate(rad, axis) {
		let [x, y, z] = axis;
		let len = Math.hypot(x, y, z);
		if (len < EPSILON) {
			return null;
		}

		len = 1 / len;
		x *= len;
		y *= len;
		z *= len;
		const s = Math.sin(rad);
		const c = Math.cos(rad);
		const t = 1 - c;

		const a00 = this[0];
		const a01 = this[1];
		const a02 = this[2];
		const a03 = this[3];
		const a10 = this[4];
		const a11 = this[5];
		const a12 = this[6];
		const a13 = this[7];
		const a20 = this[8];
		const a21 = this[9];
		const a22 = this[10];
		const a23 = this[11]; // Construct the elements of the rotation matrix

		const b00 = x * x * t + c;
		const b01 = y * x * t + z * s;
		const b02 = z * x * t - y * s;
		const b10 = x * y * t - z * s;
		const b11 = y * y * t + c;
		const b12 = z * y * t + x * s;
		const b20 = x * z * t + y * s;
		const b21 = y * z * t - x * s;
		const b22 = z * z * t + c; // Perform rotation-specific matrix multiplication

		this[0] = a00 * b00 + a10 * b01 + a20 * b02;
		this[1] = a01 * b00 + a11 * b01 + a21 * b02;
		this[2] = a02 * b00 + a12 * b01 + a22 * b02;
		this[3] = a03 * b00 + a13 * b01 + a23 * b02;
		this[4] = a00 * b10 + a10 * b11 + a20 * b12;
		this[5] = a01 * b10 + a11 * b11 + a21 * b12;
		this[6] = a02 * b10 + a12 * b11 + a22 * b12;
		this[7] = a03 * b10 + a13 * b11 + a23 * b12;
		this[8] = a00 * b20 + a10 * b21 + a20 * b22;
		this[9] = a01 * b20 + a11 * b21 + a21 * b22;
		this[10] = a02 * b20 + a12 * b21 + a22 * b22;
		this[11] = a03 * b20 + a13 * b21 + a23 * b22;
	}

	multiply(a, b) {
		for (let i = 0; i < 15; i += 4) {
			this[i + 0] = a[0] * b[i] + a[4] * b[i + 1] + a[8] * b[i + 2] + a[12] * b[i + 3];
			this[i + 1] = a[1] * b[i] + a[5] * b[i + 1] + a[9] * b[i + 2] + a[13] * b[i + 3];
			this[i + 2] = a[2] * b[i] + a[6] * b[i + 1] + a[10] * b[i + 2] + a[14] * b[i + 3];
			this[i + 3] = a[3] * b[i] + a[7] * b[i + 1] + a[11] * b[i + 2] + a[15] * b[i + 3];
		}
	}

}

export function toRadian(a) {
	return a * Math.PI / 180;
}
