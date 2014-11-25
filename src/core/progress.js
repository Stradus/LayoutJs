"use strict";
var Layout;
(function (Layout) {   
    Layout.progress = function (inheritor) {
        var self = Layout.contentHost(inheritor || this);
        self.type = 'progress';

        //self.addProperty('isDisabled', { get: true, set: true, 'default': false })
        self.addProperty('finishedStyle');
        self.addProperty('progress', false, 0.0);

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