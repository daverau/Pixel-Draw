/*

pixel draw
by dave rau
v1.1.2

*/


// # Setup
// px global variable stores all app settings, data objects and dom pointers
var px = {};

// get pixel drawings if saved
// also really nice example of localforage call
localforage.getItem('pixelDrawings', setPxIds);
function setPxIds(value) {
	px.ids = value || [];
}

px.selected = '#32328F';
px.swatching = false;
// for color selection & dragging
px.dragstartX = 0;
px.dragstartY = 0;
px.drag = false;
px.loaded = false;

// options
localforage.getItem('pixelDraw_options', setPxOptions);
function setPxOptions(value) {
	px.options = value || {};
}

// for local testing setup
px.testing = false;
if (window.location.hostname === 'pixeldraw.dev') {
	px.testing = true;
}

// # DOM cache
px.$body = document.getElementById('thebody');
px.$busy = document.getElementById('busy');
px.$paper = document.getElementById('paper');
px.$pixels = px.$paper.getElementsByTagName('td');
px.$savespot = document.getElementById('savespot');
px.$loadbox = document.getElementById('loadbox');
px.$aboutbox = document.getElementById('aboutbox');
px.$saved = document.getElementById('saved');
px.$tools = document.getElementById('tools');
px.$colorbox = document.getElementById('colorbox');
px.$workspace = document.getElementById('workspace');

px.$picker = document.getElementById('picker');
px.$bnew = document.getElementById('new');
px.$buttonsave = document.getElementById('save');
px.$buttonload = document.getElementById('load');
px.$gridsizer = document.getElementById('size');
px.$labelGridsize = document.getElementById('label-gridsize');

px.$header = document.getElementById('header');
px.$nav = document.getElementById('nav');
px.$lightsout = document.getElementById('lightsout');
px.$buttonSquare = document.getElementById('square');
px.$buttonGridlines = document.getElementById('gridlines');

px.$infobutton = document.getElementById('info');
px.$button_getsupport = document.getElementById('getsupport');
px.$button_pixelblog = document.getElementById('pixelblog');

px.$swatches = document.getElementById('swatches');
px.$swatchpixels = px.$swatches.getElementsByTagName('li');
px.$swatch1 = document.getElementById('swatch1');
px.$swatch2 = document.getElementById('swatch2');
px.$swatch3 = document.getElementById('swatch3');
px.$swatch4 = document.getElementById('swatch4');
px.$swatch5 = document.getElementById('swatch5');
px.$swatch6 = document.getElementById('swatch6');
px.$swatch7 = document.getElementById('swatch7');
px.$swatch8 = document.getElementById('swatch8');
px.$swatch9 = document.getElementById('swatch9');
px.$swatch10 = document.getElementById('swatch10');
px.$swatch11 = document.getElementById('swatch11');
px.$swatch12 = document.getElementById('swatch12');
px.$swatch13 = document.getElementById('swatch13');
px.$swatch14 = document.getElementById('swatch14');
px.$swatch15 = document.getElementById('swatch15');
px.$swatch16 = document.getElementById('swatch16');
px.$sliderS = document.getElementById('s');
px.$sliderL = document.getElementById('l');
px.$buttonrandomcolor = document.getElementById('color-random');

// show page elements hidden from initial load
px.$header.classList.remove('hide');
px.$nav.classList.remove('hide');
px.$tools.classList.remove('hide');

// unhide boxes
px.$loadbox.classList.remove('hide');
px.$colorbox.classList.remove('hide');
px.$aboutbox.classList.remove('hide');
px.$cardsflip = document.getElementsByClassName('flip');


// make drawing table grid
function makeGrid(rows, cols) {
	//console.log( 'makeGrid' );
	var doc = document.createDocumentFragment();

	px.$labelGridsize.innerHTML = px.cols + ' x ' + px.rows;
	px.$paper.innerHTML = '';

	for (var r = 0; r < rows; r++) {
		var tr = document.createElement('tr');
		for (var c = 0; c < cols; c++) {
			var td = document.createElement('td');
			td.dataset.type = 'pixel';
			tr.appendChild(td);
		}
		doc.appendChild(tr);
	}

	// add table and resize
	px.$paper.appendChild(doc);
	doc = null;
}


// # fill
function clearGrid() {
	//console.log( 'clearGrid' );
	for (var i = 0, max = px.$pixels.length; i < max; i++) {
		px.$pixels[i].style.backgroundColor = px.selected;
	}
}

// change selected color and related elements
function setColor(color, target) {
	px.selected = color;
	px.$picker.style.backgroundColor = px.selected;
	px.$bnew.style.color = px.selected;
	target.style.backgroundColor = px.selected;
}
// set picker color
setColor(px.selected, px.$picker);


// hide last few picker swatches for short screens like iphone 4 and 5
function setSwatchesCount() {
	var swatch_h = px.$swatch1.offsetHeight;
	var cnt = Math.floor(px.$paper.clientHeight / swatch_h);
	if (cnt < 16) {
		var pickerSwatches = '';
		for (var x=cnt; x<=16; x++) {
			pickerSwatches += '#picker li:nth-child('+x+'),';
		}
		// trim last comma
		var lastpickers = document.querySelectorAll(pickerSwatches.slice(0, - 1));
		for (var i = 0, max = lastpickers.length; i < max; i++) {
			lastpickers[i].classList.add('hide');
		}
	}
	px.$picker.classList.remove('hide');
}


// # Touch events
// drawing
px.$paper.addEventListener('touchstart', drawStart, false);
px.$paper.addEventListener('touchmove', drawMove, false);
function drawStart(e) {
	e.preventDefault();
	e.target.style.backgroundColor = px.selected;
}
function drawMove(e) {
	var td = document.elementFromPoint(e.targetTouches[0].pageX, e.targetTouches[0].pageY);
	if (td) {
		if (td.localName === 'td' && td.dataset.type == 'pixel') {
			td.style.backgroundColor = px.selected;
		}
	}
	td = null;
}

// color picker
px.$picker.addEventListener('touchstart', pickerStart, false);
px.$picker.addEventListener('touchmove', pickerMove, false);
px.$picker.addEventListener('touchend', pickerEnd, false);
function pickerStart(e) {
	e.preventDefault();
	if (e.target.dataset.type == 'swatch') {
		// color select
		setColor(e.target.style.backgroundColor, px.$picker);
	} else if (e.target.dataset.type == 'plus') {
		toggleColorbox({});
	}
}
function pickerMove(e) {
	var li = document.elementFromPoint(e.targetTouches[0].pageX, e.targetTouches[0].pageY);
	// is swatch
	if (li) {
		if (li.dataset.type == 'swatch' || li.dataset.type == 'pixel') {
			setColor(li.style.backgroundColor, px.$picker);
		}
	}
	li = null;
}
function pickerEnd(e) {
	e.preventDefault();
}


// build color swatches
function makeSwatches(s, l) {
	//console.log( 'makeSwatches' );
	var docFragm = document.createDocumentFragment();
	var elem;
	px.$swatches.innerHTML = '';
	for (var i = 0; i < 360; i += 12) {
		elem = document.createElement('li');
		elem.style.background = 'hsl(' + i + ', ' + s + '%, ' + l + '%)';
		elem.dataset.type = 'boxswatch';
		docFragm.appendChild(elem);
	}
	px.$swatches.appendChild(docFragm);
	docFragm = null;
}


// swatch drag and drop
px.$swatches.addEventListener('touchstart', swatchStart, false);
px.$swatches.addEventListener('touchmove', swatchMove, false);
px.$swatches.addEventListener('touchend', swatchEnd, false);
function swatchStart(e) {
	px.originaltarget = e.target;
	if (e.target.dataset.type === 'boxswatch') {
		e.preventDefault();
		px.selected = px.originaltarget.style.backgroundColor;
		setColor(px.selected, px.$picker);
		px.dragstartX = e.targetTouches[0].pageX;
		px.dragstartY = e.targetTouches[0].pageY;
		px.originaltarget.classList.add('dragging');
		px.drag = true;
	}
}
function swatchMove(e) {
	console.log('move'); // [hack][todo] leave this in for iphone bug? wtf this won't pass apple app store right?
	var curX = e.targetTouches[0].pageX - px.dragstartX,
	curY = e.targetTouches[0].pageY - px.dragstartY;
	px.originaltarget.style.webkitTransform = 'translate(' + curX + 'px, ' + curY + 'px)';
}
function swatchEnd(e) {
	e.preventDefault();
	px.originaltarget.style.webkitTransform = 'translate(0)';
	px.originaltarget.classList.remove('dragging');
	px.originaltarget = false;

	// update picker color to dropped color swatch
	var dropli = document.elementFromPoint(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
	if (dropli.dataset.type === 'swatch') {
		dropli.style.backgroundColor = px.selected;
	}

	dropli = null;
	px.drag = false;
}


// # toggle color box picker
function toggleColorbox(e) {
	px.$nav.classList.add('closed');
	if (!px.swatching) {
		px.swatching = true;
		// select this color swatch
		toggleSelected(e.target, px.$picker);
		px.$body.classList.add('x');
	} else {
		px.swatching = false;
		// unselect
		toggleSelected({}, px.$picker);
		px.$body.classList.remove('x');
	}
	px.$colorbox.classList.toggle('closed');
}


// # Color swatches for the color box
var colors = {
	's': px.$sliderS.value * 2, // saturation
	'l': px.$sliderL.value * 2 // luminosity
};
makeSwatches(colors.s, colors.l);


// color functions group for setting and selecting colors
// toggle selected class
function toggleSelected(elem, parent) {
	if (parent.getElementsByClassName('selected')[0]) {
		// unselect first (only) target
		parent.getElementsByClassName('selected')[0].className = '';
	}
	// then select
	if (elem) {
		elem.className = 'selected';
	}
}




// # Buttons

// header toggle
px.$header.addEventListener("touchend", headerclick, false);
function headerclick() {
	if (!px.$loadbox.classList.contains('closed')) {
		// close loadbox
		px.$loadbox.classList.add('closed');
		px.$body.classList.remove('x');
	} else if (!px.$colorbox.classList.contains('closed')) {
		// close colorbox
		// set colorbox variables
		px.swatching = false;
		// unselect
		toggleSelected({}, px.$picker);
		px.$colorbox.classList.add('closed');
		px.$body.classList.remove('x');
	} else if (!px.$aboutbox.classList.contains('closed')) {
		// about box
		px.$aboutbox.classList.add('closed');
		px.$body.classList.remove('x');
	} else {
		// otherwise close nav
		px.$nav.classList.toggle('closed');
	}
}


// new/fill/clear grid
px.$bnew.addEventListener('touchstart', bnewclick, false);
function bnewclick() {
	clearGrid();
	px.$body.classList.remove('x');
	px.$nav.classList.add('closed');
}

// info box
px.$infobutton.addEventListener('touchstart', infobuttonclick, false);
function infobuttonclick() {
	px.$body.classList.remove('x');
	px.$nav.classList.add('closed');

	px.$aboutbox.classList.remove('closed');
	px.$body.classList.add('x');
}

// toggle dark/light mode (.lightsout)
px.$lightsout.addEventListener('touchstart', lightsoutclick, false);
function lightsoutclick() {
	px.$nav.classList.add('closed');
	px.$body.classList.toggle('lightsout');
}

// toggle square/rectangle
px.$buttonSquare.addEventListener('touchstart', buttonSquareclick, false);
function buttonSquareclick() {
	px.$body.classList.toggle('square');
	px.$nav.classList.add('closed');
	setSquareCanvas();
}

// toggle grid lines
px.$buttonGridlines.addEventListener('touchstart', buttonGridlinesclick, false);
function buttonGridlinesclick() {
	px.$buttonGridlines.classList = '';
	px.$paper.classList.toggle('gridlines');
	px.$nav.classList.add('closed');

	// button text 'grid/no grid'
	var txt = px.$paper.classList.contains('gridlines') ? 'normal' : 'strike';
	px.$buttonGridlines.classList.add(txt);
}

// grid resize
px.$gridsizer.onchange = function (e) {
	px.cols = e.target.value;
	px.gridsize = px.$paper.clientWidth / px.cols;
	px.rows = Math.floor(px.$paper.clientHeight / px.gridsize);
	makeGrid(px.rows,px.cols);
};

// saturation slider
px.$sliderS.onchange = function (e) {
	colors.s = e.target.value * 2;
	for (var i = 0, max = px.$swatchpixels.length; i < max; i++) {
		px.$swatchpixels[i].style.backgroundColor = 'hsl(' + (i	* 12) + ', ' + colors.s + '%, ' + colors.l + '%)';
	}
};

// lightness slider
px.$sliderL.onchange = function (e) {
	colors.l = e.target.value * 2;
	for (var i = 0, max = px.$swatchpixels.length; i < max; i++) {
		px.$swatchpixels[i].style.backgroundColor = 'hsl(' + (i	* 12) + ', ' + colors.s + '%, ' + colors.l + '%)';
	}
};

// random button
px.$buttonrandomcolor.addEventListener('touchstart', buttonrandomcolorclick, false);
function buttonrandomcolorclick_swatches() {
	function get_random_color() {
		var h = rand(1, 360);
		var s = rand(0, 100);
		var l = rand(0, 100);
		return 'hsl(' + h + ',' + s + '%,' + l + '%)';
	}
	for (var i = 1; i < 17; i++) {
		px['$swatch' + i].style.backgroundColor = get_random_color();
	}
}
// new click action for randomizing saturation and lightness of the pixel pool
function buttonrandomcolorclick() {
	function get_random_color() {
		var h = rand(1, 360);
		var s = rand(0, 100);
		var l = rand(10, 90);
		return 'hsl(' + h + ',' + s + '%,' + l + '%)';
	}
	for (var i = 0, max = px.$swatchpixels.length; i < max; i++) {
		px.$swatchpixels[i].style.backgroundColor = get_random_color();
	}
}


// # Save
// load drawings update html loadbox
function update_loadbox() {
	if (px.ids.length > 0) {
		var html = '';

		// async loop to load drawings
		// http://blog.chaoscollective.org/post/40284901138/webninja-tutorial-asynchronous-for-loops
		// https://gist.github.com/akumpf/4514343#file-forloop_jquery_callback-js
		(function(){
			var i = 0;
			function forloop(){
			if ( i < Object.keys(px.ids).length ) {
				var drawingID = 'pixelDrawing_' + px.ids[i];
				localforage.getItem(drawingID, function(drawing) {
					if (drawing) {
						if (drawing.id > 0) {
							html += getHTMLsaveSnippet(drawing.id,drawing.img);
						}
					}
					i++;
					forloop();
				});
			} else {
				//console.log("all done");
				px.$saved.innerHTML = html;
				html = null;
				hideBusy();
			}
			}
			forloop();
		})();

	} else {
		px.$saved.innerHTML = '<li class="nodrawings">No Drawings. <span class="smaller">Go push some pixels!</span><span class="ok" data-js="ok">ok</span></li>';
		hideBusy();
	}
	px.loaded = true;
}

// cheap template save snippet
function getHTMLsaveSnippet(id,img) {
	return '<li id="load'+id+'"><span data-id="'+id+'" data-js="flip">' + id +'</span><div id="card'+id+'" class="card" data-id="'+id+'"><p class="front" data-id="'+id+'"><img src="'+img+'" data-id="'+id+'" data-js="load" /></p><p class="back"><b data-id="'+id+'" data-js="delete" class="delete-drawing">delete</b></p></div></li>';
}


// Save event
// [todo] make this proper with callbacks/promises
px.$buttonsave.addEventListener('touchstart', buttonsaveclick, false);
function buttonsaveclick() {
	px.$nav.classList.add('closed');
	setTimeout(function() {
		// first
		px.$busy.classList.remove('hide');
		setTimeout(function() {
			// second
			saveDrawing();
			setTimeout(function() {
				// third
				showSaveMsg();
				px.loaded = false;
			}, 250);
		}, 100);
	}, 10);
}


// # Render drawing table as canvas element and return png image data
function drawCanvasGrid(pixels, rows, cols) {
	var appw = window.innerWidth,
	apph = window.innerHeight,
	pixelw = Math.ceil(appw / cols),
	pixelh = Math.ceil(apph / rows),
	a = 0,
	offsetw = (((pixelw * cols) - appw) / 2),
	offseth = (((pixelh * rows) - apph) / 2);

	var savespot = px.$savespot.getContext('2d');

	// loop over rows, then columns and draw each pixel to the canvas
	var bgcolor = document.defaultView.getComputedStyle(px.$body,null)['background-color'];
	for (var x = 0; x < rows; x++) {
		for (var y = 0; y < cols; y++) {
			savespot.fillStyle = pixels[a] || bgcolor;
			savespot.fillRect(((y * pixelw) - offsetw), ((pixelh * x) - offseth), pixelw, pixelh);
			a++;
		}
	}
	return px.$savespot.toDataURL('image/png');
}


// save single drawing
function saveDrawing() {
	// get id
	var id = 1;
	if (Math.max.apply(null, px.ids) + 1 > 0) {
		id = Math.max.apply(null, px.ids) + 1;
	}

	// get actual rows and cols
	px.rows = px.$paper.rows.length;
	px.cols = px.$paper.rows[0].cells.length;

	var drawing = {
		'id': id,
		'colorindex': [],
		'colors': [],
		'swatches': [],
		'rows': px.rows,
		'cols': px.cols,
		'gridsize': px.gridsize,
		'img': null,
		'date': new Date()
	};

	// colors array of pixels in drawing
	for (var i = 0, max = px.$pixels.length; i < max; i++) {
		//var c = px.$pixels[i].style.backgroundColor;
		drawing.colors.push( px.$pixels[i].style.backgroundColor );
	}
	drawing.colorindex = [...new Set(drawing.colors)];

	// translate pixels to canvas element get image data
	drawing.img = drawCanvasGrid(drawing.colors, px.rows, px.cols);

	// compress colors
	var compressed = [];
	for (var j = 0, jmax = drawing.colors.length; j < jmax; j++) {
		//var cid = drawing.colors[j];
		compressed.push(drawing.colorindex.indexOf( drawing.colors[j] ));
	}
	drawing.colors = compressed;

	// swatch colors from picker
	for (var k = 1; k < 17; k++) {
		drawing.swatches.push( px['$swatch' + k].style.backgroundColor );
	}

	// update ids
	px.ids.push(drawing.id);

	localforage.setItem('pixelDrawings', px.ids).then(localforage.setItem('pixelDrawing_' + (drawing.id), drawing).then(updateAfterSave));
	;
	// save to camera roll
	function updateAfterSave(value) {
		// update html load box
		px.$saved.getElementsByClassName('nodrawings')[0].classList.add('hide');
		px.$saved.innerHTML += getHTMLsaveSnippet(drawing.id, drawing.img);

		// to camera roll/library via phonegap plugin
		// https://github.com/devgeeks/Canvas2ImagePlugin
		saveToCameraRoll();
	}
}

// save to photo library/camera roll
function saveToCameraRoll() {
	if (typeof canvas2ImagePlugin !== 'undefined') {
		canvas2ImagePlugin.saveImageDataToLibrary(
		function(msg) {
			//console.log(msg);
		}, function(err) {
			//console.log(err);
		}, 'savespot');
	}
}

// show save dialogue
function showSaveMsg() {
	closeBusy();
	function closeBusy() {
		px.$busy.classList.add('hide');
	}
	showMsg('Nice Save');
}


// # Load
// load button
px.$buttonload.addEventListener('touchstart', buttonloadclick, false);
function buttonloadclick() {

	// close others
	px.$nav.classList.add('closed');
	px.$colorbox.classList.add('closed');

	// open load box
	px.$loadbox.classList.remove('closed');
	px.$body.classList.add('x');

	// show busy indicator first time loading
	if (!px.loaded) {

		setTimeout(function() {
			px.$busy.classList.remove('hide');
			setTimeout(function() {
				// load box setup
				update_loadbox();
			}, 20);
		}, 10);
	}
}

// load a drawing to paper, grid sized, and picker colors set
function loadDrawing(id) {
	// look up drawing with id
	localforage.getItem('pixelDrawing_' + id, function(drawing){

		// update grid size + label
		px.gridsize = drawing.gridsize;
		px.$labelGridsize.innerHTML = drawing.cols + ' x ' + drawing.rows;

		// redraw grid if needed
		if (px.$pixels.length !== drawing.rows * drawing.cols) {
			makeGrid(drawing.rows, drawing.cols);
		}

		// load color data
		for (var i = 0, max = px.$pixels.length; i < max; i++) {
			px.$pixels[i].style.backgroundColor = drawing.colorindex[drawing.colors[i]];
		}

		// load picker colors
		for (var j = 1; j < 17; j++) {
			px['$swatch' + j].style.backgroundColor = drawing.swatches[j];
		}
	});

}


// load drawing click events
px.$loadbox.addEventListener('touchstart', loadboxstart, false);
px.$loadbox.addEventListener('touchmove', loadboxdrag, false);
px.$loadbox.addEventListener('touchend', loadboxclick, false);
function loadboxstart() {
	px.drag = false;
}
function loadboxdrag() {
	px.drag = true;
}
function loadboxclick(e) {
	if (e.target.dataset.id && !px.drag) {
		var id = e.target.dataset.id;
		function showBusy(callback) {
			//console.log('showBusy');
			px.$busy.classList.remove('hide');
			callback();
		}
		if (e.target.dataset.js === 'delete') {
			// delete
			showBusy(function(){
				deleteDrawing(id);
			});
		} else if (e.target.dataset.js === 'flip') {
			// toggle flip
			document.getElementById('card'+id).classList.toggle('flip');
		} else if (e.target.dataset.js === 'load') {
			// load
			loadDrawing(id);
			px.$body.classList.remove('x');
			px.$loadbox.classList.add('closed');
		}
	} else if (e.target.dataset.js === 'ok') {
		// .ok
		px.$body.classList.remove('x');
		px.$loadbox.classList.add('closed');
	}
	px.drag = false;
}

// # Delete
// remove drawing
function deleteDrawing(id) {
	//console.log('deleteDrawing');
	id = parseInt(id);

	px.ids = _.without(px.ids, id);
	//var pos = px.ids.indexOf(id);
	//px.ids = px.ids.splice(pos, 1);

	localforage.removeItem('pixelDrawing_' + id, function(){
		document.getElementById('load'+id).outerHTML = '';
		localforage.setItem('pixelDrawings', px.ids, function(){
			if (px.ids.length < 1) {
				update_loadbox();
			}
			hideBusy();
		});
	});

}
// helpers
function hideBusy() {
	px.$busy.classList.add('hide');
}
// basic randomize
function rand(min, max) {
	return parseInt(Math.random() * (max-min+1), 10) + min;
}
function showMsg(txt) {
	if (px.testing) {
		alert(txt);
	} else if (navigator.notification) {
		navigator.notification.alert('', null, txt, 'Done');
	}
}


// set square canvas
function setSquareCanvas() {
	px.$paper.style.height = px.$paper.offsetWidth;
	//gridInfo();
}


// external links
px.$button_getsupport.addEventListener('touchend', getsupportgo, false);
function getsupportgo() {
	window.open('http://pixeldrawapp.com/support/', '_system');
}
px.$button_pixelblog.addEventListener('touchend', pixelbloggo, false);
function pixelbloggo() {
	window.open('http://pixeldrawapp.com/blog/', '_system');
}


// # Run grid setup
// # Grid setup
// iphone
px.margins = 8;
px.gridsize = 27;
px.cols = Math.floor(px.$paper.clientWidth / px.gridsize);
px.rows = Math.floor(px.$paper.clientHeight / px.gridsize);
//px.$gridsizer.max = 60;
// ipad
if (window.innerWidth >= 600) {
	px.gridsize = 32;
	px.margins = 25;
	px.$gridsizer.max = 30;
}
// desktop
if (window.innerWidth >= 1200) {
	px.gridsize = 75;
	px.$gridsizer.max = 60;
}

// make table drawing grid
makeGrid(px.rows, px.cols);

// hide any picker colors that won't fix on the screen
setSwatchesCount();

// set savespot width/height to full screen
px.$savespot.width = window.innerWidth;
px.$savespot.height = window.innerHeight;
