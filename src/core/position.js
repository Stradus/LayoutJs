"use strict";
var Layout;
(function (Layout) {
    Layout.position = function (inheritor) {
        var self = Layout.uiElement(inheritor || this, 2);
        self.type = 'position';

        self.measureSelf = function (availableSize) {
            var desiredSize = { width: 0, height: 0 };
            for (var i = 0; i < self.protected.activeChildren.length; i++) {
                var child = self.protected.activeChildren[i];
                var childSize = self.protected.subtractPadding(availableSize);
                child.measure(childSize);
                desiredSize.width = Math.max(desiredSize.width,
                    child.desiredSize.width + self.padding.totalWidth + (child.x || 0));
                desiredSize.height = Math.max(desiredSize.height,
                    child.desiredSize.height + self.padding.totalHeight + (child.y || 0));
            }
            desiredSize.width += self.padding.left + self.padding.right;
            desiredSize.height += self.padding.top + self.padding.bottom;
            return desiredSize;// To use with scrolling etc. { width: Math.min(desiredSize.width, availableSize.width), height: Math.min(desiredSize.height, availableSize.height) };
        };

        self.arrangeSelf = function (finalSize) {

            for (var i = 0; i < self.protected.activeChildren.length; i++) {
                var child = self.protected.activeChildren[i];
                child.actualCornerRadius = undefined;
                child.arrange({
                    x: self.padding.left + (child.x || 0),
                    y: self.padding.top + (child.y || 0),
                    width: child.desiredSize.width,
                    height: child.desiredSize.height
                });
            }

            return finalSize;
        };
        self.createHtml = function () {
            if (!self.html) {
                self.html = document.createElement('div');
                return true;
            }
        };

        self.addParentSpecificProperties = function (child) {
            child.addProperty('x', { needsMeasure: true, 'default': 0, filter: function (v) { return v || 0 } });
            child.addProperty('y', { needsMeasure: true, 'default': 0, filter: function (v) { return v || 0 } });
        };

        return self;
    };
})(Layout || (Layout = {}));