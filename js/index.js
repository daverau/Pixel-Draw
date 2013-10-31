/*

pixel draw
by dave rau
v0.0.5

[bugs]
    prevent multi touch color drag

[v2]
    break up init code with phonegap deviceready
    square/rectangle grid toggle
    share on instagram (https://github.com/vstirbu/InstagramPlugin)

*/


// # Go
function goApp() {

// # Reset drawing data
//localStorage.clear();


// # Setup
// px global variable stores all app settings, data objects and dom pointers
var px = {};
px.ids = JSON.parse(localStorage.getItem('pixelDrawings')) || [];
px.selected = '#32328F';
px.swatching = false;
// for color selection & dragging
px.dragstartX = 0;
px.dragstartY = 0;
px.drag = false;
// for local testing setup
px.testing = false;
if (window.location.hostname === 'pixeldraw.dev') {
    px.testing = true;
}

// dom cache
px.$body = document.getElementById('thebody');
px.$busy = document.getElementById('busy');
px.$paper = document.getElementById('paper');
px.$savespot = document.getElementById('savespot');
px.$pixels = px.$paper.getElementsByTagName('td');
px.$loadbox = document.getElementById('loadbox');
px.$aboutbox = document.getElementById('aboutbox');
px.$nav = document.getElementById('nav');
px.$header = document.getElementById('header');
px.$saved = document.getElementById('saved');
px.$tools = document.getElementById('tools');
px.$colorbox = document.getElementById('colorbox');
px.$workspace = document.getElementById('workspace');

px.$picker = document.getElementById('picker');
px.$bnew = document.getElementById('new');
px.$buttonsave = document.getElementById('save');
px.$buttonload = document.getElementById('load');
px.$gridsizer = document.getElementById('size');

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

// ios7 check
// http://stackoverflow.com/questions/18944110/how-to-detect-mobile-safari-browser-in-ios-7
if (navigator.userAgent.match(/(iPad|iPhone|iPod touch);.*CPU.*OS 7_\d/i)) {
    px.$body.classList.add('ios7');
}

// show page elements hidden from initial load
px.$header.classList.remove('hide');
px.$nav.classList.remove('hide');
px.$loadbox.classList.remove('hide');
px.$colorbox.classList.remove('hide');
px.$aboutbox.classList.remove('hide');
px.$tools.classList.remove('hide');

// # Grid setup
// iphone
px.margins = 8;
px.gridsize = 27;
// ipad
if (window.innerWidth >= 600) {
    px.gridsize = 32;
    px.margins = 25;
    px.$gridsizer.max = 42;
}
// desktop
if (window.innerWidth >= 1200) {
    px.gridsize = 75;
}
// grid setup/calc heights
function gridSetup() {
    px.paperw = window.innerWidth - (px.$tools.offsetWidth + (px.margins * 2));
    px.paperh = window.innerHeight - (px.$header.offsetHeight + (px.margins * 2)); // double for top and bottom
    px.cols = Math.floor(px.paperw / px.gridsize);
    px.rows = Math.floor(px.paperh / px.gridsize);
    px.basecols = px.cols;
    px.baserows = px.rows;
}
gridSetup();


// set app-wrap height === window height (hides savebox)
function setupHeights() {
    var $appwrap = document.getElementById('app-wrap');
    $appwrap.style.height = window.innerHeight+'px';

    px.$savespot.width = window.innerWidth;
    px.$savespot.height = window.innerHeight;
}
setupHeights();

// set paper height
px.$paper.style.height = px.paperh + 'px';

// size same as #paper
px.$colorbox.style.height = px.$paper.style.height;
px.$colorbox.style.width = px.$paper.style.width;


// make table grid
function makeGrid(rows, cols) {
    //console.log( 'makeGrid' );
    var label = document.getElementById('label-gridsize');
    label.innerHTML = px.cols + ' x ' + px.rows;

    var doc = document.createDocumentFragment();
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
makeGrid(px.rows, px.cols);

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
    var cnt = Math.floor(px.paperh / swatch_h);
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
setSwatchesCount();


// # Touch events
// drawing
console.log("let's draw!");
px.$paper.addEventListener("touchstart", drawStart, false);
px.$paper.addEventListener("touchmove", drawMove, false);
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
}

// color picker
px.$picker.addEventListener("touchstart", pickerStart, false);
px.$picker.addEventListener("touchmove", pickerMove, false);
px.$picker.addEventListener("touchend", pickerEnd, false);
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
px.$swatches.addEventListener("touchstart", swatchStart, false);
px.$swatches.addEventListener("touchmove", swatchMove, false);
px.$swatches.addEventListener("touchend", swatchEnd, false);
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
    's': document.getElementById('s').value * 2, // saturation
    'l': document.getElementById('l').value * 2 // luminosity
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
px.$header.addEventListener("touchstart", headerclick, false);
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
        px.$aboutbox.classList.add('closed');
        px.$body.classList.remove('x');
    } else {
        // otherwise close nav
        px.$nav.classList.toggle('closed');
    }
}

// new/fill/clear grid
px.$bnew.addEventListener("touchstart", bnewclick, false);
function bnewclick() {
    clearGrid();
    px.$body.classList.remove('x');
    px.$nav.classList.add('closed');
}

// info box
px.$infobutton = document.getElementById('info');
px.$infobutton.addEventListener("touchstart", infobuttonclick, false);
function infobuttonclick() {
    px.$body.classList.remove('x');
    px.$nav.classList.add('closed');

    px.$aboutbox.classList.remove('closed');
    px.$body.classList.add('x');
}

// toggle dark/light mode (.lightsout)
px.$lightsout = document.getElementById('lightsout');
px.$lightsout.addEventListener("touchstart", lightsoutclick, false);
function lightsoutclick() {
    px.$body.classList.toggle('lightsout');
    px.$nav.classList.add('closed');

    // button text 'light/dark'
    var txt = px.$body.classList.contains('lightsout') ? 'Light' : 'Dark';
    px.$lightsout.innerHTML = txt;
}

// toggle square/rectangle
px.$buttonSquare = document.getElementById('square');
px.$buttonSquare.addEventListener("touchstart", buttonSquareclick, false);
function buttonSquareclick() {
    px.$body.classList.toggle('square');
    px.$nav.classList.add('closed');
    setSquareCanvas();
}

// toggle grid lines
px.$buttonGridlines = document.getElementById('gridlines');
px.$buttonGridlines.addEventListener("touchstart", buttonGridlinesclick, false);
function buttonGridlinesclick() {
    px.$buttonGridlines.classList = '';
    px.$paper.classList.toggle('gridlines');
    px.$nav.classList.add('closed');

    // button text 'grid/no grid'
    var txt = px.$paper.classList.contains('gridlines') ? 'normal' : 'strike';
    px.$buttonGridlines.classList.add(txt);
}

// grid resize
document.getElementById('size').onchange = function (e) {
    px.cols = e.target.value;
    px.gridsize = px.paperw / px.cols;
    px.rows = Math.floor(px.paperh / px.gridsize);
    makeGrid(px.rows,px.cols);
};

// saturation slider
document.getElementById('s').onchange = function (e) {
    colors.s = e.target.value * 2;
    for (var i = 0, max = px.$swatchpixels.length; i < max; i++) {
        px.$swatchpixels[i].style.backgroundColor = 'hsl(' + (i  * 12) + ', ' + colors.s + '%, ' + colors.l + '%)';
    }
};

// lightness slider
document.getElementById('l').onchange = function (e) {
    colors.l = e.target.value * 2;
    for (var i = 0, max = px.$swatchpixels.length; i < max; i++) {
        px.$swatchpixels[i].style.backgroundColor = 'hsl(' + (i  * 12) + ', ' + colors.s + '%, ' + colors.l + '%)';
    }
};

// random button
px.$buttonrandomcolor = document.getElementById('color-random');
px.$buttonrandomcolor.addEventListener("touchstart", buttonrandomcolorclick, false);
function buttonrandomcolorclick() {
    function rand(min, max) {
        return parseInt(Math.random() * (max-min+1), 10) + min;
    }
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


// # Save
// update html load list
function update_save_list() {
    if (px.ids.length > 0) {
        var html = '';
        px.$buttonload.classList.remove('hide');
        for (var i = 0, max = _.size(px.ids); i < max; i++) {
            var key = 'pixelDrawing_' + px.ids[i];
            var drawing = localStorage.getItem(key);
            if (drawing) {
                drawing = JSON.parse(drawing);
                // add to html
                if (drawing.id > 0) {
                    html += getHTMLsaveSnippet(drawing.id,drawing.img);
                }
            }
        }
        px.$saved.innerHTML = html;
        html = null;
    } else {
        px.$saved.innerHTML = '<li class="nodrawings">No Drawings. <span class="smaller">Go push some pixels!</span><span class="ok" data-js="ok">ok</span></li>';
        px.$buttonload.classList.add('hide');
    }
}
// load box setup
update_save_list();

// cheap template save snippet
function getHTMLsaveSnippet(id,img) {
    return '<li id="load'+id+'"><span data-id="'+id+'" data-js="flip">' + id +'</span><div id="card'+id+'" class="card" data-id="'+id+'"><p class="front" data-id="'+id+'"><img src="'+img+'" data-id="'+id+'" data-js="load" /></p><p class="back"><b data-id="'+id+'" data-js="delete">delete</b></p></div></li>';
}

// save event
px.$buttonsave.addEventListener("touchstart", buttonsaveclick, false);
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
            }, 250);
        }, 150);
    }, 50);
}


// # Render drawing table as canvas element and return png image data
function drawCanvasGrid(pixels, rows, cols) {
    var pixelw = Math.ceil(window.innerWidth / cols),
    pixelh = Math.ceil(window.innerHeight / rows),
    savespot = px.$savespot.getContext("2d"),
    a = 0,
    offsetw = (((pixelw * cols) - window.innerWidth) / 2),
    offseth = (((pixelh * rows) - window.innerHeight) / 2);

    // loop over rows, then columns and draw each pixel to the canvas
    for (var x = 0; x < rows; x++) {
        for (var y = 0; y < cols; y++) {
            savespot.fillStyle = pixels[a] || document.defaultView.getComputedStyle(px.$body,null)['background-color'];
            savespot.fillRect(((y * pixelw) - offsetw), ((pixelh * x) - offseth), pixelw, pixelh);
            a++;
        }
    }
    return px.$savespot.toDataURL("image/png");
}


// save drawings to localstorage
function saveDrawing() {
    // get id
    var id = 1;
    if (_.max(px.ids) + 1 > 0) {
        id = _.max(px.ids) + 1;
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
    drawing.colorindex = _.uniq(drawing.colors);

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

    // save to localstorage
    localStorage.setItem('pixelDrawings', JSON.stringify(px.ids));
    localStorage.setItem('pixelDrawing_' + (drawing.id), JSON.stringify(drawing));    

    // to camera roll/library via phonegap plugin
    // https://github.com/devgeeks/Canvas2ImagePlugin
    saveToCameraRoll(drawing.img);

    // update html load box
    px.$saved.innerHTML += getHTMLsaveSnippet(drawing.id, drawing.img);
}
function saveToCameraRoll(imgData) {
    // save to photo library/camera roll
    if (typeof canvas2ImagePlugin !== 'undefined') {
        canvas2ImagePlugin.saveImageDataToLibrary(
        function(msg) {
            console.log(msg);
        }, function(err) {
            console.log(err);
        }, imgData);
    }
}

// show save dialogue
function showSaveMsg() {
        closeBusy();
    function closeBusy() {
        px.$busy.classList.add('hide');
    }
    if (px.testing) {
        alert('Nice save');
    } else {
        navigator.notification.alert(
            '',  // message
            null,         // callback
            'Nice Save',            // title
            'Done'                  // buttonName
        );
    }
}


// # Load
// load button
px.$buttonload.addEventListener("touchstart", buttonloadclick, false);
function buttonloadclick() {
    px.$nav.classList.add('closed');
    px.$colorbox.classList.add('closed');
    // open er up
    px.$loadbox.classList.remove('closed');
    px.$body.classList.add('x');
}


// load a drawing to paper, grid sized, and picker colors set
function loadDrawing(id) {
    // look up drawing localStorage item with id
    var drawing = JSON.parse(localStorage.getItem('pixelDrawing_' + id));

    // update grid size + label
    px.gridsize = drawing.gridsize;
    var label = document.getElementById('label-gridsize');
    label.innerHTML = drawing.cols + ' x ' + drawing.rows;

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
}


// load drawing click events
px.$loadbox.addEventListener("touchstart", loadboxstart, false);
px.$loadbox.addEventListener("touchmove", loadboxdrag, false);
px.$loadbox.addEventListener("touchend", loadboxclick, false);
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
                //console.log('anon function inside showBusy');
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
// remove drawing from localstorage
function deleteDrawing(id) {
    //console.log('deleteDrawing');
    id = parseInt(id);

    function cleanId(id) {
        px.ids = _.without(px.ids, id);
        localStorage.removeItem('pixelDrawing_' + id);
        localStorage.setItem('pixelDrawings', JSON.stringify(px.ids));
        if (px.ids.length < 1) {
            update_save_list();
        }
    }

    function cleanDOM(id){
        // remove single drawing
        document.getElementById('load'+id).outerHTML = '';
        //deleteli.classList.add('hide');
    }

    function hideBusy() {
        px.$busy.classList.add('hide');
    }

    // hacky set timeout chain for dom updates
    setTimeout(function() {
        // first
        cleanDOM(id);
        cleanId(id);
        setTimeout(function() {
            // second
            hideBusy();
        }, 500);
    }, 50);

    // cleanDOM(id, function(){
    //     cleanId(id, function(){
    //         console.log('cleandom callback');
    //         hideBusy();
    //     });    
    // });

}


// set square canvas
function setSquareCanvas() {
    px.$paper.style.height = px.$paper.offsetWidth;
    //gridInfo();
}

// external links
var getsupport = document.getElementById('getsupport');
getsupport.onclick = function() {
    window.open('http://pixeldrawapp.com/support/', '_system');
    return false;
};
var pixelblog = document.getElementById('pixelblog');
pixelblog.onclick = function() {
    window.open('http://pixeldrawapp.com/blog/', '_system');
    return false;
};

// # Debug global app object
//console.log(px);

console.log('done');

}


// # run app for local setup only
// needed since deviceready is broken after adding device plugins
if (window.location.hostname === 'pixeldraw.dev') {
    //goApp();
}


// # Phonegap go
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        goApp();
        document.getElementById('busy').classList.add('hide');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    }
};