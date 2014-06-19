"use strict";
/**
 * @author oosmoxiecode - http://oos.moxiecode.com/
 */

var xgui = function ( p ) {

	if (p === undefined) p = {};

	var container, canvas, context;
	var containerId = p.id || "xgui_container";
	var pool = [];
	var mouseDownMap = {}; // hashmap for touch events, indexed by unique ids
	var mouseHitIdMap = {};
	var bgColor = p.backgroundColor || "rgb(100, 100, 100)";
	var frontColor = p.frontColor || "rgb(230, 230, 230)";
	var dimColor = p.dimColor || "rgb(140, 140, 140)";
	var font = "11px Arial";
	var fontsm = "8px Arial";

	var delta;
	var time;
	var oldTime;

	this.width = p.width || 600;
	this.height = p.height || 400;


	container = document.createElement( "div" );
	container.style.position = p.position || "relative";
	container.style.width = ""+this.width+"px";
	container.style.height = ""+this.height+"px";
	container.setAttribute("id", containerId);
	container.style.touchAction = "none";

	canvas = document.createElement("canvas");
	canvas.width = this.width;
	canvas.height = this.height;
	context = canvas.getContext('2d');

	container.appendChild(canvas);

	this.disableEvents = function () {

		// touch events
		document.removeEventListener( 'touchmove', touchMove, false );
		document.removeEventListener( 'touchend', touchEnd, false );
		container.removeEventListener( 'touchstart', touchStart, false );
		
		// mouse events
		document.removeEventListener( 'mousemove', mouseMove, false );
		document.removeEventListener( 'mousedown', mouseDown, false );
		document.removeEventListener( 'mouseup', mouseUp, false );

		// ie events
		container.removeEventListener( 'MSPointerMove', touchMove, false );
		container.removeEventListener( 'MSPointerDown', touchStart, false );
		container.removeEventListener( 'MSPointerUp', touchEnd, false );

	}

	this.enableEvents = function () {

		// touch events
		container.addEventListener( 'touchstart', touchStart, false );

		// mouse events
		container.addEventListener( 'mousedown', mouseDown, false );
		
		// ie events		
		container.addEventListener( 'MSPointerDown', touchStart, false );

	}

	this.enableEvents();


	function touchMove (event) {
		onMouseMove(event, true);
	}

	function touchStart (event) {
		onMouseDown(event, true);

		document.addEventListener( 'touchmove', touchMove, false );
		document.addEventListener( 'touchend', touchEnd, false );

		document.addEventListener( 'MSPointerMove', touchMove, false );
		document.addEventListener( 'MSPointerUp', touchEnd, false );

	}

	function touchEnd (event) {
		onMouseUp(event, true);

		// ie hack
		if (typeof event.changedTouches == "undefined") {
			event.changedTouches = [event];
		}

		if( event.changedTouches.length === 0 ) {
			document.removeEventListener( 'touchmove', touchMove, false );
			document.removeEventListener( 'touchend', touchEnd, false );

			document.removeEventListener( 'MSPointerMove', touchMove, false );
			document.removeEventListener( 'MSPointerUp', touchEnd, false );
		}

	}

	function mouseMove (event) {
		onMouseMove(event);
	}

	function mouseDown (event) {

		onMouseDown(event);

		document.addEventListener( 'mousemove', mouseMove, false );
		document.addEventListener( 'mouseup', mouseUp, false );

	}

	function mouseUp (event) {
		onMouseUp(event);

		// workaround for ColorPicker's
		var o = pool[mouseHitIdMap[0]];

		if (o !== undefined) {
			if (o.name !== "ColorPicker2" && o.name !== "ColorPicker3") {
				document.removeEventListener( 'mousemove', mouseMove, false );
				document.removeEventListener( 'mouseup', mouseUp, false );
			}
		}
	}

	function onMouseMove ( event, isTouchEvent ) {
		
		event.preventDefault();

		var m,o;
		var mouse = event;

		var loopNum = 1;
		var inputid = 0;

		// ie hack
		if (isTouchEvent && typeof event.changedTouches == "undefined") {
			event.changedTouches = [event];
		}

		if (isTouchEvent) loopNum = event.changedTouches.length;

		for (var t = 0; t < loopNum; t++) {

			if (isTouchEvent) {
				mouse = event.changedTouches[t];
				//inputid = mouse.identifier;
				inputid = (typeof mouse.identifier != "undefined") ? mouse.identifier : (typeof mouse.pointerId != "undefined") ? mouse.pointerId : 0;
			}

			if (!mouseDownMap[inputid]) {
				if (mouseHitIdMap[inputid] !== null) {
					o = pool[mouseHitIdMap[inputid]];
					if ( o && (o.name == "ColorPicker2" || o.name == "ColorPicker3")) {
						m = canvas.relativeMouseCoords(mouse);
						//var m = {x: mouse.clientX - mouse.target.offsetLeft, y: mouse.clientY - mouse.target.offsetTop};
						o.mouseMove(m.x-o.x,m.y-o.y);
					}
				}
				return;
			}

			m = canvas.relativeMouseCoords(mouse);
			//var m = {x: mouse.clientX - mouse.target.offsetLeft, y: mouse.clientY - mouse.target.offsetTop};
			o = pool[mouseHitIdMap[inputid]];

			if ( o && o.name == "CheckBox" || o.name == "RadioButton" || o.name == "Button" || o.name == "ImageButton" || o.name == "Matrix") return;
			if ( o && o.name == "Stepper" && (o.mouseDownPlus || o.mouseDownMinus)) {
				return;
			}

			o.mouseDown(m.x-o.x,m.y-o.y);

		}

	}

	function onMouseDown ( event, isTouchEvent ) {

		var mouse = event;

		var loopNum = 1;
		var inputid = 0;

		// ie hack
		if (isTouchEvent && typeof event.changedTouches == "undefined") {
			event.changedTouches = [event];
		}

		if (isTouchEvent) loopNum = event.changedTouches.length;

		for (var t = 0; t < loopNum; t++) {

			if (isTouchEvent) {
				mouse = event.changedTouches[t];
				//inputid = mouse.identifier;
				inputid = (typeof mouse.identifier != "undefined") ? mouse.identifier : (typeof mouse.pointerId != "undefined") ? mouse.pointerId : 0;
			}

			var poolId = mouseHitIdMap[inputid];

			// fix for textfields
			if (event.target == container || event.target == canvas) {
				if (mouseHitIdMap[inputid] !== null) {
					if ( pool[mouseHitIdMap[inputid]] && (pool[mouseHitIdMap[inputid]].name != "InputText" && pool[mouseHitIdMap[inputid]].name != "DropDown")) {
						event.preventDefault();
					}
				} else {
					event.preventDefault();
				}
			}

			var m = canvas.relativeMouseCoords(mouse);
			//var m = {x: mouse.clientX - mouse.target.offsetLeft, y: mouse.clientY - mouse.target.offsetTop};

			for (var i=0; i<pool.length; ++i ) {
				var o = pool[i];
				if (m.x > o.x && m.x < o.x+o.width) {
					if (m.y > o.y && m.y < o.y+o.height) {
						o.mouseDown(m.x-o.x,m.y-o.y);
						mouseDownMap[inputid] = true;
						// check old id
						if (poolId != null) {
							var old = pool[poolId];
							if (old && (old.name == "ColorPicker2" || old.name == "ColorPicker3")) {
								old.mouseUp();
							}
						}
						mouseHitIdMap[inputid] = o.id;
						break;
					}
				}
			}
			
		}

	}

	function onMouseUp ( event, isTouchEvent ) {

		var inputid = 0;

		// ie hack
		if (isTouchEvent && typeof event.changedTouches == "undefined") {
			event.changedTouches = [event];
		}

		if (isTouchEvent) {

			var touches = event.changedTouches;
			for (var i=0; i<touches.length; i++) {

				//inputid = touches[i].identifier;
				inputid = (typeof touches[i].identifier != "undefined") ? touches[i].identifier : (typeof touches[i].pointerId != "undefined") ? touches[i].pointerId : 0;

				mouseDownMap[inputid] = false;

				if (mouseHitIdMap[inputid] != null) {
					var o = pool[mouseHitIdMap[inputid]];
					o.mouseUp( inputid );
				}
			}

		} else {

			mouseDownMap[inputid] = null;
			if (mouseHitIdMap[inputid] != null) {
				var o = pool[mouseHitIdMap[inputid]];
				o.mouseUp( inputid );
				if (o.name != "ColorPicker2" && o.name != "ColorPicker3") {
					mouseHitIdMap[inputid] = null;
				}
			}

		}

	}


	/*
	 * Base
	 */

	 function Base( p ) {
		if (this.constructor == Base) return;
		if (p == undefined) p = {};

		this.id = pool.push(this)-1;
		this.x = p.x || 0;
		this.y = p.y || 0;
		this.updateInterval = p.updateInterval || 200;
		this.lastUpdate = 0;
	}

	/*
	 * Value
	 */

	function Value( value ) {

		this.v = value;
		this.bindArray = [];
		this.receiver = false;
		this.both = false;

	}

	Value.prototype.bind = function() {
		var bind = arguments[0];

		if (typeof bind == "function") {
			this.bindArray.push(bind);
		} else if (typeof bind == "object") {	
			var objArray = [bind];
			for (var i=1; i<arguments.length; ++i ) {
				objArray.push(arguments[i]);
			}
			this.bindArray.push(objArray);
		} else {
			console.log("error");
		}

	}

	Value.prototype.updateBind = function( onMouseUp ) {
		var mouseup = onMouseUp || false;

		for (var i=0; i<this.bindArray.length; ++i ) {
			var bind = this.bindArray[i];
			if (typeof bind == "function") {
				bind(this.v, mouseup);
			} else if (typeof bind == "object") {	
				var obj = bind[0]
				for (var j=1; j<bind.length; ++j ) {
					// receiver
					if (this.receiver) {
						this.v = obj[bind[j]];
					} else if (this.both) {
						this.v = obj[bind[j]];
						obj[bind[j]] = this.v;
					} else {
						// normal
						obj[bind[j]] = this.v;							
					}
				}
			} else {
				console.log("error");
			}
		}
	}

	/*
	 * Matrix
	 */


	this.Matrix = function ( p ) {
		Base.call( this, p );

		this.name = "Matrix";
		this.w = p.w || 4;
		this.h = p.h || 4;
		this.size = p.size || 10;
		this.width = (this.w*this.size)+this.w-1;
		this.height = (this.h*this.size)+this.h-1;
		var generatedArray = [];
			for (var y=0; y<this.h; ++y ) {
				generatedArray[y] = [];
				for (var x=0; x<this.w; ++x ) {
					generatedArray[y][x] = 0;
				}
			}
		this.value = new Value(p.array || generatedArray);
		this.draw();
	}


	this.Matrix.prototype = new Base();
	this.Matrix.prototype.constructor = this.Matrix;


	this.Matrix.prototype.draw = function() {

		context.save();
		context.translate(this.x, this.y);

		context.clearRect(0,0,this.width,this.height);
		
		for (var y=0; y<this.h; ++y ) {
			for (var x=0; x<this.w; ++x ) {
				context.fillStyle = bgColor;
				context.fillRect((x*this.size)+x,(y*this.size)+y,this.size,this.size);
				// selected?
				if (this.value.v[y][x]) {
					context.fillStyle = frontColor;
					context.fillRect((x*this.size)+x+2,(y*this.size)+y+2,this.size-4,this.size-4);
				}
			}
		}	

		context.restore();	
	

	}

	this.Matrix.prototype.mouseDown = function(x,y) {

		var gridx = Math.floor(x/(this.size+1));
		var gridy = Math.floor(y/(this.size+1));
		
		var val = this.value.v[gridy][gridx];
		if (!val) {
			this.value.v[gridy][gridx] = 1;
		} else {
			this.value.v[gridy][gridx] = 0;
		}

		this.value.updateBind();

		this.draw();
	}

	this.Matrix.prototype.mouseUp = function() {
		this.value.updateBind(true);
	}


	/*
	 * RangeSlider
	 */

	this.RangeSlider = function ( p ) {
		Base.call( this, p );

		this.name = "RangeSlider";
		this.mouseIsOver = false;
		this.value1 = new Value(p.value1 || 25);
		this.value2 = new Value(p.value2 || 75);
		this.width = p.width || 100,
		this.height = p.height|| 10;
		this.min = p.min || 0;
		this.max = p.max || this.width;
		this.range = this.max - this.min;
		this.decimals = p.decimals || 0;
		this.draw();
	}

	this.RangeSlider.prototype = new Base(); 
	this.RangeSlider.prototype.constructor = this.RangeSlider;

	this.RangeSlider.prototype.draw = function() {
		if (this.value1.v > this.max) this.value1.v = this.max;
		if (this.value1.v < this.min) this.value1.v = this.min;
		if (this.value2.v > this.max) this.value2.v = this.max;
		if (this.value2.v < this.min) this.value2.v = this.min;

		if (this.value1.v > this.value2.v) this.value1.v = this.value2.v;
		if (this.value2.v < this.value1.v) this.value2.v = this.value1.v;

		context.save();
		context.translate(this.x, this.y);

		context.fillStyle = bgColor;
		context.fillRect(0,0,this.width,this.height);

		var addy = Math.round( Math.max(0, this.height - 11)*0.5 );

		// label 1:1
		context.fillStyle = frontColor;
		context.font = font;
		context.textBaseline = "alphabetic";
		context.textAlign = "left";
		context.fillText(this.value1.v.toFixed(this.decimals), 0, 9+addy);
		// label 2:1
		context.fillStyle = frontColor;
		context.font = font;
		context.textBaseline = "alphabetic";
		context.textAlign = "right";
		context.fillText(this.value2.v.toFixed(this.decimals), this.width-1, 9+addy);

		context.fillStyle = frontColor;
		var p1 = this.getPositionFromValue(this.value1.v);
		var p2 = this.getPositionFromValue(this.value2.v);

		context.fillRect(p1,0,p2-p1,this.height);

		// mask
		context.beginPath();
		context.rect(p1,0,p2-p1,this.height);
		context.clip();

		// label 1:2
		context.fillStyle = bgColor;
		context.font = font;
		context.textBaseline = "alphabetic";
		context.textAlign = "left";
		context.fillText(this.value1.v.toFixed(this.decimals), 0, 9+addy);
		// label 2:2
		context.fillStyle = bgColor;
		context.font = font;
		context.textBaseline = "alphabetic";
		context.textAlign = "right";
		context.fillText(this.value2.v.toFixed(this.decimals), this.width-1, 9+addy);

		context.restore();
		
	}

	this.RangeSlider.prototype.setValueFromPosition = function(x, val) {
		var value = ( (this.range/this.width)*x )-(this.range-this.max);
		if (value > this.max) value = this.max;
		if (value < this.min) value = this.min;
		if (val == 1) {
			this.value1.v = value;
		} else {
			this.value2.v = value;
		}
	}

	this.RangeSlider.prototype.getPositionFromValue = function(value) {
		var percent = (value - this.min)/this.range;
		return (percent*this.width);

	}

	this.RangeSlider.prototype.mouseDown = function(x,y) {
		// closest
		var p1 = this.getPositionFromValue(this.value1.v);
		var p2 = this.getPositionFromValue(this.value2.v);
		
		var difx0 = Math.abs(x-p1);
		var difx1 = Math.abs(x-p2);
		if (difx0 < difx1) {
			this.setValueFromPosition(x, 1);
			this.value1.updateBind();
		} else {
			this.setValueFromPosition(x, 2);
			this.value2.updateBind();
		}
		this.draw();
	}

	this.RangeSlider.prototype.mouseUp = function() {
		this.value1.updateBind(true);
		this.value2.updateBind(true);		
	}

	/**
	 * DropDown
	 */

	this.DropDown = function ( p ) {
		Base.call( this, p );

		this.name = "DropDown";
		this.values = p.values || ["DropDown"];
		this.texts = p.texts || this.values;

		this.dropdown = document.createElement("select");
		this.dropdown.setAttribute("id",this.id);

		this.value = new Value(this.values[0]);

		for (var i=0; i<this.values.length; ++i ) {
			var option = document.createElement("option");
			option.text = this.texts[i];
			option.value = this.values[i];
			this.dropdown.options.add(option);
		}

		// draw arrow
		var arrowCanvas = document.createElement("canvas");
		arrowCanvas.width = 16;
		arrowCanvas.height = 16;
		var arrowContext = arrowCanvas.getContext('2d');
		arrowContext.clearRect(0,0,16,16);
		arrowContext.fillStyle = dimColor;
		arrowContext.fillRect(0,0,16,16);
		arrowContext.fillStyle = frontColor;
		arrowContext.beginPath();
		arrowContext.moveTo(4.5,6);
		arrowContext.lineTo(12.5,6);
		arrowContext.lineTo(8.5,11);
		arrowContext.lineTo(4.5,6);
		arrowContext.closePath();
		arrowContext.fill();
		arrowContext.strokeStyle = bgColor;
		arrowContext.beginPath();
		arrowContext.moveTo(0,0);
		arrowContext.lineTo(0,16);
		arrowContext.closePath();
		arrowContext.stroke();
		arrowContext.beginPath();
		arrowContext.moveTo(16,0);
		arrowContext.lineTo(16,16);
		arrowContext.closePath();
		arrowContext.stroke();

		// input container
		this.div = document.createElement("div");
		var inputdivId = "input"+this.id;
		this.div.setAttribute("id",inputdivId);
		this.div.style.position = "absolute";
		this.div.style.overflow = "hidden";
		this.div.style.left = this.x-1+"px";
		this.div.style.top = this.y-1+"px";
		this.div.style.width = "101px";
		this.div.style.height = "16px";
		this.div.style.background = "url('"+arrowCanvas.toDataURL("image/png")+"') no-repeat right "+frontColor+"";

		this.dropdown.style.position = "absolute"
		this.dropdown.style.left = "0px";
		this.dropdown.style.top = "0px";
		this.dropdown.style.borderWidth = "1px";
		this.dropdown.style.fontFamily = "sans-serif";
		this.dropdown.style.fontSize = "10px";
		this.dropdown.style.outlineStyle = "none"
		this.dropdown.style.color = bgColor;
		this.dropdown.style.webkitAppearance = "none";
		this.dropdown.style.borderRadius = "0px";
		this.dropdown.style.background = "rgba(0,0,0,0)";//"transparent";
		this.dropdown.style.borderStyle = "solid";
		this.dropdown.style.width = "121px";
		this.dropdown.style.height = "16px";
		this.dropdown.style.textIndent = "0px";
		this.dropdown.style.borderLeftColor = bgColor;
		this.dropdown.style.borderTopColor = bgColor;
		this.dropdown.style.borderRightColor = bgColor;
		this.dropdown.style.borderBottomColor = bgColor;
		container.appendChild( this.div );
		this.div.appendChild( this.dropdown );

		this.dropdown.onchange = this.onChange;
		this.dropdown.onfocus = this.onFocus;

		this.draw();
	}

	this.DropDown.prototype = new Base(); 
	this.DropDown.prototype.constructor = this.DropDown;

	this.DropDown.prototype.onChange = function( event ) {
		var o = pool[this.id];
		o.value.v = this.value;
		o.value.updateBind();
	}

	this.DropDown.prototype.onFocus = function( event ) {
		//mouseHitId = this.id;
	}

	this.DropDown.prototype.draw = function() {
		
	}

	this.DropDown.prototype.mouseDown = function(x,y) {

	}

	this.DropDown.prototype.mouseUp = function() {

	}

	/*
	 * InputText
	 */

	this.InputText = function ( p ) {
		Base.call( this, p );

		this.name = "InputText";
		this.text = p.text || "";

		this.input = document.createElement("input");
		this.value = new Value(this.text);
		this.input.value = this.value.v;
		this.input.type = "text";
		this.input.setAttribute("id",this.id);

		this.input.style.position = "absolute"
		this.input.style.left = this.x-1+"px";
		this.input.style.top = this.y-1+"px";
		this.input.style.borderWidth = "1px";
		this.input.style.fontFamily = "sans-serif";
		this.input.style.fontSize = "10px";
		this.input.style.outlineStyle = "none"
		this.input.style.color = bgColor;
		this.input.style.backgroundColor = frontColor;
		this.input.style.borderStyle = "solid";
		this.input.style.width = "100px";
		this.input.style.height = "12px";
		this.input.style.marginLeft = "0px";
		this.input.style.textIndent = "3px";
		this.input.style.webkitAppearance = "none";
		this.input.style.borderRadius = "0px";		
		this.input.style.borderLeftColor = bgColor;
		this.input.style.borderTopColor = bgColor;
		this.input.style.borderRightColor = bgColor;
		this.input.style.borderBottomColor = bgColor;

		this.input.oninput = this.onTextChange;
		this.input.onfocus = this.onFocus;

		container.appendChild( this.input );

		this.draw();
	}

	this.InputText.prototype = new Base(); 
	this.InputText.prototype.constructor = this.InputText;

	this.InputText.prototype.draw = function() {
		
	}

	this.InputText.prototype.onTextChange = function( event ) {
		var o = pool[this.id];
		o.value.v = this.value;
		o.value.updateBind();
	}

	this.InputText.prototype.onFocus = function( event ) {
		//mouseHitId = this.id;
	}

	this.InputText.prototype.mouseDown = function(x,y) {
		
	}

	this.InputText.prototype.mouseUp = function() {

	}

	/*
	 * Stepper
	 */

	this.Stepper = function ( p ) {
		Base.call( this, p );

		this.name = "Stepper";
		this.mouseIsOver = false;
		this.value = new Value(p.value || 0);
		this.width = p.width || 60,
		this.height = p.height || 10;
		this.min = p.min || -10000;
		this.max = p.max || 10000;
		this.mouseDownNumber = false;
		this.mouseDownMinus = false;
		this.mouseDownPlus = false;
		this.lastMouseX = null;
		this.lastMouseY = null;
		this.step = p.step || 10;
		this.decimals = p.decimals || 0;
		this.bx = this.width-22;
		this.draw();
	}

	this.Stepper.prototype = new Base(); 
	this.Stepper.prototype.constructor = this.Stepper;

	this.Stepper.prototype.draw = function() {
		if (this.value.v < this.min) this.value.v = this.min;
		if (this.value.v > this.max) this.value.v = this.max;

		context.save();
		context.translate(this.x, this.y);

		context.fillStyle = bgColor;
		context.fillRect(0,0,this.width,this.height);
		
		var addy = Math.round( Math.max(0, this.height - 11)*0.5 );

		// -
		context.fillStyle = frontColor;
		if (this.mouseDownMinus) context.fillStyle = bgColor;
		context.fillRect(this.bx,1,10,this.height-2);
		context.fillStyle = bgColor;
		if (this.mouseDownMinus) context.fillStyle = frontColor;
		context.fillRect(this.bx+2,4+addy,6,2);

		// +
		context.fillStyle = frontColor;
		if (this.mouseDownPlus) context.fillStyle = bgColor;
		context.fillRect(this.bx+11,1,10,this.height-2);
		context.fillStyle = bgColor;
		if (this.mouseDownPlus) context.fillStyle = frontColor;
		context.fillRect(this.bx+13,4+addy,6,2);
		context.fillRect(this.bx+15,2+addy,2,6);

		// label
		context.fillStyle = frontColor;
		context.font = font;
		context.textBaseline = "alphabetic";
		context.textAlign = "center";
		context.fillText(this.value.v.toFixed(this.decimals), this.bx/2, 9+addy);
		
		context.restore();

	}


	this.Stepper.prototype.mouseDown = function(x,y) {
		if (x < this.bx && !this.mouseDownMinus && !this.mouseDownPlus) {
			this.mouseDownNumber = true;
			this.mouseDownMinus = false;
			this.mouseDownPlus = false;
		} else if (x >= this.bx && x < this.bx+11 && !this.mouseDownNumber && !this.mouseDownPlus) {
			this.mouseDownMinus = true;
			this.mouseDownNumber = false;
			this.mouseDownPlus = false;
			this.value.v -= this.step;
		} else if (x >= this.bx+11 && !this.mouseDownNumber && !this.mouseDownMinus) {
			this.mouseDownPlus = true;
			this.mouseDownNumber = false;
			this.mouseDownMinus = false;
			this.value.v += this.step;
		}

		if (this.lastMouseX != null && this.mouseDownNumber) {
			var difx = x-this.lastMouseX;
			var dify = y-this.lastMouseY;

			var avg = (difx-dify);
			this.value.v += avg*this.step;
			this.draw();
		}

		this.lastMouseX = x;
		this.lastMouseY = y;
		
		this.draw();
		this.value.updateBind();

	}

	this.Stepper.prototype.mouseUp = function() {
		this.mouseDownNumber = false;
		this.mouseDownMinus = false;
		this.mouseDownPlus = false;

		this.lastMouseX = null;
		this.lastMouseY = null;

		this.value.updateBind(true);

		this.draw();
	}

	/*
	 * Graph
	 */

	this.Graph = function ( p ) {
		Base.call( this, p );

		this.name = "Graph";
		this.width = p.width || 100;
		this.height = p.height || 40;
		this.min = p.min || 0;
		this.max = p.max || 1;
		this.range = this.max - this.min;
		this.value = new Value(this.min);
		this.draw();
	}

	this.Graph.prototype = new Base(); 
	this.Graph.prototype.constructor = this.Graph;

	this.Graph.prototype.draw = function() {
		if (this.value.v > this.max) this.value.v = this.max;
		if (this.value.v < this.min) this.value.v = this.min;

		// get old
		var old = context.getImageData(this.x, this.y, this.width, this.height);

		// frame
		context.strokeStyle = bgColor;
		context.lineWidth = 2.0;
		context.strokeRect(this.x, this.y, this.width, this.height);
		
		context.fillStyle = frontColor;
		context.fillRect(this.x, this.y, this.width, this.height);

		// move one step left
		context.save();

		// mask
		context.beginPath();
		context.rect(this.x,this.y,this.width,this.height);
		context.clip();

		var tempCanvas = document.createElement('canvas');
		tempCanvas.width = this.width;
		tempCanvas.height = this.height;
		var tempContext = tempCanvas.getContext('2d');

		tempContext.putImageData(old, 0, 0);
		
		context.drawImage(tempCanvas, this.x-1, this.y); 

		// draw new
		context.fillStyle = dimColor;

		var steps = this.height/this.range;
		var h = steps*(this.value.v+Math.abs(this.min));
		context.fillRect(this.x+this.width-1, this.y+this.height-h, 1, h);

		context.restore();

	}

	this.Graph.prototype.mouseDown = function(x,y) {
	}

	this.Graph.prototype.mouseUp = function() {
	}

	/*
	 * ImageButton
	 */

	this.ImageButton = function ( p ) {
		Base.call( this, p );

		this.name = "ImageButton";
		this.image = p.image || new Image();
		this.width = p.width || this.image.width;
		this.height = p.height || this.image.height;
		this.mouseIsDown = false;
		this.value = new Value(this.mouseIsDown);
		this.draw();
	}

	this.ImageButton.prototype = new Base(); 
	this.ImageButton.prototype.constructor = this.ImageButton;

	this.ImageButton.prototype.draw = function() {
		context.clearRect(this.x,this.y,this.width,this.height);

		if (this.mouseIsDown) {
			context.globalAlpha = 0.5;
		} else {
			context.globalAlpha = 1.0;
		}
		// image
		context.drawImage(this.image, this.x, this.y, this.width, this.height);
		context.globalAlpha = 1.0;
	}

	this.ImageButton.prototype.mouseDown = function(x,y) {
		this.mouseIsDown = true;
		this.value.v = this.mouseIsDown;
		this.value.updateBind();
		this.draw();
	}

	this.ImageButton.prototype.mouseUp = function() {
		this.value.updateBind(true);
		this.mouseIsDown = false;
		this.value.v = this.mouseIsDown;
		this.value.updateBind();
		this.draw();
	}

	/*
	 * Button
	 */

	this.Button = function ( p ) {
		Base.call( this, p );

		this.name = "Button";
		this.fullWidth = 0;
		this.width = this.fullWidth;
		this.height = Math.max(p.height, 14) || 14;
		this.text = p.text || "";
		this.mouseIsDown = false;
		this.value = new Value(this.mouseIsDown);
		this.draw();
		this.draw();
	}

	this.Button.prototype = new Base(); 
	this.Button.prototype.constructor = this.Button;

	this.Button.prototype.draw = function() {

		context.save();
		context.translate(this.x, this.y);

		// frame
		context.strokeStyle = bgColor;
		context.lineWidth = 2.0;
		context.strokeRect(0, 0, this.width, this.height);
		
		context.fillStyle = frontColor;
		if (this.mouseIsDown) context.fillStyle = dimColor;
		context.fillRect(0, 0, this.width, this.height);

		// label
		var addy = Math.round( Math.max(0, this.height - 14)*0.5 );

		context.fillStyle = bgColor;
		if (this.mouseIsDown) context.fillStyle = frontColor;
		context.font = font;
		context.textBaseline = "alphabetic";
		context.textAlign = "left";
		context.fillText(this.text, 4, 11+addy);
		var labelWidth = context.measureText(this.text);
		this.width = Math.round( this.fullWidth + labelWidth.width ) + 9;

		context.restore();

	}

	this.Button.prototype.mouseDown = function(x,y) {
		this.mouseIsDown = true;
		this.value.v = this.mouseIsDown;
		this.value.updateBind();
		this.draw();
	}

	this.Button.prototype.mouseUp = function() {
		this.value.updateBind(true);
		this.mouseIsDown = false;
		this.value.v = this.mouseIsDown;
		this.draw();
	}


	/*
	 * TrackPad
	 */

	this.TrackPad = function ( p ) {
		Base.call( this, p );

		this.name = "TrackPad";
		this.width = p.width || 100;
		this.height = p.height || 60;
		this.min = p.min || -1;
		this.max = p.max || 1;
		this.size =  p.size || 6;
		this.range = this.max - this.min;
		var center = ((this.range/2)-this.max)*-1;
		this.value1 = new Value(p.value1 || center);
		this.value2 = new Value(p.value2 || center);
		this.draw();
	}

	this.TrackPad.prototype = new Base(); 
	this.TrackPad.prototype.constructor = this.TrackPad;

	this.TrackPad.prototype.draw = function() {
		if (this.value1.v < this.min) this.value1.v = this.min; 
		if (this.value1.v > this.max) this.value1.v = this.max; 
		if (this.value2.v < this.min) this.value2.v = this.min; 
		if (this.value2.v > this.max) this.value2.v = this.max;

		context.save();
		context.translate(this.x, this.y);

		context.clearRect(-1,0,this.width,this.height+14);

		// frame
		context.strokeStyle = bgColor;
		context.lineWidth = 2.0;
		context.strokeRect(0, 0, this.width, this.height);
		
		context.fillStyle = frontColor;
		context.fillRect(0, 0, this.width, this.height);

		// horizontal line
		context.strokeStyle = dimColor;
		context.lineWidth = 1.0;
		context.beginPath();
		context.moveTo(0, 0.5+this.height/2);
		context.lineTo(0+this.width, 0.5+this.height/2);
		context.closePath();
		context.stroke();

		// vertical line
		context.beginPath();
		context.moveTo(0.5+this.width/2, 0);
		context.lineTo(0.5+this.width/2, this.height);
		context.closePath();
		context.stroke();

		var x = Math.round( this.getXPositionFromValue() );
		var y = Math.round( this.getYPositionFromValue() );

		var half = this.size/2;

		if (x < half) x = half;
		if (x > this.width-half) x = this.width-half;
		if (y < half) y = half;
		if (y > this.height-half) y = this.height-half;

		// point
		context.fillStyle = dimColor;
		context.fillRect(x-half, y-half, this.size, this.size);

		// label
		context.fillStyle = bgColor;
		context.font = fontsm;
		context.textBaseline = "alphabetic";
		context.textAlign = "left";
		context.fillText("X: "+this.value1.v.toFixed(2)+" Y: "+this.value2.v.toFixed(2), 0, this.height+9);

		context.restore();

	}

	this.TrackPad.prototype.setXValueFromPosition = function(x) {
		var value1 = ( (this.range/this.width)*x )-(this.range-this.max);
		this.value1.v = value1;		
	}

	this.TrackPad.prototype.setYValueFromPosition = function(y) {
		var value2 = ( (this.range/this.height)*y )-(this.range-this.max);
		this.value2.v = value2;		
	}

	this.TrackPad.prototype.getXPositionFromValue = function() {
		var percent = (this.value1.v - this.min)/this.range;
		return (percent*this.width);
	}

	this.TrackPad.prototype.getYPositionFromValue = function() {
		var percent = (this.value2.v - this.min)/this.range;
		return (percent*this.height);
	}

	this.TrackPad.prototype.mouseDown = function(x,y) {
		this.setXValueFromPosition(x);
		this.setYValueFromPosition(y);

		this.draw();

		this.value1.updateBind();
		this.value2.updateBind();
	}

	this.TrackPad.prototype.mouseUp = function() {
		this.value1.updateBind(true);
		this.value2.updateBind(true);		
	}

	/*
	 * ColorPicker
	 */

	this.ColorPicker = function ( p ) {
		Base.call( this, p );

		this.name = "ColorPicker";
		this.framewidth = p.framewidth || 10;
		this.frameheight = p.frameheight || 10;		
		this.width = p.width || 100;
		this.height = p.height || 20;
		this.r = (p.r || p.r === 0) ? p.r : 255;
		this.g = (p.g || p.g === 0) ? p.g : 255;
		this.b = (p.b || p.b === 0) ? p.b : 255;
		this.hex = p.hex || colorToHex("rgb("+this.r+","+this.g+","+this.b+")");
		this.value = new Value(this.hex);
		this.draw();
	}

	this.ColorPicker.prototype = new Base(); 
	this.ColorPicker.prototype.constructor = this.ColorPicker;

	this.ColorPicker.prototype.draw = function() {
		context.save();
		context.translate(this.x, this.y);		

		context.clearRect(0,0,this.width,this.height+this.frameheight+4);

		// frame
		context.strokeStyle = bgColor;
		context.lineWidth = 2.0;
		context.strokeRect(0, 0, this.width, this.height);
		
		// gradient colors
		var gradient = context.createLinearGradient(0, 0, this.width, 0);
		var offset = 1/6;
		var index = 0;
		gradient.addColorStop(offset*index++, "rgb(255, 0, 0)");	// red
		gradient.addColorStop(offset*index++, "rgb(255, 255, 0)");	// yellow
		gradient.addColorStop(offset*index++, "rgb(0, 255, 0)");	// green
		gradient.addColorStop(offset*index++, "rgb(0, 255, 255)");	// cyan
		gradient.addColorStop(offset*index++, "rgb(0, 0, 255)");	// blue
		gradient.addColorStop(offset*index++, "rgb(255, 0, 255)");	// magenta
		gradient.addColorStop(offset*index++, "rgb(255, 0, 0)");	// red
		context.fillStyle = gradient;
		context.fillRect(0, 0, this.width, this.height);

		var onepixel = 1/(this.height/2);

		// gradient white overlay
		var gradient = context.createLinearGradient(0, 0, 0, this.height/2);
		gradient.addColorStop(0, "rgba(255, 255, 255, 1)");				// white
		gradient.addColorStop(onepixel, "rgba(255, 255, 255, 1)");		// white
		gradient.addColorStop(1, "rgba(255, 255, 255, 0)");				// alpha
		context.fillStyle = gradient;
		context.fillRect(0, 0, this.width, (this.height/2));

		// gradient black overlay
		var gradient = context.createLinearGradient(0, 0+(this.height/2), 0, this.height);
		gradient.addColorStop(0, "rgba(0, 0, 0, 0)");			// alpha
		gradient.addColorStop(1-onepixel, "rgba(0, 0, 0, 1)");	// black
		gradient.addColorStop(1, "rgba(0, 0, 0, 1)");			// black
		context.fillStyle = gradient;
		context.fillRect(0, this.height/2, this.width, this.height/2);

		// current color
		context.strokeStyle = bgColor;
		context.lineWidth = 2.0;
		context.strokeRect(0, this.height+4, this.framewidth, this.frameheight);
		
		context.fillStyle = "#"+this.value.v;
		context.fillRect(0, this.height+4, this.framewidth, this.frameheight);

		// label
		var addy = Math.round( Math.max(0, this.frameheight - 10)*0.5 );

		context.fillStyle = bgColor;
		context.font = font;
		context.textBaseline = "alphabetic";
		context.textAlign = "left";
		context.fillText("#"+this.value.v.toUpperCase(), this.framewidth+4, this.height+13+addy);

		context.restore()

	}

	this.ColorPicker.prototype.mouseDown = function(x,y) {
		if (x < 0) x = 0;
		if (x > this.width-1) x = this.width-1;
		if (y < 0) y = 0;
		if (y > this.height-1) y = this.height-1;

		var pixel = context.getImageData(this.x+x, this.y+y, 1, 1).data;
		this.r = pixel[0];
		this.g = pixel[1];
		this.b = pixel[2];
		this.hex = colorToHex("rgb("+this.r+","+this.g+","+this.b+")");
		this.value.v = this.hex;
		this.value.updateBind();
		this.draw();
	}

	this.ColorPicker.prototype.mouseUp = function() {
		this.value.updateBind(true);
	}

	/*
	 * ColorPicker2
	 */

	this.ColorPicker2 = function  ( p ) {
		Base.call( this, p );

		this.name = "ColorPicker2";
		this.framewidth = p.framewidth || 10;
		this.frameheight = p.frameheight || 10;
		this.colorwidth = p.width || 100;
		this.colorheight = p.height || 30;
		this.width = this.framewidth;
		this.height = this.frameheight;
		this.r = (p.r || p.r === 0) ? p.r : 255;
		this.g = (p.g || p.g === 0) ? p.g : 255;
		this.b = (p.b || p.b === 0) ? p.b : 255;
		this.oldColor = { r:this.r, g:this.g, b:this.b };
		this.open = false;
		this.mousehack = false;
		this.lastTime = 0;
		this.hex = p.hex || colorToHex("rgb("+this.r+","+this.g+","+this.b+")");
		this.value = new Value(this.hex);
		this.draw();
	}

	this.ColorPicker2.prototype = new Base(); 
	this.ColorPicker2.prototype.constructor = this.ColorPicker2;

	this.ColorPicker2.prototype.draw = function() {

		context.save();
		context.translate(this.x, this.y);		

		context.clearRect(-1,-1,this.framewidth+60,this.height+3);
		context.clearRect(-1,this.frameheight,this.colorwidth+2,this.colorheight+3);

		// frame
		context.strokeStyle = bgColor;
		context.lineWidth = 2.0;
		context.strokeRect(0, 0, this.framewidth, this.frameheight);	

		// current color
		context.fillStyle = "#"+this.value.v;
		context.fillRect(0, 0, this.framewidth, this.frameheight);

		// label
		var addy = Math.round( Math.max(0, this.frameheight - 11)*0.5 );

		context.fillStyle = bgColor;
		context.font = font;
		context.textBaseline = "alphabetic";
		context.textAlign = "left";
		context.fillText("#"+this.value.v.toUpperCase(), this.framewidth+4, 9+addy);

		if (this.open) {
			var extray = 1;
			// frame
			context.strokeStyle = bgColor;
			context.lineWidth = 2.0;
			context.strokeRect(0, this.frameheight+extray, this.colorwidth, this.colorheight);
			
			// gradient colors
			var gradient = context.createLinearGradient(0, this.frameheight+extray, this.colorwidth, this.frameheight+extray);
			var offset = 1/6;
			var index = 0;
			gradient.addColorStop(offset*index++, "rgb(255, 0, 0)");	// red
			gradient.addColorStop(offset*index++, "rgb(255, 255, 0)");	// yellow
			gradient.addColorStop(offset*index++, "rgb(0, 255, 0)");	// green
			gradient.addColorStop(offset*index++, "rgb(0, 255, 255)");	// cyan
			gradient.addColorStop(offset*index++, "rgb(0, 0, 255)");	// blue
			gradient.addColorStop(offset*index++, "rgb(255, 0, 255)");	// magenta
			gradient.addColorStop(offset*index++, "rgb(255, 0, 0)");	// red
			context.fillStyle = gradient;
			context.fillRect(0, this.frameheight+extray, this.colorwidth, this.colorheight);

			var onepixel = 1/(this.colorheight/2);

			// gradient white overlay
			var gradient = context.createLinearGradient(0, this.frameheight+extray, 0, this.frameheight+extray+(this.colorheight/2));
			gradient.addColorStop(0, "rgba(255, 255, 255, 1)");				// white
			gradient.addColorStop(onepixel, "rgba(255, 255, 255, 1)");		// white
			gradient.addColorStop(1, "rgba(255, 255, 255, 0)");				// alpha
			context.fillStyle = gradient;
			context.fillRect(0, this.frameheight+extray, this.colorwidth, (this.colorheight/2));

			// gradient black overlay
			var gradient = context.createLinearGradient(0, 0+this.frameheight+extray+(this.colorheight/2), 0, this.frameheight+extray+this.colorheight);
			gradient.addColorStop(0, "rgba(0, 0, 0, 0)");			// alpha
			gradient.addColorStop(1-onepixel, "rgba(0, 0, 0, 1)");	// black
			gradient.addColorStop(1, "rgba(0, 0, 0, 1)");			// black
			context.fillStyle = gradient;
			context.fillRect(0, this.frameheight+extray+(this.colorheight/2), this.colorwidth, (this.colorheight/2));
		}

		context.restore();
		
	}

	this.ColorPicker2.prototype.mouseDown = function(x,y) {
		var nowTimer = new Date().getTime();
		if (nowTimer-this.lastTime < 200) {
			return;
		}

		if (this.open) {
			if (x > 0 && x < this.colorwidth-1) {
				if (y > this.frameheight && y < this.frameheight+this.colorheight) {
					//if (isTouchDevice) {
						this.mouseMove(x,y);
					//}
					this.oldColor = { r:this.r, g:this.g, b:this.b };
				}
			}
		}

		if (!this.open && y < this.frameheight) {
			this.open = true;
		} else if (this.open) {
			this.open = false;
		}

		if (this.open) {
			this.width = this.colorwidth;
			this.height = this.frameheight+this.colorheight;
		} else {
			this.width = this.framewidth;
			this.height = this.frameheight;
		}

		this.draw();

		this.mousehack = false;

		this.lastTime = new Date().getTime();
		
		if (!this.open) {
			for (var i=0; i<pool.length; ++i ) {
				var o = pool[i];
				o.draw();
			}
		}


	}

	this.ColorPicker2.prototype.setOldColor = function() {
		this.r = this.oldColor.r;
		this.g = this.oldColor.g;
		this.b = this.oldColor.b;
		this.hex = colorToHex("rgb("+this.r+","+this.g+","+this.b+")");	
	}

	this.ColorPicker2.prototype.mouseMove = function(x,y) {
		var old = false;
		if (x < 0) {
			x = 0;
			this.setOldColor();
			old = true;
		}
		if (x > this.colorwidth-1) {
			x = this.colorwidth-1;
			this.setOldColor();
			old = true;
		}
		if (y <= this.frameheight) {
			y = this.frameheight;
			this.setOldColor();
			old = true;
		}
		if (y > this.frameheight+this.colorheight) {
			y = this.frameheight+this.colorheight;
			this.setOldColor();
			old = true;
		}

		if (!old) {
			var pixel = context.getImageData(this.x+x, this.y+y, 1, 1).data;
			this.r = pixel[0];
			this.g = pixel[1];
			this.b = pixel[2];
			this.hex = colorToHex("rgb("+this.r+","+this.g+","+this.b+")");
		}

		this.value.v = this.hex;
		this.value.updateBind();

		this.draw();
	}

	this.ColorPicker2.prototype.mouseUp = function( inputid ) {
		if (!this.open) {
			mouseHitIdMap[inputid] = null;
		}
		if (this.mousehack) {
			this.setOldColor();

			this.mouseDown();
			
			mouseHitIdMap[inputid] = null;
		}

		this.mousehack = true;
		this.value.updateBind(true);
	}

	/*
	 * ColorPicker3
	 */

	this.ColorPicker3 = function ( p ) {
		Base.call( this, p );

		this.name = "ColorPicker3";
		this.framewidth = p.framewidth || 10;
		this.frameheight = p.frameheight || 10;
		this.maxWidth = p.maxWidth || 12;
		this.size = p.size || 10;
		this.palette = p.palette || ["ffffff", "000000"];
		this.colorwidth = this.maxWidth * this.size;
		this.colorheight = Math.ceil(this.palette.length/this.maxWidth)*this.size;
		this.width = this.framewidth;
		this.height = this.frameheight;
		this.current = p.current || 0;
		if (this.current >= this.palette.length) this.current = this.palette.length-1;
		this.open = false;
		this.mousehack = false;
		this.lastTime = 0;
		this.hex = this.palette[this.current];
		this.oldColor = this.hex;
		this.oldCurrent = this.current;
		this.value = new Value(this.hex);
		this.draw();


	}

	this.ColorPicker3.prototype = new Base(); 
	this.ColorPicker3.prototype.constructor = this.ColorPicker3;

	this.ColorPicker3.prototype.draw = function() {

		context.save();
		context.translate(this.x, this.y);		

		context.clearRect(-1,-1,this.framewidth+60,this.height+3);
		context.clearRect(-1,this.frameheight,this.colorwidth+2,this.colorheight+3);

		// frame
		context.strokeStyle = bgColor;
		context.lineWidth = 2.0;
		context.strokeRect(0, 0, this.framewidth, this.frameheight);	

		// current color
		context.fillStyle = "#"+this.value.v;
		context.fillRect(0, 0, this.framewidth, this.frameheight);

		// label
		var addy = Math.round( Math.max(0, this.frameheight - 11)*0.5 );

		context.fillStyle = bgColor;
		context.font = font;
		context.textBaseline = "alphabetic";
		context.textAlign = "left";
		context.fillText("#"+this.value.v.toUpperCase(), this.framewidth+4, 9+addy);

		if (this.open) {
			var extray = 1;
			
			var x = 0;
			var y = 0;

			// selected one
			//var selected = this.palette.indexOf(this.hex);
			var selectedPosition = {}; 

			for (var i = 0; i < this.palette.length; i++) {
				
				if (i == this.current) selectedPosition = {x:x, y:y};
				context.strokeRect((x*this.size), this.frameheight+(y*this.size)+extray, this.size, this.size);	

				context.fillStyle = "#"+this.palette[i];
				context.fillRect((x*this.size), this.frameheight+(y*this.size)+extray, this.size, this.size);

				++x;
				if (x >= this.maxWidth) {
					x = 0;
					++y;
				}

			}

			context.strokeStyle = "#ffffff";
			context.lineWidth = 2.0;
			context.strokeRect((selectedPosition.x*this.size), this.frameheight+(selectedPosition.y*this.size)+extray, this.size, this.size);	

		}

		context.restore();

	}

	this.ColorPicker3.prototype.setOldColor = function() {
		this.hex = this.oldColor;
		this.current = this.oldCurrent;
	}

	this.ColorPicker3.prototype.mouseDown = function(x,y) {
		var nowTimer = new Date().getTime();
		if (nowTimer-this.lastTime < 200) {
			return;
		}

		if (this.open) {
			if (x > 0 && x < this.colorwidth-1) {
				if (y > this.frameheight && y < this.frameheight+this.colorheight) {
					this.mouseMove(x,y);
					this.oldColor = this.hex;
					this.oldCurrent = this.current;
				}
			}
		}

		if (!this.open && y < this.frameheight) {
			this.open = true;
		} else if (this.open) {
			this.open = false;
		}

		if (this.open) {
			this.width = this.colorwidth;
			this.height = this.frameheight+this.colorheight;
		} else {
			this.width = this.framewidth;
			this.height = this.frameheight;
		}

		this.draw();

		this.mousehack = false;

		this.lastTime = new Date().getTime();
		
		if (!this.open) {
			for (var i=0; i<pool.length; ++i ) {
				var o = pool[i];
				o.draw();
			}
		}
	}

	this.ColorPicker3.prototype.mouseMove = function(x,y) {
		var old = false;
		if (x < 0) {
			x = 0;
			this.setOldColor();
			old = true;
		}
		if (x > this.colorwidth-1) {
			x = this.colorwidth-1;
			this.setOldColor();
			old = true;
		}
		if (y <= this.frameheight) {
			y = this.frameheight;
			this.setOldColor();
			old = true;
		}
		if (y >= this.frameheight+this.colorheight) {
			y = this.frameheight+this.colorheight;
			this.setOldColor();
			old = true;
		}

		if (!old) {
			var px = Math.floor(x/this.size);
			var py = Math.floor((y-this.frameheight)/this.size);
			var fx = (px * this.size) + Math.ceil(this.size*0.5);
			var fy = (py * this.size) + Math.ceil(this.size*0.5);
			
			this.current = (py*this.maxWidth) + px;

			var pixel = context.getImageData(this.x+1+fx, this.y+this.frameheight+1+fy, 1, 1).data;
			this.hex = colorToHex("rgb("+pixel[0]+","+pixel[1]+","+pixel[2]+")");
		}

		this.value.v = this.hex;
		this.value.updateBind();

		this.draw();
	}

	this.ColorPicker3.prototype.mouseUp = function(inputid) {
		if (!this.open) {
			mouseHitIdMap[inputid] = null;
		}
		if (this.mousehack) {
			this.setOldColor();

			this.mouseDown();
			
			mouseHitIdMap[inputid] = null;
		}

		this.mousehack = true;
		this.value.updateBind(true);
	}

	/*
	 * Knob
	 */

	this.Knob = function ( p ) {
		Base.call( this, p );

		this.name = "Knob";
		this.radius = p.radius || 15;
		this.width = this.radius*2;
		this.height = this.radius*2;
		this.min = p.min || 0;
		this.max = p.max || 100;
		this.range = this.max - this.min;
		this.value = new Value(p.value || 0);
		this.mPI = Math.PI*0.8;
		this.rotationValue = this.getRotationValue();
		this.lastRotationValue = this.rotationValue;
		this.decimals = p.decimals || 0;
		this.draw();
	}

	this.Knob.prototype = new Base(); 
	this.Knob.prototype.constructor = this.Knob;

	this.Knob.prototype.getRotationValue = function() {

		var range = this.mPI - -this.mPI;

		var percent = (this.value.v - this.min)/(this.max - this.min);

		var value = (percent*range) - (this.mPI);

		return value;

	}

	this.Knob.prototype.draw = function() {
		if (this.value.v < this.min) this.value.v = this.min;
		if (this.value.v > this.max) this.value.v = this.max;

		context.save();
		context.translate(this.x, this.y);	

		context.clearRect(-4,-4,this.width+8,this.height+13);
		//draw a circle
		context.fillStyle = bgColor;
		context.beginPath();
		context.arc(this.radius, this.radius, this.radius, 0, Math.PI*2, false); 
		context.closePath();
		context.fill();

		// draw lines
		var startangle = Math.PI+this.mPI;
		var endangle = Math.PI-this.mPI;
		var step = (startangle-endangle)/this.radius;

		context.strokeStyle = bgColor;
		context.lineWidth = 0.5;

		for (var i=0; i<=this.radius; ++i ) {
			var startx = this.radius + Math.sin(startangle-(step*i))*(this.radius+1);
			var starty = this.radius + Math.cos(startangle-(step*i))*(this.radius+1);
			var endx = this.radius + Math.sin(startangle-(step*i))*(this.radius+4);
			var endy = this.radius + Math.cos(startangle-(step*i))*(this.radius+4);

			context.beginPath();
			context.moveTo(startx, starty);
			context.lineTo(endx, endy);
			context.closePath();
			context.stroke();

		}

		// line
		var linex = this.radius + Math.cos(this.rotationValue - Math.PI*0.5)*(this.radius);
		var liney = this.radius + Math.sin(this.rotationValue - Math.PI*0.5)*(this.radius);

		context.strokeStyle = frontColor;
		context.lineWidth = 2.0;
		context.beginPath();
		context.moveTo(this.radius, this.radius);
		context.lineTo(linex, liney);
		context.closePath();
		context.stroke();

		// label
		context.fillStyle = bgColor;
		context.font = fontsm;
		context.textBaseline = "alphabetic";
		context.textAlign = "center";
		context.fillText(this.value.v.toFixed(this.decimals), this.radius, (this.radius*2)+7);

		context.restore();
	}

	this.Knob.prototype.mouseDown = function(x,y) {

	    var dx = this.radius - x;
	    var dy = this.radius - y;
	    this.rotationValue = Math.atan2(dx,dy)*-1;

	    if (this.rotationValue > this.mPI) this.rotationValue = this.mPI;
	    if (this.rotationValue < -this.mPI) this.rotationValue = -this.mPI;
	
		// too much dif, use old value
		var dif = Math.abs(this.rotationValue - this.lastRotationValue);
		if (dif > Math.PI) {
			this.rotationValue = this.lastRotationValue;
		}
		
		var range = this.mPI - -this.mPI;
		var steps = 1/range;
		var value = (this.rotationValue - -this.mPI)*steps;

		this.value.v = (this.range*value)+this.min;
		
		this.draw();
		this.value.updateBind();

		this.lastRotationValue = this.rotationValue;
	
	}

	this.Knob.prototype.mouseUp = function() {
		this.value.updateBind(true);
	}

	/*
	 * CheckBox
	 */

	this.CheckBox = function ( p ) {
		Base.call( this, p );

		this.name = "CheckBox";
		this.text = p.text || "";
		this.value = new Value(p.selected || false);
		this.fullWidth = p.width || 10;
		this.width = this.fullWidth,
		this.height = p.height || 10;
		this.draw();
	}

	this.CheckBox.prototype = new Base(); 
	this.CheckBox.prototype.constructor = this.CheckBox;

	this.CheckBox.prototype.draw = function() {
		
		context.save();
		context.translate(this.x, this.y);	

		context.clearRect(0,0,this.width,this.height);
		context.fillStyle = bgColor;
		context.fillRect(0,0,this.fullWidth,this.height);
		if (this.value.v) {
			context.fillStyle = frontColor;
		} else {
			context.fillStyle = bgColor;
		}
		context.fillRect(2,2,this.fullWidth-4,this.height-4);		

		// label
		var addy = Math.round( Math.max(0, this.height - 11)*0.5 );

		context.fillStyle = bgColor;
		context.font = font;
		context.textBaseline = "alphabetic";
		context.textAlign = "left";
		context.fillText(this.text, this.fullWidth+2, 9+addy);
		var labelWidth = context.measureText(this.text);
		this.width = this.fullWidth + labelWidth.width + 3;

		context.restore();
	}

	this.CheckBox.prototype.mouseDown = function() {
		if (!this.value.v) {
			this.value.v = true;
		} else {
			this.value.v = false;		
		}
		
		this.value.updateBind();

		this.draw();
	}

	this.CheckBox.prototype.mouseUp = function() {
		this.value.updateBind(true);
	}

	/*
	 * RadioButtons
	 */


	this.RadioButtonGroup = function () {
		this.name = "RadioButtonGroup";
		this.array = [];
		this.value = new Value( new Array() );
	}

	this.RadioButtonGroup.prototype.add = function(radioButton) {
		this.array.push(radioButton);
		this.value.v.push(radioButton.value.v);
		radioButton.group = this;
	}

	this.RadioButtonGroup.prototype.clear = function(omit) {
		for (var i=0; i<this.array.length; ++i ) {
			var r = this.array[i];
			if (r == omit) {
				this.value.v[i] = true;
				continue;
			}
			this.value.v[i] = false;
			
			r.value.v = false;
			r.value.updateBind();
			r.draw();
		}
		this.value.updateBind();
	}

	this.RadioButton = function ( p ) {
		Base.call( this, p );
		
		this.name = "RadioButton";
		this.group = null;
		this.text = p.text || "";
		this.value = new Value(p.selected || false);
		this.fullWidth = p.width || 18;
		this.width = this.fullWidth;
		this.height = p.height || 10;
		this.draw();
	}

	this.RadioButton.prototype = new Base(); 
	this.RadioButton.prototype.constructor = this.RadioButton;

	this.RadioButton.prototype.draw = function() {
		context.save();
		context.translate(this.x, this.y);	

		context.clearRect(0,0,this.width,this.height);
		context.fillStyle = bgColor;
		context.fillRect(0,0,this.fullWidth,this.height);
		if (this.value.v) {
			context.fillStyle = frontColor;
			context.fillRect((this.fullWidth/2)+1,2,(this.fullWidth/2)-3,this.height-4);
		} else {
			context.fillStyle = dimColor;
			context.fillRect(2,2,(this.fullWidth/2)-3,this.height-4);		
		}
		// label
		var addy = Math.round( Math.max(0, this.height - 11)*0.5 );

		context.fillStyle = bgColor;
		context.font = font;
		context.textBaseline = "alphabetic";
		context.textAlign = "left";
		context.fillText(this.text, this.fullWidth+2, 9+addy);
		var labelWidth = context.measureText(this.text);
		this.width = this.fullWidth + labelWidth.width + 3;

		context.restore();
	}

	this.RadioButton.prototype.mouseDown = function() {
		this.group.clear(this);
		if (!this.value.v) {
			this.value.v = true;
		}
		
		this.value.updateBind();
		this.draw();
	}

	this.RadioButton.prototype.mouseUp = function() {
		this.value.updateBind(true);
	}

	this.RadioButton.prototype.mouseMove = function() {

	}


	/*
	 * HSlider
	 */

	this.HSlider = function ( p ) {
		Base.call( this, p );

		this.name = "HSlider";
		this.mouseIsOver = false;
		this.value = new Value(p.value || 0);
		this.width = p.width || 100,
		this.height = p.height|| 10;
		this.min = p.min || 0;
		this.max = p.max || this.width;
		this.range = this.max - this.min;
		this.decimals = p.decimals || 0;
		this.draw();
	}

	this.HSlider.prototype = new Base(); 
	this.HSlider.prototype.constructor = this.HSlider;

	this.HSlider.prototype.draw = function() {
		if (this.value.v > this.max) this.value.v = this.max;
		if (this.value.v < this.min) this.value.v = this.min;

		context.save();
		context.translate(this.x, this.y);	

		context.fillStyle = bgColor;
		context.fillRect(0,0,this.width,this.height);

		var addy = Math.round( Math.max(0, this.height - 11)*0.5 );

		// label
		context.fillStyle = frontColor;
		context.font = font;
		context.textBaseline = "alphabetic";
		context.textAlign = "left";
		context.fillText(this.value.v.toFixed(this.decimals), 0, 9+addy);

		var p = this.getPositionFromValue();
		context.fillStyle = frontColor;
		context.fillRect(0,0,p,this.height);

		context.beginPath();
		context.rect(0,0,p,this.height);
		context.clip();
		
		// label2
		context.fillStyle = bgColor;
		context.font = font;
		context.textBaseline = "alphabetic";
		context.textAlign = "left";
		context.fillText(this.value.v.toFixed(this.decimals), 0, 9+addy);

		context.restore();
		
	}

	this.HSlider.prototype.setValueFromPosition = function(x) {
		var value = ( (this.range/this.width)*x )-(this.range-this.max);
		this.value.v = value;		
	}

	this.HSlider.prototype.getPositionFromValue = function() {
		var percent = (this.value.v - this.min)/this.range;
		return (percent*this.width);
	}

	this.HSlider.prototype.mouseDown = function(x,y) {
		this.setValueFromPosition(x);
		this.draw();
		this.value.updateBind();
	}

	this.HSlider.prototype.mouseUp = function() {
		this.value.updateBind(true);
	}


	/*
	 * VSlider
	 */

	this.VSlider = function ( p ) {
		Base.call( this, p );

		this.name = "VSlider";
		this.mouseIsOver = false;
		this.value = new Value(p.value || 0);
		this.width = p.width || 10;
		this.height = p.height || 100;
		this.min = p.min || 0;
		this.max = p.max || this.height;
		this.decimals = p.decimals || 0;
		this.range = this.max - this.min;
		this.draw();
	}

	this.VSlider.prototype = new Base(); 
	this.VSlider.prototype.constructor = this.VSlider;

	this.VSlider.prototype.draw = function() {
		if (this.value.v > this.max) this.value.v = this.max;
		if (this.value.v < this.min) this.value.v = this.min;

		context.save();
		context.translate(this.x, this.y);

		context.fillStyle = bgColor;
		context.fillRect(0,0,this.width,this.height);

		var addx = Math.round( Math.max(0, this.width - 11)*0.5 );

		// label
		context.save();
		context.translate(9+addx, this.height-1);
		context.rotate(-Math.PI/2);
		
		context.fillStyle = frontColor;
		context.font = font;
		context.textBaseline = "alphabetic";
		context.textAlign = "left";
		context.fillText(this.value.v.toFixed(this.decimals), 0, 0);

		context.restore();

		var p = this.getPositionFromValue();
		context.fillStyle = frontColor;
		context.fillRect(0,p,this.width,this.height-p);

		context.translate(9+addx, this.height-1);
		context.rotate(-Math.PI/2);

		context.beginPath();
		context.rect(-1,-this.width+1,this.height-p,this.width);
		context.clip();
		
		// label2
		context.fillStyle = bgColor;
		context.font = font;
		context.textBaseline = "alphabetic";
		context.textAlign = "left";
		context.fillText(this.value.v.toFixed(this.decimals), 0, 0);

		context.restore();

	}

	this.VSlider.prototype.setValueFromPosition = function(y) {
		var value = this.range - ( (this.range/this.height)*y )-(this.range-this.max);
		this.value.v = value;
	}

	this.VSlider.prototype.getPositionFromValue = function() {
		var percent = (this.value.v - this.min)/this.range;
		return this.height-(percent*this.height);
	}

	this.VSlider.prototype.mouseDown = function(x,y) {
		this.setValueFromPosition(y);
		this.draw();
		this.value.updateBind();
	}

	this.VSlider.prototype.mouseUp = function() {
		this.value.updateBind(true);
	}

	/*
	 * Joystick
	 */

	this.Joystick = function ( p ) {
		Base.call( this, p );

		this.name = "Joystick";
		this.value1 = new Value(0);
		this.value2 = new Value(0);
		this.radius = p.radius || 50;
		this.innerRadius = p.innerRadius || this.radius*0.65;
		this.width = this.radius*2;
		this.height = this.radius*2;
		this.stickx = 0;
		this.sticky = 0;
		this.laststickx = -1;
		this.laststicky = -1;		
		this.maxDistance = this.radius - this.innerRadius - 5;
		this.mouseIsDown = false;
		this.doUpdate = false;
		this.draw();
	}

	this.Joystick.prototype = new Base(); 
	this.Joystick.prototype.constructor = this.Joystick;

	this.Joystick.prototype.draw = function( updateCalling ) {

		// normalize
		if (!this.mouseIsDown) {
			this.stickx += (0 - this.stickx)/3;
			this.sticky += (0 - this.sticky)/3;			
		}

		if (this.stickx.toFixed(2) == this.laststickx.toFixed(2) && this.sticky.toFixed(2) == this.laststicky.toFixed(2) && updateCalling) {
			this.doUpdate = false;
			return;
		}

		this.doUpdate = true;
		
		this.value1.v = this.stickx/this.maxDistance;
		this.value2.v = this.sticky/this.maxDistance;

		context.save();
		context.translate(this.x, this.y);

		context.clearRect(-2,-2,this.width+14,this.height+14);

		// ToDo: Move this gradient creation to the construct and use translate instead...

		//draw outer circle
		var gradient = context.createRadialGradient(this.radius, this.radius, 0, this.radius, this.radius, this.radius+5);
		gradient.addColorStop(0, dimColor);		
		gradient.addColorStop(0.8, frontColor);
		gradient.addColorStop(1, dimColor);
		context.fillStyle = gradient;
		context.beginPath();
		context.arc(this.radius, this.radius, this.radius, 0, Math.PI*2, false); 
		context.closePath();
		context.fill();

		//draw inner circle

		// shadow
		var shadowaddx = (1-this.value1.v)*5;
		var shadowaddy = (1-this.value2.v)*5;

		var gradient = context.createRadialGradient(this.radius+this.stickx+shadowaddx, this.radius+this.sticky+shadowaddy, 0, this.radius+this.stickx+shadowaddx, this.radius+this.sticky+shadowaddy, this.innerRadius+10);
		gradient.addColorStop(0, 'rgba(0,0,0,1)');
		gradient.addColorStop(1, 'rgba(0,0,0,0.00001)');
		context.fillStyle = gradient;
		context.beginPath();
		context.arc(this.radius+this.stickx+shadowaddx, this.radius+this.sticky+shadowaddy, this.innerRadius+10, 0, Math.PI*2, false); 
		context.closePath();
		context.fill();

		// gradient + first circle
		var gradient = context.createLinearGradient(this.radius+this.stickx-this.innerRadius, this.radius+this.sticky-this.innerRadius, this.radius+this.stickx-this.innerRadius, this.radius+this.sticky+this.innerRadius);
		gradient.addColorStop(0, frontColor);
		gradient.addColorStop(1, dimColor);
		context.fillStyle = gradient;
		context.beginPath();
		context.arc(this.radius+this.stickx, this.radius+this.sticky, this.innerRadius, 0, Math.PI*2, false); 
		context.closePath();
		context.fill();

		// gradient + second circle
		var gradient = context.createRadialGradient(this.radius+this.stickx, this.radius+this.sticky, 0, this.radius+this.stickx, this.radius+this.sticky, this.radius);
		gradient.addColorStop(0, frontColor);
		gradient.addColorStop(1, dimColor);
		context.fillStyle = gradient;
		context.beginPath();
		context.arc(this.radius+this.stickx, this.radius+this.sticky, this.innerRadius-4, 0, Math.PI*2, false); 
		context.closePath();
		context.fill();


		this.laststickx = this.stickx;
		this.laststicky = this.sticky;	

		context.restore();	

	}

	this.Joystick.prototype.mouseDown = function(x,y) {

		this.mouseIsDown = true;

		this.stickx = x-this.radius;
		this.sticky = y-this.radius;

		var distance = Math.sqrt(this.stickx * this.stickx + this.sticky * this.sticky);
		
		if (distance > this.maxDistance) {
			var angleRad = Math.atan2(this.stickx, this.sticky);
			this.stickx = Math.sin(angleRad) * this.maxDistance;
			this.sticky = Math.cos(angleRad) * this.maxDistance;
		}

		this.draw();

		this.value1.updateBind();
		this.value2.updateBind();
		
	}

	this.Joystick.prototype.mouseUp = function() {
		this.mouseIsDown = false;
		this.doUpdate = true;
		this.value1.updateBind(true);
		this.value2.updateBind(true);		
	}	

	/*
	 * CircularSlider
	 */

	this.CircularSlider = function ( p ) {
		Base.call( this, p );

		this.name = "CircularSlider";
		this.radius = p.radius || 25;
		this.innerRadius = p.innerRadius || this.radius - 10;
		this.width = this.radius*2;
		this.height = this.radius*2;
		this.min = p.min || 0;
		this.max = p.max || 100;
		this.range = this.max - this.min;
		this.value = new Value(p.value || 0);
		this.rotationValue = this.getRotationValue();
		this.lastRotationValue = this.rotationValue;
		this.decimals = p.decimals || 0;
		this.draw();
	}

	this.CircularSlider.prototype = new Base(); 
	this.CircularSlider.prototype.constructor = this.CircularSlider;

	this.CircularSlider.prototype.getRotationValue = function() {
		var range = Math.PI*2;

		var percent = (this.value.v - this.min)/(this.max - this.min);

		var value = (percent*range);

		return value;
	}

	this.CircularSlider.prototype.draw = function() {
		if (this.value.v < this.min) this.value.v = this.min;
		if (this.value.v > this.max) this.value.v = this.max;

		context.save();
		context.translate(this.x, this.y);

		context.clearRect(0,0,this.width,this.height);
		//draw background circle
		context.fillStyle = bgColor;
		context.beginPath();
		context.arc(this.radius, this.radius, this.radius, -Math.PI*0.5, Math.PI*1.5, false); 
		context.closePath();
		context.fill();

		// draw foreground circle
		context.fillStyle = frontColor;
		context.beginPath();
		context.moveTo(this.radius, this.radius);
		context.lineTo(this.radius, 0);
		context.arc(this.radius, this.radius, this.radius, -Math.PI*0.5, this.rotationValue-Math.PI*0.5, false); 
		context.closePath();
		context.fill();

		// clear center
		context.globalCompositeOperation = "destination-out";
		context.beginPath();
		context.arc(this.radius, this.radius, this.innerRadius, -Math.PI*0.5, Math.PI*1.5, false); 
		context.closePath();
		context.fill();		
		context.globalCompositeOperation = "source-over";

		// label
		context.fillStyle = bgColor;
		context.font = font;
		context.textBaseline = "alphabetic";
		context.textAlign = "center";
		context.fillText(this.value.v.toFixed(this.decimals), this.radius, this.radius+4);

		context.restore();
	}

	this.CircularSlider.prototype.mouseDown = function(x,y) {

	    var dx = this.radius - x;
	    var dy = this.radius - y;
	    this.rotationValue = Math.atan2(dy, dx) - Math.PI*0.5;

		var range = Math.PI*2;
		this.rotationValue = (((this.rotationValue%range)+range)%range); // keep it between 0 - Pi2 

		// too much dif, use old value
		var dif = Math.abs(this.rotationValue - this.lastRotationValue);
		if (dif > Math.PI) {
			this.rotationValue = this.lastRotationValue;
		}
		
		var steps = 1/range;
		var value = (this.rotationValue)*steps;

		this.value.v = (this.range*value)+this.min;
		
		this.draw();
		this.value.updateBind();

		this.lastRotationValue = this.rotationValue;
	
	}

	this.CircularSlider.prototype.mouseUp = function() {
		this.value.updateBind(true);
	}

	/*
	 * Scrollwheel
	 */

	this.Scrollwheel = function ( p ) {
		Base.call( this, p );

		this.name = "Scrollwheel";
		this.width = p.width || 20;
		this.height = p.height || 80;
		this.centerx = this.x+this.width*0.5;
		this.centery = this.y+this.height*0.5;
		this.min = p.min || -1;
		this.max = p.max || 1;
		this.range = this.max - this.min;
		this.value = new Value(p.value || 0);
		this.lastValue = this.value.v;
		this.decimals = p.decimals || 2;

		// make a pattern
		this.pattern = document.createElement("canvas");
		this.pattern.width = this.width;
		this.pattern.height = this.height*3;
		var patternContext = this.pattern.getContext('2d');
		var colors = [frontColor, dimColor];
		for (var i = 0; i < this.pattern.height; i+=2) {
			patternContext.fillStyle = colors[(i*0.5)%2];
			patternContext.fillRect(0,i,128,2);
		}

		this.mouseStartY = null;
		this.mouseOffsetY = 0;
		this.offsetY = 0;

		this.doUpdate = true;
		this.draw();
	}

	this.Scrollwheel.prototype = new Base(); 
	this.Scrollwheel.prototype.constructor = this.Scrollwheel;


	this.Scrollwheel.prototype.draw = function() {
		if (this.value.v < this.min) this.value.v = this.min;
		if (this.value.v > this.max) this.value.v = this.max;

		// normalize
		this.offsetY += (this.mouseOffsetY - this.offsetY)/10;

		context.save();
		context.translate(this.x, this.y);

		// background
		context.fillStyle = bgColor;
		context.fillRect(0,0,this.width,this.height);
		// pattern
		context.save();
		context.beginPath();
		context.rect(2,2,this.width-4,this.height-4);
		context.clip();
		context.drawImage(this.pattern, 0, -this.height+this.offsetY);
		context.restore();
		// cover gradient
		var gradient = context.createLinearGradient(0,0,0,this.height);
		gradient.addColorStop(0, "rgba(0,0,0,0.7)");		
		gradient.addColorStop(0.4, "rgba(0,0,0,0)");
		gradient.addColorStop(0.6, "rgba(0,0,0,0)");
		gradient.addColorStop(1, "rgba(0,0,0,0.7)");
		context.fillStyle = gradient;
		context.fillRect(0,0,this.width,this.height);

		// update value
		var percent = ((this.offsetY+this.height)/(this.height*2));
		this.value.v = ((this.range*percent)+this.min).toFixed(this.decimals);
		if (this.value.v != this.lastValue) {
			this.value.updateBind();
			this.doUpdate = true;
		} else {
			this.doUpdate = false;
		}
		this.lastValue = this.value.v;

		context.restore();

	}

	this.Scrollwheel.prototype.mouseDown = function(x,y) {

		if (this.mouseStartY == null) {
			this.mouseStartY = y;
		}

		this.mouseOffsetY = y - this.mouseStartY;

		if (this.mouseOffsetY > this.height) this.mouseOffsetY = this.height;
		if (this.mouseOffsetY < -this.height) this.mouseOffsetY = -this.height;

		this.draw();
	
	}

	this.Scrollwheel.prototype.mouseUp = function() {
		this.mouseStartY = null;
		this.mouseOffsetY = 0;
		this.doUpdate = true;
		this.value.updateBind(true);
	}


	/*
	 * Label
	 */

	this.Label = function ( p ) {
		Base.call( this, p );

		this.name = "Label";
		this.group = null;
		this.value = new Value(p.text || "");
		this.width = 0;
		this.height = 13;
		this.draw();
	}

	this.Label.prototype = new Base(); 
	this.Label.prototype.constructor = this.Label;

	this.Label.prototype.draw = function() {
		context.clearRect(this.x,this.y,this.width,this.height);

		// label
		context.fillStyle = bgColor;
		context.font = font;
		context.textBaseline = "alphabetic";
		context.textAlign = "left";
		context.fillText(this.value.v, this.x, this.y+9);
		var labelWidth = context.measureText(this.value.v);
		this.width = labelWidth.width + 3;
	}

	this.Label.prototype.mouseDown = function() {
		
	}

	this.Label.prototype.mouseUp = function() {

	}

	this.onResize = function () {
		
		container.style.width = ""+this.width+"px";
		container.style.height = ""+this.height+"px";

		canvas.width = this.width;
		canvas.height = this.height;

	}

	this.dispose = function () {
		
		this.disableEvents();

		pool.length = 0;
		container.removeChild(canvas);
		container.innerHTML = "";

		document.getElementById(containerId).parentNode.removeChild(container);

		for (var i in this) {
			delete this[i];
		}

	}

	this.update = function () {
		time = Date.now();
		delta = time - oldTime;
		oldTime = time;

		for (var i=0; i<pool.length; ++i ) {
			var o = pool[i];

			// special Joystick and Scrollwheel case
			if (o.name == "Joystick" || o.name == "Scrollwheel") {
				if (o.doUpdate) {
					o.draw( true );
				}
				continue;
			}

			// 1 value
			if (o.value) {
				if ((o.value.receiver || o.value.both) && time > (o.lastUpdate+o.updateInterval)) {
					o.value.updateBind();
					o.draw();
					o.lastUpdate = time;
				}
			}
			// 2 values
			if (o.value1) {
				var doUpdate = false;
				if ((o.value1.receiver || o.value1.both) && time > (o.lastUpdate+o.updateInterval)) {
					o.value1.updateBind();
					doUpdate = true;
				}
				if ((o.value2.receiver || o.value2.both) && time > (o.lastUpdate+o.updateInterval)) {
					o.value2.updateBind();
					doUpdate = true;
				}
				if (doUpdate) {
					o.draw();
					o.lastUpdate = time;
				}
			}

		}
	}

	return {

		getDomElement: function () { return container; },
		getContext: function () { return context; },
		HSlider: this.HSlider,
		VSlider: this.VSlider,
		Label: this.Label,
		RadioButton: this.RadioButton,
		RadioButtonGroup: this.RadioButtonGroup,
		CheckBox: this.CheckBox,
		Knob: this.Knob,
		ColorPicker: this.ColorPicker,
		ColorPicker2: this.ColorPicker2,
		ColorPicker3: this.ColorPicker3,
		TrackPad: this.TrackPad,
		Button: this.Button,
		ImageButton: this.ImageButton,
		Graph: this.Graph,
		Stepper: this.Stepper,
		InputText: this.InputText,
		DropDown: this.DropDown,
		Matrix: this.Matrix,
		RangeSlider: this.RangeSlider,
		Joystick: this.Joystick,
		CircularSlider: this.CircularSlider,
		Scrollwheel: this.Scrollwheel,
		update: this.update,
		onResize: this.onResize,
		disableEvents: this.disableEvents,
		enableEvents: this.enableEvents,
		dispose: this.dispose

	};


};


/*
 * General
 */


function colorToHex(c) {
	var m = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(c);
	return m ? (1 << 24 | m[1] << 16 | m[2] << 8 | m[3]).toString(16).substr(1) : c;
}

HTMLCanvasElement.prototype.relativeMouseCoords = function (event) {
	var totalOffsetX = 0;
	var totalOffsetY = 0;
	var canvasX = 0;
	var canvasY = 0;
	var currentElement = this;

	do {
		totalOffsetX += currentElement.offsetLeft;
		totalOffsetY += currentElement.offsetTop;
	}
	while (currentElement = currentElement.offsetParent)

	canvasX = event.pageX - totalOffsetX;
	canvasY = event.pageY - totalOffsetY;

	// Fix for variable canvas width
	canvasX = Math.round( canvasX * (this.width / this.offsetWidth) );
	canvasY = Math.round( canvasY * (this.height / this.offsetHeight) );

	return {x:canvasX, y:canvasY}
}
