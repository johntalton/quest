// @ts-check
import { setup } from '@quest/engine/setup.js'
import { render } from '@quest/engine/render.js'
import { update } from '@quest/engine/update.js'
import { Vector } from '@quest/lib/vector.js'

/**
 * @typedef {{ url: string }} MetaConfig
 *
 * @typedef {{
* }} PreGraphics

 * @typedef {{
 *  viewport: HTMLElement,
 * 	canvas: HTMLCanvasElement,
 * 	context: RenderingContext
 * }} Graphics
 *
 * @typedef {{  }} Player
 *
 * @typedef {{ ok: boolean, error?: string, pause: boolean, player: Player }} CommonConfig
 * @typedef {CommonConfig & {
 * 	gfx: PreGraphics,
 * }} PreConfig
 *
 * @typedef {CommonConfig & {
 * 	gfx: Graphics
 * }} Config
 */

/**
 * @param {MetaConfig} meta
 * @returns {Promise<PreConfig>}
 */
async function load(meta) {
	const base = {
		gfx: {
			viewport: null,
			canvas: null,
			context: null
		},
		world: {},
		player: {}
	}
	try {
		const response = await fetch(meta.url)
		if(!response.ok) {
			return {
				...base,
				...meta,
				ok: false,
				pause: true,
				error: `fetch(${meta.url}) - ${response.statusText }`
			}
		}

		const json = await response.json()
		// console.log(json)
		return {
			...base,
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
			...base,
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
	if(!(dialog instanceof HTMLDialogElement)) { throw new Error('dialog is not a dialog') }

	if(config.error === undefined) {
		// console.log('no error close and return')
		dialog.close()
		return
	}

	const messageOut = document.getElementById('dialogErrorMessage')
	if(!(messageOut instanceof HTMLOutputElement)) { throw new Error('ouput is not an output') }
	messageOut.value = config.error
	dialog.showModal()

}

function setupUI(config) {
	const snapshotDialog = document.getElementById('dialogSnapshot')
	if(snapshotDialog === null) { throw new Error('undefined Snapshot dialog element')}
	if(!(snapshotDialog instanceof HTMLDialogElement)) { throw new Error('dialog is not a dialog') }

	const snapshotList = document.getElementById('snapshotsList')
	if(snapshotList === null) { throw new Error('undefined Snapshot list element')}

	const template = snapshotList.querySelector('template')
	if(template === null) { throw new Error('missing list template') }

	observerOpenDialog(snapshotDialog, event => {
		if(config.saves === undefined) { return }

		snapshotList.querySelectorAll('li').forEach(li => li.remove())
		// console.log('Load Snapshot')
		snapshotList.append(...config.saves.map(save => {
			// const li = document.createElement('li')
			const li = template.content.cloneNode(true)
			if(!(li instanceof DocumentFragment)) { throw new Error('template must be a element root') }

			// if(li === null) { throw new Error('f') }
			const name = li.querySelector('slot[name="name"]')
			if(name !== null && name instanceof HTMLElement) { name.innerText = save.name }

			const desc = li.querySelector('slot[name="description"]')
			if(desc !== null && desc instanceof HTMLElement) { desc.innerText = save.description ?? '' }

			const icon = li.querySelector('slot[name="icon"]')
			if(icon !== null && icon instanceof HTMLElement) { icon.innerText = save.icon ?? '' }

			const button = li.querySelector('button[part="button"]')
			if(button !== null && button instanceof HTMLButtonElement) {
				button.addEventListener('click', event => {
					// console.log('Handle', save.name)
					button.disabled = true

					const form = button.closest('form')
					if(form !== null && form instanceof HTMLElement) { form.submit() }

					//
					config.gfx.canvas.toggleAttribute('data-pause')

				}, { once: true })
			}

			return li
		}))
	})

	snapshotDialog.showModal()
}

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
		config.gfx.canvas.toggleAttribute('data-pause')
	}

	// for(const button of buttons) {
	// 	if(!button.pressed) continue
	// 	console.log(button)
	// }
}

/**
 * @param {PreConfig} config
 * @returns {Config}
 */
function bindGFX(config) {
	const viewport = document.getElementById('viewport')
	if(viewport === null) { throw new Error('undefined viewport element') }
	const canvas = document.getElementById('canvas')
	if(canvas === null) { throw new Error('undefined canvas element') }
	if(!(canvas instanceof HTMLCanvasElement)) { throw new Error('canvas is not a ... well, canvas') }
	const context = canvas.getContext('2d', {
		alpha: true,
		colorSpace: 'display-p3'
	})
	if(context === null) { throw new Error('not able to create context') }

	// if(config.gfx === undefined) { config.gfx = {} }
	// config.gfx.viewport = viewport
	// config.gfx.canvas = canvas
	// config.gfx.context = context

	const gfx = config?.gfx ?? {}
	return {
		...config,
		gfx: {
			...gfx,
			viewport, canvas, context
		}
	}
}


async function onContentLoaded() {
	const configLink = document.getElementById('config')
	if(configLink === null) { throw new Error('no config <link> tag in document') }
	if(!(configLink instanceof HTMLLinkElement)) { throw new Error('link is not a link') }

	const metaConfig = {
		url: configLink.href
	}

	//
	const preConfig = await load(metaConfig)

	//
	const config = bindGFX(preConfig)

	//
	setupUI(config)

	//
	handleErrorDialog(config)


	//
	await setup(config)

	observerPauseAttribute(config, config.gfx.canvas)

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




