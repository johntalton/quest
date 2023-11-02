import { Rect } from '../lib/rect.js'
import { Vector } from '../lib/vector.js'
import { Space } from '../lib/space.js'
import { steeringForce } from '../lib/util.js'
import { mapRange } from '../lib/scalar.js'

function renderBackground(config, renderTime) {
	//
	config.gfx.context.clearRect(0, 0, config.gfx.canvas.width, config.gfx.canvas.height)
}

function tileLookup(config, location) {

	const tile = config.surface.tiles.find(item => item.x === location.x && item.y === location.y)
	if(tile === undefined) { return { location } }

	const sprite = config.gfx.sprites.find(item => item.name === tile.sprite)


	return {
		location,
		sprite
	}
}

function *surfaceArea(config) {
	const size = 100

	const worldOriginTile = Space.gameToTile(config, config.world.origin)

	const offsetXGame = config.world.origin.x % 100
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

function renderSurface(config, renderTime) {
	//
	const { cabinet } = config.gfx.textures

	const size = {
		x: 100 * config.gfx.bounds.render.width / config.world.bounds.width,
		y: 100 * config.gfx.bounds.render.height / config.world.bounds.height
	}

	for(const area of surfaceArea(config)) {
		const offset = {
			origin: area.render,
			width: size.x,
			height: size.y
		}

		const tile = tileLookup(config, area.tile)

		if(tile.sprite !== undefined) {
			config.gfx.context.drawImage(cabinet,
				tile.sprite.origin.x, tile.sprite.origin.y, tile.sprite.width, tile.sprite.height,
				offset.origin.x, offset.origin.y, offset.width, offset.height)

			config.gfx.context.fillStyle = 'rgb(200 200 200 / .8)'
			config.gfx.context.fillRect(
				offset.origin.x, offset.origin.y,
				offset.width, offset.height)
		}


		config.gfx.context.strokeStyle = 'rgb(0 0 0 / .125)'
		config.gfx.context.lineWidth = 1
		config.gfx.context.strokeRect(
			offset.origin.x, offset.origin.y,
			offset.width, offset.height)

		renderLines(config, [
			`(${area.tile.x} : ${area.tile.y})`
		], {
			x: offset.origin.x + offset.width / 2,
			y: offset.origin.y + offset.height / 2
		}, {
			style: 'rgba(0 0 0 / .5)'
		})

	}
}

function bounds(config) {
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

function renderBounds(config, renderTime) {
	if(config.gfx.bounds === undefined ) { return }

	config.gfx.context.lineWidth = 1

	//
	config.gfx.context.strokeStyle = 'purple'
	config.gfx.context.setLineDash([5, 5])
	config.gfx.context.strokeRect(
		config.gfx.bounds.viewport.origin.x,
		config.gfx.bounds.viewport.origin.y,
		config.gfx.bounds.viewport.width,
		config.gfx.bounds.viewport.height)
	config.gfx.context.setLineDash([])


	//
	config.gfx.context.strokeStyle = 'red'
	config.gfx.context.setLineDash([5, 5])
	config.gfx.context.strokeRect(
		config.gfx.bounds.game.origin.x,
		config.gfx.bounds.game.origin.y,
		config.gfx.bounds.game.width,
		config.gfx.bounds.game.height)
	config.gfx.context.setLineDash([])

	//
	config.gfx.context.strokeStyle = 'red'
	config.gfx.context.strokeRect(
		config.gfx.bounds.render.origin.x,
		config.gfx.bounds.render.origin.y,
		config.gfx.bounds.render.width,
		config.gfx.bounds.render.height)

	//
	const lines = [
		Math.round(config.world.origin.x) + ' : ' + Math.round(config.world.origin.y),
		'[🧭]'
	]

	renderLines(config, lines,
		Vector.add(config.gfx.bounds.render.origin, { x: 5, y: 5 }),
		{
			fontSize: 20,
			style: 'black',
			textAlign: 'start',
			textBaseLine: 'top'
		})
}

function renderPlayer(config, renderTime) {
	const scale = 20

	const virtualRenderWorldOrigin = Space.gameToRendering(config, config.world.origin)

	const renderPositionFull = Space.gameToRendering(config, config.player.position)
	const renderPosition = {
		x: Math.max(config.gfx.bounds.render.origin.x, Math.min(renderPositionFull.x, config.gfx.bounds.render.origin.x + config.gfx.bounds.render.width)),
		y: Math.max(config.gfx.bounds.render.origin.y, Math.min(renderPositionFull.y, config.gfx.bounds.render.origin.y + config.gfx.bounds.render.height)),
	}

	const r = 1 * scale
	config.gfx.context.strokeStyle = 'black'
	config.gfx.context.fillStyle = 'white'
	config.gfx.context.beginPath()
	config.gfx.context.ellipse(renderPosition.x, renderPosition.y, r, r, 0, 0, 2 * Math.PI)
	config.gfx.context.fill()
	config.gfx.context.stroke()

	config.gfx.context.beginPath()
	config.gfx.context.translate(renderPosition.x, renderPosition.y);
	config.gfx.context.rotate(config.player.facing);
	config.gfx.context.moveTo(0, 0)
	config.gfx.context.lineTo(2 * scale, 0)
	config.gfx.context.rotate(-config.player.facing);
	config.gfx.context.translate(-renderPosition.x, -renderPosition.y);
	config.gfx.context.stroke()

	//
	const offsetV = Vector.multiply(config.player.velocity, 100)
	const v = Vector.add(renderPosition, offsetV)
	config.gfx.context.strokeStyle = 'red'
	config.gfx.context.beginPath()
	config.gfx.context.moveTo(renderPosition.x + 5, renderPosition.y)
	config.gfx.context.lineTo(v.x + 5, v.y)
	config.gfx.context.stroke()


	//
	const offsetA = Vector.multiply(config.player.acceleration, 100)
	const a = Vector.add(renderPosition, offsetA)
	config.gfx.context.strokeStyle = 'purple'
	config.gfx.context.beginPath()
	config.gfx.context.moveTo(renderPosition.x - 5, renderPosition.y)
	config.gfx.context.lineTo(a.x - 5, a.y)
	config.gfx.context.stroke()


	//
	if (config.player.target !== undefined) {
		const offsetS = steeringForce(config, config.player.target, config.player.maxSpeed)
		const s = Vector.add(renderPosition, offsetS)
		config.gfx.context.strokeStyle = 'white'
		config.gfx.context.beginPath()
		config.gfx.context.moveTo(renderPosition.x, renderPosition.y)
		config.gfx.context.lineTo(s.x, s.y)
		config.gfx.context.stroke()
	}


	//
	const gp = config.player.position
	const lines = [
		'Game Pos:   ' + Math.round(gp.x) + ' : ' + Math.round(gp.y),
		'Render Pos: ' + Math.round(renderPosition.x) + ' : ' + Math.round(renderPosition.y)
	]

	renderLines(config, lines,
		Vector.add(renderPosition, { x: 0, y: r + 24 }),
		{
			fontSize: 20,
			style: 'rgb(255 255 255 / .75)',
			fill: true
		})
}

function renderLines(config, lines, position, options = {}) {
	const { fontSize, style, textAlign, textBaseLine, fill } = {
		fontSize: 12,
		style: 'rgba(0 0 0 / .5)',
		textAlign: 'center',
		textBaseLine: 'middle',
		fill: false,

		...options
	}

	const lineSize = fontSize * 1.2

	config.gfx.context.font = `normal ${fontSize}px sans-serif`
	config.gfx.context.textAlign = textAlign
	config.gfx.context.textBaseline = textBaseLine

	const padding = 2

	lines.forEach((line, i) => {
		const y = position.y + (i * lineSize)

		if(fill) {
			const measure = config.gfx.context.measureText(line)
			config.gfx.context.fillStyle = 'rgba(0 0 0 / .5)'
			config.gfx.context.fillRect(
				position.x - measure.width / 2 - padding,
				y - fontSize / 2 - padding,
				measure.width + 2 * padding,
				fontSize + 2 * padding)
		}

		config.gfx.context.fillStyle = style
		config.gfx.context.fillText(line, position.x, y)
	})
}

function renderTarget(config, target, style) {
	if (target === undefined) { return }

	const renderPosition = Space.gameToRendering(config, target)
	const r = 10
	config.gfx.context.fillStyle = style
	config.gfx.context.beginPath()
	config.gfx.context.ellipse(renderPosition.x, renderPosition.y, r, r, 0, 0, 2 * Math.PI)
	config.gfx.context.fill()

	//
	const line1 = 'Pos: ' + Math.round(target.x) + ' : ' + Math.round(target.y)

	const fontSize = 12
	const textX = renderPosition.x
	const textY = renderPosition.y + r + fontSize
	config.gfx.context.fillStyle = 'rgba(0 0 0 / .5)'
	config.gfx.context.font = `normal ${fontSize}px sans-serif`
	config.gfx.context.textAlign = 'center'
	config.gfx.context.textBaseline = 'middle'
	config.gfx.context.fillText(line1, textX, textY)
}

function renderPlayerTarget(config, renderTime) {
	//
	renderTarget(config, config.player.target, 'grey')

	// future
	if (config.player.future) {
		renderTarget(config, config.player.future.position, 'black')

		const prediction = Vector.add(
			config.player.future.position,
			Vector.multiply(config.player.future.velocity, 10))

		const futureRenderPosition = Space.gameToRendering(config, config.player.future.position)
		const predictionRenderPosition = Space.gameToRendering(config, prediction)

		config.gfx.context.strokeStyle = 'red'
		config.gfx.context.beginPath()
		config.gfx.context.moveTo(futureRenderPosition.x, futureRenderPosition.y)
		config.gfx.context.lineTo(predictionRenderPosition.x, predictionRenderPosition.y)
		config.gfx.context.stroke()
	}
}

function renderField(config) {
	const r = 5

	config.gfx.context.lineWidth = 3

	for(const field of config.flow.field) {
		const fieldGame = Space.tileToGame(config, field)
		const fieldRender = Space.gameToRendering(config, fieldGame)

		config.gfx.context.strokeStyle = 'purple'
		config.gfx.context.beginPath()
		config.gfx.context.ellipse(fieldRender.x, fieldRender.y, r, r, 0, 0, 2 * Math.PI)
		config.gfx.context.stroke()
	}
}

function renderSand(config) {
	// const r = 1

	for(const sand of config.flow.sand) {
		const sandRender = Space.gameToRendering(config, sand.position)

		const h = sand.age / 10
		const a = (sand.age > 200) ? 1 : mapRange(sand.age, 0, 200, 0, 1)
		config.gfx.context.fillStyle = `hsl(${h} 80% 50%)`
		config.gfx.context.strokeStyle = `hsl(${h} 80% 50% / ${a})`

		config.gfx.context.beginPath()
		// config.gfx.context.ellipse(sandRender.x, sandRender.y, r, r, 0, 0, 2 * Math.PI)
		// config.gfx.context.fill()

		const firstRender = Space.gameToRendering(config, sand.first)
		config.gfx.context.moveTo(firstRender.x, firstRender.y)

		config.gfx.context.lineWidth = 2
		for(const foo of sand.lastPositions ?? []) {
			const last = Space.gameToRendering(config, foo)
			config.gfx.context.lineTo(last.x, last.y)
		}

		config.gfx.context.lineTo(sandRender.x, sandRender.y)

		config.gfx.context.stroke()
	}
}

function renderFlow(config, renderTime) {
	renderSand(config)
	renderField(config)
}

export function render(config, renderTime) {
	if (!config?.ok) { return }

	if (config.gfx.bounds === undefined) { bounds(config); return }

	renderBackground(config, renderTime)
	renderSurface(config, renderTime)
	renderFlow(config, renderTime)
	renderBounds(config, renderTime)
	renderPlayerTarget(config, renderTime)
	renderPlayer(config, renderTime)
}


