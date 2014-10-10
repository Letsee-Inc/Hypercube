jQuery.browser = {};
(function () {
    jQuery.browser.msie = false;
    jQuery.browser.version = 0;
    if (navigator.userAgent.match(/MSIE ([0-9]+)\./)) {
        jQuery.browser.msie = true;
        jQuery.browser.version = RegExp.$1;
    }
})();

var cube;
var tempQ;
var completedCounter = 0;

function initPlane() {
	// create color picker
	$('#picker').farbtastic({ callback: function(e) {
	    var c = hexToRgb(e);
		var h = rgbToHsl(c.r,c.g,c.b);
		var r = hslToRgb(h.h,h.s,h.l);
	    var rgb = 'rgb('+r.r+','+r.g+','+r.b+')';
            	
        updateHTML5LogoColor(rgb, e);
	}, width: 130 } );
	
	// create weather	    
	openWeather('Seoul', 1);
	openWeather('Paris', 2);
	openWeather('Sidney', 3);
	openWeather('Tokyo', 4);
	openWeather('London', 5);
}

function bindRotateEvent() {
	tempQ = new THREE.Quaternion();
    cube = document.getElementById("cube");
    
    $(".ar-renderer").swipe( {
        swipe: function(event, direction, distance, duration, fingerCount) {
        	event.preventDefault();
        	if (event.target.className !== "ar-renderer") return;

			if (direction === "left") turnLeft();
            if (direction === "right") turnRight();
            if (direction === "up") turnUp();
            if (direction === "down") turnDown();
                     
        }, 
        doubleTap: function(event, target) {
        	event.preventDefault();
        	if (event.target.className !== "ar-renderer") return;
        	
          	rotateZ();
        },
        tap: function(event, target) { },
        threshold: 0
    } );
}

function onTrackStart() {
	// create canvas animation
	initTrail(500, 500);
	
	// create coverflow
	$("#coverflow").flipster({ style: 'carousel', start: 0 });

    // create google maps
    navigator.geolocation.getCurrentPosition( function(p) { 
		var location = p.coords;
		var latlng = new google.maps.LatLng(location.latitude, location.longitude);
		var mapOptions = {
			zoom: 17,
			center: latlng,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};

		var map = new google.maps.Map(document.getElementById("map"), mapOptions);
	});
	
	// remove trackstart event
	letsee.removeEventListener( "trackstart", "targets/lasmeninas", onTrackStart );
}

function trySwiperStart() {
	if(completedCounter == 5)
	var mySwiper = new Swiper('.swiper-container', { mode:'horizontal', loop: true });
}

function openWeather(place, num) {
	var wrapper = document.getElementById('weather-wrapper' + num);
	$('.weather-temperature', wrapper).openWeather({
		city: place,
		windSpeedTarget: '#weather-wind-speed' + num,
		humidityTarget: '#weather-humidity' + num,
		sunriseTarget: '#weather-sunrise' + num,
		sunsetTarget: '#weather-sunset' + num,
		placeTarget: '#weather-place' + num,
		iconTarget: '#weather-icon' + num,
		customIcons: 'js/vendor/open-weather/images/icons/weather/',
		success: function() {
			$('#weather-wrapper'+num).show();
			var temp = $('#weather-temperature' + num); 
			temp.html(parseInt(temp.text()) + '°');
			var place = $('#weather-place' + num);
			place.html(place.text().split(',')[0]);
			var sunrise = $('#weather-sunrise' + num);
			sunrise.html(sunrise.text().toLowerCase());
			var sunset = $('#weather-sunset' + num);
			sunset.html(sunset.text().toLowerCase());
			var imgSrc = $('#weather-icon' + num).attr('src');
			if(imgSrc.indexOf('night') >= 0) {
				wrapper.style.backgroundImage = "url('js/vendor/open-weather/images/n_bg.jpg')";
			}
			else {
				wrapper.style.backgroundImage = "url('js/vendor/open-weather/images/d_bg.jpg')";
			}
			completedCounter++;
			trySwiperStart();
		},
		error: function(message) {
			console.log(message);
		}
	});
}

function updateHTML5LogoColor( color1, color2 ){
	var svgDoc = document.getElementById("html5_svg").contentDocument;
	if (svgDoc !== null && svgDoc.getElementById("darkshade") !== null) {
		var darkshade = svgDoc.getElementById("darkshade").style;
		var lightshade = svgDoc.getElementById("lightshade").style;
	
		darkshade.setProperty("fill", color1, "");
		lightshade.setProperty("fill", color2, "");
	}
};

function hslToRgb(h, s, l) {
    var r, g, b;

    if (s == 0) {
       	 r = g = b = l; // achromatic
    } else {
        function hue2rgb(p, q, t) {
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return { r:parseInt(r*255), g:parseInt(g*255), b:parseInt(b*255) };
}

function rgbToHsl(r, g, b) {
	r /= 255, g /= 255, b /= 255;
	var max = Math.max(r, g, b), min = Math.min(r, g, b);
	var h, s, l = (max + min) / 2;

	if (max == min) {
		h = s = 0; // achromatic
	} else {
		var d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
          
		switch (max) {
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}
		h /= 6;
	}    
	return {h:h, s:s, l:l*.8};
}  

function hexToRgb(hex) {
	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}

function roundXL(q, digits) {
	var x = q._x;
	var y = q._y;
	var z = q._z;
	var w = q._w;

	q._x = parseFloat(x.toFixed(digits))
	q._y = parseFloat(y.toFixed(digits))
	q._z = parseFloat(z.toFixed(digits))
	q._w = parseFloat(w.toFixed(digits))

	return q;
}

function rotateZ() {
	var mRotate = new THREE.Matrix4();
	mRotate.makeRotationZ( degree_to_radians(90) );

	var mQ = new THREE.Quaternion();
	mQ.setFromRotationMatrix(mRotate);

	mQ.multiply(tempQ);
	mQ = roundXL(mQ, 5);
	tempQ = mQ;

	var m = new THREE.Matrix4();
	m.makeRotationFromQuaternion(mQ);
	
	var arr = Array.prototype.slice.call(m.elements);
	cube.style.WebkitTransform = "matrix3d(" + arr.join() + ")";
}

function turnLeft() {
	var mRotate = new THREE.Matrix4();
	mRotate.makeRotationY( degree_to_radians(-90) );

	var mQ = new THREE.Quaternion();
	mQ.setFromRotationMatrix(mRotate);

	mQ.multiply(tempQ);
	mQ = roundXL(mQ, 5);
	tempQ = mQ;

	var m = new THREE.Matrix4();
	m.makeRotationFromQuaternion(mQ);
	
	var arr = Array.prototype.slice.call(m.elements);
	cube.style.WebkitTransform = "matrix3d(" + arr.join() + ")";
}

function turnUp() {
	var mRotate = new THREE.Matrix4();
	mRotate.makeRotationX( degree_to_radians(90) );

	var mQ = new THREE.Quaternion();
	mQ.setFromRotationMatrix(mRotate);

	mQ.multiply(tempQ);
	mQ = roundXL(mQ, 5);
	tempQ = mQ;

	var m = new THREE.Matrix4();
	m.makeRotationFromQuaternion(mQ);
	
	var arr = Array.prototype.slice.call(m.elements);
	cube.style.WebkitTransform = "matrix3d(" + arr.join() + ")";
}

function turnDown() {
	var mRotate = new THREE.Matrix4();
	mRotate.makeRotationX( degree_to_radians(-90) );

	var mQ = new THREE.Quaternion();
	mQ.setFromRotationMatrix(mRotate);

	mQ.multiply(tempQ);
	mQ = roundXL(mQ, 5);
	tempQ = mQ;

	var m = new THREE.Matrix4();
	m.makeRotationFromQuaternion(mQ);
	
	var arr = Array.prototype.slice.call(m.elements);
	cube.style.WebkitTransform = "matrix3d(" + arr.join() + ")";
}

function turnRight() {
	var mRotate = new THREE.Matrix4();
	mRotate.makeRotationY( degree_to_radians(90) );

	var mQ = new THREE.Quaternion();
	mQ.setFromRotationMatrix(mRotate);

	mQ.multiply(tempQ);
	mQ = roundXL(mQ, 5);
	tempQ = mQ;

	var m = new THREE.Matrix4();
	m.makeRotationFromQuaternion(mQ);
	
	var arr = Array.prototype.slice.call(m.elements);
	cube.style.WebkitTransform = "matrix3d(" + arr.join() + ")";
}

function degree_to_radians(degree) {
    return degree * (Math.PI/180);
}

function radians_to_degree(radians) {
	return radians * (180/Math.PI);
}
