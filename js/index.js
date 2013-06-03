/*

pixel draw
by dave rau

[start]
x    get paper area
x    make grid
x    make swatch grid
[middle]
x    draw events
x    pick color
x    change swatches
x    grid resize
x    new doc
x    light/dark theme
[end]
x    save (save swatches; use colors index map)
x    local save
    load (update swatches; color index map; grid calc)
x    delete
[polish]
    delete last drawing has visual bug
    stress test 100+ drawings for loading/deleting/saving
    no jquery
    knockout?


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

        // save to library plugin
        canvas2ImagePlugin = window.plugins.canvas2ImagePlugin;
        
        // grid debug info
        gridInfo();
        
        // update load files list
        update_save_list();
    },
    receivedEvent: function(id) {
        console.log('Received Event: ' + id);
    }
};


// fastclick
window.addEventListener('load', function() {
    new FastClick(document.body);
}, false);


//localStorage.clear();

// start
var px = {};
    px.ids = JSON.parse(localStorage.getItem('pixelDrawings')) || [];
    px.count = px.ids.length || 0;
    px.selected = '#eee';
    px.deleteId = '';
    px.swatching = false;

// grid iphone/ipad+
    px.gridsize = 19;
    if (screen.width >= 600) {
        px.gridsize = 32;
        // increase max grid size slider
        document.getElementById('size').max = 100;
    }

// dom cache
    px.$paper = document.getElementById('paper');
    px.$pixels = px.$paper.getElementsByTagName('li');
    px.$loadbox = document.getElementById('loadbox');
    px.$nav = document.getElementById('nav');
    px.$header = document.getElementById('header');
    px.$saved = document.getElementById('saved');
    px.$colorbox = document.getElementById('colorbox');
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
    px.$picker = document.getElementById('picker');
    px.$bnew = document.getElementById('new');

    px.$buttonsave = document.getElementById('save');
    px.$buttonload = document.getElementById('load');


function makeGrid(rows, cols) {
    var count = rows * cols;
    var docFragm = document.createDocumentFragment();
    px.$paper.innerHTML = '';
    for (var i = 0; i < count; i++) {
        elem = document.createElement('li');
        //elem.style.backgroundColor = px.selected;
        elem.style.backgroundColor = '#fff';
        elem.style.width = px.gridsize + 'px';
        elem.style.height = px.gridsize + 'px';
        docFragm.appendChild(elem);
    }
    px.$paper.style.width = px.paperw + 'px';
    px.$paper.style.height = px.paperh + 'px';
    px.$paper.appendChild(docFragm);
}



function clearGrid() {
    // redraw grid if not default size
    if (px.$pixels.length !== px.baserows * px.basecols) {
        makeGrid(px.baserows, px.basecols);
    }
    // loop and color
    for (i = 0, max = px.$pixels.length; i < max; i++) {
        px.$pixels[i].style.backgroundColor = px.selected;
    }
}


function resetPicker() {
    // function setSwatch(num, color) {
    //     console.log( $swatch+num );
    //     sw = px.$swatch+num;
    //     sw.style.backgroundColor = color;
    // }
    // setSwatch(1,'rgb(231, 136, 136)');
    px.$swatch1.style.backgroundColor = 'rgb(231, 136, 136)';
    px.$swatch2.style.backgroundColor = 'rgb(200, 37, 37)';
    px.$swatch3.style.backgroundColor = '#0a7de8';
    px.$swatch4.style.backgroundColor = '#2625c8';
    px.$swatch5.style.backgroundColor = '#7fd33d';
    px.$swatch6.style.backgroundColor = '#397930';
    px.$swatch7.style.backgroundColor = 'rgb(233, 233, 55)';
    px.$swatch8.style.backgroundColor = 'rgb(165, 156, 107)';
    px.$swatch9.style.backgroundColor = 'rgb(235, 151, 45)';
    px.$swatch10.style.backgroundColor = 'rgb(82, 67, 48)';
    px.$swatch11.style.backgroundColor = 'rgb(170, 132, 219)';
    px.$swatch12.style.backgroundColor = 'rgb(99, 32, 185)';
    px.$swatch13.style.backgroundColor = '#fff';
    px.$swatch14.style.backgroundColor = '#eee';
    px.$swatch15.style.backgroundColor = '#333';
    px.$swatch16.style.backgroundColor = '#000';
}


// build swatch color picker
function makeSwatches(s, l) {
    var docFragm = document.createDocumentFragment();
    var elem, contents;
    px.$swatches.innerHTML = '';
    for (var i = 0; i < 360; i += 2) {
        elem = document.createElement('li');
        elem.style.background = 'hsl(' + i + ', ' + s + '%, ' + l + '%)';
        //elem.style.width = px.gridsize + 'px';
        //elem.style.height = px.gridsize + 'px';
        docFragm.appendChild(elem);
    }
    px.$swatches.appendChild(docFragm);
}



// page actions
jQuery(function(){


    // grid setup/calc heights
    px.margins = $('#tools').css('margin-right').replace('px', '');
    px.paperw = window.innerWidth - $('#tools').width() - (px.margins * 3);
    px.paperh = window.innerHeight - $('header')[0].offsetHeight - (px.margins * 3); // 3 is a magic number
    px.cols = Math.floor(px.paperw / px.gridsize);
    px.rows = Math.floor(px.paperh / px.gridsize);
    px.basecols = px.cols;
    px.baserows = px.rows;

    // console log grid debug info
    function gridInfo() {

        console.log('header h: '+ px.$header.offsetHeight );
        console.log('margins: '+ (px.margins * 2) );

        console.log('innerWidth: '+ window.innerWidth);
        console.log('innerHeight: '+ window.innerHeight);

        console.log('paperw: '+ px.paperw);
        console.log('px w: '+ (px.gridsize * px.cols));

        console.log('paperh: '+ px.paperh);
        console.log('px h: '+ (px.gridsize * px.rows));

        console.log('grid: ' + px.cols + ' x ' +px.rows + ' (' + px.gridsize + 'px)');
    }
    // show grid info for debugging/testing
    gridInfo();



    // let's draw!
    makeGrid(px.rows, px.cols, 'w');

        // drawing touch events
        $("#paper").hammer({prevent_default: true})
            .on("touch","li", function(e) {
                this.style.backgroundColor = px.selected;
            })
            .on("doubletap","li", function(e) {
                //console.log('dtap');
            })
            .on("dragstart","li", function(e) {
                this.style.backgroundColor = px.selected;
            })
            .on("drag","li", function(e) {
                var li = document.elementFromPoint(event.pageX, event.pageY);
                if (li.localName === 'li' && li.parentElement.id === 'paper') {
                    li.style.backgroundColor = px.selected;
                }
        });


    // colors! for the picker
    resetPicker();

        // pixel colors
        $('#picker').hammer({prevent_default: true})
            .bind('touch', function(e) {
                if (px.swatching) {
                    // color swap/select this to repick
                    toggleSelected(e.target, px.$picker);
                } else {
                    // color select
                    setColor(e.target.style.backgroundColor, px.$picker);
                }
            })
            .bind('doubletap', function(e) {
                var cbox = document.getElementById('colorbox');
                if (!px.swatching) {
                    px.swatching = true;
                    toggleSelected(e.target, px.$picker);
                } else {
                    px.swatching = false;
                    toggleSelected({}, px.$picker);
                }
                cbox.classList.toggle('closed');
            })
            .bind('dragstart', function(e) {
                var li = e.target;
                if (px.swatching) {
                    toggleSelected(li, px.$picker);
                } else {
                    setColor(li.style.backgroundColor, px.$picker);
                }
            })
            .bind('drag', function(e) {
                var li = document.elementFromPoint(event.pageX, event.pageY);
                if (px.swatching) {
                    toggleSelected(li, px.$picker);
                } else {
                    setColor(li.style.backgroundColor, px.$picker);
                }
            })
            .bind('dragend', function(e) {
        });


    // color swatches
    var colors = {
        's': document.getElementById('s').value * 2, // saturation
        'l': document.getElementById('l').value * 2 // luminosity
    };
    makeSwatches(colors.s, colors.l);

        px.$colorbox.classList.remove('hide');
        px.$nav.classList.remove('hide');

        // size same as #paper
        px.$colorbox.style.height = px.$paper.offsetHeight+'px';
        px.$colorbox.style.width = px.$paper.offsetWidth+'px';

        console.log(px.$colorbox.style.height);
        console.log(px.$colorbox.style.width);

        // change swatch color
        $('#swatches').hammer({prevent_default: true})
            .bind('touch', function(e) {
                if (e.target.localName === 'li') {
                    toggleSelected(e.target, px.$swatches);
                    setColor(e.target.style.backgroundColor, px.$picker.getElementsByClassName('selected')[0]);
                }
            })
            .bind('doubletap', function(e) {
            })
            .bind('dragstart', function(e) {
                if (e.target.localName === 'li') {
                    toggleSelected(e.target, px.$swatches);
                    setColor(e.target.style.backgroundColor, px.$picker.getElementsByClassName('selected')[0]);
                }
            })
            .bind('drag', function(e) {
                var li = document.elementFromPoint(event.pageX, event.pageY);
                if (li.localName === 'li') {
                    toggleSelected(li, px.$swatches);
                    setColor(li.style.backgroundColor, px.$picker.getElementsByClassName('selected')[0]);
                }
            })
            .bind('dragend', function(e) {
        });

        // toggle selected class
        function toggleSelected(elem, parent) {
            if (parent.getElementsByClassName('selected')[0]) {
                parent.getElementsByClassName('selected')[0].className = '';
            }
            elem.className = 'selected';
        }
        // change selected color
        function setColor(color, target) {
            px.selected = color;
            px.$picker.style.backgroundColor = px.selected;
            px.$bnew.style.backgroundColor = px.selected;
            target.style.backgroundColor = px.selected;
        }
        // change selected picker color
        function setPickerSelected() {
            if (px.$picker.getElementsByClassName('selected')[0]) {
                px.$picker.getElementsByClassName('selected')[0].style.backgroundColor = px.selected;
            }
        }

        document.getElementById('s').onchange = function (e) {
            colors.s = e.target.value * 2;
            for (i = 0, max = px.$swatchpixels.length; i < max; i++) {
                px.$swatchpixels[i].style.backgroundColor = 'hsl(' + (i  * 2) + ', ' + colors.s + '%, ' + colors.l + '%)';
            }
            setColor(px.$swatches.getElementsByClassName('selected')[0].style.backgroundColor, px.$picker);
            setPickerSelected();
        };

        document.getElementById('l').onchange = function (e) {
            colors.l = e.target.value * 2;
            for (i = 0, max = px.$swatchpixels.length; i < max; i++) {
                px.$swatchpixels[i].style.backgroundColor = 'hsl(' + (i  * 2) + ', ' + colors.s + '%, ' + colors.l + '%)';
            }
            setColor(px.$swatches.getElementsByClassName('selected')[0].style.backgroundColor, px.$picker);
            setPickerSelected();
        };
















    // buttons

    // header toggle
    $('header').click(function() {
        if (!px.$loadbox.classList.contains('closed')){
            !px.$loadbox.classList.add('closed');
        } else {
            px.$nav.classList.toggle('closed');
        }
    });

    // new
    $('#new').click(function () {
        clearGrid();
        px.$nav.classList.toggle('closed');
    });

    // lights out mode
    $('#lightsout').click(function () {
        $('body').toggleClass('lightsout');
        px.$nav.classList.add('closed');
    });

    // grid resize
    document.getElementById('size').onchange = function (e) {
        px.gridsize = e.target.value;
        /*
        for (i = 0, max = px.$pixels.length; i < max; i++) {
            px.$pixels[i].style.width = px.gridsize + 'px';
            px.$pixels[i].style.height = px.gridsize + 'px';
        }
        */
        // for (i = 0, max = px.$swatchpixels.length; i < max; i++) {
        //     px.$swatchpixels[i].style.width = px.gridsize + 'px';
        //     px.$swatchpixels[i].style.height = px.gridsize + 'px';
        // }

        px.cols = Math.floor(px.paperw / px.gridsize);
        px.rows = Math.floor(px.paperh / px.gridsize);

        makeGrid(px.cols,px.rows);

    };

    
    // save
    px.$buttonsave.onclick = function() {
        // prompt for name; only save if name is not empty
        var name = prompt('Name this drawing:');
        if (!_.isEmpty(name)) {
            // html table to canvas to png data
            html2canvas(px.$paper, {
                onrendered: function(canvas) {
                var imageData = canvas.toDataURL("image/png");
                // save to photo library
                if (typeof canvas2ImagePlugin !== 'undefined') {
                    canvas2ImagePlugin.saveImageDataToLibrary(function(msg){console.log(msg);},function(err){console.log(err);},canvas);
                }
                saveDrawing(name, imageData);
                }
            });
        }
    }


    // load button
    px.$buttonload.onclick = function() {
        px.$nav.classList.add('closed');
        px.$loadbox.classList.remove('closed');
    }

    // load box setup
    update_save_list();
    // set loadbox height based on screen
    $('#loadbox').height( window.innerHeight - px.$header.offsetHeight ); // consider 100% height load window

    // load drawings
    $("#loadbox")
        .on("click", "span", function(){
            $(this).next('.card').toggleClass('flip');
        })
        .on("click", ".back", function(){
            id = $(this).parents('li').data('id');
            px.deleteId = id;
            deleteDrawing();
        })
        .on("click", "img", function(){
            $('#loadbox, nav').addClass('closed');
            id = $(this).parents('li').data('id');
            loadDrawing(id);
        });




});




// save drawings to localstorage
function saveDrawing(name,imgData) {
    var drawing = {
        'id': _.size(px.ids) + 1 || 1,
        'colorindex': [],
        'colors': [],
        'swatches': [],
        'rows': px.rows,
        'cols': px.cols,
        'gridsize': px.gridsize,
        'name': name,
        'img': imgData,
        'date': new Date()
    }

    // colors
    for (i = 0, max = px.$pixels.length; i < max; i++) {
        c = px.$pixels[i].style.backgroundColor;
        drawing.colors.push(c);
    }
    drawing.colorindex = _.uniq(drawing.colors);

    // compress colors
    var compressed = [];
    for (i = 0, max = drawing.colors.length; i < max; i++) {
        cid = drawing.colors[i];
        compressed.push(drawing.colorindex.indexOf(cid));
    }
    drawing.colors = compressed;

    // swatch colors
    for (i = 1; i < 17; i++) {
        c = px['$swatch' + i].style.backgroundColor;
        drawing.swatches.push(c);
    }

    // update ids
    px.ids.push(drawing.id);

    // save
    localStorage.setItem('pixelDrawings', JSON.stringify(px.ids));
    localStorage.setItem('pixelDrawing_' + (drawing.id), JSON.stringify(drawing));

    // update html
    update_save_list();
}


// save drawings to localstorage
function loadDrawing(id) {
    var drawing = JSON.parse(localStorage.getItem('pixelDrawing_' + id));

    // load color data, don't redraw grid
    for (i = 0, max = px.$pixels.length; i < max; i++) {
        px.$pixels[i].style.backgroundColor = drawing.colorindex[drawing.colors[i]];
    }

    // load picker colors
    for (i = 1; i < 17; i++) {
        px['$swatch' + i].style.backgroundColor = drawing.swatches[i];
    }

    //px.$paper.innerHTML = table[0].innerHTML;
    //$('#paper td').hammer({prevent_default: true});
}


// update html load list
function update_save_list() {
    if (_.size(px.ids) > 0) {
        var html = '';
        $('#load, #loadbox').removeClass('hide');
        for (i = 0, max = _.size(px.ids); i < max; i++) {
            var key = 'pixelDrawing_' + px.ids[i];
            var drawing = localStorage.getItem(key);
            if (drawing) {
                drawing = JSON.parse(drawing);
                if (drawing.id > 0) {
                    html += '<li data-id="'+drawing.id+'"><span>' + drawing.name +'</span><div class="card"><p class="front"><img src="'+drawing.img+'" /></p><p class="back"><b>delete</b></p></div></li>';
                }
            }
        }
        px.$saved.innerHTML = html;
    } else {
        px.$buttonload.classList.add('hide');
    }
}



// show a confirmation dialog
function deleteDrawing() {
    if (navigator.notification) {
        navigator.notification.confirm(
            'Delete this drawing?', // message
            confirmDelete, // callback
            'Delete', // title
            'Delete,Cancel' // buttonLabels
        );
        // reset confirmation
        function confirmDelete(button) {
            if (button === 1) {
                removeDrawing();
           }
        }
    } else {
        removeDrawing();
    }
    function removeDrawing() {
        localStorage.removeItem('pixelDrawing_' + px.deleteId);
        px.ids = _.without(px.ids, px.deleteId);
        localStorage.setItem('pixelDrawings', JSON.stringify(px.ids));
        px.deleteId = '';
        update_save_list();
    }
}
