/*global define, FileReader*/
/*jslint nomen:true*/

define(function (require, exports, module) {
    "use strict";
    
    // VAR init
    
    var View                    = require('famous/core/View'),
        ImageSurface            = require('famous/surfaces/ImageSurface'),
        Surface                 = require('famous/core/Surface'),
        Transform               = require('famous/core/Transform'),
        StateModifier           = require('famous/modifiers/StateModifier'),
        Transitionable          = require('famous/transitions/Transitionable'),
        TransitionableTransform = require('famous/transitions/TransitionableTransform'),
        Modifier                = require('famous/core/Modifier'),
        GenericSync             = require('famous/inputs/GenericSync'),
        MouseSync               = require('famous/inputs/MouseSync'),
        TouchSync               = require('famous/inputs/TouchSync'),
      
        tiles = [],
        sizeTransform,
        sync,
        rot = 0,
        currentRot = 0,
        direction,
        lang = 'PT',
        collectionInfo,
        collectionInfoSmall,
        
        collectionUsageMsg = ' drag & drop your design file / touch to rotate',
        collectionUsageMsgPT = ' arraste o seu ficheiro de imagem / toque para rodar azulejos',
        collectionErrorMsg = ' Error loading file / invalid format',
        collectionErrorMsgPT = ' Erro a ler ficheiro / formato inválido',
        collectionFileReaderMsg = ' disabled in this browser / device',
        collectionFileReaderMsgPT = ' indisponível neste browser / dispositivo',
        collectionInfoAlign = 'left',
        usageMsgFlag = 0,
        img = 'img/blank.svg',
        
        _generateTileLayout,
        _redrawTileLayout,
        _createbackground,
        _createColectionInfo,
        _createSmallInfo;
    
    
   
    //Input control
    
    GenericSync.register({'mouse': MouseSync, 'touch': TouchSync});
    
    sync = new GenericSync(
        ['mouse', 'touch'],
        {direction: GenericSync.DIRECTION_X}
    );
    
    
    // "Private" methods
    
    _createbackground = function () {
        
        var background = new ImageSurface({
            properties: {
                backgroundColor: 'white'
            }
        });
        
        this.add(background);
        
        
    };
    
    _createColectionInfo = function (w, h) {
        
        var measure = Math.min(w, h),
            innerH = window.innerHeight,
            fSize = (innerH - (innerH * 0.9)) / 2;
        
        this.collectionName = new Surface({
            size: [w, fSize],
            properties: {
                fontFamily: 'simplifica_local',
                verticalAlign: 'bottom',
                lineHeight: fSize + 'px',
                textAlign: collectionInfoAlign,
                fontSize: 14 + 'px',
                color: 'rgb(190, 183, 170)'
            }
        });
        
        this.collectionName.pipe(sync);
        
        this.collectionName.transitionable = new Transitionable();
        this.collectionName.transitionable.set(1);
        this.collectionName.translTransitionable = new TransitionableTransform();
        this.collectionName.translTransitionable.setTranslate([w / 1.95, innerH - fSize, 0]);
        
        this.collectionName.modifier = new Modifier({
            origin: [0.5, 1],
            opacity: this.collectionName.transitionable,
            transform: this.collectionName.translTransitionable
        });
        this.add(this.collectionName.modifier).add(this.collectionName);
        
        collectionInfo = this.collectionName;

    };
    
    _createSmallInfo = function (w, h) {
        
        var measure = Math.min(w, h),
            innerH = window.innerHeight,
            fSize = (innerH - (innerH * 0.9)) / 2;
        
        this.collectionInfoSmall = new Surface({
            size: [w, fSize],
            content: ' ',
            properties: {
                fontFamily: 'simplifica_local',
                verticalAlign: 'bottom',
                lineHeight: fSize + 'px',
                textAlign: collectionInfoAlign,
                fontSize: 14 + 'px',
                color: 'rgb(190, 183, 170)'
               
            }
        });
        
        this.collectionInfoSmall.transitionable = new Transitionable();
        this.collectionInfoSmall.transitionable.set(1);
        this.collectionInfoSmall.translTransitionable = new TransitionableTransform();
        this.collectionInfoSmall.translTransitionable.setTranslate([w / 1.95, innerH, 0]);
        
        this.collectionInfoSmall.modifier = new Modifier({
            origin: [0.5, 1],
            opacity: this.collectionInfoSmall.transitionable,
            transform: this.collectionInfoSmall.translTransitionable
        });
        this.add(this.collectionInfoSmall.modifier).add(this.collectionInfoSmall);
        
        collectionInfoSmall = this.collectionInfoSmall;
        

    };
    
    
    _redrawTileLayout = function (w, h) {
        var c,
            l,
            numCols = this.options.gridColumns,
            numLines = this.options.gridLines,
            measure = Math.max(w, h),
            preTileSize = parseInt(measure % numLines, 10),
            tileSize,
            wStart,
            hStart,
            innerH = window.innerHeight,
            fSize = (innerH - (innerH * 0.9)) / 2;
 
        
        tileSize = parseInt(measure / numLines, 10) + Math.ceil(preTileSize / numLines);
        wStart = w / 2 - (this.options.gridLines / 2) * tileSize + tileSize / 2;
        hStart = h - tileSize / 2;
        
        for (c = 0; c < numCols; c = c + 1) {
            for (l = 0; l < numLines; l = l + 1) {
                tiles[c][l].sizeTransform.set([tileSize, tileSize]);
                tiles[c][l].translTransform.setTranslate([wStart + c * tileSize, hStart - l * tileSize, 200 ]);
            }
        }
        
        this.collectionName.setProperties({'fontSize': Math.min(w, h) / 22 + 'px'});
        this.collectionName.setProperties({'lineHeight': fSize + 'px'});
        this.collectionName.setSize([w, fSize]);
        this.collectionName.translTransitionable.setTranslate([w / 1.95, innerH - fSize, 0]);
        
        this.collectionInfoSmall.setProperties({'fontSize': Math.min(w, h) / 39 + 'px'});
        this.collectionInfoSmall.setProperties({'lineHeight': fSize + 'px'});
        this.collectionInfoSmall.setSize([w, fSize]);
        this.collectionInfoSmall.translTransitionable.setTranslate([w / 1.95, innerH, 0]);
       
    };
    
    _generateTileLayout = function (w, h) {
        var c,
            l,
            numCols = this.options.gridColumns,
            numLines = this.options.gridLines,
            tileSize = parseInt(h / (this.options.gridLines * 2), 10),
            rotMod,
            clickCallback,
            dragenterCallback,
            dragoverCallback,
            dropCallback;
        

        clickCallback = function (event) {
            this.rotModifier.rots = this.rotModifier.rots + 1;
        };
        
        rotMod = function () {
            return Transform.rotate(0, 0, Math.PI / 2 * this.rots);
        };
        
        dragenterCallback = function (evt) {
            evt.preventDefault();
        };
        
        dragoverCallback = function (evt) {
            evt.preventDefault();
        };
        
        dropCallback = function (evt) {
            var file,
                reader = new FileReader(),
                setImage;
            
            evt.preventDefault();
            evt.stopPropagation();
            
            setImage = function (img) {
                var l, c, w, h;
                
                for (c = 0; c < numCols; c = c + 1) {
                    for (l = 0; l < numLines; l = l + 1) {
                        tiles[c][l].rotModifier.rots = 0;
                        tiles[c][l].setContent(img);
                        w = tiles[c][l].getSize()[0];
                        h = tiles[c][l].getSize()[1];
                        tiles[c][l].sizeTransform.set([w * 1.4, h * 1.4]);
                        tiles[c][l].sizeTransform.set([w, h]);
                       
                    }
                }
                
            };
            
           

            if (window.FileReader) {
                file = evt.dataTransfer.files[0];

                reader.onloadend = function () {
                    setImage(this.result);
                };

                reader.onerror = function () {
                    setImage(img);
                    collectionInfo.setContent(collectionErrorMsg);
                    collectionInfoSmall.setContent(collectionErrorMsgPT);
                };

                reader.readAsDataURL(file);
                collectionInfo.setContent(collectionUsageMsg);
                collectionInfoSmall.setContent(collectionUsageMsgPT);

            } else {
                collectionInfo.setContent(collectionFileReaderMsg);
                collectionInfoSmall.setContent(collectionFileReaderMsgPT);
            }

        };
        
        
        for (c = 0; c < numCols; c = c + 1) {
            
            tiles[c] = [];
            
            for (l = 0; l < numLines; l = l + 1) {
                
                tiles[c][l] = new ImageSurface({
                    content: img
                });
                
                
                tiles[c][l].on('dragenter', dragenterCallback);
                
                tiles[c][l].on('dragover', dragoverCallback);

                tiles[c][l].on('drop', dropCallback.bind(this));
                
                tiles[c][l].on('click', clickCallback);
                
                tiles[c][l].translTransform = new TransitionableTransform();
                tiles[c][l].sizeTransform = new Transitionable([tileSize, tileSize]);
                
                tiles[c][l].layoutModifier = new Modifier({
                    size : tiles[c][l].sizeTransform,
                    transform:  tiles[c][l].translTransform
                });
                
                
                tiles[c][l].rotModifier = new Modifier({
                    origin: [0.5, 0.5]
                });
                
                tiles[c][l].rotModifier.rots = 0;
                
                tiles[c][l].rotModifier.transformFrom(rotMod);
               
                this.add(tiles[c][l].layoutModifier)
                    .add(tiles[c][l].rotModifier)
                    .add(tiles[c][l]);
            }
        }
        
    };
    
   
    
    // Constructor
    
    function LabView(w, h) {
        
        View.apply(this, arguments);

        _createbackground.call(this);
        _generateTileLayout.call(this, w, h);
        _createColectionInfo.call(this, w, h);
        _createSmallInfo.call(this, w, h);
        this.collectionName.setContent(collectionUsageMsg);
        this.collectionName.setProperties({'textAlign': collectionInfoAlign});
        this.collectionInfoSmall.setContent(collectionUsageMsgPT);
        this.collectionInfoSmall.setProperties({'textAlign': collectionInfoAlign});
        _redrawTileLayout.call(this, w, h);
        
    }

    LabView.prototype = Object.create(View.prototype);
    LabView.prototype.constructor = LabView;
    LabView.prototype.redraw = function (w, h) {
        _redrawTileLayout.call(this, w, h);
    };
    
    //Options
    
    LabView.DEFAULT_OPTIONS = {
        gridColumns: 12,
        gridLines: 12
    };

    //Exports
    
    module.exports = LabView;
});