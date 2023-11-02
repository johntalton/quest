export class Rect {
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
