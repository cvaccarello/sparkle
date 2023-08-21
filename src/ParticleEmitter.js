/*****************************************************************************************************/
/**  Author: Chris A Vaccarello																		**/
/**  Description:  Particle Emitters which creates & updates Particles 								**/
/**  Date: 6/16/16																					**/
/**  Compatibility: FF, Chrome, Edge, IE10+															**/
/*****************************************************************************************************/


/**
 * ParticleEmitter class, controls Particles
 */
class ParticleEmitter {

	/**
	 * Creates a ParticleEmitter object with the given configuration.  Note that the settings should not be changed dynamically,
	 *  	as there are some optimization that causes some of the initial configuration settings to become stale.  Changing these
	 *  	settings after the emitter is initialized, would have unintended results.
	 * @param {Object} cfg - default settings for emitter
	 * @property {jQuery} cfg.element - jquery element to calculate spawn location
 	 * @property {Boolean} cfg.active - status of emitter when intiailized (on/off)
 	 * @property {Number} cfg.max_particles - max number of particle the emitter can hold
 	 * @property {Object|Number} cfg.emit_delay - random time between particle emissions or a single constant value
 	 * @property {Number} cfg.emit_delay.min
 	 * @property {Number} cfg.emit_delay.max
 	 * @property {Object|String} cfg.direction - random direction range to move particles, or special string 'in' to aim randomly inwards if spawn_point is 'outside'
 	 * @property {Number} cfg.direction.min - min range in degrees (0 moves up, 90 right, 180 down, 270 left)
 	 * @property {Number} cfg.direction.max - max range in degrees (360 moves up)
	 * @property {String} cfg.spawn_point - particle spawn location within emitter element ('center', 'random', null for top-left corner of element)
 	 * @property {Object} cfg.particle - default particle settings
 	 * @property {Class} cfg.particle.constructor - reference to class (Ex: Particle)
 	 * @property {jQuery} cfg.particle.append_to - element to append particles to
 	 * @property {String} cfg.particle.template - an html string template to create particles with
 	 * @property {Number} cfg.particle.time_to_live - lifespan of particles (how long they'll exist before being removed)
 	 * @property {Number} cfg.particle.speed_amt - how fast particles will move based on elapsed time in pps (pixels per second)
 	 * @property {Number} cfg.particle.size_amt - number to incrementally increase particle element by, based on elapsed time in pps (pixels per second)
 	 * @property {Number} cfg.particle.size - size of particle in canvas
	 * @constructor
	 */
	constructor(cfg = {}, debug = false) {
		// OPTIMIZATION: 1 time calculation
		var radians = -Math.PI / 180;

		// setup default settings, given configuration
		this._settings = $.extend(true, {
			active: false,
			element: $('body'),
			max_particles: 100,
			emit_delay: { min: 100, max: 100 },
			direction: { min: 0, max: 360 },
			spawn_point: 'center',

			particle: {
				constructor: Particle,
				append_to: $('body'),
				template: `<div style="width: 5px; height: 5px; background-color: red; z-index: 2;"></div>`,
				time_to_live: 2000,
				speed_amt: 70,
				size_amt: 0,
				size: 10
			}
		}, cfg);

		// array of particles
		this.particles = [];

		// dom jquery reference to emitter element
		this.$element = this._settings.element;

		// width & height for calculating spawn location within dom $element
		this.width = this.$element.outerWidth();
		this.height = this.$element.outerHeight();

		// check if element is a canvas object
		this.ctx = null;
		if (this.$element.is('canvas')) {
			this.ctx = this.$element[0].getContext('2d');
			this._settings.particle.append_to = this.$element;
		}


		/*********************************************************************************
		**  PRIVATE VARIABLES															**
		*********************************************************************************/

		// for debugging purposes (used for console logging)
		this._debug = debug;

 		// whether or not this emitter is actively emitting particles
 		this._active = this._settings.active;

		// whether or not this emitter has been destroyed/removed
		this._destroyed = false;

		 // remember timeout for trigger callback (to clear when toggling)
		this._triggerCallback = null;

		// initial spawn point offset and position of emitter
		this._spawn_position = {};

		// total delay amount
		this._delay = 0;

		// elapsed time
		this._time = new Date();
		this._elapsed_time = this._time.getTime();

		// OPTIMIZATION: convert direction in degrees to radians (in degree's initially b/c those are easier for people to understand, but radians are required)
		//					also subtract 90 degree's so that 0 is aimed upwards, b/c that too makes more sense
		if (typeof this._settings.direction == 'object') {
			this._settings.direction.min = (this._settings.direction.min - 90) * radians;
			this._settings.direction.max = (this._settings.direction.max - 90) * radians;
		} else if (this._settings.direction == 'in' && this._settings.spawn_point == 'outside') {
			// special case when spawning "outside" to point inwards
			this.left = { min: (180 - 90) * radians, max: (360 - 90) * radians };
			this.right = { min: (0 - 90) * radians, max: (360 - 90) * radians };
			this.up = { min: (-90 - 90) * radians, max: (90 - 90) * radians };
			this.down = { min: (90 - 90) * radians, max: (270 - 90) * radians };
		} else {
			this._settings.direction.min = (0 - 90) * radians;
			this._settings.direction.max = (360 - 90) * radians;
		}


		// OPTIMIZATION: adjust speed & size from seconds to milliseconds (again, seconds are easier to understand than milliseconds, but milliseconds are required)
		if (this._settings.particle.speed_amt > 0) { this._settings.particle.speed_amt /= 1000; }
		if (this._settings.particle.size_amt > 0) { this._settings.particle.size_amt /= 1000; }

		// OPTIMIZATION: create a spawn point relative to the $element ("center" and default "null" here as an optimization, "random" is handled below inside particleSpawnPosition)
		this._spawn_position = {
			x: (this._settings.spawn_point == 'center')? (this.width / 2): 0,
			y: (this._settings.spawn_point == 'center')? (this.height / 2): 0
		};
	}


	/**
	 * update emitter by updating, adding, and removing particles
	 */
	update() {
		// calculate time since last update
		var now = new Date();
		this._elapsed_time = now - this._time;

		// a cap for elapsed time for slower computers, b/c if you don't, you end up not even seeing any particles as the screen updates too slowly
		// the idea is that I'd rather see slow moving particles, than none at all
		if (this._elapsed_time > 500) {
			// TODO: instead of capping elapsed time, find a way to pre-calculate/optimize for the computer in question (by removing particles, capping max particle count, and/or increasing time between emissions)
			if (this._debug) { console.log('Particle System: Capping elapsed time at 500 (was '+this._elapsed_time+')'); }
			this._elapsed_time = 500;
		}

		// only create particles if emitter is set to active
		if (this._active) {
			this._createParticles(this._elapsed_time);
		}

		// update & remove particles by telling them how much time as passed since the last update
		this._updateParticles(this._elapsed_time);

		// reset elapsed time to the current time after all updates have occured
		this._time = (new Date()).getTime();
	}

	/**
	 * Create & append a particle given spawn_point and direction
	 * @param {Object} spawn_point - global coordinates to create particle at
	 * @param {Number} spawn_point.x
	 * @param {Number} spawn_point.y
	 * @param {Number} [direction] - direction in degrees, for particle to move
	 */
	addParticle(spawn_point, direction = null) {
		let min = 0, max = 360;

		// if no direction was given, create a random direction based on settings
		if (!direction && typeof this._settings.direction == 'object') {
			max = this._settings.direction.max;
			min = this._settings.direction.min;
		} else {
			// direction should point inwards if special string 'in' case

			// no direction & spawned top
			if (!direction && spawn_point.location === 'top') {
				max = this.down.max;
				min = this.down.min;
			}

			// no direction & spawned bottom
			if (!direction && spawn_point.location === 'bottom') {
				max = this.up.max;
				min = this.up.min;
			}

			// no direction & spawned left
			if (!direction && spawn_point.location === 'left') {
				max = this.right.max;
				min = this.right.min;
			}

			// no direction & spawned right
			if (!direction && spawn_point.location === 'right') {
				max = this.left.max;
				min = this.left.min;
			}
		}

		if (!direction) {
			direction = (Math.random() * (max - min)) + min;
		}

		// create a particle and append it to list
		this.particles.push(new this._settings.particle.constructor(spawn_point, direction, this._settings.particle, this._debug, this.ctx));
	}

	/**
	 * Trigger this emitter for x amount of time
	 * @param {Number} amount - how long to emit particles for
	 * @param {Function} [callback] - optional function to call when completed
	 */
	trigger(amount, callback) {
		// set this emitter to active state
		this._active = true;

		window.clearTimeout(this._triggerCallback);

		// set up a delay callback to disable the emitter
		this._triggerCallback = window.setTimeout(() => {
			this._active = false;
			if (callback) { callback.call(); }
		}, amount);
	}

	/**
	 * Toggle emitter on/off
	 */
	toggle() {
		// toggle boolean activate status
		this._active = !this._active;

		// clear trigger function's callback, so that toggle and trigger don't conflict as much
		if (this._triggerCallback) { window.clearTimeout(this._triggerCallback); }
	}

	/**
	 * Turn emitter on
	 */
	activate() {
		this._active = true;
	}

	/**
	 * Turn emitter off
	 */
	deactivate() {
		this._active = false;
	}

	/**
	 * Call particles remove function and then remove particle from array
	 */
	remove() {
		this._destroyed = true;
		for (let i=0; i<this.particles.length; i++) {
			this.particles[i].remove();
			this.particles.splice(i, 1);
			i--;
		}
	}

	/**
	 * Calculate & Return the global spawn position of particle
	 * @returns {x: number, y: number}
	 */
	get particleSpawnPosition() {
		var offset = this.$element.offset();
		var spawn_point = {x: offset.left + this._spawn_position.x, y: offset.top + this._spawn_position.y};

		if (this._settings.spawn_point == 'random') {
			spawn_point.x += Math.random() * this.width;
			spawn_point.y += Math.random() * this.height;
		} else if (this._settings.spawn_point == 'outside') {
			if (Math.round(Math.random())) {
				// spawn top or bottom
				spawn_point.x += Math.random() * this.width;

				if (Math.round(Math.random())) {
					spawn_point.y += this.height;
					spawn_point.location = 'bottom';
				} else {
					spawn_point.location = 'top';
				}
			} else {
				// spawn left or right
				spawn_point.y += Math.random() * this.height;

				if (Math.round(Math.random())) {
					spawn_point.x += this.width;
					spawn_point.location = 'right';
				} else {
					spawn_point.location = 'left';
				}
			}
		}

		return spawn_point;
	}

	/**
	 * Check to see if this Emitter is destroyed
	 */
	get isDestroyed() {
		return this._destroyed;
	}



	/*********************************************************************************
	**  PRIVATE METHODS																**
	*********************************************************************************/

	/**
	 * Update and remove particles based on the particles Time To Live (TTL)
	 * @param {Number} elapsed_time
	 */
	_updateParticles(elapsed_time) {
		// clear canvas if emitter is attached to a canvas element
		if (this.ctx) {
			this.ctx.clearRect(0, 0, this.width, this.height);
		}

		for (let i=0; i<this.particles.length; i++) {
			let p = this.particles[i];
			p.update(elapsed_time);

			// call particles remove function to remove element from DOM then remove particle class from particle array
			if (p.TTL <= 0) {
				p.remove();
				this.particles.splice(i, 1);
				i--;
			}
		}
	}

	/**
	 * Create as many particles as the emit_delay & max_particles settings will allow
	 * @param {Number} elapsed_time
	 */
	_createParticles(elapsed_time) {
		// find the emitters exact position to spawn particles at for this update call (changes per update if random)
		var spawn_point = this.particleSpawnPosition;

		// calculate the emit_delay amount for this update call (either a random amount between min/max or a standard number)
		var delay_settings = this._settings.emit_delay;
		var emit_delay = (delay_settings.min || delay_settings.max)?
			(Math.random() * (delay_settings.max - delay_settings.min)) + delay_settings.min:
			delay_settings;

		// create as many particles as the delay & max particle count will allow based on time since last update
		if (this.particles.length < this._settings.max_particles) {
			this._delay -= this._elapsed_time;
			// if emit_delay is 0, loop until all possible particles have been created
			while (this._delay <= 0 && this.particles.length < this._settings.max_particles) {
				this._delay += emit_delay;

				// create & append a particle at the given global spawn coordinates
				this.addParticle(spawn_point);
			}
		}
	}

};
