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
                self.htmlHost = self.html;
                return true
            }
            return false;
        };
        self.measureSelf = function (availableSize) {
            if (self.child) {
                self.child.measure(self.protected.subtractPadding(availableSize));
                return self.protected.addPadding(self.child.desiredSize);
            } else {
                return { width: self.padding.totalWidth, height: self.padding.totalHeight };
            }
        }
        self.arrangeSelf = function (finalSize) {
            if (self.child) {
                var childSize = self.protected.subtractPadding(finalSize);
                childSize.x = self.padding.left;
                childSize.y = self.padding.top;
                self.child.arrange(childSize);
                //var selfSize = self.protected.addBorder(self.padding, self.child.actualSize);                
                return finalSize;
            } else {
                return finalSize;// { x: 0, y: 0, width: Math.min(self.padding.totalWidth, finalSize.width), height: Math.min(self.padding.totalHeight, finalSize.height) };
            }
        }
        return self;
    }
})(Layout || (Layout = {}));