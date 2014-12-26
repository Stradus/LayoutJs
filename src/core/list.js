"use strict";
var Layout;
(function (Layout) {
    Layout.list = function (inheritor) {
        var self = Layout.contentHost(inheritor || this);
        self.type = 'list';

        var updateList = function () {
            self.removeAllVisualChildren();
            var items = Layout.peekPropertyValue(self, 'items')||[];
            var itemLayout = Layout.peekPropertyValue(self, 'itemLayout');
            var itemsOrganizer = Layout.peekPropertyValue(self, 'itemsOrganizer');
           
            var parent = Layout.create(itemsOrganizer);
            self.addChild(parent);
            for (var i = 0; i < items.length; i++) {
                var child = Layout.create(itemLayout);                
                parent.addChild(child);
                child.data = items[i];
            }
        };

        self.addProperty('itemsOrganizer', { 'default': { type: 'stack', orientation: 'vertical' }, changed: updateList });
        self.addProperty('itemLayout', { 'default': { type: 'text', bindText: '' }, changed: updateList });
        self.addProperty('items', { 'default': [], changed : updateList });


        //self.addProperty('isDisabled', { get: true, set: true, 'default': false })
        //self.addProperty('pointerOverStyle');
        //self.addProperty('buttonDownStyle');
        //self.addProperty('disabledStyle');

        //self.addAutoProperty('state', function (oldState) {
        //    var state = self.isDisabled ? 'disabled' : ((self.isPointerDown & self.isPointerOver) ? 'buttonDown' :
        //        (self.isPointerOver ? 'pointerOver' : 'default'));
        //    //console.log('State: ' + state);
        //    self.applyStyle(state);
        //    return state;
        //});

        //var clickActivated = false;
        //var isClickedProperty = self.addAutoProperty('isClicked', function () {
        //    if (self.isDisabled) {
        //        clickActivated = false;
        //        return false;
        //    }
        //    // First state for click
        //    if (self.isPointerOver && self.isPointerDown) {
        //        clickActivated = true;
        //        return false;
        //    }
        //    //second state for click
        //    if (clickActivated && self.isPointerOver && !self.isPointerDown) {
        //        clickActivated = false;
        //        return true;
        //    }
        //    clickActivated = false;
        //    return false;
        //});

        //self.addAutoEvent('click', isClickedProperty);

        return self;
    }
})(Layout || (Layout = {}));