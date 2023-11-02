import { mapRange } from './scalar.js'
import { Vector } from './vector.js'

export class Space {
	static renderToGame(config, vec) {
		return {
			x: mapRange(vec.x,
				config.gfx.bounds.render.origin.x,
				config.gfx.bounds.render.origin.x + config.gfx.bounds.render.width,
				config.world.origin.x,
				config.world.origin.x + config.world.bounds.width),
			y: mapRange(vec.y,
				config.gfx.bounds.render.origin.y,
				config.gfx.bounds.render.origin.y + config.gfx.bounds.render.height,
				config.world.origin.y,
				config.world.origin.y + config.world.bounds.height
			)
		}
	}

	static gameToRendering(config, vec) {
		return {
			x: mapRange(
				vec.x,
				config.world.origin.x,
				config.world.origin.x + config.world.bounds.width,
				config.gfx.bounds.render.origin.x,
				config.gfx.bounds.render.origin.x + config.gfx.bounds.render.width),
			y: mapRange(
				vec.y,
				config.world.origin.y,
				config.world.origin.y + config.world.bounds.height,
				config.gfx.bounds.render.origin.y,
				config.gfx.bounds.render.origin.y + config.gfx.bounds.render.height)
		}
	}

	static gameToTile(config, vec) {
		return {
			x: Math.trunc(vec.x / 100),
			y: Math.trunc(vec.y / 100)
		}
	}

	static tileToGame(config, vec) {
		return Vector.multiply(vec, 100)
	}
}
