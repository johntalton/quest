import { Space } from '../lib/space.js'
import { Vector } from '../lib/vector.js'

function handleMouseClick(config, event) {
	// console.log(config)

	if(!config?.ok) { return }
	if (config.gfx.bounds === undefined) { return }

	const { clientX, clientY, offsetX, offsetY, screenX, screenY } = event

	const location = Space.renderToGame(config, {
		x: event.offsetX,
		y: event.offsetY
	})

	config.player.target = location

	// console.log(location)
}

function handleTouchEnd(config, event) {
	console.log('proxy touch')
	handleMouseClick(config, event)
}

function handleMouseMove(config, event) {
	if(!config?.ok) { return }
	if (config.gfx.bounds === undefined) { return }

	const position = Space.renderToGame(config, {
		x: event.offsetX,
		y: event.offsetY
	})

	const velocity = {
		x: event.movementX,
		y: event.movementY
	}

	if(event.shiftKey) {
		// console.log(velocity)

		config.player.future = {
			position,
			velocity
		}
	}
}

function handleKeyUp(config, event) {
	if(!config?.ok) { return }
	// if (config.gfx.bounds === undefined) { return }

	if(event.key === 'ArrowUp') {
		config.player.acceleration = Vector.origin()
	}

	if(!event.shiftKey) {
		config.player.future = undefined
		config.player.acceleration = Vector.origin()
	}
}

function handleKeyDown(config, event) {
	if(!config?.ok) { return }
	// if (config.gfx.bounds === undefined) { return }

	const key = event.key

	if(key === 'ArrowLeft' || key === 'ArrowRight') {
		// console.log('turn')
		const adjustment = key === 'ArrowLeft' ? -.25 : .25
		config.player.facing += adjustment
	}

	if(key === 'ArrowUp') {
		// console.log('accelerate')

		const heading = Vector.from(config.player.facing)

		config.player.acceleration = Vector.limit(Vector.add(
			config.player.acceleration,
			Vector.multiply(heading, 1)
		), 1)
	}
}

export function bindHandler(config) {
	window.addEventListener('click', event => {
		handleMouseClick(config, event)
	})

  window.addEventListener('mousemove', event => {
    handleMouseMove(config, event)
  })

  window.addEventListener('keydown', event => {
    handleKeyDown(config, event)
  })

	window.addEventListener('keyup', event => {
		handleKeyUp(config, event)
	})

	window.addEventListener('touchend', event => {
		handleTouchEnd(config, event)
	})
}
