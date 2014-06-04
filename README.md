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

* doesn't use canvas, I favor HTML/DOM/CSS over 2d coordinate systems, so this uses a table -- semantic blastphamy!
* saves to localstorage, testing out localForage for speed optimizations on iOS
* publishes online via parse.com data api

Changelog
---------

### 1.2.0
* publish to the online gallery
* random color picker now randomizes the working area colors, not your saved palette
