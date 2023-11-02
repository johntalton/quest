
export function bindCommands(config) {
	globalThis.goto = (x, y) => {
		config.player.position = { x, y }
		config.player.acceleration = { x: 0, y: 0 }
		config.player.velocity = { x: 0, y: 0 }
	}

	globalThis.mark = (x, y) => {
		config.player.target = { x, y }
	}
}
