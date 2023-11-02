import { Vector } from './vector.js'

export function steering(position, velocity, target) {
	return Vector.subtract(Vector.subtract(target, position), velocity)
}

export function steeringForce(config, target) {
	return steering(config.player.position, config.player.velocity, target)
}

