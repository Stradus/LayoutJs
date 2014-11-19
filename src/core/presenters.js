"use strict";
var Layout;
(function (Layout) {    

    Layout.contentHost = function (inheritor) {
        var self = Layout.uiElement(inheritor || this, 1);
        self.type = 'contentHost';
        self.addCssProperty('background', false, undefined);
        self.createHtml = function () {
            if (!self.html) {
                self.html = document.createElement('div');
                return true
            }
            return false;
        };
        self.measureSelf = function (availableSize) {
            if (self.child) {
                self.child.measure(self.protected.subtractPadding(availableSize));
                return self.protected.addPadding(self.child.desiredSize);
            } else {
                return { width: self.padding.width, height: self.padding.height };
            }
        }
        self.arrangeSelf = function (finalSize) {
            if (self.child) {
                var childSize = self.protected.subtractPadding(finalSize);
                childSize.x = self.padding.left;
                childSize.y = self.padding.right;
                self.child.arrange(childSize);
                //var selfSize = self.protected.addBorder(self.padding, self.child.actualSize);                
                return finalSize;
            } else {
                return { x: 0, y: 0, width: Math.min(self.padding.width, finalSize.width), height: Math.min(self.padding.height, finalSize.height) };
            }
        }
        return self;
    }
})(Layout || (Layout = {}));