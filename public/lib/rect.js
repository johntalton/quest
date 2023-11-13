// @ts-check

/** @typedef {{ origin: Vec, width: number, height: number}} Rectangle */

export class Rect {
	/**
	 * @param {Rectangle} rect
	 * @param {Rectangle} clipRect
	 * @returns {Rectangle}
	 */
	static clip(rect, clipRect) {
		return {
			origin: {
				x: Math.max(rect.origin.x, clipRect.origin.x),
				y: Math.max(rect.origin.y, clipRect.origin.y)
			},
			width: Math.min(rect.width, clipRect.width),
			height: Math.min(rect.height, clipRect.height),
		}
	}
}
