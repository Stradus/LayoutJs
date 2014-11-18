"use strict";
var Layout;
(function (Layout) {
    Layout.button = function (inheritor) {
        var self = Layout.contentHost(inheritor || this);
        self.type = 'button';

        self.addTriggeredProperty('state', function (oldState) {
            var state = (self.isPointerDown & self.isPointerOver) ? 'buttonDown' :
                (self.isPointerOver ? 'pointerOver' : 'default');
            console.log('State: ' + state);
            self.applyStyle(state);
            return state;
        });

        //self.addTriggeredProperty('test', function (oldState) {
        //    console.log("Pointer over: " + self.isPointerOver);
        //    return self.isPointerOver;
        //});

        self.addProperty('pointerOverStyle', function (style) {
            console.log('Style set');
            return style;
        });

        self.addProperty('buttonDownStyle', function (style) {
            console.log('Style set');
            return style;
        });

        


        var clickActivated = false;
        self.addTriggeredEvent('click', function () {
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

})(Layout || (Layout = {}));