
/**
 * @param {number} delta
 * @param {number} start
 * @param {number} end
 *
 * @returns {number}
 */
export function lerp(delta, start, end) {
	return (delta * (end - start)) + start
}

/**
 * @param {number} value
 * @param {number} sourceStart
 * @param {number} sourceEnd
 * @param {number} destinationStart
 * @param {number} destinationEnd
 *
 * @returns {number}
 */
export function mapRange(value, sourceStart, sourceEnd, destinationStart, destinationEnd) {
	const delta = (value - sourceStart) / (sourceEnd - sourceStart)
	return lerp(delta, destinationStart, destinationEnd)
}

/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 *
 * @returns {number}
 */
export function clamp(value, min, max) {
	return Math.max(min, Math.min(value, max))
}
