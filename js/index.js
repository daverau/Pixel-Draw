/*

pixel drawing app
by dave rau

[start]
x    get paper area
x    make grid
x    make swatch grid
[middle]
x    draw events
x    pick color
x    change swatches
    grid resize
x    new doc
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
        //gridInfo();
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
    }

// dom cache
    px.$paper = document.getElementById('paper');
    px.$pixels = px.$paper.getElementsByTagName('li');
    px.$papertds = px.$paper.getElementsByTagName('td');
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


function makeGrid(rows, cols) {
    var count = rows * cols;
    var docFragm = document.createDocumentFragment();
    px.$paper.innerHTML = '';
    for (var i = 0; i < count; i++) {
        elem = document.createElement('li');
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
        elem.style.width = px.gridsize + 'px';
        elem.style.height = px.gridsize + 'px';
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
    /*
    function gridInfo() {
        console.log('header h: '+ px.$header.offsetHeight );
        console.log('margins: '+ (px.margins * 2) );

        console.log('innerWidth: '+ window.innerWidth);
        console.log('innerHeight: '+ window.innerHeight);

        console.log('paperw: '+ px.paperw);
        console.log('paperh: '+ px.paperh);
        console.log('grid px: '+ px.gridsize);

        console.log('grid: '+ px.cols + ' x ' +px.rows);
    }
    // show grid info for debugging/testing
    gridInfo();
    */


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
                if (li.localName === 'li') {
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
                var cbox = $('#colorbox');
                if (!px.swatching) {
                    px.swatching = true;
                    toggleSelected(e.target, px.$picker);
                } else {
                    px.swatching = false;
                    toggleSelected({}, px.$picker);
                }
                cbox.toggleClass('closed');
                //$('#colorbox').toggleClass('closed');
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

        $('nav, #colorbox').removeClass('hide');
        $('#colorbox').height( $('#paper').height() ).width( $('#paper').width() ); // size same as #paper

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
        if (!$('#loadbox').hasClass('closed')){
            $('#loadbox').addClass('closed');
        } else {
            $('nav').toggleClass('closed');
        }
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

    // grid resize
    document.getElementById('size').onchange = function (e) {
        px.gridsize = e.target.value;
        for (i = 0, max = px.$pixels.length; i < max; i++) {
            px.$pixels[i].style.width = px.gridsize + 'px';
            px.$pixels[i].style.height = px.gridsize + 'px';
        }
        // for (i = 0, max = px.$swatchpixels.length; i < max; i++) {
        //     px.$swatchpixels[i].style.width = px.gridsize + 'px';
        //     px.$swatchpixels[i].style.height = px.gridsize + 'px';
        // }
    };

    // save
    $('#save').click(function () {
        // prompt for name; only save if name is not empty
        var name = prompt('Name this drawing:');
        if (!_.isEmpty(name)) {
            // html table to canvas to png data
            var paper = $('#paper');
            //var paper = px.$paper;
            html2canvas(paper, {
                onrendered: function(canvas) {
                var imageData = canvas.toDataURL("image/png");
                saveDrawing(name, imageData);
                }
            });
        }
    });


    // load button
    $('#load').click(function () {
        $('nav').addClass('closed');
        $('#loadbox').removeClass('closed');
    });

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
        'colors': [],
        'rows': px.rows,
        'cols': px.cols,
        'name': name,
        'img': imgData,
        'date': new Date()
    }
    // colors
    for (i = 0, max = px.$papertds.length; i < max; i++) {
        c = px.$papertds[i].className;
        drawing.colors.push(c);
    }
    //console.log(drawing);
    // update ids
    px.ids.push(drawing.id);
    localStorage.setItem('pixelDrawings', JSON.stringify(px.ids));

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
        for (i = 0, max = px.$papertds.length; i < max; i++) {
            px.$papertds[i].className = drawing.colors[i];
        }
    } else {
        // redraw everything
        makeGrid(drawing.rows, drawing.cols, colors);
        // var table = $('<table>');
        // tindex = 0;
        // for (var r = 0; r < drawing.rows; r++) {
        //     var tr = $('<tr>');
        //     for (var c = 0; c < drawing.cols; c++) {
        //         var cssclass = drawing.colors[tindex]
        //         $('<td class="'+cssclass+'"></td>').appendTo(tr);
        //         tr.appendTo(table);
        //         tindex++;
        //     }
        // }
        px.$paper.innerHTML = table[0].innerHTML;
        $('#paper td').hammer({prevent_default: true});
    }
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
        $('#load').addClass('hide');
    }
}




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
            localStorage.removeItem('pixelDrawing_' + px.deleteId);
            // remove id from array
            //_.without(array, [*values]);
            px.deleteId = '';
            update_save_list();
       }
    }
}

