
/* junk drawer */

function loadDrawing(id) {
    var drawing = JSON.parse(localStorage.getItem('pixelDrawing_' + id));
    if ($('#paper tr').length === drawing.rows && $('#paper tr:first-child td').length === drawing.cols) {
        // just load drawing, don't redraw grid
        for (i = 0, max = px.$pixels.length; i < max; i++) {
            px.$pixels[i].style.backgroundColor = drawing.colors[i];
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


// randomize colors
function randomColors() {
    var data = [0,1,2,3,4,5,6];
    var colors = [
        {"s": "97d3bf", "e": "46567a" },
        {"s": "00aeae", "e": "6db108" },
        {"s": "fe6639", "e": "d6c324" },
        {"s": "9cbea5", "e": "3f4c43" },
        {"s": "84b03c", "e": "1f3415" },
        {"s": "1a8895", "e": "259057" },
        {"s": "e3e081", "e": "9d323a" },
        {"s": "4f4c63", "e": "86d47e" },
        {"s": "86d47e", "e": "4f4c63" }
    ];

    color_index = _.random(0, (colors.length - 1));
    var color1 = '#'+colors[color_index].s;
    var color2 = '#'+colors[color_index].e;
    
    // random hex color
    // http://paulirish.com/2009/random-hex-color-code-snippets/
    var color1 = '#'+Math.floor(Math.random()*16777215).toString(16);
    var color2 = '#'+Math.floor(Math.random()*16777215).toString(16);

    var color = d3.scale.linear()
       .domain([0,16])  // min/max of data
       .range([color1, color2])
       .interpolate(d3.cie.interpolateLch);

    $('#picker li').attr("class", function(d) {
        var cl = $(this).attr('class');
        $.stylesheet('.'+cl, 'background-color', color(d));
    });
}



// // disable body scrolling
// document.body.addEventListener('touchmove', function(event) {
//   event.preventDefault();
// }, false);


// function makeGrid(rows, cols, color) {
//     var table = $('<table></table>');
//     if (!color) {
//         var color = draw.selected;
//     }
//     for (var r = 0; r < rows; r++) {
//         var tr = $('<tr>');
//         for (var c = 0; c < cols; c++)
//         $('<td></td>').attr('class', color).appendTo(tr);
//         tr.appendTo(table);
//     }
//     draw.$paper.innerHTML = table[0].innerHTML;
// }

// function makeGrid(rows, cols, color) {
//     var table = $('#paper').empty();
//     if (!color) {
//         var color = draw.selected;
//     }
//     for (var r = 0; r < rows; r++) {
//         var tr = $('<tr>');
//         for (var c = 0; c < cols; c++)
//         $('<td></td>').attr('class', color).appendTo(tr);
//         tr.appendTo(table);
//     }
//     table.appendTo(table);
// }



    // // fill/drop
    // $('#paper').on({
    //     dragover: function(e) {
    //         e.preventDefault();
    //     },
    //     drop: function() {
    //        $('#paper td').attr('class', draw.selected);
    //     }
    // }); 


    //$(window).resize( resizePaper );
    //resizePaper();
    // resize drawing grid paper
    //function resizePaper() {
        // resize paper
        //$('#paper').width(draw.paperw);
        //var td_width = $('#paper td').width();
        // make td square based on new width
        //$('#paper td').height(td_width);
    //}


// check version/screen size for grid sizing options
// console.log(navigator);
// console.log(navigator.platform);
// var element = document.getElementById('deviceProperties');

//         element.innerHTML = 'Device Name: '     + device.name     + '<br />' + 
//                             'Device PhoneGap: ' + device.phonegap + '<br />' + 
//                             'Device Platform: ' + device.platform + '<br />' + 
//                             'Device UUID: '     + device.uuid     + '<br />' + 
//                             'Device Version: '  + device.version  + '<br />';


/*
    <table class="mini"></table>

    var table = $(li).find('.mini');
    tindex = 1;
    for (var r = 0; r < drawing.rows; r++) {
        var tr = $('<tr>');
        for (var c = 0; c < drawing.cols; c++) {
            var cssclass = drawing.colors[tindex]
            $('<td class="'+cssclass+'"></td>').appendTo(tr);
            tr.appendTo(table);
            tindex++;
        }
    }
*/