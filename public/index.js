import { setup } from './engine/setup.js'
import { render } from './engine/render.js'
import { update } from './engine/update.js'

const metaConfig = {
	url: './config.json'
}

async function load(meta) {
	const response = await fetch(meta.url)
	if(!response.ok) {
		return {
			...meta,
			ok: false,
			error: `fetch(${url}) - ${response.statusText() }`
		}
	}

 	const json = await response.json()
	return {
		ok: true,
		...meta,
		...json,
	}
}

async function onContentLoaded() {
	const config = await load(metaConfig)

	const viewport = document.getElementById('viewport')
	const canvas = document.getElementById('canvas')
	const context = canvas.getContext('2d', {
		alpha: true,
		colorSpace: 'display-p3'
	})

	config.gfx.viewport = viewport
	config.gfx.canvas = canvas
	config.gfx.context = context

	await setup(config)

	const curryRenderer = (config, render) => (time) => {
		update(config, time)
		render(config, time)

		requestAnimationFrame(curryRenderer(config, render))
		// setTimeout(() => requestAnimationFrame(curryRenderer(config, render)), 1000 * 1)
	}

	requestAnimationFrame(curryRenderer(config, render))
}

const syncOnContentLoaded = () => {
	onContentLoaded()
		.catch(console.warn)
}

(document.readyState === 'loading') ?
	document.addEventListener('DOMContentLoaded', syncOnContentLoaded) :
	syncOnContentLoaded()




