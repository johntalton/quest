import { bindHandler } from './handler.js'
import { bindCommands } from './commands.js'

async function loadImageBitmap(name) {
	const image = new Image()
	image.src = name
	await image.decode()
	return createImageBitmap(image)
}

export async function setup(config) {
	//
	for(const [ key, url ] of Object.entries(config.gfx.textures)) {
		const image = await loadImageBitmap(url)
		config.gfx.textures[key] = image
	}

	//
	const length = config.flow.sand
	config.flow.sand = Array.from({ length }, () => ({
		position: { x: 0, y: 0 },
		velocity: { x: 0, y: 0 },
		age: 0
	}))

	//
	bindHandler(config)
	bindCommands(config)

	return config
}
