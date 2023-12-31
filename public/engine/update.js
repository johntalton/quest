// @ts-check
import { Vector } from '@quest/lib/vector.js'
import { steeringForce } from '@quest/lib/util.js'
import { Space } from '@quest/lib/space.js'

export function update(config, renderTime) {
	if(!config?.ok) { return }

	if(!config.pause) {
		// gravity
		// config.player.acceleration = Vector.add(config.player.acceleration, { x: 0, y: .001 })

		// dampen
		config.player.acceleration = Vector.multiply(config.player.acceleration, config.world.accelerationDampening)
		config.player.velocity = Vector.multiply(config.player.velocity, config.world.velocityDampening)

		// update
		config.player.velocity = Vector.add(config.player.velocity, config.player.acceleration)
		config.player.position = Vector.add(config.player.position, config.player.velocity)

		// steer
		if (config.player.target !== undefined) {
			const steering = steeringForce(config, config.player.target)
			const mag = Vector.magnitude(steering)

			const d = 10
			if (mag < d) {
				config.player.acceleration = Vector.origin()
			}
			else {
				const amp = 1
				config.player.acceleration = Vector.limit(Vector.add(
					config.player.acceleration,
					Vector.multiply(Vector.normalize(steering), amp)), config.world.accelerationLimit)
			}
		}

		// repel
		if (config.player.repel !== undefined) {
			const steering = Vector.negate(steeringForce(config, config.player.repel))
			const amp = 1 / (Vector.magnitude(steering) * 1)

			config.player.acceleration = Vector.limit(Vector.add(
				config.player.acceleration,
				Vector.multiply(Vector.normalize(steering), amp)), config.world.accelerationLimit)
		}

		// future
		if (config.player.future !== undefined) {
			const steering = steeringForce(config, config.player.future.position)
			//const amp = 1 / (Vector.magnitude(steering) * 1)

			config.player.acceleration = Vector.limit(Vector.add(
				config.player.acceleration,
				Vector.multiply(Vector.normalize(steering), 1)), config.world.accelerationLimit)
		}
	}

	// auto cancel
	if (config.player.target !== undefined) {
		const diff = Vector.subtract(config.player.position, config.player.target)
		if (Vector.magnitude(diff) < 50 && (Vector.magnitude(config.player.velocity) < 0.125)) {
			console.log('clear')
			config.player.target = undefined
			config.player.velocity = Vector.origin()
			config.player.acceleration = Vector.origin()
		}
	}

	// world bounding
	if (config.player.position.x > (config.world.origin.x + config.world.bounds.width)) {
		config.world.origin.x = config.player.position.x - config.world.bounds.width
	}

	if (config.player.position.x < config.world.origin.x) {
		config.world.origin.x = config.player.position.x
	}

	if (config.player.position.y > (config.world.origin.y + config.world.bounds.height)) {
		config.world.origin.y = config.player.position.y - config.world.bounds.height
	}

	if (config.player.position.y < config.world.origin.y) {
		config.world.origin.y = config.player.position.y
	}

	// field point capture
	if(config.player.inventory !== undefined) {
		config.player.inventory.x = Space.gameToTile(config, config.player.position).x
		config.player.inventory.y = Space.gameToTile(config, config.player.position).y
	}
	else {
		for(const field of config.flow.field) {
			const fieldGame = Space.tileToGame(config, field)
			const distanceToField = Vector.magnitude(Vector.subtract(config.player.position, fieldGame))

			if(distanceToField < 40) {
				config.player.inventory = field
			}
		}
	}


	if(!config.pause) {
		// sand
		for(const sand of config.flow.sand) {
			// const accumulator = config.flow.field.reduce((acc, f) => {
			// 	const fg = Space.tileToGame(config, f)
			// 	const offset = Vector.subtract(fg, sand.position)
			// 	const d = Vector.magnitude(offset)
			// 	const t = Vector.multiply(offset, 1 / d)
			// 	return Vector.add(acc, t)
			// }, { x: 0, y: 0 })

			const sandTile = Space.gameToTile(config, sand.position)
			const start = Vector.add(sandTile, { x: -5, y: -5 })
			const end = Vector.add(sandTile, { x: 5, y: 5 })

			let accumulator = { x: 0, y: 0 }
			for(let y = start.y; y < end.y; y++) {
				for(let x = start.x; x < end.x; x++) {
					const fg = Space.tileToGame(config, { x, y })

					const value = config.flow.fieldFn({ x, y })
					const v = Vector.from(value)

					const offset = Vector.subtract(sand.position, fg)
					const d = Vector.magnitude(offset) * 10000
					const t = Vector.multiply(v, 1 / d)

					accumulator = Vector.add(accumulator, t)
				}
			}

			const acc = Vector.normalize(accumulator)

			if(sand.lastPositions === undefined) { sand.lastPositions = [ ] }
			else sand.lastPositions.push(sand.position)


			sand.velocity = Vector.multiply(Vector.add(sand.velocity, acc), .95)
			sand.position = Vector.add(sand.position, sand.velocity)
			sand.age -= 1

			if(sand.age <= 0) {
				const posDelta = { x: Math.random() * 200 - 100, y: Math.random() * 200 - 100 }
				const pos = Vector.add(config.player.position, posDelta)
				sand.first = pos
				sand.position = pos
				sand.velocity = { x: Math.random() * 1, y: Math.random() * 1 }
				sand.age = 1000 + Math.random() * 1000
				sand.lastPositions = undefined
			}
		}
	}
}