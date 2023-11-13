// @ts-check
import { Space } from '@quest/lib/space.js'
import { Vector } from '@quest/lib/vector.js'

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

	if(key === ' ') {
		config.pause = !config.pause
		document.getElementById('canvas').toggleAttribute('data-pause', config.pause)
		if(config.pause) { document.getElementById('dialogPause').showModal() }
		else { document.getElementById('dialogPause').close() }
	}

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
	config.gfx.canvas.addEventListener('click', event => {
		handleMouseClick(config, event)
	})

  config.gfx.canvas.addEventListener('mousemove', event => {
    handleMouseMove(config, event)
  })

  window.addEventListener('keydown', event => {
    handleKeyDown(config, event)
  })

	window.addEventListener('keyup', event => {
		handleKeyUp(config, event)
	})

	config.gfx.canvas.addEventListener('touchend', event => {
		handleTouchEnd(config, event)
	})

	// const controllers = navigator.getGamepads()
	// console.log(controllers)

	window.addEventListener("gamepadconnected", event => {
		console.log('gamepad connected', event.gamepad)
		config.gfx.gamepad = event.gamepad
	})
}
