export function lerp(delta, start, end) {
	return (delta * (end - start)) + start
}

export function mapRange(value, sourceStart, sourceEnd, destinationStart, destinationEnd) {
	const delta = (value - sourceStart) / (sourceEnd - sourceStart)
	return lerp(delta, destinationStart, destinationEnd)
}

export function clamp(value, min, max) {
	return Math.max(min, Math.min(value, max))
}
