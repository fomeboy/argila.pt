/*global define, alert*/
/*jslint nomen: true*/

define(function (require, exports, module) {
    "use strict";
    
    var View                    = require('famous/core/View'),
        Surface                 = require('famous/core/Surface'),
        ImageSurface            = require('famous/surfaces/ImageSurface'),
        Transform               = require('famous/core/Transform'),
        StateModifier           = require('famous/modifiers/StateModifier'),
        Modifier                = require('famous/core/Modifier'),
        Transitionable          = require('famous/transitions/Transitionable'),
        TransitionableTransform = require('famous/transitions/TransitionableTransform'),
        Easing                  = require('famous/transitions/Easing'),
        GenericSync             = require('famous/inputs/GenericSync'),
        MouseSync               = require('famous/inputs/MouseSync'),
        TouchSync               = require('famous/inputs/TouchSync'),
        
        TileView = require('views/TileView'),
        LabView = require('views/LabView'),
        ContactView = require('views/ContactView'),
        
        logoOn = false,
        tilesOn = false,
        labOn = false,
        contactOn = false,
        introLoaded = false,
        sync,
       
        _getLogoSize,
        _getDotY,
        _createLayout,
        _initializeIntro,
        _initializeLayout,
        _initializeTileView,
        _initializeLabView,
        _initializeContactView,
        
        dotTranslTransitionable,
        tileSizeTransitionable,
        tileTranslTransitionable,
    
        labSizeTransitionable,
        labTranslTransitionable,
        labOpacity,
        
        contactSizeTransitionable,
        contactTranslTransitionable,
        contactOpacity,
        
        infoMsg = '<html><head><style>p {position: relative;top: 15%;}</style></head><body><p>&#160;&#160;&#160;Square... Two horizontal lines, two vertical lines. Two pairs of equal intensity, balanced.<br/>Rotation... Horizontal becomes vertical, density turns to lightness. New tensions, rhythm, movement...<br/><br/>&#160;&#160;&#160; Argila is a bespoke azulejo studio located in Lisbon dedicated to the exploration on new forms of expression using the ancient tradition of azulejo production. <br/><br/>&#160;&#160;&#160; Have an ideia for an azulejo? Use our lab to test your design. We will produce it for you.<br/><br/><br/><br/>&#160;&#160;&#160;Quadrado... Duas linhas horizontais, duas linhas verticais. Dois pares de igual densidade, equilibrio. <br/>Rotação... Horizontal passa a vertical, densidade transforma-se em leveza. Novas tensões, ritmos, movimento...<br/><br/>&#160;&#160;&#160; Argila  é um estúdio de azulejaria de autor localizado em Lisboa que se dedica à exploração de novas formas de expressão utilizando a antiga tradição de produção de azulejos.<br/><br/>&#160;&#160;&#160; Deseja produzir o seu próprio azulejo? Utilize o nosso laboratório para testar a sua ideia e deixe o resto conosco.</p></body></html>';
    
   
    
    GenericSync.register({'mouse': MouseSync, 'touch': TouchSync});
    
    sync = new GenericSync(
        ['mouse', 'touch'],
        {direction: GenericSync.DIRECTION_X}
    );
    
    _getLogoSize = function () {
        var measure = Math.min(window.innerWidth, window.innerHeight);
        
        return parseInt(measure * 0.09 / 1.5, 10);
    };
    
    _getDotY = function () {
        var h = window.innerHeight;
            
        return parseInt(h - (h - (h * this.options.relFooterHeight)) / 2 + _getLogoSize() / 1.9, 10);
    };
    
    _createLayout = function () {
        var measure = Math.min(window.innerWidth, window.innerHeight),
            logoSize = parseInt(measure * 0.09 / 1.5, 10),
            logoY = window.innerHeight - (window.innerHeight - (window.innerHeight * this.options.relFooterHeight)) / 2,
            collectionClickCallback,
            labClickCallback,
            contactClickCallback,
            logoClickCallback;

        this.layoutBackground = new Surface({
            size: [undefined, undefined],
            properties: {
                backgroundColor: 'rgb(74, 74, 74)'
            }
        });
        
       
      
        this.layoutModifier = new StateModifier();
        this.add(this.layoutmodifier).add(this.layoutBackground);
        
        this.layoutTransitionable = new Transitionable();
        this.layoutTransitionable.set(0);
        
        this.logo = new ImageSurface({
            size: [logoSize, logoSize],
            content: 'img/UI/logo.svg'
        });
        
        this.logoModifier = new Modifier({
            origin: [0.5, 0.5],
            opacity: this.layoutTransitionable,
            transform: Transform.translate(parseInt(window.innerWidth - logoSize * 3.5, 10), logoY, 400)
        });
        this.add(this.logoModifier).add(this.logo);
        
        logoClickCallback = function () {
            if (introLoaded && !logoOn) {
                
                logoOn = true;
                
                tileTranslTransitionable.setTranslate([-window.innerWidth - 10, 0, 100 ], { duration : 3000, curve: Easing.outCubic});
                tilesOn = false;
                
                labTranslTransitionable.setTranslate([-window.innerWidth - 10, 0, 200 ], { duration : 3000, curve: Easing.outCubic});
                labOn = false;
                
                contactTranslTransitionable.setTranslate([-window.innerWidth - 10, 0, 300 ], { duration : 3000, curve: Easing.outCubic});
                contactOn = false;
                
                this.infoTransitionable.set(1, { duration : 2500, curve: Easing.outCubic});
                this.introPressedTransitionable.set(0);
                
                dotTranslTransitionable.setTranslate([parseInt(window.innerWidth - _getLogoSize() * 3.5, 10), _getDotY.call(this),
                                                      400], { duration : 750, curve: Easing.outQuad});
            }
           
        };
        
        this.logo.on('click', logoClickCallback.bind(this));
        

        this.insta = new ImageSurface({
            size: [logoSize, logoSize],
            content: 'img/UI/instagram.svg'
        });
        
        this.instaModifier = new Modifier({
            origin: [0.5, 0.5],
            opacity: this.layoutTransitionable,
            transform: Transform.translate(parseInt(window.innerWidth - logoSize * 0.75, 10), logoY, 400)
        });
        this.add(this.instaModifier).add(this.insta);
        
        this.insta.on('click', function () { if (introLoaded) { window.open('https://instagram.com/argilazulejos/'); } });
        
        //
        this.dot = new ImageSurface({
            size: [logoSize / 6, logoSize / 6],
            content: 'img/UI/dot.svg'
        });
        
        dotTranslTransitionable = new TransitionableTransform();
        dotTranslTransitionable.setTranslate([parseInt(window.innerWidth - logoSize * 2.1, 10), _getDotY.call(this), 400]);
        
        this.dotModifier = new Modifier({
            origin: [0.5, 0.5],
            opacity: this.layoutTransitionable,
            transform: dotTranslTransitionable
            
        });
        this.add(this.dotModifier).add(this.dot);
        //
        
        this.face = new ImageSurface({
            size: [logoSize, logoSize],
            content: 'img/UI/facebook.svg'
        });
        
        this.faceModifier = new Modifier({
            origin: [0.5, 0.5],
            opacity: this.layoutTransitionable,
            transform: Transform.translate(parseInt(window.innerWidth - logoSize * 1.5, 10), logoY, 400)
        });
        this.add(this.faceModifier).add(this.face);
        
        this.face.on('click', function () {if (introLoaded) { window.open('https://www.facebook.com/argilazulejos'); } });
        
        
        this.intro = new ImageSurface({
            size: [measure / 2, measure / 2],
            content: 'img/UI/intro.svg'
        });
        
        this.introTransitionable = new Transitionable();
        this.introTransitionable.set(0);
        this.introModifier = new Modifier({
            origin: [0.5, 0.5],
            opacity: this.introTransitionable,
            transform: Transform.translate(parseInt(window.innerWidth / 2, 10), parseInt(window.innerHeight / 2, 10), 30)
        });
        this.add(this.introModifier).add(this.intro);
        
        this.intro.on('click', function () { _initializeLayout.call(this); }.bind(this));
        
        this.introPressed = new ImageSurface({
            size: [measure / 2, measure / 2],
            content: 'img/UI/introPressed.svg'
        });
        
        this.introPressedTransitionable = new Transitionable();
        this.introPressedTransitionable.set(0);
        this.introPressedModifier = new Modifier({
            origin: [0.5, 0.5],
            opacity: this.introPressedTransitionable,
            transform: Transform.translate(parseInt(window.innerWidth / 2, 10), parseInt(window.innerHeight / 2, 10), 10)
        });
        this.add(this.introPressedModifier).add(this.introPressed);
    
        
        //
        this.info = new Surface({
            size: [measure, measure],
            properties: {
                fontFamily: 'simplifica_local',
                fontSize: 14 + 'px',
                textAlign: 'center',
                color: 'rgb(190, 183, 170)'
            }
            
        });
        
        this.info.setProperties({'fontSize': measure / 30 + 'px'});
        this.infoTransitionable = new Transitionable();
        this.infoTransitionable.set(0);
        
        this.infoModifier = new Modifier({
            origin: [0.5, 0.5],
            opacity: this.infoTransitionable,
            transform: Transform.translate(parseInt(window.innerWidth / 2, 10), parseInt(window.innerHeight / 2, 10), 20)
        });
        
        this.info.setContent(infoMsg);
        
        this.add(this.infoModifier).add(this.info);
        
        //
        
        this.contactUI = new ImageSurface({
            size: [logoSize, logoSize],
            content: 'img/UI/contact.svg'
        });
        
        this.contactUIModifier = new Modifier({
            origin: [0.5, 0.5],
            opacity: this.layoutTransitionable,
            transform: Transform.translate(parseInt(window.innerWidth - logoSize * 2.5, 10), logoY, 400)
        });
        
        this.add(this.contactUIModifier).add(this.contactUI);
        
        contactClickCallback = function () {
            if (introLoaded && !contactOn) {
              
                contactTranslTransitionable.setTranslate([window.innerWidth, 0, 300 ], { duration : 3000, curve: Easing.outCubic});
                contactOn = true;
                
                
                this.infoTransitionable.set(0, { duration : 2000, curve: Easing.outCubic});
                this.introPressedTransitionable.set(0, { duration : 2000, curve: Easing.outCubic});
                
               
                logoOn = false;
                
                dotTranslTransitionable.setTranslate([parseInt(window.innerWidth - _getLogoSize() * 2.5, 10), _getDotY.call(this),
                                                      400], { duration : 750, curve: Easing.outQuad});
                
            }
           
        };
        
        this.contactUI.on('click', contactClickCallback.bind(this));
        
        
        this.labUI = new ImageSurface({
            size: [logoSize, logoSize],
            content: 'img/UI/lab.svg'
        });
        
        this.labUIModifier = new Modifier({
            origin: [0.5, 0.5],
            opacity: this.layoutTransitionable,
            transform: Transform.translate(window.innerWidth - logoSize * 4.5, logoY, 400)
        });
        
        this.add(this.labUIModifier).add(this.labUI);
        
        labClickCallback = function () {
            
            if (introLoaded && (!labOn || contactOn)) {
                
                labTranslTransitionable.setTranslate([window.innerWidth, 0, 100 ], { duration : 3000, curve: Easing.outCubic});
                labOn = true;
                
                tileTranslTransitionable.setTranslate([-window.innerWidth - 10, 0, 200 ], { duration : 3000, curve: Easing.outCubic});
                tilesOn = false;
                
                contactTranslTransitionable.setTranslate([-window.innerWidth - 10, 0, 300 ], { duration : 3000, curve: Easing.outCubic});
                contactOn = false;
                
                logoOn = false;
                this.infoTransitionable.set(0, { duration : 1500, curve: Easing.outCubic});
                this.introPressedTransitionable.set(1, { duration : 3000, curve: Easing.inCubic});
                
                dotTranslTransitionable.setTranslate([parseInt(window.innerWidth - _getLogoSize() * 4.5, 10), _getDotY.call(this),
                                                      400], { duration : 750, curve: Easing.outQuad});
                
            }
             
        };
        
        this.labUI.on('click', labClickCallback.bind(this));
        
        this.catalogUI = new ImageSurface({
            size: [logoSize, logoSize],
            content: 'img/UI/tiles.svg'
        });
        
        this.catalogUIModifier = new Modifier({
            origin: [0.5, 0.5],
            opacity: this.layoutTransitionable,
            transform: Transform.translate(window.innerWidth - logoSize * 5.5, logoY, 400)
        });
        
        this.add(this.catalogUIModifier).add(this.catalogUI);
        
        collectionClickCallback = function () {
            
            if (introLoaded && (!tilesOn || contactOn)) {
                
                
                tileTranslTransitionable.setTranslate([window.innerWidth, 0, 100 ], { duration : 3000, curve: Easing.outCubic});
                tilesOn = true;
                
                labTranslTransitionable.setTranslate([-window.innerWidth - 10, 0, 200 ], { duration : 3000, curve: Easing.outCubic});
                labOn = false;
                
                contactTranslTransitionable.setTranslate([-window.innerWidth - 10, 0, 300 ], { duration : 3000, curve: Easing.outCubic});
                contactOn = false;
                
                logoOn = false;
                this.infoTransitionable.set(0, { duration : 1500, curve: Easing.outCubic});
                this.introPressedTransitionable.set(1, { duration : 3000, curve: Easing.inCubic});
                
                dotTranslTransitionable.setTranslate([parseInt(window.innerWidth - _getLogoSize() * 5.5, 10), _getDotY.call(this),
                                                      400], { duration : 750, curve: Easing.outQuad});
            }
           
        };
        
        this.catalogUI.on('click', collectionClickCallback.bind(this));
          
    };
    
    _initializeIntro = function () {
        
        this.introTransitionable.set(1, {duration: 2000, curve: Easing.inExpo});
    
    };
    
    _initializeLayout = function () {
        if (!introLoaded) {
            this.introTransitionable.set(0, {duration: 1500, curve: Easing.outQuad }, function () {
                this.layoutTransitionable.set(1, {duration: 1000, curve: Easing.inQuad }, function () {
                    introLoaded = true;
                });
            }.bind(this));
            this.introPressedTransitionable.set(1, {duration: 1500, curve: Easing.inQuad});
            
        }
    };

    _initializeTileView = function () {
        var measure = Math.min(window.innerWidth, window.innerHeight),
            initX = Math.max(window.innerWidth, window.innerHeight),
            logoSize = parseInt((measure / this.options.gridLines), 10),
            viewWidth = window.innerWidth,
            viewHeight = window.innerHeight * this.options.relFooterHeight;

        this.tileView = new TileView(viewWidth, viewHeight);

        
        tileSizeTransitionable = new Transitionable([viewWidth, viewHeight]);
        tileTranslTransitionable = new TransitionableTransform();
        tileTranslTransitionable.setTranslate([-window.innerWidth - 10, 0, 100 ]);
         
        this.tileModifier = new Modifier({
            size: tileSizeTransitionable,
            origin: [1, 0],
            transform: tileTranslTransitionable
        });
        this.add(this.tileModifier).add(this.tileView);
        
    };
    
    _initializeLabView = function () {
        var measure = Math.min(window.innerWidth, window.innerHeight),
            logoSize = parseInt((measure / this.options.gridLines), 10),
            viewWidth = window.innerWidth,
            viewHeight = window.innerHeight * this.options.relFooterHeight;

        this.labView = new LabView(viewWidth, viewHeight);
        
        labSizeTransitionable = new Transitionable([viewWidth, viewHeight]);
        labTranslTransitionable = new TransitionableTransform();
        labTranslTransitionable.setTranslate([-window.innerWidth  - 10, 0, 200 ]);
        labOpacity = new Transitionable(1);
         
        this.labModifier = new Modifier({
            size: labSizeTransitionable,
            origin: [1, 0],
            opacity: labOpacity,
            transform: labTranslTransitionable
        });
        this.add(this.labModifier).add(this.labView);
        
    };
    
    _initializeContactView = function () {
        var measure = Math.max(window.innerWidth, window.innerHeight),
            logoSize = parseInt((measure / this.options.gridLines), 10),
            viewWidth = window.innerWidth,
            viewHeight = Math.ceil(window.innerHeight * this.options.relFooterHeight),
            w,
            h;
        
        if (viewWidth > window.innerHeight) {
            w = parseInt(viewWidth / 2, 10);
            h = parseInt(viewHeight, 10);
        } else {
            w = parseInt(viewWidth, 10);
            h = parseInt(viewHeight / 2, 10);
        }
        
        
        this.contactView = new ContactView(w, h);
       
        
        contactSizeTransitionable = new Transitionable();
        contactSizeTransitionable.set([w, h]);
        contactTranslTransitionable = new TransitionableTransform();
        contactTranslTransitionable.setTranslate([-window.innerWidth - 10, 0, 300 ]);
      
         
        this.contactModifier = new Modifier({
            size: contactSizeTransitionable,
            origin: [1, 0],
            transform: contactTranslTransitionable
        });
        this.add(this.contactModifier).add(this.contactView);
        
    };
    
   
    
    function Controller() {
        View.apply(this, arguments);
        
       
        _createLayout.call(this);
        _initializeIntro.call(this);
        _initializeTileView.call(this);
        _initializeLabView.call(this);
        _initializeContactView.call(this);
      
    }

    Controller.prototype = Object.create(View.prototype);
    Controller.prototype.constructor = Controller;
    
    Controller.prototype.redraw = function (w, h) {
        var measure = Math.min(w, h),
            logoHeight = parseInt(measure * 0.09 / 1.5, 10),
            logoY = h - (h - (h * this.options.relFooterHeight)) / 2;
        
        this.dot.setSize([logoHeight / 6, logoHeight / 6]);
        
        if (tilesOn) {
            if (contactOn) {
                dotTranslTransitionable.setTranslate([parseInt(w - logoHeight * 2.5, 10), _getDotY.call(this), 400]);
            } else {
                dotTranslTransitionable.setTranslate([parseInt(w - logoHeight * 5.5, 10), _getDotY.call(this), 400]);
            }
        } else if (labOn) {
            if (contactOn) {
                dotTranslTransitionable.setTranslate([parseInt(w - logoHeight * 2.5, 10), _getDotY.call(this), 400]);
            } else {
                dotTranslTransitionable.setTranslate([parseInt(w - logoHeight * 4.5, 10), _getDotY.call(this), 400]);
            }
        } else if (logoOn) {
            dotTranslTransitionable.setTranslate([parseInt(w - logoHeight * 3.5, 10), _getDotY.call(this), 400]);
        } else if (contactOn) {
            dotTranslTransitionable.setTranslate([parseInt(w - logoHeight * 2.5, 10), _getDotY.call(this), 400]);
        } else {
            dotTranslTransitionable.setTranslate([parseInt(w - logoHeight * 2.1, 10), _getDotY.call(this), 400]);
        }

        this.logo.setSize([logoHeight, logoHeight]);
        this.logoModifier.setTransform(
            Transform.translate(parseInt(w - logoHeight * 3.5, 10), logoY, 400)
        );
        
        this.insta.setSize([logoHeight, logoHeight]);
        this.instaModifier.setTransform(
            Transform.translate(parseInt(w - logoHeight * 0.75, 10), logoY, 400)
        );
        
        this.face.setSize([logoHeight, logoHeight]);
        this.faceModifier.setTransform(
            Transform.translate(parseInt(w - logoHeight * 1.5, 10), logoY, 400)
        );
        
        this.intro.setSize([measure / 2, measure / 2]);
        this.introModifier.setTransform(
            Transform.translate(parseInt(w / 2, 10), parseInt(h / 2, 10), 30)
        );
        
        this.introPressed.setSize([measure / 2, measure / 2]);
        this.introPressedModifier.setTransform(
            Transform.translate(parseInt(w / 2, 10), parseInt(h / 2, 10))
        );
        
        this.info.setSize([measure, measure]);
        this.infoModifier.setTransform(
            Transform.translate(parseInt(w / 2, 10), parseInt(h / 2, 10))
        );
        
        this.info.setProperties({'fontSize': measure / 30 + 'px'});
        
        this.contactUI.setSize([logoHeight, logoHeight]);
        this.contactUIModifier.setTransform(
            Transform.translate(parseInt(w - logoHeight * 2.5, 10), logoY, 400)
        );
        
        this.labUI.setSize([logoHeight, logoHeight]);
        this.labUIModifier.setTransform(
            Transform.translate(parseInt(w - logoHeight * 4.5, 10), logoY, 400)
        );
        
        this.catalogUI.setSize([logoHeight, logoHeight]);
        this.catalogUIModifier.setTransform(
            Transform.translate(parseInt(w - logoHeight * 5.5, 10), logoY, 400)
        );
        
        
        if (introLoaded) {
            if (tilesOn) {
                tileTranslTransitionable.setTranslate([w, 0]);
            } else {
                tileTranslTransitionable.setTranslate([-w, 0]);
            }
            
            if (labOn) {
                labTranslTransitionable.setTranslate([w, 0]);
            } else {
                labTranslTransitionable.setTranslate([-w, 0]);
            }
            
            if (contactOn) {
                contactTranslTransitionable.setTranslate([w, 0]);
            } else {
                contactTranslTransitionable.setTranslate([-w, 0]);
            }
            
            tileSizeTransitionable.set([w, h * this.options.relFooterHeight]);
            this.tileView.redraw(w, h * this.options.relFooterHeight);
            
           
            labSizeTransitionable.set([w, h * this.options.relFooterHeight]);
            this.labView.redraw(w, h * this.options.relFooterHeight);
            
            if (w > h) {
                contactSizeTransitionable.set([parseInt(w / 2, 10), Math.ceil(h * this.options.relFooterHeight)]);
                this.contactView.redraw(parseInt(w / 2, 10), Math.ceil(h * this.options.relFooterHeight));
            } else {
                contactSizeTransitionable.set([w, Math.ceil(h / 2)]);
                this.contactView.redraw(w, Math.ceil(h / 2));
            }
        }
        
       
        
        
           
        
    };

    Controller.DEFAULT_OPTIONS = {
        marginUIelm: 20,
        gridLines: 5,
        relFooterHeight: 0.9,
        iconSpacer: 20
    };

    module.exports = Controller;
});
