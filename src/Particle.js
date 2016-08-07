/*****************************************************************************************************/
/**  Author: Chris A Vaccarello																		**/
/**  Description:  A Particle class for controlling how a single particle behaves					**/
/**  Date: 6/16/16																					**/
/**  Compatibility: FF, Chrome, Edge, IE10+															**/
/*****************************************************************************************************/


/**
 * Particle class
 */
class Particle {

	/**
	 * Create a Particle object
	 * @param {Object} spawn_point - x, y spawn point of particle
	 * @param {Number} spawn_point.x
	 * @param {Number} spawn_point.y
	 * @param {Number} direction - direction to move particle in radians
	 * @param {Object} cfg - default particle settings
 	 * @property {jQuery} cfg.append_to - element to append particles to
 	 * @property {String} cfg.template - an html string template to create particles with
 	 * @property {Number} cfg.time_to_live - lifespan of particles (how long they'll exist before being removed)
 	 * @property {Number} cfg.speed - how fast particles will move based on elapsed time in pps (pixels per second)
 	 * @property {Number} cfg.size - number to incrementally increase particle element by, based on elapsed time in pps (pixels per second)
	 * @constructor
	 */
	constructor(spawn_point, direction, cfg = {}, debug = false) {
		// setup default settings, given configuration
		this._settings = $.extend(true, {
			append_to: $('body'),
			template: `<div style="width: 5px; height: 5px; background-color: red; z-index: 2;"></div>`,
			time_to_live: 2000,
			speed: 10,
			size: 0
		}, cfg);

		// create a DOM object given a template, and hide so that it has dimension, but can't be seen until positioned
		this.$element = $(this._settings.template).css('visibility', 'hidden');

		// append particle element to an element on the page
		this.$element.appendTo(this._settings.append_to);

		// get width and height of element for positioning purposes
		this.width = this.$element.width();
		this.height = this.$element.height();

		this.size = this._settings.size;
		this.speed = this._settings.speed;

		// convert the global spawn_point coordinates into their appropriate local coordinates (based off the closest positioned parent)
		var local_coords = this.$element.offsetParent().offset();
		this.coordinates = {x: spawn_point.x - local_coords.left, y: spawn_point.y - local_coords.top};


		/*********************************************************************************
		**  PRIVATE VARIABLES															**
		*********************************************************************************/

		// for debugging purposes (used for console logging)
		this._debug = debug;

		// OPTIMIZATION: velocity/movement amount based on speed and direction
		this._vx = this.speed * (Math.cos(direction));
		this._vy = this.speed * (-Math.sin(direction));

		// how long the particle will exist before it's removal
		this._ttl = this._settings.time_to_live;



		/*********************************************************************************
		**  INITIALIZE PARTICLE															**
		*********************************************************************************/

		// set visibility so that the particle can now be seen (it was hidden until position calculations were complete)
		this.$element.css({
			'position': 'absolute',
			'visibility': 'visible'
		});

		// render the particle
		this._render();
	};


	/**
	 * @param {Number} elapsed_time - how long since the emitter/particle was last updated
	 */
	update(elapsed_time) {
		// adjust particles time to live value (life time)
		this.reduceTTL(elapsed_time);

		// adjust particles coordinates
		this.move(elapsed_time);

		// adjust width & height based on size increase/decrease setting
		this.width += this.size * elapsed_time;
		this.height += this.size * elapsed_time;

		// render element (update in dom)
		this._render();
	};


	/**
	 * Reduce the particles life based on elapsed time
	 * @param elapsed_time
	 */
	reduceTTL(elapsed_time) {
		this._ttl -= elapsed_time;
	};

	/**
	 * Move particle based on speed, direction, and time since last update
	 * @param elapsed_time
	 */
	move(elapsed_time) {
		this.coordinates.x += this._vx * elapsed_time;
		this.coordinates.y += this._vy * elapsed_time;
	};

	/**
	 * Remove this particle element from the DOM
	 */
	remove() {
		this.$element.remove();
	};

	/**
	 * Get this particles remaining Time To Live
	 * @returns {Number}
	 */
	get TTL() {
		return this._ttl;
	};


	/**
	 * Render the particle in the dom
	 */
	 _render() {
		// TODO:  look into rendering to a canvas
 		this.$element.css({
 			'top': (this.coordinates.y - (this.width / 2)) + 'px',
 			'left': (this.coordinates.x - (this.height / 2)) + 'px',
 			'width': this.width + 'px',
 			'height': this.height + 'px'
 		});
 	};
};
