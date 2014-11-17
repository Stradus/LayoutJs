"use strict";
var Layout;
(function (Layout) {
    Layout.stack = function (inheritor) {
        var self = Layout.uiElement(inheritor || this);
        self.type = 'stackPanel';
        self.addProperty('orientation', { get: true, set: true, 'default': 'vertical', needsMeasure: true });
        self.addCssProperty('background', false, undefined);
        self.measureSelf = function (availableSize) {
            var childSize = { width: 0, height: 0 };
            switch (self.orientation) {
                case 'horizontal':
                    childSize.width = Infinity;
                    childSize.height = availableSize.height - self.padding.top - self.padding.bottom;
                    break;
                case 'vertical':
                    childSize.width = availableSize.width - self.padding.left - self.padding.right;
                    childSize.height = Infinity;
                    break;
                default:
                    throw 'Unsupported orientation: ' + self.orientation;
                    break;
            }
            var desiredSize = { width: 0, height: 0 };


            for (var i = 0; i < self.children.length; i++) {
                var child = self.children[i];
                child.measure(childSize);
                if (self.orientation === 'vertical') {
                    desiredSize.width = Math.max(desiredSize.width, child.desiredSize.width);
                    desiredSize.height += child.desiredSize.height;
                } else {
                    desiredSize.width += child.desiredSize.width;
                    desiredSize.height = Math.max(desiredSize.height, child.desiredSize.height);
                }
            }
            desiredSize.width += self.padding.left + self.padding.right;
            desiredSize.height += self.padding.top + self.padding.bottom;
            return desiredSize;// To use with scrolling etc. { width: Math.min(desiredSize.width, availableSize.width), height: Math.min(desiredSize.height, availableSize.height) };
        };

        self.arrangeSelf = function (finalSize) {
            var offset = 0;
            for (var i = 0; i < self.children.length; i++) {
                var child = self.children[i];
                if (self.orientation === 'vertical') {
                    child.arrange({
                        x: self.padding.left,
                        y: offset + self.padding.top,
                        width: Math.max(finalSize.width - self.padding.left - self.padding.right, child.desiredSize.width),
                        height: child.desiredSize.height
                    });
                    offset += child.desiredSize.height;
                } else {
                    child.arrange({
                        x: offset + self.padding.left,
                        y: self.padding.top,
                        width: child.desiredSize.width,
                        height: Math.max(finalSize.height - self.padding.top - self.padding.bottom, child.desiredSize.height)
                    });
                    offset += child.desiredSize.width;
                }
            }
            return finalSize;
        };
        self.createHtml = function () {
            if (!self.html) {
                self.html = document.createElement('div');
                return true;
            }
        };

        return self;
    };
})(Layout || (Layout = {}));