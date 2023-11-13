// @ts-check
import { bindHandler } from '@quest/engine/handler.js'
import { bindCommands } from '@quest/engine/commands.js'

async function loadImageBitmap(name) {
	// console.log('load texture', name)
	const image = new Image()
	image.src = name
	await image.decode()
	return createImageBitmap(image)
}

export async function setup(config) {
	//
	if(config.gfx.textures !== undefined) {
		for(const [ key, url ] of Object.entries(config.gfx.textures)) {
			const image = await loadImageBitmap(url)
			config.gfx.textures[key] = image
		}
	}

	//
	if(config.flow?.sand !== undefined) {
		const length = config.flow.sand
		config.flow.sand = Array.from({ length }, () => ({
			position: { x: 0, y: 0 },
			velocity: { x: 0, y: 0 },
			age: 0
		}))
	}


	//
	if(config.flow?.fieldFn === 'noise') {
		config.flow.fieldFn = ({x, y}) => {
			return Math.sin(x * .5) + Math.sin(y * .125) / 2 * 2 * Math.PI
		}
	}

	//
	bindHandler(config)
	bindCommands(config)

	return config
}
