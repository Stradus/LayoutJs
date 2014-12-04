"use strict";
var Layout;
(function (Layout) {
    Layout.split = function (inheritor) {
        var self = Layout.uiElement(inheritor || this, 2);
        self.type = 'split';
        self.addProperty('orientation', {
            get: true, set: true, 'default': 'vertical', needsMeasure: true,
            validValues: ['vertical', 'horizontal']
        });
        self.addProperty('splitRatio', { get: true, set: true, needsMeasure: true, 'default': 0.5 });
        self.addProperty('collapseInBetweenMargins', { get: true, set: true, 'default': true, needsMeasure: true });
        self.addProperty('collapseInBetweenBorders', { get: true, set: true, 'default': true, needsMeasure: true });
        self.addProperty('collapseInBetweenCornerRadius', { get: true, set: true, 'default': true, needsMeasure: true });
        self.addCssProperty('background', false, undefined);

        self.measureSelf = function (availableSize) {
            //var availableChildSize = self.protected.subtractPadding(availableSize);
            //switch (self.orientation) {
            //    case 'horizontal':
            //        childSize.width = Infinity;
            //        childSize.height = availableSize.height - self.padding.top - self.padding.bottom;
            //        break;
            //    case 'vertical':
            //        childSize.width = availableSize.width - self.padding.left - self.padding.right;
            //        childSize.height = Infinity;
            //        break;
            //    default:
            //        throw 'Unsupported orientation: ' + self.orientation;
            //        break;
            //}
            var desiredSize = { width: 0, height: 0 };

            var collapseMargins = self.collapseInBetweenMargins;
            var collapseBorders = self.collapseInBetweenBorders;
            var firstMargin = undefined;
            var firstBorder = undefined;
            for (var i = 0; i < self.protected.activeChildren.length; i++) {
                var child = self.protected.activeChildren[i];
                var childSize = self.protected.subtractPadding(availableSize);
                if (self.orientation === 'vertical') {
                    childSize.height = i === 0 ? childSize.height * self.splitRatio : childSize.height * (1 - self.splitRatio);
                } else {
                    childSize.width = i === 0 ? childSize.width * self.splitRatio : childSize.width * (1 - self.splitRatio);
                }
                child.measure(childSize);
                if (self.orientation === 'vertical') {
                    desiredSize.width = Math.max(desiredSize.width, child.desiredSize.width);
                    desiredSize.height += child.desiredSize.height;
                    if (collapseMargins && firstMargin !== undefined) {
                        desiredSize.height -= Math.min(child.margin.top, firstMargin);
                    }
                    if (collapseBorders && firstMargin !== undefined &&
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
        var getActualCornerRadius = function (child) {
            child.actualCornerRadius = child.actualCornerRadius || {
                topLeft: child.cornerRadius.topLeft,
                topRight: child.cornerRadius.topRight,
                bottomRight: child.cornerRadius.bottomRight,
                bottomLeft: child.cornerRadius.bottomLeft
            };
            return child.actualCornerRadius;
        }
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
                child.actualCornerRadius = undefined;
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
                        height: i === 0 ? finalSize.height * self.splitRatio : finalSize.height * (1 - self.splitRatio)//child.desiredSize.height
                    });
                    if (collapseRadius && prevChild) {
                        if (prevChild.margin.bottom === 0 && child.margin.top === 0) {
                            if (prevChild.actualSize.x === child.actualSize.x ||
                                prevChild.actualSize.x + prevChild.actualSize.width === child.actualSize.x + child.actualSize.width) {
                                var prevRad = getActualCornerRadius(prevChild);
                                var rad = getActualCornerRadius(child);
                                if (prevChild.actualSize.x === child.actualSize.x) {
                                    prevRad.bottomLeft = 0;
                                    rad.topLeft = 0;
                                }
                                if (prevChild.actualSize.x + prevChild.actualSize.width === child.actualSize.x + child.actualSize.width) {
                                    prevRad.bottomRight = 0;
                                    rad.topRight = 0;
                                }
                            }
                        }
                    }
                    var prevChild = child;
                    offset += child.actualSize.height;
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
                        width: i === 0 ? finalSize.width * self.splitRatio : finalSize.width * (1 - self.splitRatio), //child.desiredSize.width,
                        height: Math.max(finalSize.height - self.padding.top - self.padding.bottom, child.desiredSize.height)
                    });
                    if (collapseRadius && prevChild) {
                        if (prevChild.margin.left === 0 && child.margin.right === 0) {
                            if (prevChild.actualSize.y === child.actualSize.y ||
                                prevChild.actualSize.y + prevChild.actualSize.height === child.actualSize.y + child.actualSize.height) {
                                var prevRad = getActualCornerRadius(prevChild);
                                var rad = getActualCornerRadius(child);
                                if (prevChild.actualSize.y === child.actualSize.y) {
                                    prevRad.topRight = 0;
                                    rad.topLeft = 0;
                                }
                                if (prevChild.actualSize.y + prevChild.actualSize.height === child.actualSize.y + child.actualSize.height) {
                                    prevRad.bottomRight = 0;
                                    rad.bottomLeft = 0;
                                }
                            }
                        }
                    }
                    var prevChild = child;
                    prevChild = child;
                    offset += child.actualSize.width;
                }
            }
            return finalSize;
        };
        self.createHtml = function () {
            if (!self.html) {
                self.html = document.createElement('div');
                self.htmlHost = self.html;
                return true;
            }
        };

        return self;
    };
})(Layout || (Layout = {}));