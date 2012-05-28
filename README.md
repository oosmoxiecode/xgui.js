xgui.js
=======

Some simple gui stuff to try and make js experimentation a bit easier.
The idea is to be able to quickly set up a bunch of sliders, knobs, colorPickers, etc. and bind the values of these to objects or functions.

It gives you a bunch of gui stuff, like these:
[![example](http://oosmoxiecode.github.com/assets/xgui.png)](http://oosmoxiecode.github.com/examples/xgui.js/testbed.html)
(Click the screenshot to open)

### Basic usage ###

Download the [minified js file](http://oosmoxiecode.github.com/xgui.js/build/xgui.min.js) and include it in your html.

```html
<script src="js/xgui.min.js"></script>
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

More examples to come. For now look in */examples/testbed.html* for some ideas of how to use it.