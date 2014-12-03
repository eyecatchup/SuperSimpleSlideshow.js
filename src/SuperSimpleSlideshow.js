// Copyright 2013 Stephan Schmitz <eyecatchup@gmail.com>. All rights reserved.
// URL: https://github.com/eyecatchup/SuperSimpleSlideshow.js
// Use of this source code is governed by the MIT license that can be found in
// the LICENSE file.

/*jshint ass: true, forin:true, noarg:true, noempty:true, nomen: true, unparam: true, eqeqeq:true, bitwise:true, strict:true, undef:false, curly:true, browser:true, es5:true, indent:4, maxerr:500, white:true*/
/*global SuperSimpleSlideshow:true, window:true*/

/**
 * The global SuperSimpleSlideshow object.
 * @type {!Object}
 * @const
 */
var SuperSimpleSlideshow = (function () {
    'use strict';

    var self   = this,
        states = {
            now: -1,
            map: {
                INITED:     1,
                PLAYING:    2,
                STOPPED:    3
            }
        },
        slider = {
            oImagesNodeList: null,
            nImgCnt:         0,
            nSlideCurrIndex: 0
        },
        opts = {
            bAutostart:     false,
            nSlideInterval: 3000,
            sSliderNodeId:  "slideshow",
            sCssTransition: "fadey" //"imageAnimation"
        };

    function _$(nodeId) {
        try {
            return window.document.getElementById(nodeId);
        } catch (e) {}
    }

    function isTrue(mixedVal) {
        return ("true" == mixedVal);
    }

    function SuperSimpleSlideshow(oOpts) {
        self = this;
        this.__init__(slider, opts, oOpts);

        window.document.addEventListener('keydown', this.bindHotkeys, false);
    }

    SuperSimpleSlideshow.prototype = {
        __init__: function (slider, opts, oOpts) {
            this.slider = slider;
            this.opts = opts;

            if ("undefined" !== typeof oOpts) {
                oOpts.autostart && this.setAutostart(oOpts.autostart);
                oOpts.interval  && this.setSliderInterval(oOpts.interval);
                oOpts.sliderId  && this.setSliderNodeId(oOpts.sliderId);
            }

            this.setSlideshowNodeList();

            if (true === this.getAutostart()) {
                this.start();
            }
        },
        start: function() {
            var imageNodes = this.getSlideshowNodeList(),
                n = this.getSliderIteration();

            if ("undefined" === typeof imageNodes) {
                return false;
            }
            this.setState(2);

            imageNodes[n].style.webkitAnimation = this.opts.sCssTransition + " " + this.getSliderInterval() + "ms";
            imageNodes[n].style.animation       = this.opts.sCssTransition + " " + this.getSliderInterval() + "ms";

            window.setInterval(function() {
                var _self = this;

                imageNodes[self.slider.nSlideCurrIndex].removeAttribute("style");

                if (states.map.PLAYING == self.getState()) {
                    (self.slider.nSlideCurrIndex == (self.slider.nImgCnt - 1)) ? self.setSliderIteration(0) : self.slider.nSlideCurrIndex++;

                    imageNodes[self.slider.nSlideCurrIndex].style.webkitAnimation  = self.opts.sCssTransition + " " + self.getSliderInterval() + "ms";
                    imageNodes[self.slider.nSlideCurrIndex].style.animation        = self.opts.sCssTransition + " " + self.getSliderInterval() + "ms";
                }
            }, this.getSliderInterval());
        },
        pause: function() {
            return this.setState(3);
        },
        getState: function() {
            return states.now;
        },
        setState: function(num) {
            if (num === states.map.INITED || num === states.map.PLAYING || num === states.map.STOPPED) {
                var msg = 'State changed: ';
                if (num === states.map.INITED) { msg += 'INITED'; }
                else if (num === states.map.PLAYING) { msg += 'PLAYING'; }
                else if (num === states.map.STOPPED) { msg += 'STOPPED'; }

                console.log(msg);
                return states.now = num, true;
            }
            return false;
        },
        getAutostart: function() {
            return this.opts.bAutostart;
        },
        setAutostart: function(bool) {
            (true === bool || bool === false) && (this.opts.bAutostart = bool);
        },
        getSliderInterval: function() {
            return this.opts.nSlideInterval;
        },
        setSliderInterval: function(num) {
            isFinite(num) && (this.opts.nSlideInterval = num);
        },
        getSliderIteration: function() {
            return this.slider.nSlideCurrIndex;
        },
        setSliderIteration: function(num) {
            this.slider.nSlideCurrIndex = num;
        },
        addSliderIteration: function() {
            this.slider.nSlideCurrIndex += 1;
        },
        resetSliderIteration: function() {
            this.slider.nSlideCurrIndex = 0;
        },
        getSliderNodeId: function() {
            return this.opts.sSliderNodeId;
        },
        setSliderNodeId: function(str) {
            ("string" === typeof str) && 0 < str.length && (this.opts.sSliderNodeId = str);
        },
        getSlideshowNodeList: function() {
            return this.slider.oImagesNodeList;
        },
        setSlideshowNodeList: function() {
            var nodeId = this.getSliderNodeId();
            if(_$(nodeId) && _$(nodeId).children && _$(nodeId).children.length) {
                this.slider.oImagesNodeList = _$(nodeId).children;
                this.slider.nImgCnt = _$(nodeId).children.length;
                this.resetSliderIteration();
                this.setState(1);
            }
            else {
                return false;
            }
        },
        goFullscreen: function() {
            var a = _$(this.getSliderNodeId());
            if (a.requestFullscreen) {
                return a.requestFullscreen();
            }
            else if (a.webkitRequestFullscreen ) {
                return a.webkitRequestFullscreen();
            }
            else if (a.mozRequestFullScreen) {
                return a.mozRequestFullScreen();
            }
        },
        bindHotkeys: function(event) {
            event = event || window.event;
            var _self = this;
            switch (event.keyCode) {
                case 32:
                    !event.cancelable || event.preventDefault();
                    console.log('space key pressed.');
                    if (states.map.INITED == self.getState() || self.getState() == states.map.STOPPED) {
                        console.log('was NOT playing.. starting.');
                        return self.start();
                    }
                    else if (states.map.PLAYING == self.getState()) {
                        console.log('was playing.. pausing.');
                        return self.pause();
                    }
                    break;
                case 37:
                    !event.cancelable || event.preventDefault();
                    console.log('left > prev()');
                    break;
                case 39:
                    !event.cancelable || event.preventDefault();
                    console.log('right > next()');
                    break;
                case 38:
                    !event.cancelable || event.preventDefault();
                    console.log('up > zoomIn()');
                    break;
                case 40:
                    !event.cancelable || event.preventDefault();
                    console.log('down > zoomOut()');
                    break;
                case 187:
                    !event.cancelable || event.preventDefault();
                    console.log('+ > zoomIn()');
                    break;
                case 189:
                    !event.cancelable || event.preventDefault();
                    console.log('- > zoomOut()');
                    break;
                case 70:
                    !event.cancelable || event.preventDefault();
                    console.log('f > goFullscreen()');
                    return self.goFullscreen();
                    break;
                default:
                    !event.cancelable || event.preventDefault();
                    //console.dir(event.keyCode);
                    break;
            }
            return;
        }
    };

    window.SuperSimpleSlideshow = SuperSimpleSlideshow;
    return SuperSimpleSlideshow;
})();