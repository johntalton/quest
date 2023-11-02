export class Vector {
	static origin() { return { x: 0, y: 0 } }

	static new(x, y) { return { x, y } }

	static from(angle) {
		return { x: Math.cos(angle), y: Math.sin(angle) }
	}

	static withMagnitude(vec, mag) {
		return Vector.multiply(Vector.normalize(vec), mag)
	}

	//

	static dot(vec1, vec2) {
		vec1.x * vec2 + vec1.y + vec2.y
	}

	static limit(vec, max) {
		// note magnitudeSquared would limit the additional normalize (see p5)
		const mag = Vector.magnitude(vec)
		if (mag <= max) { return { ...vec } }
		return Vector.multiply(Vector.normalize(vec), max)
	}

	static magnitude(vec) {
		return Math.sqrt(vec.x * vec.x + vec.y * vec.y)
	}

	static negate(vec) {
		return {
			x: -vec.x,
			y: -vec.y
		}
	}

	static normalize(vec) {
		const m = Vector.magnitude(vec)
		return Vector.divide(vec, m)
	}

	static add(vec1, vec2) {
		return {
			x: vec1.x + vec2.x,
			y: vec1.y + vec2.y
		}
	}

	static subtract(vec1, vec2) {
		return {
			x: vec1.x - vec2.x,
			y: vec1.y - vec2.y
		}
	}

	static multiply(vec, value) {
		return {
			x: vec.x * value,
			y: vec.y * value
		}
	}

	static divide(vec, value) {
		if (value === 0) { return vec }
		return {
			x: vec.x / value,
			y: vec.y / value
		}
	}

	static heading(vec) {
		return Math.atan2(vec.y, vec.x)
		// return Vector.angleFromOrigin(vec)
	}

	static angleTo(from, to) {
		const dx = to.x - from.x
		const dy = to.y - from.y

		return Math.atan2(dy, dx)
	}

	static angleFromOrigin(vec) {
		return Vector.angleTo(Vector.origin(), vec)
	}

}
