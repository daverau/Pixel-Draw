Pixel Drawing App in plain JavaScript
=====================================

A plain JavaScript pixel drawing app for the browser, ideally for touch screens.

Background
----------
Native Javascript except selective use of Underscore.js for functions like _.size and _.without. Requires touch event emulation in the browser to use.

Interface in action
-------------------
<img src="http://pixeldrawapp.com/img/drawinghi_web.gif" width="240" >

Features
--------

* No canvas, uses a good old HTML table -- semantic blastphamy!
* Save to localstorage, testing out localForage for speed optimizations on iOS
* Publish online via parse.com data api (removed since Parse service shutdown)

Changelog
---------

### 1.3.0
- New color picker with presets
- Minor code formatting cleanup

### 1.2.0
- Publish to the online gallery
- Random color picker now randomizes the working area colors, not your saved palette
