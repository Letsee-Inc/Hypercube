/**
 * With love.
 * http://hakim.se/experiments/
 * http://twitter.com/hakimel
 */

var SCREEN_WIDTH;
var SCREEN_HEIGHT;

var RADIUS = 110;

var RADIUS_SCALE = 1;
var RADIUS_SCALE_MIN = 1;
var RADIUS_SCALE_MAX = 1.5;

// The number of particles that are used to generate the trail
var QUANTITY = 25;

var canvas;
var context;
var particles;

var mouseX = 0;
var mouseY = 0;
var mouseIsDown = false;

function initTrail(width, height) {
	SCREEN_WIDTH = width;
	SCREEN_HEIGHT = height;	

	canvas = document.getElementById( 'world' );
	canvas.width = SCREEN_WIDTH;
	canvas.height = SCREEN_HEIGHT;
	
	if (canvas && canvas.getContext) {
		context = canvas.getContext('2d');
	
		// Register event listeners
		canvas.addEventListener('touchstart', canvasTouchStartHandler, false);
		canvas.addEventListener('touchmove', canvasTouchMoveHandler, false);
		
		createParticles();
// 		setInterval( loop, 1000 / 60 );
	}
}

function createParticles() {
	particles = [];
	
	for (var i = 0; i < QUANTITY; i++) {
		var particle = {
			position: { x: mouseX, y: mouseY },
			shift: { x: mouseX, y: mouseY },
			size: 1,
			angle: 0,
			speed: 0.01 + Math.random() * 0.2,
			targetSize: 1,
			fillColor: '#' + (Math.random() * 0x404040 + 0xaaaaaa | 0).toString(16),
			orbit: RADIUS*.5 + (RADIUS * .5 * Math.random())
		};
		
		particles.push( particle );
	}
}

function canvasTouchStartHandler(event) {
	if(event.touches.length == 1) {
		event.preventDefault();

		mouseX = event.touches[0].pageX;
		mouseY = event.touches[0].pageY;
	}
}

function canvasTouchMoveHandler(event) {
	if(event.touches.length == 1) {
		event.preventDefault();

		mouseX = event.touches[0].pageX;
		mouseY = event.touches[0].pageY;
	}
}

function renderCanvas() {
	RADIUS_SCALE -= ( RADIUS_SCALE - RADIUS_SCALE_MIN ) * (0.02);
	RADIUS_SCALE = Math.min( RADIUS_SCALE, RADIUS_SCALE_MAX );
	
	// Fade out the lines slowly by drawing a rectangle over the entire canvas
	context.fillStyle = 'rgba(0,0,0,0.05)';
	context.fillRect(0, 0, context.canvas.width, context.canvas.height);
	
	for (i = 0, len = particles.length; i < len; i++) {
		var particle = particles[i];
		
		var lp = { x: particle.position.x, y: particle.position.y };
		
		// Offset the angle to keep the spin going
		particle.angle += particle.speed;
		
		// Follow mouse with some lag
		particle.shift.x += ( mouseX - particle.shift.x) * (particle.speed);
		particle.shift.y += ( mouseY - particle.shift.y) * (particle.speed);
		
		// Apply position
		particle.position.x = particle.shift.x + Math.cos(i + particle.angle) * (particle.orbit*RADIUS_SCALE);
		particle.position.y = particle.shift.y + Math.sin(i + particle.angle) * (particle.orbit*RADIUS_SCALE);
		
		// Limit to screen bounds
		particle.position.x = Math.max( Math.min( particle.position.x, SCREEN_WIDTH ), 0 );
		particle.position.y = Math.max( Math.min( particle.position.y, SCREEN_HEIGHT ), 0 );
		
		particle.size += ( particle.targetSize - particle.size ) * 0.05;
		
		// If we're at the target size, set a new one. Think of it like a regular day at work.
		if( Math.round( particle.size ) == Math.round( particle.targetSize ) ) {
			particle.targetSize = 1 + Math.random() * 7;
		}
		
		context.beginPath();
		context.fillStyle = particle.fillColor;
		context.strokeStyle = particle.fillColor;
		context.lineWidth = particle.size;
		context.moveTo(lp.x, lp.y);
		context.lineTo(particle.position.x, particle.position.y);
		context.stroke();
		context.arc(particle.position.x, particle.position.y, particle.size/2, 0, Math.PI*2, true);
		context.fill();
	}
	
	var img = document.getElementById("tempImage");
	context.drawImage(img, 430, 20);
}