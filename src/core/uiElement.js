﻿"use strict";
var Layout;
(function (Layout) {
    // uiElement is an abstract base class of all UI elements that exist in LayoutJS
    // It provideds all the basic support for layout, styling etc.
    Layout.uiElement = function (inheritor, maxChildren) {
        if (!inheritor) {
            log.warn( "uiElement is an abstract class, it needs to have a descendant to inherit from.");
            self = this;
        }
        var self = inheritor;
        self.protected = {};
        var logicalDescendant = self;
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
        self.addTriggeredEvent = function (name, trigger) {
            Layout.addTriggeredEvent(self, name, trigger);
        };
        self.addEvent = function (name) {
            return Layout.addEvent(self, name);
        }

        var cssValues = {};
        var changedCssValues = {};
        var changeCssValue = function (name, value) {
            if (value !== cssValues[name]) {
                cssValues[name] = value;
                changedCssValues[name] = value;
                self.needsRender = true;
            }
        };
        self.addCssProperty = function (name, needsMeasure, defaultValue, validValues) {
            var changeFunc = changeCssValue.bind(this, name);
            if (arguments.length > 2) {
                changeFunc(defaultValue);
            }

            self.addProperty(name, {
                needsMeasure: needsMeasure,
                get: true,
                set: true,
                changed: changeFunc,
                'default': defaultValue,
                validValues: validValues
            });
        };

        //var attrValues = {};
        ////var changedAttrValues = {};
        //self.addAttrProperty = function (name, needsMeasure, defaultValue, validValues) {
        //    var changeFunc = function (v) {
        //        attrValues[name] = v;
        //        if (self.html) {
        //            self.html[name] = v;
        //        }
        //    };
        //    if (arguments.length > 2) {
        //        changeFunc(defaultValue);
        //    }
        //    self.addProperty(name, {
        //        needsMeasure: needsMeasure,
        //        get: true,
        //        set: true,
        //        'default': defaultValue,
        //        changed: changeFunc,
        //        validValues: validValues
        //    });
        //};

        //self.addAttrProperty('id', false, null);


        self.addChild = function (child) {
            return logicalDescendant.addVisualChild(child);
        };

        self.addVisualChild = function (child) {
            if (!child) {
                self.removeAllChildren();
                return;
            }
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
            Layout.applyCascade(child);
            self.needsMeasure = true;
        }

        self.removeChild = function (child) {
            return logicalDescendant.removeVisualChild(child);
        };
        self.removeVisualChild = function (child) {
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
            return logicalDescendant.removeAllVisualChildren();
        };
        self.removeAllVisualChildren = function () {
            var oldChildren = children.slice();
            for (var i = 0; i < oldChildren.length; i++) {
                self.removeChild(oldChildren[i]);
            }
        }

        Object.defineProperty(self, 'children', { get: function () { return logicalDescendant.visualChildren } });
        Object.defineProperty(self, 'visualChildren', { get: function () { return children } });
        Object.defineProperty(self.protected, 'activeChildren', {
            get: function () { return children.filter(function (e) { return e.visible !== 'collapsed' }) }
        });
        //self.addProperty('children', { get:true, 'default': children});
        //self.addProperty('child', { get: function () { if (children.length > 1) { throw "Element has multiple children" }; return children[0]; } });
        Object.defineProperty(self, 'child', {
            get: function () { return logicalDescendant.visualChild },
            set: function (child) {
                logicalDescendant.visualChild = child;
            }
        })
        Object.defineProperty(self, 'visualChild', {
            get: function () { return children.length > 0 ? children[0] : undefined },
            set: function (child) {
                if (children.length === 1 && children[0] === child) {
                    // nothing to change
                    return;
                }
                self.removeAllVisualChildren();
                self.addVisualChild(child);
            }
        })

        Object.defineProperty(self, 'parent', { get: function () { return parent; } });



        //self.renderer = undefined;
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

        self.addProperty('dataSelector',{get:true, set:true, 'default':undefined})

        self.addProperty('data', {
            set: true, get: true, cascade: true,
            filter: function(v){
                if(self.dataSelector && v){
                    return v[self.dataSelector];
                }
                return v;
            },
            changed: function (v) {
                Layout.updateBindings(self);
            }
        });
        self.bind = function (elmentPropertyName, bindingExpression) {
            if (!self.hasOwnProperty(ElementPropertyName)) {
                throw "Cannot bind to non existing property name on element: " + elementPropertyName
            }
            Layout.dataBind(self, elmentPropertyName, bindingExpression);
        }


        self.html = undefined;

       

        var styleChanges = {};
        var activeStyleName = 'default';
        self.applyStyle = function (styleName) {
            var style = self[styleName + 'Style'];

            // first revert style changes
            for (var name in styleChanges) {
                self[name] = styleChanges[name];
            }
            styleChanges = {};
            if (styleName === 'default' || !style) {
                return; // Nothing to set for the default style
            }
            for (var name in style) {
                var oldValue = Layout.peekPropertyValue(self, name);
                var newValue = style[name];
                if (newValue !== oldValue) {
                    styleChanges[name] = oldValue;
                    self[name] = newValue;
                }
            }
        };

        

        self.addProperty('display', {
            get: true, set: true, 'default': 'visible', needsMeasure: true,
            validValues: ['visible', 'hidden', 'collapsed']
        });

        self.addProperty('horizontalAlignment', {
            get: true, set: true, 'default': 'stretch', needsArrange: true,
            validValues: ['left', 'center', 'right', 'stretch']
        });

        self.addProperty('verticalAlignment', {
            get: true, set: true, 'default': 'stretch', needsArrange: true,
            validValues: ['top', 'center', 'bottom', 'stretch']
        });
        var zeroThickness = { top: 0, right: 0, bottom: 0, left: 0 };
        Object.freeze(zeroThickness); // Should never change
        self.addProperty('margin', {
            get: true, set: true, 'default': zeroThickness,
            filter: function (v) {
                var thickness;
                if (typeof v === 'number') {
                    thickness = { top: v, right: v, bottom: v, left: v };
                } else {
                    thickness = { top: v.top || 0, right: v.right || 0, bottom: v.bottom || 0, left: v.left || 0 };
                }
                thickness.totalWidth = thickness.left + thickness.right;
                thickness.totalHeight = thickness.top + thickness.bottom;
                return Object.freeze(thickness);
            },
            needsMeasure: true
        })
        var positiveThicknessChangeFunc = function (v) {
            // Border or Padding can never be negative
            var thickness;
            if (typeof v === 'number') {
                if (v < 0) { v = 0; }
                thickness = { top: v, right: v, bottom: v, left: v };
            } else {
                thickness = { top: Math.max(0, v.top || 0), right: Math.max(0, v.right || 0), bottom: Math.max(0, v.bottom || 0), left: Math.max(0, v.left || 0) };
            }
            thickness.totalWidth = thickness.left + thickness.right;
            thickness.totalHeight = thickness.top + thickness.bottom;
            return Object.freeze(thickness);
        };
        self.addProperty('border', {
            get: true, set: true, 'default': zeroThickness,
            filter: positiveThicknessChangeFunc,
            needsMeasure: true
        })
        self.addProperty('padding', {
            get: true, set: true, 'default': zeroThickness,
            filter: positiveThicknessChangeFunc,
            needsMeasure: true
        })
        self.addCssProperty('boxShadow', false, '');
        self.addCssProperty('borderStyle', false, 'solid', ['dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset']);
        self.addCssProperty('borderColor', false, 'black');
        self.addCssProperty('opacity', false);
        var zeroRadius = Object.freeze({topLeft:0, topRight:0, bottomRight:0, bottomLeft:0});
        self.addProperty('cornerRadius', {
            get: true,
            set: true,
            needsArrange: true,
            filter: function (v) {
                var radius;
                if (typeof v === 'number') {
                    radius = { topLeft: v, topRight: v, bottomRight: v, bottomLeft: v };
                } else {
                    radius = { topLeft: v.topLeft || 0, topRight: v.topRight || 0, 
                        bottomRight: v.bottomRight || 0, bottomLeft: v.bottomLeft || 0 };
                }
                //// Now movde to renderer, since it might be changed by organizers
                //changeCssValue('borderRadius', radius.topLeft + 'px ' + radius.topRight + 'px '
                //    + radius.bottomRight + 'px ' + radius.bottomLeft + 'px');
                return Object.freeze(radius);
            },
            'default':zeroRadius
        });


        self.addProperty('isPointerOver', { get: true, set: true, 'default': false });
        self.addProperty('isPointerDown', { get: true, set: true, 'default': false });
        

        //self.isLogicalHost = true;
        self.protected.setLogicalDescendant = function(element){
            logicalDescendant = element;
        };
        var setTemplate = function (template) {
            self.removeAllVisualChildren();
            if (!template) {
                return;
            };
            var visualChild = Layout.create(template, self);
            
            self.addVisualChild(visualChild);
        };
        self.addProperty('template', {
            get: true, set: true, changed: function (v) {
                setTemplate(v);
            }
        });

       

        self.protected.applyTheme = function () {
            var style = Layout.getThemeStyleForElement(self);
            if (!style) {
                return;
            }
            if (style.hasOwnProperty('template')) {
                self.template = style.template;
            }

            for (var name in style) {
                if (name === 'template') {
                    // already done
                    continue;
                }
                if (!self.hasOwnProperty(name)) {
                    console.warn('Template tries to set non-existing property: ' + name);
                    continue;
                }
                var oldValue = Layout.peekPropertyValue(self, name);
                var newValue = style[name];
                if (newValue !== oldValue) {
                    //styleChanges[name] = oldValue; // Don't store style changes, we are setting the default style here!
                    self[name] = newValue;
                }
            }
        };


     


        

       
        
        //self.protected.subtractThickness = function (border, size) {
        //    return {
        //        x: size.x + border.left,
        //        y: size.y + border.top,
        //        width: Math.max(0, size.width - border.left - border.right),
        //        height: Math.max(0, size.height - border.top - border.bottom)
        //    };
        //}
        //self.protected.addThickness = function (border, size) {
        //    return {
        //        x: size.x - border.left,
        //        y: size.y - border.top,
        //        width: size.width + border.left + border.right,
        //        height: size.height + border.top + border.bottom
        //    }
        //}

        self.protected.subtractOutside = function (size) {
            return {
                x: size.x + self.border.left + self.margin.left,
                y: size.y + self.border.top + self.margin.top,
                width: Math.max(0, size.width - self.border.totalWidth - self.margin.totalWidth),
                height: Math.max(0, size.height - self.border.totalHeight - self.margin.totalHeight)
            };
        }
        self.protected.addOutside = function (size) {
            return {
                x: size.x - self.border.left - self.margin.left,
                y: size.y - self.border.top - self.margin.top,
                width: Math.max(0, size.width + self.border.totalWidth + self.margin.totalWidth),
                height: Math.max(0, size.height + self.border.totalHeight + self.margin.totalHeight)
            };
        };
        self.protected.subtractPadding = function (size) {
            return {
                x: size.x + self.padding.left,
                y: size.y + self.padding.top,
                width: Math.max(0, size.width - self.padding.totalWidth),
                height: Math.max(0, size.height - self.padding.totalHeight)
            };
        }
        self.protected.addPadding = function (size) {
            return {
                x: size.x - self.padding.left,
                y: size.y - self.padding.top,
                width: Math.max(0, size.width + self.padding.totalWidth),
                height: Math.max(0, size.height + self.padding.totalHeight)
            };
        };

        var subtractOutside = self.protected.subtractOutside;
        var addOutside = self.protected.addOutside;

        //var removeThickness = function (size) { return self.protected.removeBorder(self.margin, size); };
        //var addThickness = function (size) { return self.protected.addBorder(self.margin, size); };

        self.measure = function (availableSize) {
            if (self.display === 'collapsed') {
                self.desiredSize = { width: 0, height: 0 };
                return;
            }
            self.desiredSize = addOutside(self.measureSelf(subtractOutside(availableSize)));
        };

        self.arrange = function (finalSize) {
            if (self.display === 'collapsed') {
                self.actualSize = { x: 0, y: 0, width: 0, height: 0 };
                return;
            }
            //var marginSize = removeThickness(finalSize);
            var availableSize = { x: finalSize.x, y: finalSize.y, width: finalSize.width, height: finalSize.height };
            if (self.horizontalAlignment !== 'stretch') {
                availableSize.width = self.desiredSize.width;
            }
            if (self.verticalAlignment !== 'stretch') {
                availableSize.height = self.desiredSize.height;
            }
            self.actualSize = addOutside(self.arrangeSelf(subtractOutside(availableSize)));
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
        var lastDisplay;
        var lastBorder;
        var lastRadius;
        var lastWasVisible = true;
        var removeHtml = function (child) {
            if (child.html) {
                child.html.parentElement.removeChild(child.html);
                child.html = undefined;
            }
            for (var i = 0; i < child.visualChildren.length; i++) {
                removeHtml(child.visualChildren[i]);
            }
        }
        var hideHtml = function (element) {
            if (element.html) {
                element.html.style.display = 'none';
            };
            for (var i = 0; i < element.visualChildren.length; i++) {
                hideHtml(element.visualChildren[i]);
            }
        };

        var showHtml = function (element) {
            if (element.html) {
                element.html.style.display = 'block';
            };
            for (var i = 0; i < element.visualChildren.length; i++) {
                showHtml(element.visualChildren[i]);
            }
        };

        //var lastPadding = { top: -1, right: -1, bottom: -1, left: -1 };// Illegal value to force padding being applied the first time
        self.render = function (htmlParent, offset) {
            if (self.display !== 'visible') {
                if (lastWasVisible) {
                    lastWasVisible = false;
                    hideHtml(self);
                }
                return;
            }
            if (!lastWasVisible) {
                lastWasVisible = true;
                showHtml(self);
            }


            offset = offset ||
                { x: 0, y: 0 };
            self.renderSize = {
                x: offset.x + self.actualSize.x + self.margin.left,
                y: offset.y + self.actualSize.y + self.margin.top,
                width: self.actualSize.width - self.margin.totalWidth - self.border.totalWidth,
                height: self.actualSize.height - self.margin.totalHeight - self.border.totalHeight
            };
            //if (self.renderSize.width === lastRenderSize.width && self.renderSize.height === lastRenderSize.height && self.renderSize.x === lastRenderSize.x && self.renderSize.y === lastRenderSize.y && !self.needsRender) {
            //    return; // Nothing to render
            //}
            if (self.createHtml && self.display === 'visible') {
                if (self.createHtml()) {
                    //self.html.style.display = 'block';
                    self.html.style.position = 'absolute';
                    //self.html.style.pointerEvents = 'none';
                    self.html.layoutElement = self;

                    //// Removed since only changed values should be set 
                    //for (var name in cssValues) {
                    //    self.html.style[name] = cssValues[name];
                    //}
                    //for (var name in attrValues) {
                    //    self.html[name] = attrValues[name];
                    //}
                }
            }
            if (self.html) {
                var html = self.html;
                //self.html.style.display = 'block';
                for (var name in changedCssValues) {
                    html.style[name] = changedCssValues[name];
                }
                changedCssValues = {};

                if (lastBorder !== self.border) {
                    lastBorder = self.border;
                    html.style.borderWidth = self.border.top + 'px ' +
                        self.border.right + 'px ' +
                        self.border.bottom + 'px ' +
                        self.border.left + 'px';
                }
                var radius = self.actualCornerRadius||self.cornerRadius;
                if(lastRadius !==radius && (!lastRadius ||
                    radius.topLeft!==lastRadius.topLeft ||  
                    radius.topRight !== lastRadius.topRight||
                    radius.bottomRight !== lastRadius.bottomRight ||
                    radius.bottomLeft !== lastRadius.bottomLeft)) {
                    html.style.borderRadius = radius.topLeft + 'px ' + radius.topRight + 'px '
                        + radius.bottomRight + 'px ' + radius.bottomLeft + 'px';
                    lastRadius = radius;
                }

                if (lastHtmlParent !== htmlParent) {
                    lastHtmlParent = htmlParent;
                    htmlParent.appendChild(html);
                }
                html.style.width = self.renderSize.width + 'px';
                html.style.height = self.renderSize.height + 'px';
                html.style.left = self.renderSize.x + 'px';
                html.style.top = self.renderSize.y + 'px';
            }

            // We still carry out these steps even if we are collapsed since we have to make sure
            // we dont display the children as well
            if (self.renderSelf) {
                self.renderSelf(self.renderSize);
            }

            for (var i = 0; i < children.length; i++) {
                var child = children[i];
                child.render(htmlParent, { x: self.renderSize.x + self.border.left, y: self.renderSize.y + self.border.top });
            }
            if (self.postRenderSelf) {
                self.postRenderSelf(self.renderSize);
            }
        };
        return self;
    };
})(Layout || (Layout = {}));