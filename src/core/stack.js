"use strict";
var Layout;
(function (Layout) {
    Layout.stack = function (inheritor) {
        var self = Layout.uiElement(inheritor || this);
        self.type = 'stackPanel';
        self.addProperty('orientation', {
            get: true, set: true, 'default': 'vertical', needsMeasure: true,
            validValues: ['vertical', 'horizontal']
        });
        self.addProperty('collapseInBetweenMargins', { get: true, set: true, 'default': true, needsMeasure: true });
        self.addProperty('collapseInBetweenBorders', { get: true, set: true, 'default': true, needsMeasure: true });
        self.addProperty('collapseInBetweenCornerRadius', { get: true, set: true, 'default': true, needsMeasure: true });
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

            var collapseMargins = self.collapseInBetweenMargins;
            var collapseBorders = self.collapseInBetweenBorders;
            var firstMargin = undefined;
            var firstBorder = undefined;
            for (var i = 0; i < self.protected.activeChildren.length; i++) {
                var child = self.protected.activeChildren[i];
                child.measure(childSize);
                if (self.orientation === 'vertical') {
                    desiredSize.width = Math.max(desiredSize.width, child.desiredSize.width);
                    desiredSize.height += child.desiredSize.height;
                    if (collapseMargins && firstMargin !== undefined) {
                        desiredSize.height -= Math.min(child.margin.top, firstMargin);
                    }
                    if(collapseBorders && firstMargin !== undefined &&
                        firstMargin === 0 && child.margin.top === 0) {
                        desiredSize.height -= Math.min(child.border.top, firstBorder);
                    }
                    firstMargin = child.margin.bottom;
                    firstBorder = child.border.bottom;
                } else {
                    desiredSize.width += child.desiredSize.width;
                    desiredSize.height = Math.max(desiredSize.height, child.desiredSize.height);
                    if (collapseMargins && firstMargin !== undefined) {
                        desiredSize.width -= Math.min(child.margin.right, firstMargin);
                    }
                    if (collapseBorders && firstMargin !== undefined &&
                        firstMargin === 0 && child.margin.right === 0) {
                        desiredSize.width -= Math.min(child.border.right, firstBorder);
                    }
                    firstMargin = child.margin.left;
                    firstBorder = child.border.left;
                }
            }
            desiredSize.width += self.padding.left + self.padding.right;
            desiredSize.height += self.padding.top + self.padding.bottom;
            return desiredSize;// To use with scrolling etc. { width: Math.min(desiredSize.width, availableSize.width), height: Math.min(desiredSize.height, availableSize.height) };
        };

        self.arrangeSelf = function (finalSize) {
            var offset = 0;
            var collapseMargins = self.collapseInBetweenMargins;
            var collapseBorders = self.collapseInBetweenBorders;
            var collapseRadius = self.collapseInBetweenCornerRadius;
            var firstMargin = undefined;
            var firstBorder = undefined;
            var firstRadius1 = undefined;
            var firstRadius2 = undefined;
            for (var i = 0; i < self.protected.activeChildren.length; i++) {
                var child = self.protected.activeChildren[i];
                if (self.orientation === 'vertical') {
                    if (collapseMargins && firstMargin !== undefined) {
                        offset -= Math.min(child.margin.top, firstMargin);
                    }
                    if (collapseBorders && firstMargin !== undefined &&
                       firstMargin === 0 && child.margin.top === 0) {
                        offset -= Math.min(child.border.top, firstBorder);
                    }                    
                    firstMargin = child.margin.bottom;
                    firstBorder = child.border.bottom;
                    child.arrange({
                        x: self.padding.left,
                        y: offset + self.padding.top,
                        width: Math.max(finalSize.width - self.padding.left - self.padding.right, child.desiredSize.width),
                        height: child.desiredSize.height
                    });
                    //if (collapseRadius && firstRadius1 != undefined) {
                    //    if (firstRadius1p === child.cornerRadius.topleft ||
                    //        firstRadius2p === child.cornerRadius.topright) {
                    //        child.renderCornerRadius = 
                    //    }
                    //}
                    firstRadius1 = child.cornerRadius.bottomleft;
                    firstRadius1p = child.actualSize.x;
                    firstRadius2 = child.cornerRadius.bottomright;
                    firstRadius2p = child.actualSize.x + child.actualSize.width;
                    offset += child.desiredSize.height;
                } else {
                    if (collapseMargins && firstMargin !== undefined) {
                        offset -= Math.min(child.margin.right, firstMargin);
                    }
                    if (collapseBorders && firstMargin !== undefined &&
                        firstMargin === 0 && child.margin.right === 0) {
                        offset -= Math.min(child.border.right, firstBorder);
                    }
                    firstMargin = child.margin.left;
                    firstBorder = child.border.left;
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