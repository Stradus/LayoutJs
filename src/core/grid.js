//"use strict";
//var Layout;
//(function (Layout) {
//    Layout.grid = function (inheritor) {
//        var self = Layout.uiElement(inheritor || this);
//        self.type = 'grid';
//        //self.addProperty('orientation', {
//        //    get: true, set: true, 'default': 'vertical', needsMeasure: true,
//        //    validValues: ['vertical', 'horizontal']
//        //});
//        //self.addProperty('collapseInBetweenMargins', { get: true, set: true, 'default': true, needsMeasure: true });
//        self.addCssProperty('background', false, undefined);
//        var defaultColumns = [{ width: 1, relative: true }];
//        self.addProperty('columns', {
//            get: true,
//            set: true,
//            onChange: function (v) {
//                v.forEach(function (c) {
//                    if (Object.getOwnPropertyDescriptor(c, 'width').configurable) {
//                        var width = c.width;
//                        Object.defineProperty(c, 'width', {
//                            get: function () { return width; },
//                            set: function (newValue) {
//                                if (newValue !== width) {
//                                    self.needsMeasure = true;
//                                }
//                                width = newValue;
//                            }
//                        });
//                    }
//                    return c;
//                });
//            },
//            needsMeasure:true
//        });


//        self.measureSelf = function (availableSize) {
//            var childrenSize = self.protected.subtractPadding(availableSize);
//            var totalWidth = self.columns.reduce(function (prev, current) { return prev + current },0);


//            var desiredSize = { width: 0, height: 0 };

//            var collapse = self.collapseInBetweenMargins;
//            var firstMargin = undefined;
//            for (var i = 0; i < self.protected.activeChildren.length; i++) {
//                var child = self.protected.activeChildren[i];
//                child.measure(childrenSize);
//                if (self.orientation === 'vertical') {
//                    desiredSize.width = Math.max(desiredSize.width, child.desiredSize.width);
//                    desiredSize.height += child.desiredSize.height;
//                    if (collapse && firstMargin !== undefined) {
//                        desiredSize.height -= Math.min(child.margin.top, firstMargin);
//                    }
//                    firstMargin = child.margin.bottom;
//                } else {
//                    desiredSize.width += child.desiredSize.width;
//                    desiredSize.height = Math.max(desiredSize.height, child.desiredSize.height);
//                    if (collapse && firstMargin !== undefined) {
//                        desiredSize.width -= Math.min(child.margin.right, firstMargin);
//                    }
//                    firstMargin = child.margin.left;
//                }
//            }
//            desiredSize.width += self.padding.left + self.padding.right;
//            desiredSize.height += self.padding.top + self.padding.bottom;
//            return desiredSize;// To use with scrolling etc. { width: Math.min(desiredSize.width, availableSize.width), height: Math.min(desiredSize.height, availableSize.height) };
//        };

//        self.arrangeSelf = function (finalSize) {
//            var offset = 0;
//            var collapse = self.collapseInBetweenMargins;
//            var firstMargin = undefined;
//            for (var i = 0; i < self.protected.activeChildren.length; i++) {
//                var child = self.protected.activeChildren[i];
//                if (self.orientation === 'vertical') {
//                    if (collapse && firstMargin !== undefined) {
//                        offset -= Math.min(child.margin.top, firstMargin);
//                    }
//                    firstMargin = child.margin.bottom;
//                    child.arrange({
//                        x: self.padding.left,
//                        y: offset + self.padding.top,
//                        width: Math.max(finalSize.width - self.padding.left - self.padding.right, child.desiredSize.width),
//                        height: child.desiredSize.height
//                    });

//                    offset += child.desiredSize.height;
//                } else {
//                    if (collapse && firstMargin !== undefined) {
//                        offset -= Math.min(child.margin.right, firstMargin);
//                    }
//                    firstMargin = child.margin.left;
//                    child.arrange({
//                        x: offset + self.padding.left,
//                        y: self.padding.top,
//                        width: child.desiredSize.width,
//                        height: Math.max(finalSize.height - self.padding.top - self.padding.bottom, child.desiredSize.height)
//                    });

//                    offset += child.desiredSize.width;
//                }
//            }
//            return finalSize;
//        };
//        self.createHtml = function () {
//            if (!self.html) {
//                self.html = document.createElement('div');
//                return true;
//            }
//        };

//        return self;
//    };
//})(Layout || (Layout = {}));