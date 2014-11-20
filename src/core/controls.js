"use strict";
var Layout;
(function (Layout) {
    Layout.button = function (inheritor) {
        var self = Layout.contentHost(inheritor || this);
        self.type = 'button';

        self.addProperty('isDisabled',{get:true,set:true,'default':false})
        self.addProperty('pointerOverStyle');
        self.addProperty('buttonDownStyle');
        self.addProperty('disabledStyle');

        self.addTriggeredProperty('state', function (oldState) {
            var state = self.isDisabled?'disabled':( (self.isPointerDown & self.isPointerOver) ? 'buttonDown' :
                (self.isPointerOver ? 'pointerOver' : 'default'));
            console.log('State: ' + state);
            self.applyStyle(state);
            return state;
        });

        
        
        var clickActivated = false;
        self.addTriggeredEvent('click', function () {
            if (self.isDisabled) {
                clickActivated = false;
                return false;
            }
            // First state for click
            if (self.isPointerOver && self.isPointerDown) {
                clickActivated = true;
                return false;
            }
            //second state for click
            if (clickActivated && self.isPointerOver && !self.isPointerDown) {
                clickActivated = false;
                return true;
            }
            clickActivated = false;
            return false;
        });

        return self;
    }

    Layout.progress = function (inheritor) {
        var self = Layout.contentHost(inheritor || this);
        self.type = 'progress';

        //self.addProperty('isDisabled', { get: true, set: true, 'default': false })
        self.addProperty('finishedStyle');

        self.addTriggeredProperty('state', function (oldState) {
            var state = self.progress < 1.0 ? 'default' : 'finished';
            //var state = self.isDisabled ? 'disabled' : ((self.isPointerDown & self.isPointerOver) ? 'buttonDown' :
            //    (self.isPointerOver ? 'pointerOver' : 'default'));
            //console.log('State: ' + state);
            self.applyStyle(state);
            return state;
        });
    }


})(Layout || (Layout = {}));