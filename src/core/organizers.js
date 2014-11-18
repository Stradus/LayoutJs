"use strict";
var Layout;
(function (Layout) {
    Layout.stack = function (inheritor) {
        var self = Layout.uiElement(inheritor || this);
        self.type = 'stackPanel';
        self.addProperty('orientation', { get: true, set: true, 'default': 'vertical', needsMeasure: true });
        self.addProperty('collapseInBetweenMargins', { get: true, set: true, 'default':true, needsMeasure:true });
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

            var collapse = self.collapseInBetweenMargins;
            var firstMargin = undefined;
            for (var i = 0; i < self.children.length; i++) {
                var child = self.children[i];                
                //var collapseMargins = self.collapseInBetweenMargins && i < self.children.length - 1;
                child.measure(childSize);
                if (self.orientation === 'vertical') {
                    desiredSize.width = Math.max(desiredSize.width, child.desiredSize.width);
                    desiredSize.height += child.desiredSize.height;
                    if (collapse && child.display !== 'collapsed') {
                        if (firstMargin !== undefined) {
                            desiredSize.height -= Math.max(child.margin.top, firstMargin);
                        }
                        firstMargin = child.margin.bottom;
                    }
                  //  if (collapseMargins) {
                    //    desiredSize.height -= Math.min(child.margin.bottom, self.children[i + 1].margin.top);
                    //}
                } else {
                    desiredSize.width += child.desiredSize.width;
                    desiredSize.height = Math.max(desiredSize.height, child.desiredSize.height);
                    if (collapse && child.display !== 'collapsed') {
                        if (firstMargin !== undefined) {
                            desiredSize.width -= Math.max(child.margin.right, firstMargin);
                        }
                        firstMargin = child.margin.left;
                    }
                    //if (collapseMargins) {
                    //    desiredSize.width -= Math.min(child.margin.right, self.children[i + 1].margin.left);
                    //}
                }
            }
            desiredSize.width += self.padding.left + self.padding.right;
            desiredSize.height += self.padding.top + self.padding.bottom;
            return desiredSize;// To use with scrolling etc. { width: Math.min(desiredSize.width, availableSize.width), height: Math.min(desiredSize.height, availableSize.height) };
        };

        self.arrangeSelf = function (finalSize) {
            var offset = 0;
            var collapse = self.collapseInBetweenMargins;
            var firstMargin = undefined;
            for (var i = 0; i < self.children.length; i++) {
                var child = self.children[i];
                if (self.orientation === 'vertical') {
                    if (collapse && child.display !== 'collapsed') {
                        if (firstMargin !== undefined) {
                            offset -= Math.max(child.margin.top, firstMargin);
                        }
                        firstMargin = child.margin.bottom;
                    }
                    child.arrange({
                        x: self.padding.left,
                        y: offset + self.padding.top,
                        width: Math.max(finalSize.width - self.padding.left - self.padding.right, child.desiredSize.width),
                        height: child.desiredSize.height
                    });
                    
                    offset += child.desiredSize.height;
                } else {
                    if (collapse && child.display !== 'collapsed') {
                        if (firstMargin !== undefined) {
                            offset -= Math.max(child.margin.right, firstMargin);
                        }
                        firstMargin = child.margin.left;
                    }
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