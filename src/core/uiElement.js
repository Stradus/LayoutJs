"use strict";
var Layout;
(function (Layout) {
    // uiElement is an abstract base class of all UI elements that exist in LayoutJS
    // It provideds all the basic support for layout, styling etc.
    Layout.uiElement = function (inheritor, maxChildren) {
        if (!inheritor) {
            throw "uiElement is an abstract class, it needs to have a descendant to inherit from.";
        }
        var self = inheritor;
        var children = [];
        var parent;
        self.type = 'uiElement';
        self.id = undefined;
        var getRootElement = function () {
            var root = self;
            while (root.parent) {
                root = root.parent;
            }
            return root;
        }

        self.findElementById = function (id) {
            var rootElement = getRootElement();
            if (rootElement.id === id) {
                return rootElement;
            }
            return rootElement.findChildElementById(id);
        };

        self.findChildElementById = function (id) {
            for (var i = 0; i < children.length; i++) {
                if (children[i].id === id) {
                    return children[i];
                }
                var element = children[i].findChildElementById(id);
                if (element) {
                    return element;
                }
            }
        };

        self.setParent = function (p) {
            parent = p;
        };

        self.addProperty = function (name, options) {
            Layout.addProperty(self, name, options);
        };
        self.addTriggeredProperty = function (name, compute) {
            Layout.addTriggeredProperty(self, name, compute);
        }
        var cssValues = {};
        var changedCssValues = {};
        self.addCssProperty = function (name, needsMeasure, defaultValue) {
            var changeFunc = function (v) {
                if (v !== cssValues[name]) {
                    cssValues[name] = v;
                    changedCssValues[name] = v;
                    self.needsRender = true;
                }
                return v;
            };
            if (arguments.length > 2) {
                changeFunc(defaultValue);
            }

            self.addProperty(name, {
                needsMeasure: needsMeasure,
                get: true,
                set: true,
                onChange: changeFunc,
                'default': defaultValue
            });
        };

        var attrValues = {};
        //var changedAttrValues = {};
        self.addAttrProperty = function (name, needsMeasure, defaultValue) {
            var changeFunc = function (v) {
                attrValues[name] = v;
                if (self.html) {
                    self.html[name] = v;
                }
                return v;
            };
            if (arguments.length > 2) {
                changeFunc(defaultValue);
            }
            self.addProperty(name, {
                needsMeasure: needsMeasure,
                get: true,
                set: true,
                onChange: changeFunc
            });
        };

        self.addAttrProperty('id', false);

        self.renderer = undefined;
        var needsMeasureInternal = true; // By default it needs work
        var needsArrangeInternal = true; // By default it needs work
        var needsRenderInternal = true;
        Object.defineProperty(self, 'needsMeasure', {
            get: function () { return needsMeasureInternal }, set: function (v) {
                needsMeasureInternal = v;
                if (needsMeasureInternal && self.parent) {
                    self.parent.needsMeasure = needsMeasureInternal;
                }
            },
            configurable: true
        });
        Object.defineProperty(self, 'needsArrange', {
            get: function () { return needsArrangeInternal }, set: function (v) {
                needsArrangeInternal = v;
                if (needsArrangeInternal && self.parent) {
                    self.parent.needsArrange = needsArrangeInternal;
                }

            },
            configurable: true
        });
        Object.defineProperty(self, 'needsRender', {
            get: function () { return needsRenderInternal }, set: function (v) {
                needsRenderInternal = v;
                if (needsRenderInternal && self.parent) {
                    self.parent.needsRender = needsRenderInternal;
                }

            },
            configurable: true
        });


        self.html = undefined;

        Object.defineProperty(self, 'children', { get: function () { return children } });
        //self.addProperty('children', { get:true, 'default': children});
        //self.addProperty('child', { get: function () { if (children.length > 1) { throw "Element has multiple children" }; return children[0]; } });
        Object.defineProperty(self, 'child', {
            get: function () { return children.length > 0 ? children[0] : undefined },
            set: function (child) {
                if (self.children.length === 1 && self.children[0] === child) {
                    // nothing to change
                    return;
                }
                self.removeAllChildren();
                self.addChild(child);
            }
        })
        Object.defineProperty(self, 'parent', { get: function () { return parent; } });

        self.addProperty('horizontalAlignment', { get: true, set: true, 'default': 'stretch', needsArrange: true });
        self.addProperty('verticalAlignment', { get: true, set: true, 'default': 'stretch', needsArrange: true });

        self.addProperty('margin', {
            get: true, set: true, 'default':{ top: 0, right: 0, bottom: 0, left: 0 },
            onChange: function (v) {
                if (typeof v === 'number') {
                    return { top: v, right: v, bottom: v, left: v };
                } else {
                    return { top: v.top || 0, right: v.right || 0, bottom: v.bottom || 0, left: v.left || 0 };
                }
            },
            needsMeasure: true
        })
        self.addProperty('padding', {
            get: true, set: true, 'default': { top: 0, right: 0, bottom: 0, left: 0 },
            onChange: function (v) {
                // Padding can never be negative
                if (typeof v === 'number') {
                    if (v < 0) { v = 0; }
                    return { top: v, right: v, bottom: v, left: v };
                } else {
                    return { top: Math.max(0, v.top || 0), right: Math.max(0, v.right || 0), bottom: Math.max(0, v.bottom || 0), left: Math.max(0, v.left || 0) };
                }
            },
            needsMeasure: true
        })
        self.addProperty('isPointerOver', { get: true, set: true, 'default': false });
        self.addProperty('isPointerDown', { get: true, set: true, 'default': false });

        var removeHtml = function (child) {
            if (child.html) {
                child.html.parentElement.removeChild(child.html);
                child.html = undefined;
            }
            for (var i = 0; i < child.children.length; i++) {
                removeHtml(child.children[i]);
            }
        }

        self.addChild = function (child) {
            if (maxChildren === 0) {
                throw "Element does not support children";
            }
            // Check that interface exists
            if (!child.measureSelf) {
                throw "Missing measure self function";
            }
            if (!child.arrangeSelf) {
                throw "Missing arrange self function";
            }
            if (child.parent) {
                child.parent.removeChild(child);
            }
            if (maxChildren === 1) {
                if (children.length === 1) {
                    children[0].parent.removeChild(children[0]);
                }
            }
            children.push(child);
            child.setParent(self);
            self.needsMeasure = true;
        }
        self.removeChild = function (child) {
            var childIndex = children.indexOf(child);
            if (childIndex === -1) {
                throw "Element was not removed since it was not a child";
            }
            children.splice(childIndex, 1);
            //if (child.parent && child.html) {
            //    child.html.parentElement.removeChild(child.html);
            //}
            removeHtml(child);
            child.setParent(undefined);
            child.html = undefined;
            self.needsMeasure = true;
        }
        self.removeAllChildren = function () {
            var oldChildren = children.slice();
            for (var i = 0; i < oldChildren.length; i++) {
                self.removeChild(oldChildren[i]);
            }
        }

        self.protected = {};
        self.protected.removeBorder = function (border, size) {
            return {
                x: size.x,
                y: size.y,
                width: Math.max(0, size.width - border.left - border.right),
                height: Math.max(0, size.height - border.top - border.bottom)
            };
        }
        self.protected.addBorder = function (border, size) {
            return {
                x: size.x,
                y: size.y,
                width: size.width + border.left + border.right,
                height: size.height + border.top + border.bottom
            }
        }

        var removeMargin = function (size) { return self.protected.removeBorder(self.margin, size); };
        var addMargin = function (size) { return self.protected.addBorder(self.margin, size); };

        self.measure = function (availableSize) {
            self.desiredSize = addMargin(self.measureSelf(removeMargin(availableSize)));
        };

        self.arrange = function (finalSize) {
            //var marginSize = removeMargin(finalSize);
            var availableSize = { x: finalSize.x, y: finalSize.y, width: finalSize.width, height: finalSize.height };
            if (self.horizontalAlignment !== 'stretch') {
                availableSize.width = self.desiredSize.width;
            }
            if (self.verticalAlignment !== 'stretch') {
                availableSize.height = self.desiredSize.height;
            }
            self.actualSize = addMargin(self.arrangeSelf(removeMargin(availableSize)));
            var fullSize = self.actualSize;
            var offset = { x: 0, y: 0 };
            if (self.horizontalAlignment === 'center' ||
                self.horizontalAlignment === 'stretch') {
                offset.x = (finalSize.width - fullSize.width) / 2;
            } else if (self.horizontalAlignment === 'right') {
                offset.x = finalSize.width - fullSize.width;
            } else {
                offset.x = 0;
            }

            if (self.verticalAlignment === 'center' ||
                self.verticalAlignment === 'stretch') {
                offset.y = (finalSize.height - fullSize.height) / 2;
            } else if (self.verticalAlignment === 'bottom') {
                offset.y = finalSize.height - fullSize.height;
            } else {
                offset.y = 0;
            }
            self.actualSize.x += offset.x;// + margin.left;
            self.actualSize.y += offset.y;// + margin.top;
            //self.actualSize.width = self.actualSize.width - margin.left - margin.right;
            //self.actualSize.height = self.actualSize.height - margin.top - margin.bottom;
        };
        var lastHtmlParent;
        var lastRenderSize = { x: undefined, y: undefined, width: undefined, height: undefined };
        //var lastPadding = { top: -1, right: -1, bottom: -1, left: -1 };// Illegal value to force padding being applied the first time
        self.render = function (htmlParent, offset) {
            offset = offset || { x: 0, y: 0 };
            self.renderSize = { x: offset.x + self.actualSize.x + self.margin.top, y: offset.y + self.actualSize.y + self.margin.top, width: self.actualSize.width - self.margin.left - self.margin.right, height: self.actualSize.height - self.margin.top - self.margin.bottom };
            //if (self.renderSize.width === lastRenderSize.width && self.renderSize.height === lastRenderSize.height && self.renderSize.x === lastRenderSize.x && self.renderSize.y === lastRenderSize.y && !self.needsRender) {
            //    return; // Nothing to render
            //}
            if (self.createHtml) {
                if (self.createHtml()) {
                    self.html.style.display = 'block';
                    self.html.style.position = 'absolute';
                    //self.html.style.pointerEvents = 'none';
                    self.html.layoutElement = self;
                    // Remove event handling from children since events are fully centrally managed
                    // Since pointer events is hiearchical, only need to set one level
                    for (var i = 0; i < self.html.children.length; i++) {
                        self.html.children[i].style.pointerEvents = 'none';
                    }


                    //for (var name in cssValues) {
                    //    self.html.style[name] = cssValues[name];
                    //}
                    for (var name in attrValues) {
                        self.html[name] = attrValues[name];
                    }
                }
            }
            if (self.html) {
                var html = self.html;
                for (var name in changedCssValues) {
                    html.style[name] = changedCssValues[name];
                }
                changedCssValues = {};

                if (lastHtmlParent !== htmlParent) {
                    lastHtmlParent = htmlParent;
                    htmlParent.appendChild(html);
                }
                html.style.width = self.renderSize.width + 'px';
                html.style.height = self.renderSize.height + 'px';
                html.style.left = self.renderSize.x + 'px';
                html.style.top = self.renderSize.y + 'px';
                //if (self.setPadding && (
                //    lastPadding.top !== self.padding.top ||
                //    lastPadding.right !== self.padding.right ||
                //    lastPadding.bottom !== self.padding.bottom ||
                //    lastPadding.left !== self.padding.left)) {
                //    html.style.paddingTop = self.padding.top + 'px';
                //    html.style.paddingRight = self.padding.right + 'px';
                //    html.style.paddingBottom = self.padding.bottom + 'px';
                //    html.style.paddingLeft = self.padding.left + 'px';
                //    lastPadding = self.padding;
                //}
                //htmlParent = html;
            }
            if (self.renderSelf) {
                self.renderSelf(self.renderSize);
            }

            for (var i = 0; i < self.children.length; i++) {
                var child = self.children[i];
                child.render(htmlParent, self.renderSize);
            }
        };
        return self;
    };
})(Layout || (Layout = {}));