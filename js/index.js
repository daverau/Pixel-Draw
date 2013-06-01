/*

pixel drawing app
by dave rau

[start]
    get paper area
    make grid
[middle]
    draw events
    pick color
    change swatches
    grid resize
    new doc
    light/dark theme
[end]
    save
    load
    delete
    share?
    local save?

[do]
- use background color instead of css class name
- change save object to use color index keys; swap values for keys when saving colors array

- switch table to list and test speed
- add grid slider control for tests

- picker show selected colors on left and right (css selected class; and remove color class)

- load page sorting by id
- save ids to array; ditch counter





*/
var app = {
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        gridInfo();
        update_save_list();
    },
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    }
};

// show a confirmation dialog
function deleteDrawing() {
    navigator.notification.confirm(
        'Delete this drawing?', // message
        confirmDelete, // callback
        'Delete', // title
        'Delete,Cancel' // buttonLabels
    );
    // reset confirmation
    function confirmDelete(button) {
        if (button === 1) {
            localStorage.removeItem('pixelDrawing_' + draw.deleteId);
            // remove id from array
            //_.without(array, [*values]);
            draw.deleteId = '';
            update_save_list();
       }
    }
}

// fastclick
window.addEventListener('load', function() {
    new FastClick(document.body);
}, false);


//localStorage.clear();

// start
var draw = {};
    draw.ids = JSON.parse(localStorage.getItem('pixelDrawings')) || [];
    draw.count = draw.ids.length || 0;
    draw.selected = '#eee';
    draw.deleteId = '';

// grid iphone/ipad+
    draw.gridsize = 19;
    if (screen.width >= 600) {
        draw.gridsize = 32;
    }

// dom cache
    draw.$paper = document.getElementById('paper');
    draw.$pixels = draw.$paper.getElementsByTagName('li');
    draw.$papertds = draw.$paper.getElementsByTagName('td');
    draw.$loadbox = document.getElementById('loadbox');
    draw.$nav = document.getElementById('nav');
    draw.$header = document.getElementById('header');
    draw.$saved = document.getElementById('saved');
    draw.$colorbox = document.getElementById('colorbox');
    draw.$swatches = document.getElementById('swatches');
    draw.$swatch1 = document.getElementById('swatch1');
    draw.$swatch2 = document.getElementById('swatch2');
    draw.$swatch3 = document.getElementById('swatch3');
    draw.$swatch4 = document.getElementById('swatch4');
    draw.$swatch5 = document.getElementById('swatch5');
    draw.$swatch6 = document.getElementById('swatch6');
    draw.$swatch7 = document.getElementById('swatch7');
    draw.$swatch8 = document.getElementById('swatch8');
    draw.$swatch9 = document.getElementById('swatch9');
    draw.$swatch10 = document.getElementById('swatch10');
    draw.$swatch11 = document.getElementById('swatch11');
    draw.$swatch12 = document.getElementById('swatch12');
    draw.$swatch13 = document.getElementById('swatch13');
    draw.$swatch14 = document.getElementById('swatch14');
    draw.$swatch15 = document.getElementById('swatch15');
    draw.$swatch16 = document.getElementById('swatch16');
    draw.$picker = document.getElementById('picker');
    draw.$bnew = document.getElementById('new');


function makeGrid(rows, cols) {
    var count = rows * cols;
    var docFragm = document.createDocumentFragment();
    draw.$paper.innerHTML = '';
    for (var i = 0; i < count; i++) {
        elem = document.createElement('li');
        elem.style.backgroundColor = '#fff';
        elem.style.width = draw.gridsize + 'px';
        elem.style.height = draw.gridsize + 'px';
        docFragm.appendChild(elem);
    }
    draw.$paper.appendChild(docFragm);
    draw.$paper.style.width = draw.paperw + 'px';
    draw.$paper.style.height = draw.paperh + 'px';
}



function clearGrid() {
    // clear grid or redraw if not default size
    if (draw.$paper.getElementsByTagName('tr').length === draw.baserows && draw.$paper.querySelector('tr:first-child td').length === draw.basecols) {
        // loop tds
        for (i = 0, max = draw.$papertds.length; i < max; i++) {
            // set className to selected
            draw.$papertds[i].className = draw.selected;
        }
    } else {
        // redraw grid
        makeGrid(draw.baserows, draw.basecols);
    }
}


function initPicker() {
    draw.$swatch1.style.backgroundColor = 'rgb(231, 136, 136)';
    draw.$swatch2.style.backgroundColor = 'rgb(200, 37, 37)';
    draw.$swatch3.style.backgroundColor = '#0a7de8';
    draw.$swatch4.style.backgroundColor = '#2625c8';
    draw.$swatch5.style.backgroundColor = '#7fd33d';
    draw.$swatch6.style.backgroundColor = '#397930';
    draw.$swatch7.style.backgroundColor = 'rgb(233, 233, 55)';
    draw.$swatch8.style.backgroundColor = 'rgb(165, 156, 107)';
    draw.$swatch9.style.backgroundColor = 'rgb(235, 151, 45)';
    draw.$swatch10.style.backgroundColor = 'rgb(82, 67, 48)';
    draw.$swatch11.style.backgroundColor = 'rgb(170, 132, 219)';
    draw.$swatch12.style.backgroundColor = 'rgb(99, 32, 185)';
    draw.$swatch13.style.backgroundColor = '#fff';
    draw.$swatch14.style.backgroundColor = '#eee';
    draw.$swatch15.style.backgroundColor = '#333';
    draw.$swatch16.style.backgroundColor = '#000';
}


// build swatch color picker
function buildList(s, l) {
    var docFragm = document.createDocumentFragment();
    var elem, contents;
    draw.$swatches.innerHTML = '';
    for (var i = 0; i < 360; i += 2) {
        elem = document.createElement('li');
        elem.style.background = 'hsl(' + i + ', ' + s + '%, ' + l + '%)';
        elem.style.width = draw.gridsize + 'px';
        elem.style.height = draw.gridsize + 'px';
        docFragm.appendChild(elem);
    }
    draw.$swatches.appendChild(docFragm);
}


// save drawings to localstorage
function saveDrawing(name,imgData) {
    //build object
    var drawing = {};
    drawing.id = _.size(draw.ids) + 1 || 1;
    drawing.colors = [];
    drawing.rows = draw.rows;
    drawing.cols = draw.cols;
    drawing.name = name;
    drawing.img = imgData;
    drawing.date = new Date();

    // save color array
    for (i = 0, max = draw.$papertds.length; i < max; i++) {
        c = draw.$papertds[i].className;
        drawing.colors.push(c);
    }

    // update ids
    draw.ids.push(drawing.id);
    localStorage.setItem('pixelDrawings', JSON.stringify(draw.ids));

    // save
    localStorage.setItem('pixelDrawing_' + (drawing.id), JSON.stringify(drawing));

    // update html
    update_save_list();
    $('nav').addClass('closed');
}


// save drawings to localstorage
function loadDrawing(id) {
    var drawing = JSON.parse(localStorage.getItem('pixelDrawing_' + id));
    if ($('#paper tr').length === drawing.rows && $('#paper tr:first-child td').length === drawing.cols) {
        // just load drawing, don't redraw grid
        for (i = 0, max = draw.$papertds.length; i < max; i++) {
            draw.$papertds[i].className = drawing.colors[i];
        }
    } else {
        // redraw everything
        var table = $('<table>');
        tindex = 0;
        for (var r = 0; r < drawing.rows; r++) {
            var tr = $('<tr>');
            for (var c = 0; c < drawing.cols; c++) {
                var cssclass = drawing.colors[tindex]
                $('<td class="'+cssclass+'"></td>').appendTo(tr);
                tr.appendTo(table);
                tindex++;
            }
        }
        draw.$paper.innerHTML = table[0].innerHTML;
        $('#paper td').hammer({prevent_default: true});
    }
}


// update html load list
function update_save_list() {
    if (_.size(draw.ids) > 0) {
        var html = '';
        $('#load, #loadbox').removeClass('hide');
        for (i = 0, max = _.size(draw.ids); i < max; i++) {
            var key = 'pixelDrawing_' + draw.ids[i];
            var drawing = localStorage.getItem(key);
            if (drawing) {
                drawing = JSON.parse(drawing);
                if (drawing.id > 0) {
                    html += '<li data-id="'+drawing.id+'"><span>' + drawing.name +'</span><div class="card"><p class="front"><img src="'+drawing.img+'" /></p><p class="back"><b>delete</b></p></div></li>';
                }
            }
        }
        draw.$saved.innerHTML = html;
    } else {
        $('#load').addClass('hide');
    }
}


// page actions
jQuery(function(){


    // grid setup/calc heights
    draw.margins = $('#tools').css('margin-right').replace('px', '');
    draw.paperw = window.innerWidth - $('#tools').width() - (draw.margins * 3);
    draw.paperh = window.innerHeight - $('header')[0].offsetHeight - (draw.margins * 3); // 3 is a magic number
    draw.cols = Math.floor(draw.paperw / draw.gridsize);
    draw.rows = Math.floor(draw.paperh / draw.gridsize);
    draw.basecols = draw.cols;
    draw.baserows = draw.rows;

     // console log grid debug info
    function gridInfo() {
        console.log('header h: '+ draw.$header.offsetHeight );
        console.log('margins: '+ (draw.margins * 2) );

        console.log('innerWidth: '+ window.innerWidth);
        console.log('innerHeight: '+ window.innerHeight);

        console.log('paperw: '+ draw.paperw);
        console.log('paperh: '+ draw.paperh);
        console.log('grid px: '+ draw.gridsize);

        console.log('grid: '+ draw.cols + ' x ' +draw.rows);
    }
    // show grid info for debugging/testing
    gridInfo();

    // set loadbox height based on screen
    $('#loadbox').height( window.innerHeight - draw.$header.offsetHeight ); // consider 100% height load window

    // run everything
    makeGrid(draw.rows, draw.cols, 'w');
    update_save_list();
    $('nav, #colorbox').removeClass('hide');

    // size colorbox same as paper
    $('#colorbox').height( $('#paper').height() ).width( $('#paper').width() );
    

    // color swatches
    // setup
    var colors = {};
    colors.list = document.getElementById('swatches');
    colors.listitems = colors.list.getElementsByTagName('li');
    colors.s = document.getElementById('s').value * 2; // saturation
    colors.l = document.getElementById('l').value * 2; // luminosity
    colors.size = 20; // px
    buildList(colors.s, colors.l);

    document.getElementById('s').onchange = function (e) {
        colors.s = e.target.value * 2;
        for (i = 0, max = colors.listitems.length; i < max; i++) {
            colors.listitems[i].style.background = 'hsl(' + (i  * 2) + ', ' + colors.s + '%, ' + colors.l + '%)';
        }
    };

    document.getElementById('l').onchange = function (e) {
        colors.l = e.target.value * 2;
        for (i = 0, max = colors.listitems.length; i < max; i++) {
            colors.listitems[i].style.background = 'hsl(' + (i  * 2) + ', ' + colors.s + '%, ' + colors.l + '%)';
        }
    };

    document.getElementById('size').onchange = function (e) {
        draw.gridsize = e.target.value;
        for (i = 0, max = colors.listitems.length; i < max; i++) {
            colors.listitems[i].style.width = draw.gridsize + 'px';
            colors.listitems[i].style.height = draw.gridsize + 'px';
        }
        // for (i = 0, max = colors.listitems.length; i < max; i++) {
        //     colors.listitems[i].style.width = draw.gridsize + 'px';
        //     colors.listitems[i].style.height = draw.gridsize + 'px';
        // }
    };

    // init color picker
    initPicker();


    // save
    $('#save').click(function () {
        // prompt for name; only save if name is not empty
        var name = prompt('Name this drawing:');
        if (!_.isEmpty(name)) {
            // html table to canvas to png data
            var paper = $('#paper');
            //var paper = draw.$paper;
            html2canvas(paper, {
                onrendered: function(canvas) {
                var imageData = canvas.toDataURL("image/png");
                saveDrawing(name, imageData);
                }
            });
        }
    });


    // load drawings
    $("#loadbox")
    .on("click", "span", function(){
        $(this).next('.card').toggleClass('flip');
    })
    .on("click", ".back", function(){
        id = $(this).parents('li').data('id');
        draw.deleteId = id;
        deleteDrawing();
    })
    .on("click", "img", function(){
        $('#loadbox, nav').addClass('closed');
        id = $(this).parents('li').data('id');
        loadDrawing(id);
    });


    // pixel colors
    $('#picker').hammer({prevent_default: true})
        .bind('touch', function(e) {
            if (e.target.localName === 'li') {
                draw.selected = e.target.style.backgroundColor;
                draw.$picker.style.backgroundColor = draw.selected;
                draw.$bnew.style.backgroundColor = draw.selected;
            }
        })
        .bind('doubletap', function(e) {
            //randomColors();
            var li = e.target;
            if (li.localName === 'li') {
                li.className = 'selected';
            }
            $('#colorbox').toggleClass('closed');
        })
        .bind('dragstart', function(e) {
            var li = e.target;
            if (li.localName === 'li') {
                draw.selected = li.style.backgroundColor;
                draw.$picker.style.backgroundColor = draw.selected;
                draw.$bnew.style.backgroundColor = draw.selected;
            }
        })
        .bind('drag', function(e) {
            var li = document.elementFromPoint(event.pageX, event.pageY);
            if (li.localName === 'li') {
                draw.selected = li.style.backgroundColor;
                draw.$picker.style.backgroundColor = draw.selected;
                draw.$bnew.style.backgroundColor = draw.selected;
            }
        })
        .bind('dragend', function(e) {
    });


    // toggle selected class
    function toggleSelected(elem, tag) {
        if (draw.$swatches.getElementsByClassName('selected')[0]) {
            draw.$swatches.getElementsByClassName('selected')[0].className = '';
        }
        elem.className = 'selected';
    }
    // change color
    function setColor(color) {
        draw.selected = color;
        draw.$picker.style.backgroundColor = draw.selected;
        draw.$bnew.style.backgroundColor = draw.selected;
    }

    // change swatch color
    $('#swatches').hammer({prevent_default: true})
        .bind('touch', function(e) {
            if (e.target.localName === 'li') {
                toggleSelected(e.target);
                setColor(e.target.style.backgroundColor);
            }
        })
        .bind('doubletap', function(e) {
        })
        .bind('dragstart', function(e) {
            if (e.target.localName === 'li') {
                toggleSelected(e.target);
                setColor(e.target.style.backgroundColor);
            }
        })
        .bind('drag', function(e) {
            var li = document.elementFromPoint(event.pageX, event.pageY);
            if (li.localName === 'li') {
                toggleSelected(e.target);
                setColor(e.target.style.backgroundColor);
            }
        })
        .bind('dragend', function(e) {
    });


    // drawing touch events
    $("#paper").hammer({prevent_default: true})
        .on("touch","li", function(e) {
            //this.className = draw.selected;
            this.style.backgroundColor = draw.selected;
        })
        .on("doubletap","li", function(e) {
            //console.log('dtap');
        })
        .on("dragstart","li", function(e) {
            //this.className = draw.selected;
            this.style.backgroundColor = draw.selected;
        })
        .on("drag","li", function(e) {
            var li = document.elementFromPoint(event.pageX, event.pageY);
            if (li.localName === 'li') {
                //td.className = draw.selected;
                li.style.backgroundColor = draw.selected;
            }
    });

    
    // buttons

    // header toggle
    $('header').click(function() {
        if (!$('#loadbox').hasClass('closed')){
            $('#loadbox').addClass('closed');
        } else {
            $('nav').toggleClass('closed');
        }
    });

    // load button
    $('#load').click(function () {
        $('nav').addClass('closed');
        $('#loadbox').removeClass('closed');
    });

    // new
    $('#new').click(function () {
        clearGrid();
        $('nav').toggleClass('closed');
    });

    // lights out mode
    $('#lightsout').click(function () {
        $('body').toggleClass('lightsout');
        $('nav').addClass('closed');
    });

});