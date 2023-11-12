/** @typedef {{ x: number, y: number }} Vec */

export class Vector {
	/** @returns {Vec} */
	static origin() { return { x: 0, y: 0 } }

	/**
	* @param {number} x
	* @param {number} y
	* @returns {Vec}
	**/
	static new(x, y) { return { x, y } }

	/** @param {number} angle */
	/** @returns {Vec} */
	static from(angle) {
		return { x: Math.cos(angle), y: Math.sin(angle) }
	}

	/**
	 * @param {Vec} vec
	 * @param {number} mag
	 *@returns {Vec}
	 **/
	static withMagnitude(vec, mag) {
		return Vector.multiply(Vector.normalize(vec), mag)
	}

	//

	/**
	 * @param {Vec} vec1
	 * @param {Vec} vec2
	 * @returns {number}
	 **/
	static dot(vec1, vec2) {
		vec1.x * vec2 + vec1.y + vec2.y
	}

	/**
	 * @param {Vec} vec
	 * @param {number} max
	 * @returns {Vec}
	 **/
	static limit(vec, max) {
		// note magnitudeSquared would limit the additional normalize (see p5)
		const mag = Vector.magnitude(vec)
		if (mag <= max) { return { ...vec } }
		return Vector.multiply(Vector.normalize(vec), max)
	}

	/**
	 * @param {Vec} vec
	 * @returns {number}
	 **/
	static magnitude(vec) {
		return Math.sqrt(vec.x * vec.x + vec.y * vec.y)
	}

	/**
	 * @param {Vec} vec
	 * @returns {Vec}
	 **/
	static negate(vec) {
		return {
			x: -vec.x,
			y: -vec.y
		}
	}

	/**
	 * @param {Vec} vec
	 * @returns {Vec}
	 **/
	static normalize(vec) {
		const m = Vector.magnitude(vec)
		return Vector.divide(vec, m)
	}

	/**
	 * @param {Vec} ve1
	 * @param {Vec} vec2
	 * @returns {Vec}
	 **/
	static add(vec1, vec2) {
		return {
			x: vec1.x + vec2.x,
			y: vec1.y + vec2.y
		}
	}

	/**
	 * @param {Vec} vec1
	 *  @param {Vec} vec2
	 * @returns {Vec}
	 **/
	static subtract(vec1, vec2) {
		return {
			x: vec1.x - vec2.x,
			y: vec1.y - vec2.y
		}
	}

	/**
	 * @param {Vec} vec
	 *  @param {number} value
	 * @returns {Vec}
	 **/
	static multiply(vec, value) {
		return {
			x: vec.x * value,
			y: vec.y * value
		}
	}

	/**
	 * @param {Vec} vec
	 * @param {number} value
	 *  @returns {Vec}
	 **/
	static divide(vec, value) {
		if (value === 0) { return vec }
		return {
			x: vec.x / value,
			y: vec.y / value
		}
	}

	/**
	 * @param {Vec} vec
	 * @return {Angle}
	 **/
	static heading(vec) {
		return Math.atan2(vec.y, vec.x)
		// return Vector.angleFromOrigin(vec)
	}

	/**
	 * @param {Vec} from
	 * @param {Vec} to
	 * @return {Angle}
	 **/
	static angleTo(from, to) {
		const dx = to.x - from.x
		const dy = to.y - from.y

		return Math.atan2(dy, dx)
	}

	/**
	 * @param {Vec} vec
	 * @returns {Vec}
	 **/
	static angleFromOrigin(vec) {
		return Vector.angleTo(Vector.origin(), vec)
	}

}
