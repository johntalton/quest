import { Vector } from './vector.js'
import { Rect } from '../lib/rect.js'
import { Space } from '../lib/space.js'

export function steering(position, velocity, target) {
	return Vector.subtract(Vector.subtract(target, position), velocity)
}

export function steeringForce(config, target) {
	return steering(config.player.position, config.player.velocity, target)
}

export function bounds(config) {
	// viewport boundary
	const x = Math.max(0, (config.gfx.canvas.width - config.gfx.viewport.clientWidth) / 2)
	const y = Math.max(0, (config.gfx.canvas.height - config.gfx.viewport.clientHeight) / 2)
	const w = Math.min(config.gfx.canvas.width, config.gfx.viewport.clientWidth)
	const h = Math.min(config.gfx.canvas.height, config.gfx.viewport.clientHeight)

	// padding
	const pad = 0
	const viewportRect = {
		origin: {
			x: x + pad,
			y: y + pad
		},
		width: w - 2 * pad,
		height: h - 2 * pad
	}

	// render space
	const canvasOrigin = {
		x: config.gfx.canvas.width / 2,
		y: config.gfx.canvas.height / 2
	}

	// game space
	const boundsOrigin = {
		x: config.world.bounds.width / 2,
		y: config.world.bounds.height / 2
	}

	//
	const gameRect = {
		origin: {
			x: canvasOrigin.x - boundsOrigin.x,
			y: canvasOrigin.y - boundsOrigin.y
		},
		width: config.world.bounds.width,
		height: config.world.bounds.height
	}

	const redDotRect = Rect.clip(gameRect, viewportRect)

	const inset = 10
	const blockStart = 0
	const blockEnd = 20
	const inline = 20

	const renderRect  = {
		origin: {
			x: redDotRect.origin.x + inset + inline,
			y: redDotRect.origin.y + inset + blockStart
		},
		width: redDotRect.width - (2 * inset) - inline - inline,
		height: redDotRect.height - (2 * inset) - blockStart - blockEnd
	}

	config.gfx.bounds = {
		viewport: viewportRect,
		render: renderRect,
		game: gameRect,
	}
}

export function *surfaceArea(config) {
	const worldOriginTile = Space.gameToTile(config, config.world.origin)
	const start = Vector.add(worldOriginTile, { x: -3, y: -4 })
	const end = Vector.add(worldOriginTile, { x: 10, y: 6 })

	for(let y = start.y; y < end.y; y++) {
		for(let x = start.x; x < end.x; x++) {
			const tile = { x, y }
			const gameTile = Space.tileToGame(config, tile)

			const render = Space.gameToRendering(config, gameTile)

			yield {
				render,
				tile
			}
		}
	}
}

export function tileLookup(config, location) {

	const tileNamed = config.surface.tiles.find(item => item.x === location.x && item.y === location.y)
	const tile = tileNamed ?? config.surface.tiles[0]


	const sprite = config.gfx.sprites.find(item => item.name === tile.sprite)


	return {
		location,
		sprite
	}
}
