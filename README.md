xgui.js
=======

Some simple gui stuff to try and make js experimentation a bit easier.

The idea is to be able to quickly set up a bunch of sliders, knobs, colorPickers, etc. and bind the values of these to objects or functions.

It gives you a bunch of gui stuff, like [these](http://oosmoxiecode.github.io/examples/xgui.js/testbed.html)(or a more touch friendly one [here](http://oosmoxiecode.github.com/examples/xgui.js/testbed_touch.html)):

[![example](http://oosmoxiecode.github.com/assets/xgui.png)](http://oosmoxiecode.github.com/examples/xgui.js/testbed.html)

### Basic usage ###

Download the [minified js file](https://github.com/oosmoxiecode/xgui.js/blob/master/build/xgui.min.js) and include it in your html.

```html
<script src="xgui.min.js"></script>
```

This code creates a "xgui" and adds it to the document.body, makes a HSlider, binds some properties of a testObject.

```html
<script>

	var testObject = { x:0, y:0 };

	var gui = new xgui();
	document.body.appendChild( gui.getDomElement() );

	var slider = new gui.HSlider( {x:10, y:10, value: 0, min:-100, max:100} );
	slider.value.bind(testObject, "x", "y");

</script>
```

So when you drag the slider testObject.x and testObject.y will be set to the value of the slider.

More examples to come. For now look in */examples/testbed.html* and */examples/testbed_touch.html* for some idea of how to use it.
Some examples where I used it: [Dragon Curve](http://oos.moxiecode.com/js_canvas/dragoncurve/), [Balls Box2d](http://oos.moxiecode.com/js_canvas/balls_box2d/), [Drum machine](http://oos.moxiecode.com/js_webgl/drum_machine_webaudio/)

Inspiration came from similar stuff for OpenFrameworks, like [this](http://forum.openframeworks.cc/t/different-guis-for-openframeworks/4376).

It currently includes these elements:
**HSlider,
VSlider,
Label,
RadioButton,
RadioButtonGroup,
CheckBox,
Knob,
ColorPicker,
ColorPicker2,
TrackPad,
Button,
ImageButton,
Graph,
Stepper,
InputText,
DropDown,
Matrix,
RangeSlider,
Joystick.**

**History**

r1 - Made it touch friendly, so multitouch should hopefully work(Tested on Nexus 4/7). Added Joystick, like an analog stick. Fixed various bugs and stuff.

r0 - Initial version.