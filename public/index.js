import { setup } from './engine/setup.js'
import { render } from './engine/render.js'
import { update } from './engine/update.js'

async function load(meta) {
	try {
		const response = await fetch(meta.url)
		if(!response.ok) {
			return {
				...meta,
				ok: false,
				pause: true,
				error: `fetch(${meta.url}) - ${response.statusText }`
			}
		}

		const json = await response.json()
		console.log(json)
		return {
			ok: true,
			pause: true,
			...meta,
			...json,
		}
	}
	catch(e) {
		// either fetch:dns error
		//  or json parse error
		return {
			...meta,
			ok: false,
			pause: true,
			error: e.message
		}
	}
}

function observerPauseAttribute(config, target) {
	const handler = (mutationList, observer) => {
		const latest = mutationList.at(-1)

		if(latest.type !== 'attributes') { return }
		if(latest.attributeName !== 'data-pause') { return }

		config.pause = target.hasAttribute('data-pause')

	}

	const observer = new MutationObserver(handler)
	observer.observe(target, {
		attributes: true,
		subtree: false,
		childList: false
	})
}

function observerOpenDialog(target, callback) {
	const observer = new MutationObserver(callback)
	observer.observe(target, {
		attributes: true,
		subtree: false,
		childList: false
	})
}

function handleErrorDialog(config) {
	const dialog = document.getElementById('dialogError')

	if(config.error === undefined) {
		console.log('no error close and return')
		dialog.close()
		return
	}

	const messageOut = document.getElementById('dialogErrorMessage')
	messageOut.value = config.error
	dialog.showModal()

}

function setupUI(config) {
	const snapshotDialog = document.getElementById('dialogSnapshot')
	const snapshotList = document.getElementById('snapshotsList')
	const template = snapshotList.querySelector('template')

	observerOpenDialog(snapshotDialog, event => {
		if(config.saves === undefined) { return }

		snapshotList.querySelectorAll('li').forEach(li => li.remove())
		console.log('Load Snapshot')
		snapshotList.append(...config.saves.map(save => {
			// const li = document.createElement('li')
			const li = template.content.cloneNode(true)
			const name = li.querySelector('slot[name="name"]')
			name.innerText = save.name

			const desc = li.querySelector('slot[name="description"]')
			desc.innerText = save.description ?? ''

			const icon = li.querySelector('slot[name="icon"]')
			icon.innerText = save.icon ?? ''

			const button = li.querySelector('button[part="button"]')
			button.addEventListener('click', event => {
				console.log('Handle', save.name)
				button.disabled = true

				const form = button.closest('form')
				form.submit()

				//
				document.getElementById('canvas').toggleAttribute('data-pause')

			}, { once: true })

			return li
		}))
	})

	snapshotDialog.showModal()
}

import { Vector } from './lib/vector.js'
let was = false
let debouncePause = Date.now()

function input(config, time) {
	// if(config.gfx.gamepad === undefined) { return }

	const gamepads = navigator.getGamepads()
	if(gamepads[0] == null) { return }
	const { axes, buttons } = gamepads[0]

	if(buttons[0].value === 1) {
		const heading = Vector.from(config.player.facing)
		config.player.acceleration = Vector.limit(Vector.add(
			config.player.acceleration,
			Vector.multiply(heading, .1)
		), 1)
		was = true
	 }
	else if(was) { config.player.acceleration = Vector.origin(); was = false }
	// console.log(axes)

	const adjustment = axes[0] / 10
	if(Math.abs(adjustment) > 0.01) config.player.facing += adjustment


	if(buttons[13].value === 1 && (Date.now() - debouncePause > .25 * 1000)) {
		debouncePause = Date.now()
		config.pause = true
		document.getElementById('canvas').toggleAttribute('data-pause')
	}

	// for(const button of buttons) {
	// 	if(!button.pressed) continue
	// 	console.log(button)
	// }
}

async function onContentLoaded() {
	const configLink = document.getElementById('config')
	if(configLink === null) {
		throw new Error('no config <link> tag in document')
	}
	console.log('load config from', configLink.href)
	const metaConfig = {
		url: configLink.href
	}

	//
	const config = await load(metaConfig)

	//
	setupUI(config)

	//
	handleErrorDialog(config)

	//
	const viewport = document.getElementById('viewport')
	const canvas = document.getElementById('canvas')
	const context = canvas.getContext('2d', {
		alpha: true,
		colorSpace: 'display-p3'
	})

	if(config.gfx === undefined) { config.gfx = {} }
	config.gfx.viewport = viewport
	config.gfx.canvas = canvas
	config.gfx.context = context

	await setup(config)

	observerPauseAttribute(config, canvas)

	const curryRenderer = (config, render) => (time) => {
		input(config, time)
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




