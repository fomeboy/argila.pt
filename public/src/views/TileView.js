/*global define*/
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
        SpringTransition        = require('famous/transitions/SpringTransition'),
        Easing                  = require('famous/transitions/Easing'),
      
        CollectionsData   = require('data/Model'),
        
        currWidth,
        currHeight,
        currCol,
        currentColl = 0,
        localColl = 0,
        collNum = CollectionsData.length,
        tiles = [],
        tiles2 = [],
        images = [],
        goldenRatio   = 1.618,
        sizeTransform,
        sync,
        rot = 0,
        currentRot = 0,
        changeColl = false,
        direction,
        lim_min,
        lim_max,
        setDir = false,
        prevX,
        xStart,
        beginSwipe,
        endSwipe,
        swipeTolerance,
        swipeSpan,
        springRotation,
        // degrees * (Math.PI / 180) => radians
        radians_90 = 90 * (Math.PI / 180),
        radians_270 = 270 * (Math.PI / 180),
        radians_180 = 180 * (Math.PI / 180),
        radians_360 = 360 * (Math.PI / 180),
        radians_450 = 450 * (Math.PI / 180),
        radians_630 = 630 * (Math.PI / 180),
        radians_720 = 720 * (Math.PI / 180),
        lang = 'PT',
        collectionInfo,
        collectionPatternInfo,
        collectionUsageMsg = ' touch to rotate tiles / drag to change collection',
        collectionUsageMsgPT = ' toque para rodar azulejos / arraste para mudar coleção',
        collectionInfoAlign = 'left',
        usageMsgFlag = 0,
        
        mapVal,
        incrementColl,
        decrementColl,
        incrementLocalColl,
        decrementLocalColl,
        checkMaxCollName,
        _generateTileLayout,
        _redrawTileLayout,
        _changeCollectionLayout,
        _changeCollectiontext,
        _generateTileLayout2H,
        _createbackground,
        _createColectionInfo,
        _createColePatternInfoL,
        _handleSwipe,
        _preloadImages;
    
    
    // Intializations
    
    springRotation = new SpringTransition([0, 0, 0]);
    
    
    //Generic functions
    
    mapVal = function (val, in_min, in_max, out_min, out_max) {
        return (val - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    };
    
    incrementColl = function () {
        currentColl = currentColl + 1;
        if (currentColl === collNum) {
            currentColl = 0;
        }
    };
    
    decrementColl = function () {
        currentColl = currentColl - 1;
        if (currentColl < 0) {
            currentColl = collNum - 1;
        }
    };
    
    incrementLocalColl = function () {
        localColl = localColl + 1;
        if (localColl === collNum) {
            localColl = 0;
        }
    };
    
    decrementLocalColl = function () {
        localColl = localColl - 1;
        if (localColl < 0) {
            localColl = collNum - 1;
        }
    };
    
    checkMaxCollName = function () {
        var i,
            val = 0;
    
        for (i = 0; i <  CollectionsData.length; i = i + 1) {
            if (CollectionsData[i].collection_name[lang].length > val) {
                val = CollectionsData[i].collection_name[lang].length;
            }
        }
        
        return val;
    
    };
    
    //Input control
    
    GenericSync.register({'mouse': MouseSync, 'touch': TouchSync});
    
    sync = new GenericSync(
        ['mouse', 'touch'],
        {direction: GenericSync.DIRECTION_X}
    );
    
    sync.on('update', function (data) {
        
        direction = data.clientX - xStart;
        
        if (!setDir) {
            if (direction > 0) {
                lim_min = xStart + swipeTolerance;
                lim_max = xStart + swipeTolerance + swipeSpan;
            } else {
                lim_min = xStart - swipeTolerance - swipeSpan;
                lim_max = xStart - swipeTolerance;
            }
            
            setDir = true;
        }
        
        if (data.clientX  >= lim_min && data.clientX <= lim_max) {
            
            if (direction <= 0) {
                rot = mapVal(data.clientX, lim_max, lim_min, 0, 360) * (Math.PI / 180);
            } else {
                rot = -mapVal(data.clientX, lim_min, lim_max, 0, 360) * (Math.PI / 180);
            }
           
            // surface is "backsided" between 90 and 270 degrees on Y axis
            //left swipe
            if (rot >= radians_90 && rot <= radians_270 && prevX >= data.clientX) {
                rot = Math.min(rot + radians_180, radians_360);
            }
            
            if (rot >= radians_90 && rot <= radians_270 && prevX <= data.clientX) {
                rot = Math.max(rot - radians_90, 0);
            }
            
            //right swipe
            if (rot <= -radians_90 && rot >= -radians_270 && prevX <= data.clientX) {
                rot = Math.max(rot - radians_180, -radians_360);
            }
            if (rot <= -radians_90 && rot >= -radians_270 && prevX >= data.clientX) {
                rot = Math.min(rot + radians_90, 0);
            }
            
            prevX = data.clientX;
            
            collectionInfo.setContent("");
            collectionPatternInfo.setContent("");
            
        }

    });
    
    sync.on('start', function (data) {
        xStart = data.clientX;
        localColl = currentColl;
        changeColl = false;
    });
    
    sync.on('end', function (data) {
        var c, l, numCols = 18, numLines = 18;
        
        if (direction <= 0) {
            if (changeColl) {
                currentRot = currentRot + radians_360;
                rot = 0;
                incrementColl();
            } else {
                rot = 0;
            }
        } else {
            if (changeColl) {
                currentRot = currentRot - radians_360;
                rot = 0;
                decrementColl();
            } else {
                rot = 0;
            }
        }

        setDir = false;
        
        if (collectionInfo.content !== CollectionsData[currentColl].collection_name[lang]) {
            collectionInfo.transitionable.set(0, {duration: 100, curve: Easing.inCubic}, function () {
                collectionInfo.setContent(CollectionsData[currentColl].collection_name[lang]);
                collectionInfo.transitionable.set(1, {duration: 400, curve: Easing.inCubic});
            });
            
            collectionPatternInfo.transitionable.set(0, {duration: 100, curve: Easing.inCubic}, function () {
                collectionPatternInfo.setContent(CollectionsData[currentColl].description[lang]);
                collectionPatternInfo.transitionable.set(1, {duration: 400, curve: Easing.inCubic});
            });
        }
        
        
    });
    
    
    // "Private" methods
    
    _preloadImages = function () {
        var i, createImage;
        
        images = [];
        
        createImage = function (src) {
            var img   = new Image();
            img.src   = src;
                
            return img;
        };

        for (i = 0; i <  CollectionsData.length; i = i + 1) {
            images.push(createImage(CollectionsData[i].imgUrl));
        }
        
    };
    
    _createbackground = function () {
        var background = new Surface({
            properties: {
                backgroundColor: 'white'
            }
        });
        
        
        background.pipe(sync);
        
        this.add(background);
    };
    
    _createColectionInfo = function (w, h) {
        
        var measure = Math.min(w, h),
            innerH = window.innerHeight,
            fSize = (innerH - (innerH * 0.9)) / 2;
        
        this.collectionName = new Surface({
            size: [w, fSize],
            content: CollectionsData[currentColl].collection_name[lang],
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
    
    _createColePatternInfoL = function (w, h) {
        
        var measure = Math.min(w, h),
            innerH = window.innerHeight,
            fSize = (innerH - (innerH * 0.9)) / 2;
        
        this.collectionPattern = new Surface({
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
        
        this.collectionPattern.transitionable = new Transitionable();
        this.collectionPattern.transitionable.set(1);
        this.collectionPattern.translTransitionable = new TransitionableTransform();
        this.collectionPattern.translTransitionable.setTranslate([w / 1.95, innerH, 0]);
        
        this.collectionPattern.modifier = new Modifier({
            origin: [0.5, 1],
            opacity: this.collectionPattern.transitionable,
            transform: this.collectionPattern.translTransitionable
        });
        this.add(this.collectionPattern.modifier).add(this.collectionPattern);
        
        collectionPatternInfo = this.collectionPattern;
        

    };
     
   
    _changeCollectionLayout = function (collection) {
        var c,
            l,
            numCols = tiles.length,
            numLines = tiles[0].length,
            patternLines1 = CollectionsData[collection].pattern1[0].length - 1,
            patternCols1 = CollectionsData[collection].pattern1.length - 1,
            patternLines2 = CollectionsData[collection].pattern2[0].length - 1,
            patternCols2 = CollectionsData[collection].pattern2.length - 1,
            patternLines3 = CollectionsData[collection].pattern3[0].length - 1,
            patternCols3 = CollectionsData[collection].pattern3.length - 1,
            patternPosH = 0,
            patternPosV = 0,
            browser = '';
        
       
        if (navigator.vendor.toLowerCase().indexOf('apple') >= 0) {
            browser = 'Safari';
        }
    
        
        for (c = 0; c < numCols / 3; c = c + 1) {
            for (l = 0; l < numLines; l = l + 1) {
                tiles[c][l].setContent(images[collection].src);
                tiles[c][l].rotModifier.rots = parseInt(CollectionsData[collection].pattern1[patternPosV][patternPosH].rot, 10);
                if (browser === 'Safari') {
                    tiles[c][l].opactrans.set(0);
                }
                
                if (patternPosV === patternCols1) {
                    patternPosV = 0;
                } else {
                    patternPosV = patternPosV + 1;
                }
            }
            
            patternPosV = 0;
            if (patternPosH === patternLines1) {
                patternPosH = 0;
            } else {
                patternPosH = patternPosH + 1;
            }
        }
        
        patternPosV = 0;
        patternPosH = 0;
        
        for (c = numCols / 3; c < numCols / 3 * 2; c = c + 1) {
            for (l = 0; l < numLines; l = l + 1) {
                tiles[c][l].setContent(images[collection].src);
                tiles[c][l].rotModifier.rots = parseInt(CollectionsData[collection].pattern2[patternPosV][patternPosH].rot, 10);
                if (browser === 'Safari') {
                    tiles[c][l].opactrans.set(0);
                }
                
                if (patternPosV === patternCols2) {
                    patternPosV = 0;
                } else {
                    patternPosV = patternPosV + 1;
                }
            }
            
            patternPosV = 0;
            if (patternPosH === patternLines2) {
                patternPosH = 0;
            } else {
                patternPosH = patternPosH + 1;
            }
        }
        
        patternPosV = 0;
        patternPosH = 0;
        
        for (c = numCols / 3 * 2; c < numCols; c = c + 1) {
            for (l = 0; l < numLines; l = l + 1) {
                tiles[c][l].setContent(images[collection].src);
                tiles[c][l].rotModifier.rots = parseInt(CollectionsData[collection].pattern3[patternPosV][patternPosH].rot, 10);
                if (browser === 'Safari') {
                    tiles[c][l].opactrans.set(0);
                }
                
                if (patternPosV === patternCols3) {
                    patternPosV = 0;
                } else {
                    patternPosV = patternPosV + 1;
                }
            }
            
            patternPosV = 0;
            if (patternPosH === patternLines3) {
                patternPosH = 0;
            } else {
                patternPosH = patternPosH + 1;
            }
        }
        
        //safari redraw?repaint bug
        if (browser === 'Safari') {
            tiles[numLines - 1][numCols - 1].opactrans.set(1, {duration: 1}, function () {
                document.body.removeChild(document.body.appendChild(document.createElement('style')));
                for (c = 0; c < numCols; c = c + 1) {
                    for (l = 0; l < numLines; l = l + 1) {
                        tiles[c][l].opactrans.set(1);
                    }
                }
            });
        }
        
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
        wStart = w / 2 - (numLines / 2) * tileSize + tileSize / 2;
        hStart = h - tileSize / 2;
        
        for (c = 0; c < numCols; c = c + 1) {
            for (l = 0; l < numLines; l = l + 1) {
                tiles[c][l].sizeTransform.set([tileSize, tileSize]);
                tiles[c][l].translTransform.setTranslate([wStart + c * tileSize, hStart - l * tileSize, 100 ]);
            }
        }
        
        collectionInfo.setProperties({'fontSize': Math.min(w, h) / 22 + 'px'});
        collectionInfo.setProperties({'lineHeight': fSize + 'px'});
        collectionInfo.setSize([w, fSize]);
        collectionInfo.translTransitionable.setTranslate([w / 1.95, innerH - fSize, 0]);
        
        collectionPatternInfo.setProperties({'fontSize': Math.min(w, h) / 39 + 'px'});
        collectionPatternInfo.setProperties({'lineHeight': fSize + 'px'});
        collectionPatternInfo.setSize([w, fSize]);
        collectionPatternInfo.translTransitionable.setTranslate([w / 1.95, innerH, 0]);
        
        
    };
    
    _generateTileLayout = function (w, h) {
        var c,
            l,
            numCols = this.options.gridColumns,
            numLines = this.options.gridLines,
            measure = Math.max(w, h),
            preTileSize = parseInt(measure % numLines, 10),
            tileSize = parseInt(measure / numLines, 10) + Math.ceil(preTileSize / numLines),
            rotMod,
            createTileAnim,
            clickCallback;
        

        clickCallback = function (event) {
            this.rotModifier.rots = this.rotModifier.rots + 1;
        };
        
        createTileAnim = function () {
            var springRot,
                translTransform,
                sizeTransform;
          
            springRotation.set([0, currentRot + rot, 0], {
                dampingRatio: 0.1,
                period: 500
               
            });
            
            springRot = springRotation.get();
            
            
            if (springRot[1] >= currentRot + radians_90) {

                if (localColl === currentColl) {
                    incrementLocalColl();
                    _changeCollectionLayout(localColl);
                    changeColl = true;
                }
            } else if (springRot[1] > currentRot && springRot[1] < currentRot + radians_90) {
                if (localColl !== currentColl) {
                    decrementLocalColl();
                    _changeCollectionLayout(localColl);
                    changeColl = false;
                }
            //negative rotation    
            } else if (springRot[1] <= currentRot - radians_90) {

                if (localColl === currentColl) {
                    decrementLocalColl();
                    _changeCollectionLayout(localColl);
                    changeColl = true;
                }
            } else if (springRot[1] < currentRot && springRot[1] > currentRot - radians_90) {
                if (localColl !== currentColl) {
                    incrementLocalColl();
                    _changeCollectionLayout(localColl);
                    changeColl = false;
                }
            }
            
            return Transform.rotate(springRot[0], springRot[1], springRot[2]);
            
        };
        
        rotMod = function () {
            return Transform.rotate(0, 0, Math.PI / 2 * this.rots);
        };
        
        
        for (c = 0; c < numCols; c = c + 1) {
            
            tiles[c] = [];
            
            for (l = 0; l < numLines; l = l + 1) {
                
                tiles[c][l] = new ImageSurface({
                    properties: {
                        //backfaceVisibility: 'hidden'  
                    }
                });
                
                tiles[c][l].pipe(sync);
                
                tiles[c][l].on('click', clickCallback);
                
                tiles[c][l].translTransform = new TransitionableTransform();
                tiles[c][l].sizeTransform = new Transitionable([tileSize, tileSize]);
        
                tiles[c][l].opactrans = new Transitionable();
                tiles[c][l].opactrans.set(1);
                
                tiles[c][l].layoutModifier = new Modifier({
                    size : tiles[c][l].sizeTransform,
                    transform:  tiles[c][l].translTransform,
                    opacity: tiles[c][l].opactrans
                });
                
                tiles[c][l].tileAnimModifier = new Modifier({
                });
                
                tiles[c][l].tileAnimModifier.transformFrom(createTileAnim.bind(this));
                
                tiles[c][l].rotModifier = new Modifier({
                    origin: [0.5, 0.5]
                });
                
                tiles[c][l].rotModifier.rots = 0;
                
                tiles[c][l].rotModifier.transformFrom(rotMod);
             
                this.add(tiles[c][l].layoutModifier)
                    .add(tiles[c][l].tileAnimModifier)
                    .add(tiles[c][l].rotModifier)
                    .add(tiles[c][l]);
            }
        }
        
    };
    
   
    
    // Constructor
    
    function TileView(w, h) {
        
        View.apply(this, arguments);
        
        currWidth = w;
        currHeight = h;
  
        swipeTolerance = currWidth / 20;
        swipeSpan = swipeTolerance * 2;

        _createbackground.call(this);
        _preloadImages();
        _generateTileLayout.call(this, w, h);
        _changeCollectionLayout(currentColl);
        _createColectionInfo.call(this, w, h);
        _createColePatternInfoL.call(this, w, h);
        _redrawTileLayout.call(this, w, h);
        this.collectionName.setContent(collectionUsageMsg);
        this.collectionName.setProperties({'textAlign': collectionInfoAlign});
        this.collectionPattern.setContent(collectionUsageMsgPT);
        this.collectionPattern.setProperties({'textAlign': collectionInfoAlign});
        
    }

    TileView.prototype = Object.create(View.prototype);
    TileView.prototype.constructor = TileView;
    TileView.prototype.redraw = function (w, h) {
        _redrawTileLayout.call(this, w, h);
    };
    
   
    //Options
    
    TileView.DEFAULT_OPTIONS = {
        gridColumns: 21,
        gridLines: 21
    };

    //Exports
    
    module.exports = TileView;
});