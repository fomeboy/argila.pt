/*global define*/

define(function (require, exports, module) {
    "use strict";
    var Engine = require('famous/core/Engine'),
        mainContext = Engine.createContext(),
        Controller = require('Controller'),
        controller;
    
    controller = new Controller();
    mainContext.add(controller);
    
    Engine.on('resize', function () {
        var w = document.documentElement.clientWidth,
            h = document.documentElement.clientHeight;
        
        controller.redraw(w, h);
    });
    
});
