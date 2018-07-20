/*****************************************************************************************************/
/**  Author: Chris A Vaccarello																		**/
/**  Description:  Particle System that controls Particle Emitters which in turn control Particles 	**/
/**  Date: 6/16/16																					**/
/**  Compatibility: FF, Chrome, Edge, IE10+															**/
/*****************************************************************************************************/


/**
 * ParticleSystem class, controls Emitters which in turn control Particles
 */
class ParticleSystem {

	/**
	 * Creates a ParticleSystem object
	 * @param {Object} cfg - default particle system settings
 	 * @deprecated {Number} cfg.timeout - time between update intervals for the particle system
	 * @constructor
 	 */
	constructor(cfg = {}, debug = false) {
		// setup default settings, given configuration
		this._settings = $.extend(true, {
			timeout: 30
		}, cfg);


		/*********************************************************************************
		**  PRIVATE VARIABLES															**
		*********************************************************************************/

		// for debugging purposes (used for console logging)
		this._debug = debug;

		// particle system emitters
		this._particle_emitters = [];


		/*********************************************************************************
		**  INITIALIZE PARTICLE															**
		*********************************************************************************/

		// start a loop for the updating and rendering of emitters and particles
		if (window.requestAnimationFrame) {
			var update = () => { window.setTimeout(() => { this._update(); window.requestAnimationFrame(update); }, this._settings.timeout); }
			update();
		} else {
			window.setInterval(() => { this._update(); }, this._settings.timeout);
		}
	}


	/**
	 * Add a particle emitter to the emitter list for updating/rendering purposes
	 * @returns {class} Emitter - return a reference to emitter in case someone wants to chain function calls together
	 */
	addEmitter(Emitter) {
		this._particle_emitters.push(Emitter);
		return Emitter;
	}

	/**
	 * Remove emitter from the particle system
	 * @param {class} Emitter
	 */
	removeEmitter(Emitter) {
		for (let i=0; i<this._particle_emitters.length; i++) {
			if (Emitter == this._particle_emitters[i]) {
				this._particle_emitters[i].remove();   		// call the emitters remove function (which will call each particles remote function, among other things)
				this._particle_emitters.splice(i, 1);  		// remove this emitter from the particle system
				break;
			}
		}
	}



	/*********************************************************************************
	**  PRIVATE METHODS																**
	*********************************************************************************/

	/**
	 * update each Particle Emitter contained within this Particle System
	 */
	_update() {
		for (let i=0; i<this._particle_emitters.length; i++) {
			let Emitter = this._particle_emitters[i];

			// check if emitter is destroyed/removed, if so remove it from particle system (mostly just cleanup)
			// TODO:  Some day this "destroy" check would be better accomplished with an event listener
			if (Emitter.isDestroyed) {
				this._particle_emitters.splice(i, 1);
				i--;
			} else {
				Emitter.update();
			}
		}
	}
};
