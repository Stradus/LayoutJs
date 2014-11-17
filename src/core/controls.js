"use strict";
var Layout;
(function (Layout) {
    Layout.button = function (inheritor) {
        var self = Layout.contentHost(inheritor || this);
        self.type = 'button';
        
        self.addTriggeredProperty('state', function () {
            var state = self.isPointerDown?'pointerDown':(self.isPointerOver ? 'pointerOver' : 'default');
            console.log('State: ' + state);
            return state;
        })

        return self;
    }

})(Layout || (Layout = {}));