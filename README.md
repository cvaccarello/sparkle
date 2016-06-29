# Welcome, to :sparkles: Project Sparkle! :sparkles:


# Introduction
Hello All! This is my first attempt at creating public code, so please go easy on me haha.

### What Is This?
This is a particle system that adds and removes html elements to the DOM.  Eventually, I hope to make it optionally work with a canvas element as well, as it can, on average, handle a larger number of particles.

### Why Would I Want to Use This?
You might be asking "why would I want to add particles to the DOM instead of a canvas element??" and the answer is, some times you may want your particles to be overtop of other elements.  When you use a canvas element, or any large overlay on the screen, it would block normal interactive elements like buttons.  Additionally with this system, you could setup a custom, signature particle effect for buttons on your site! Examples below.


# Lets Begin
A few things to note before using this code.  If you have any debugging tools open, like chrome dev tools or firebug, this will likely greatly slow down your particle effect and browser, so just be aware that it won't look quite the same, but it is a good way of simulate slower computers (though a VPN would be better).

I also recommend *no more than 300* particles on the screen at a time.  It will work with many more, infinitely more as far as I know, but this is running on the CPU, not the GPU, so older computers will start to slow down or even freeze, and you shouldn't sacrifice usability for a cool effect :)

You can download this code, clone the repo, or download it via `bower install sparkle`.

### Configuration

#### :sparkles: Particle System :sparkles:
Key | Description
--- | -----------
timeout | a number in milliseconds which represents the time between update intervals for the particle system.  It's unlikely you would ever want to change this, and not recommended to change anyways.

Example:
```
var NewParticleSystem = new ParticleSystem({timeout: 30});
```


#### :sparkles: Particle Emitter :sparkles:
Key | Description
--- | -----------
| element | jquery element to calculate spawn location
| active | status of emitter when initialized (on/off)
| max_particles | max number of particle the emitter can hold
| emit_delay | time between particle emissions (use an object with min & max for a random amount, or a number for consistent particles emissions)
| emit_delay.min | used for random emit setting (minimum amount of delay)
| emit_delay.max | used for random emit setting (maximum amount of delay)
| direction | random direction range to move particles (0 moves up, 90 right, 180 down, 270 left)
| direction.min | min in degrees
| direction.max | max in degrees
| spawn_point | particle spawn location within emitter element ('center', 'random', 'none' - top-left corner)

Example:
```
var NewParticleEmitter = new ParticleEmitter({
	active: false,
	element: $('body'),
	max_particles: 100,
	emit_delay: { min: 100, max: 100 },
	direction: { min: 0, max: 360 },
	spawn_point: 'center'
});
```


#### :sparkles: Particle :sparkles:
Key | Description
--- | -----------
| particle | default particle settings
| particle.constructor | reference to a particle class (this lets you create a custom particle class)
| particle.append_to | jquery element to append the particles to
| particle.template | an html string template to create particles with (this is what you see on the screen and in the DOM)
| particle.time_to_live | lifespan of particles (how long they'll exist before being removed)
| particle.speed | how fast particles will move based on elapsed time in pps (pixels per second)
| particle.size | number to incrementally increase particle element by, based on elapsed time in pps (pixels per second)

Example:
```
var NewParticleEmitter = new ParticleEmitter({
	particle: {
		constructor: Particle,
		append_to: $('body'),
		template: `<div style="width: 5px; height: 5px; background-color: red; z-index: 2;"></div>`,
		time_to_live: 2000,
		speed: 70,
		size: 0
	}
});
```



## Working Demos
- [Basic Test Page](https://cvaccarello.github.io/sparkle/examples/basic.html) - This is as simple as it gets! It creates a particle system, creates a particle emitter, and adds the emitter to the system.
- [Configured Examples](https://cvaccarello.github.io/sparkle/examples/configurations.html) - Several simple particle effects, created with CSS and adjusting the configurations available.
- Advanced Examples - Coming Soon.  Numerous advanced particle effects using images and extended classes.
