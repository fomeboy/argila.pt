/*global define, FileReader, XDomainRequest*/
/*jslint nomen:true*/

define(function (require, exports, module) {
    "use strict";
    
    // VAR init
    
    var View                    = require('famous/core/View'),
        ImageSurface            = require('famous/surfaces/ImageSurface'),
        InputSurface            = require('famous/surfaces/InputSurface'),
        TextAreaSurface         = require('famous/surfaces/TextareaSurface'),
        SubmitSurface           = require('famous/surfaces/SubmitInputSurface'),
        Surface                 = require('famous/core/Surface'),
        Transform               = require('famous/core/Transform'),
        StateModifier           = require('famous/modifiers/StateModifier'),
        Transitionable          = require('famous/transitions/Transitionable'),
        TransitionableTransform = require('famous/transitions/TransitionableTransform'),
        Modifier                = require('famous/core/Modifier'),
        GenericSync             = require('famous/inputs/GenericSync'),
        MouseSync               = require('famous/inputs/MouseSync'),
        TouchSync               = require('famous/inputs/TouchSync'),
        
        lang = 'PT',
        sync,
        collectionInfo,
        collectionUsageMsg = 'Fill details...',
        collectionErrorMsg = 'Error loading file / Invalid format',
        collectionInvalidEmailMsg = 'Invalid email address',
        nameInputMsg = ' Type your name...',
        emailInputMsg = ' Type your email address...',
        msgInputMsg = ' Type your message...',
        msgSent = 'Message received. Thank you!',
        msgError = 'Error sending message. Please send email to info@argila.pt',
        msgSend = 'Send Message',
        msgSending = 'Sending...',
        collectionInfoAlign = 'center',
        
        checkData,
        xhr,
        canSend = true,
       
        _redrawLayout,
        _createbackground,
        _createInputs,
        _createColectionInfo;
    
    
   
    //Input control
    
    GenericSync.register({'mouse': MouseSync, 'touch': TouchSync});
    
    sync = new GenericSync(
        ['mouse', 'touch'],
        {direction: GenericSync.DIRECTION_X}
    );
    
    //Utils
    
    checkData = function () {
        var name = this.nameInput.getValue().trim(),
            email = this.emailInput.getValue().trim(),
            msg = this.msgInput.getValue().trim();
            
        if (name !== '' && msg !== '' && email !== '') {
            if (this.emailInput.valid) {
                return msgSend;
            } else {
                return collectionInvalidEmailMsg;
            }
            
        } else {
            return collectionUsageMsg;
        }
    
    };
    
    xhr = function (url, method, data, callback, errback) {
        var req;

        if (XMLHttpRequest) {
            req = new XMLHttpRequest();
   
            req.open(method, url, true);
            req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            req.onerror = errback;
            req.onreadystatechange = function () {
                if (req.readyState === 4) {
                    if (req.status >= 200 && req.status < 400) {
                        if (req.responseText === 'OK') {
                            callback();
                        } else {
                            errback();
                        }
                    
                    } else {
                        errback();
                    }
                }
            };
            
            req.send(data);
           
        } else if (XDomainRequest) {
            req = new XDomainRequest();
            req.open(method, url);
            req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            req.onerror = errback;
            req.onload = function () {
                if (req.responseText === 'OK') {
                    callback();
                } else {
                    errback();
                }
            };
            req.send(data);
        } else {
            errback();
        }
    };
    
    
    // "Private" methods
    
    _createbackground = function () {
        
        this.background = new Surface({
            properties: {
                backgroundColor: 'rgb(190, 183, 170)'
            }
        });
        
        this.backTransf = new TransitionableTransform();
        this.backTransf.setTranslate([0, 0, 500]);
       
        this.backMod = new Modifier({
            origin: [0, 0],
            transform: this.backTransf,
            opacity: 0.9
        });
        
        this.add(this.backMod).add(this.background);
    };
    
    _createInputs = function (w, h) {
        
        var width = parseInt(w / 12 * 10, 10),
            height = parseInt(h / 14, 10),
            submitMsgHandler;
       
        // NAME INPUT
        
        this.nameInput = new InputSurface({
            name: 'nameInput',
            placeholder: nameInputMsg,
            value: '',
            type: 'text',
            tabIndex: 1,
            properties: {
                color: '#4e4d4d',
                backgroundColor: 'rgb(220, 208, 197)',
                fontFamily: 'simplifica_local',
                fontSize: 24 + 'px',
                outlineColor: 'black',
                outlineWidth: '1px',
                borderStyle: 'none'
            }
        });
        
        this.nameInputTranslTransform = new TransitionableTransform();
        this.nameInputTranslTransform.setTranslate([parseInt(w / 2, 10), parseInt(h / 8, 10), 600]);
        
        this.nameInputSizeTransitionable = new Transitionable();
        this.nameInputSizeTransitionable.set([width, height]);
        
        this.nameInputMod = new Modifier({
            origin: [0.5, 0.5],
            size: this.nameInputSizeTransitionable,
            transform: this.nameInputTranslTransform,
            opacity: 0.9
        });
        
        this.add(this.nameInputMod).add(this.nameInput);
        
        this.nameInput.on('blur', function () {
            this.submitInput.setValue(checkData.call(this));
        }.bind(this));
        
        //EMAIL INPUT
        
        this.emailInput = new InputSurface({
            name: 'emailInput',
            placeholder: emailInputMsg,
            value: '',
            type: 'text',
            tabIndex: 2,
            properties: {
                color: '#4e4d4d',
                backgroundColor: 'rgb(220, 208, 197)',
                fontFamily: 'simplifica_local',
                fontSize: 24 + 'px',
                outlineColor: 'black',
                outlineWidth: '1px',
                borderStyle: 'none'
            }
        });
        
        this.emailInput.valid = false;
        
        this.emailInputTranslTransform = new TransitionableTransform();
        this.emailInputTranslTransform.setTranslate([parseInt(w / 2, 10), parseInt(h / 8 * 2, 10), 600]);
        
        this.emailInputSizeTransitionable = new Transitionable();
        this.emailInputSizeTransitionable.set([width, height]);
        
        this.emailInputMod = new Modifier({
            origin: [0.5, 0.5],
            size: this.emailInputSizeTransitionable,
            transform: this.emailInputTranslTransform,
            opacity: 0.9
        });
        
        this.add(this.emailInputMod).add(this.emailInput);
        
        this.emailInput.on('blur', function () {

            var re = /\S+@\S+\.\S+/,
                email = this.emailInput.getValue().trim(),
                res;
            
            res = re.test(email);
            
            if (res) {
                
                this.emailInput.valid = true;
                this.submitInput.setValue(checkData.call(this));
                                
            } else {
                this.emailInput.valid = false;
                
                if (email === '') {
                    this.submitInput.setValue(collectionUsageMsg);
                } else {
                    this.submitInput.setValue(checkData.call(this));
                }
    
                
            }
    
        }.bind(this));
  
        //MESSAGE INPUT
        
        this.msgInput = new TextAreaSurface({
            name: 'msgInput',
            placeholder: msgInputMsg,
            value: '',
            tabIndex: 3,
            properties: {
                color: '#4e4d4d',
                backgroundColor: 'rgb(220, 208, 197)',
                fontFamily: 'simplifica_local',
                fontSize: 24 + 'px',
                outlineColor: 'black',
                outlineWidth: '1px',
                borderStyle: 'none'
            }
        });
        
        this.msgInputTranslTransform = new TransitionableTransform();
        this.msgInputTranslTransform.setTranslate([parseInt(w / 2, 10), parseInt(h / 2, 10), 600]);
        
        this.msgInputSizeTransitionable = new Transitionable();
        this.msgInputSizeTransitionable.set([width, h / 2]);
        
        this.msgInputMod = new Modifier({
            origin: [0.5, 0.5],
            size: this.msgInputSizeTransitionable,
            transform: this.msgInputTranslTransform,
            opacity: 0.9
        });
        
        this.add(this.msgInputMod).add(this.msgInput);
        
        this.msgInput.on('blur', function () {
            this.submitInput.setValue(checkData.call(this));
        }.bind(this));
        
        // SUBMIT
        
        this.submitInput = new SubmitSurface({
            name: 'sumbitInput',
            value: '',
            type: 'submit',
            tabIndex: 4,
            properties: {
                color: '#4e4d4d',
                backgroundColor: 'rgb(190, 183, 170)',
                outline: 'none',
                fontFamily: 'simplifica_local',
                fontSize: 24 + 'px',
                borderStyle: 'solid',
                borderRadius: '16px',
                borderWidth: '1px',
                borderColor: 'rgb(76, 76, 76)'
            }
        });


        this.submitInputTranslTransform = new TransitionableTransform();
        this.submitInputTranslTransform.setTranslate([parseInt(w / 2, 10), parseInt(h / 12 * 10, 10), 600]);

        this.submitInputSizeTransitionable = new Transitionable();
        this.submitInputSizeTransitionable.set([width, parseInt(h / 12, 10)]);

        this.submitInputMod = new Modifier({
            origin: [0.5, 0.5],
            size: this.submitInputSizeTransitionable,
            transform: this.submitInputTranslTransform,
            opacity: 1
        });
        
        this.add(this.submitInputMod).add(this.submitInput);
          
        this.submitInput.on('click', function () {
            var client = new XMLHttpRequest(),
                name = this.nameInput.getValue().trim(),
                email = this.emailInput.getValue().trim(),
                msg = this.msgInput.getValue().trim(),
                sendMsg;
        
          
            if (canSend) {
                if (name !== '' && msg !== '' && email !== '' && this.emailInput.valid) {

                    sendMsg = 'name' + '=' + name + '&' + 'email' + '=' + email + '&' + 'msg' + '=' + msg;

                    this.submitInput.setValue(msgSending);
                    canSend = false;
                    
                    xhr('insert_contact', 'POST', sendMsg,
                        function () {
                            this.nameInput.setValue('');
                            this.emailInput.setValue('');
                            this.msgInput.setValue(null);
                            this.submitInput.setValue(msgSent);
                            canSend = true;
                        }.bind(this),
                        function () {
                            this.submitInput.setValue(msgError);
                            canSend = true;
                        }.bind(this));
                } else {
                    this.submitInput.setValue(checkData.call(this));
                }
            }
        }.bind(this));
             
    };
    

    
    _redrawLayout = function (w, h) {
        var innerH = window.innerHeight,
            fSize = (innerH - (innerH * 0.9)) / 2,
            width = parseInt(Math.min(w, h) / 12 * 10, 10),
            height = parseInt(h / 12, 10);
        
        if (window.innerWidth > window.innerHeight) {
            this.nameInputTranslTransform.setTranslate([parseInt(w / 2, 10), parseInt(h / 12, 10), 600]);
            this.nameInputSizeTransitionable.set([parseInt(w / 12 * 10, 10), parseInt(h / 14, 10)]);
            
            this.emailInputTranslTransform.setTranslate([parseInt(w / 2, 10), parseInt(h / 12 * 2, 10), 600]);
            this.emailInputSizeTransitionable.set([parseInt(w / 12 * 10, 10), parseInt(h / 14, 10)]);
            
            this.msgInputTranslTransform.setTranslate([parseInt(w / 2, 10), parseInt(h / 2, 10), 600]);
            this.msgInputSizeTransitionable.set([parseInt(w / 12 * 10, 10), parseInt(h / 2, 10)]);
            
            this.submitInputTranslTransform.setTranslate([parseInt(w / 2, 10), parseInt(h / 12 * 10, 10), 600]);
            this.submitInputSizeTransitionable.set([parseInt(w / 12 * 10, 10), parseInt(h / 12, 10)]);
            
        } else {
            
            this.nameInputTranslTransform.setTranslate([parseInt(w / 2, 10), parseInt(h / 12, 10), 600]);
            this.nameInputSizeTransitionable.set([parseInt(w / 12 * 10, 10), parseInt(h / 14, 10)]);
            
            this.emailInputTranslTransform.setTranslate([parseInt(w / 2, 10), parseInt(h / 12 * 2, 10), 600]);
            this.emailInputSizeTransitionable.set([parseInt(w / 12 * 10, 10), parseInt(h / 14, 10)]);
            
            this.msgInputTranslTransform.setTranslate([parseInt(w / 2, 10), parseInt(h / 2, 10), 600]);
            this.msgInputSizeTransitionable.set([parseInt(w / 12 * 10, 10), parseInt(h / 2, 10)]);
            
            this.submitInputTranslTransform.setTranslate([parseInt(w / 2, 10), parseInt(h / 12 * 10, 10), 600]);
            this.submitInputSizeTransitionable.set([parseInt(w / 12 * 10, 10), parseInt(h / 12, 10)]);
        }
        
        
        
        
        this.nameInput.setProperties({'fontSize': Math.min(w, h) / 22 + 'px'});
        this.emailInput.setProperties({'fontSize': Math.min(w, h) / 22 + 'px'});
        this.msgInput.setProperties({'fontSize': Math.min(w, h) / 22 + 'px'});
        this.submitInput.setProperties({'fontSize': Math.min(w, h) / 22 + 'px'});
        
    };
    
   
    
    // Constructor
    
    function ContactView(w, h) {
        
        View.apply(this, arguments);
        
        _createbackground.call(this);
        _createInputs.call(this, w, h);
        this.submitInput.setValue(collectionUsageMsg);
        _redrawLayout.call(this, w, h);
        
    }

    ContactView.prototype = Object.create(View.prototype);
    ContactView.prototype.constructor = ContactView;
    ContactView.prototype.redraw = function (w, h) {
        _redrawLayout.call(this, w, h);
    };
    
    //Options
    
    ContactView.DEFAULT_OPTIONS = {
    };

    //Exports
    
    module.exports = ContactView;
});
