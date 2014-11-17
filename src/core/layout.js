"use strict";
var StradusLayout;
(function (StradusLayout) {

    StradusLayout.test = function () {

        var definition = {
            type: 'host',
            children: [{
                type: 'button', background: 'gray', horizontalAlignment: 'left', verticalAlignment: 'top', margin: 5,
                children: [{
                    type: "text", text: "Button Text", userSelect: "none", margin: 5, horizontalAlignment: 'center', verticalAlignment: 'center', selectable: 'false'
                }]
            }]
        };

        //var definition = {
        //    type: 'host',
        //    children: [{
        //        type: 'button', background: 'gray', horizontalAlignment: 'left', verticalAlignment: 'top',
        //        children: ['Button Text']
        //    }]
        //};

        //var definition = {
        //    type: 'host',
        //    children: [{
        //        type: "text", text: "Button Text", userSelect: "none", margin: 5, horizontalAlignment: 'center', verticalAlignment: 'center'
        //    }]
        //};

        //var definition = {
        //    type: 'host',
        //    children: [{
        //        type: 'stackPanel', background: 'gray', horizontalAlignment: 'left', verticalAlignment: 'top',
        //        children: [{
        //            type: "text", text: "Button Text", userSelect: "none", margin: 5, horizontalAlignment: 'center', verticalAlignment: 'center'
        //        }]
        //    }]
        //};

        //var definition = {
        //    type: 'host', children: [
        //        {
        //            type: 'stackPanel', children: [
        //               { type: 'text', text: 'Hgello', background: 'gray', horizontalAlignment: 'center', verticalAlignment: 'center' },
        //               {
        //                   type: 'button', children: [
        //                       "Button Text"
        //                   ]
        //               }
        //            ]
        //        }
        //    ]
        //};


        //var definition =
        //    {
        //        type: 'host', children: [{
        //            type: 'stackPanel', orientation: 'vertical', children: [
        //            {
        //                type: 'stackPanel', orientation: 'vertical', background:'blue', children: [
        //                  { type: 'text', text: 'This is a long sentence' },
        //                  { type: 'text', text: 'This is shorter' },
        //                  {
        //                      type: 'stackPanel', id: 'panel2', orientation: 'horizontal', children: [
        //                         { type: 'text', text: 'Horizontal 1' },
        //                         { type: 'text', text: 'Horizontal 2, but longer' }
        //                      ]
        //                  },
        //                  { type: 'text', text: 'After the stack panel',background:'yellow' }
        //                ]
        //            }]
        //        }]
        //    };

        return StradusLayout.create(definition);
        //var definition =
        //    {
        //        type: 'stackPanel', orientation: 'vertical', children: [
        //           { type: 'text', textContent: 'This is a long sentence' },
        //           { type: 'text', textContent: 'This is shorter' },
        //           {
        //               type: 'stackPanel', id: 'panel2', orientation: 'horizontal', children: [
        //                  { type: 'text', textContent: 'Horizontal 1' },
        //                  { type: 'text', textContent: 'Horizontal 2, but longer' }
        //               ]
        //           },
        //           { type: 'text', textContent: 'After the stack panel' }
        //        ]
        //    };


        //var layout = StradusLayout.create(definition);

        ////var l = StradusLayout;
        ////var panel = new StradusLayout.stackPanel();
        ////panel.orientation = 'vertical';
        ////var text1 = new StradusLayout.text();
        ////text1.textContent = 'This is a long sentence';
        ////panel.addChild(text1);
        ////var text2 = new StradusLayout.text();
        ////text2.textContent = 'Short Text';
        ////panel.addChild(text2);

        ////var panel2 = new StradusLayout.stackPanel();
        ////panel2.orientation = 'horizontal';
        ////panel.addChild(panel2);
        ////var text3 = new StradusLayout.text();
        ////text3.textContent = 'Horizontal 1';
        ////panel2.addChild(text3);
        ////var text4 = new StradusLayout.text();
        ////text4.textContent = 'Horizontal 2';
        ////panel2.addChild(text4);
        ////var text5 = new StradusLayout.text();
        ////text5.textContent = 'After horizontal';
        ////panel.addChild(text5);

        //var rect = { height: window.innerHeight, width: window.innerWidth };
        ////StradusLayout.render(document.body, rect, panel);
        //var renderer = new StradusLayout.renderer(document.body, rect);
        //renderer.addChild(layout);
        //return renderer;
    };

    StradusLayout.create = function (definition) {
        var element;
        // Create self
        if (typeof definition === 'string') {
            element = new StradusLayout.text();
            element.text = definition;
        } else {
            element = new StradusLayout[definition.type]();
        }
        for (var optionName in definition) {
            if (optionName === 'type' || optionName === 'children') {
                continue;// skip those special meaning fields
            }
            element[optionName] = definition[optionName];
        }
        if (!definition.children) {
            return element; // No children so we are done
        }
        // Create children
        for (var i = 0; i < definition.children.length; i++) {
            element.addChild(StradusLayout.create(definition.children[i]));
        }
        return element;
    }


    var windowEventHandlerCreated = false;
    var createWindowEventHandler = function () {
        if (windowEventHandlerCreated) {
            return;
        }
        window.addEventListener('click', function (e) {
            if (e.target.layoutElement) {
                console.log('Created by: ' + e.target.layoutElement.type);
            } else {
                console.log('Unmanaged HTML element');
            }
        });
        var lastMouseOverElement = undefined;
        window.addEventListener('mouseover', function (e) {
            var target = e.target.layoutElement;
            if (lastMouseOverElement != target && lastMouseOverElement) {
                var element = lastMouseOverElement;
                do {
                    element.isPointerOver = false;
                    element = element.parent;
                } while (element);
                
            }
            
            if (e.target.layoutElement) {
                var element = target;
                do {
                    element.isPointerOver = true;
                    element = element.parent;
                } while (element);
                lastMouseOverElement = target;
                console.log('Created by: ' + e.target.layoutElement.type);
            } else {
                lastMouseOverElement = undefined;
                console.log('Unmanaged HTML element');
            }
        });
        windowEventHandlerCreated = true;
    };
    StradusLayout.host = function (hostHtmlElement, rootRect) {
        var self = new StradusLayout.uiElement(1);
        createWindowEventHandler();
        self.type = 'host';
        //self.horizontalAlignment = 'left';
        //self.verticalAlignment = 'top';
        if (!hostHtmlElement) {
            hostHtmlElement = document.body;
            if (!rootRect) {
                rootRect = { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
            }
        }

        var measureScheduled = true;
        var arrangeScheduled = true;
        var renderScheduled = true;
        Object.defineProperty(self, 'needsMeasure', {
            get: function () { return measureScheduled; },
            set: function (v) {
                measureScheduled = measureScheduled || v;
                if (measureScheduled) {
                    requestAnimationFrame();
                }
            }
        })

        Object.defineProperty(self, 'needsArrange', {
            get: function () { return arrangeScheduled; },
            set: function (v) {
                arrangeScheduled = arrangeScheduled || v;
                if (arrangeScheduled) {
                    requestAnimationFrame();
                }
            }
        })

        Object.defineProperty(self, 'needsRender', {
            get: function () { return renderScheduled; },
            set: function (v) {
                renderScheduled = renderScheduled || v;
                if (renderScheduled) {
                    requestAnimationFrame();
                }
            }
        })

        hostHtmlElement.position = 'absolute';
        hostHtmlElement.display = 'block';
        hostHtmlElement.width = '100%';
        hostHtmlElement.height = '100%';
        hostHtmlElement.margin = '0px';
        if (!rootRect) {
            var rootRect = hostHtmlElement.getClientBoundingRect();
        }
        rootRect.width = rootRect.width === 0 ? Infinity : rootRect.width;
        rootRect.height = rootRect.height === 0 ? Infinity : rootRect.height;
        rootRect.x = rootRect.x || 0;
        rootRect.y = rootRect.y || 0;

        var requestAnimationFrameID = undefined;
        var requestAnimationFrame = function () {
            if (!requestAnimationFrameID) {
                requestAnimationFrameID = window.requestAnimationFrame(render);
            }
        };

        var render = function () {
            var start = window.performance.now();
            if (self.children.length < 1) {
                // No children so nothing to render
                return;
            }
            var child = self.child;
            if (measureScheduled) {
                child.measure(rootRect);
                measureScheduled = false;
                arrangeScheduled = true;
            }
            if (arrangeScheduled) {
                child.arrange({ x: 0, y: 0, width: rootRect.width, height: rootRect.height });
                arrangeScheduled = false;
                renderScheduled = true;
            }
            if (renderScheduled) {
                child.render(hostHtmlElement);
                renderScheduled = false;
            }
            // To allow new scheduling
            requestAnimationFrameID = undefined;
            console.log('Rendered in: ' + (window.performance.now() - start));
        };

        // Should always remain last call
        requestAnimationFrame();// To force initial render
        return self;
    };

    StradusLayout.uiElement = function (maxChildren) {
        var self = this;
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
            var o = {};
            var value = options.default;
            if (options.get) {
                if (options.get === true) {
                    o.get = function () {
                        return value;
                    }
                } else {
                    o.get = options.get;
                }
            }
            if (options.set) {
                if (options.set === true) {
                    if (options.needsMeasure) {
                        o.set = function (v) {
                            value = v;
                            self.needsMeasure = true;
                        }
                    } else if (options.needsArrange) {
                        o.set = function (v) {
                            value = v;
                            self.needsArrange = true;
                        }
                    }
                    else if (options.needsRender) {
                        o.set = function (v) {
                            value = v;
                            self.needsRender = true;
                        }
                    } else {
                        o.set = function (v) {
                            value = v;
                        }
                    }
                } else {
                    if (options.needsMeasure) {
                        var set = options.set;
                        o.set = function (v) {
                            set(v);
                            self.needsMeasure = true;
                        }
                    } else if (options.needsArrange) {
                        var set = options.set;
                        o.set = function (v) {
                            set(v);
                            self.needsArrange = true;
                        }
                    } else if (options.needsRender) {
                        var set = options.set;
                        o.set = function (v) {
                            set(v);
                            self.needsRender = true;
                        }
                    } else {
                        o.set = options.set;
                    }
                }
            }
            Object.defineProperty(self, name, o);
        };
        var cssValues = {};
        var changedCssValues = {};
        self.addCssProperty = function (name, needsMeasure, defaultValue) {
            var setFunc = function (v) {
                if (v !== cssValues[name]) {
                    cssValues[name] = v;
                    changedCssValues[name] = v;
                    self.needsRender = true;
                }
                //if (self.html) {
                //    self.html.style[name] = v;
                //}
            };
            if (arguments.length > 2) {
                setFunc(defaultValue);
            }

            self.addProperty(name, {
                needsMeasure: needsMeasure,
                get: function () {
                    return cssValues[name];
                },
                set: setFunc
            });
        };
        var attrValues = {};
        //var changedAttrValues = {};
        self.addAttrProperty = function (name, needsMeasure, defaultValue) {
            var setFunc = function (v) {
                attrValues[name] = v;
                if (self.html) {
                    self.html[name] = v;
                }
            };
            if (arguments.length > 2) {
                setFunc(defaultValue);
            }
            self.addProperty(name, {
                needsMeasure: needsMeasure,
                get: function () {
                    return attrValues[name];
                },
                set: setFunc
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


        self.addProperty('children', { get: function () { return children; } });
        self.addProperty('child', { get: function () { if (children.length > 1) { throw "Element has multiple children" }; return children[0]; } });
        self.addProperty('parent', { get: function () { return parent; } });

        self.addProperty('horizontalAlignment', { get: true, set: true, 'default': 'stretch', needsArrange: true });
        self.addProperty('verticalAlignment', { get: true, set: true, 'default': 'stretch', needsArrange: true });
        var margin = { top: 0, right: 0, bottom: 0, left: 0 };
        self.addProperty('margin', {
            get: function () { return margin; }, set: function (v) {
                if (typeof v === 'number') {
                    margin = { top: v, right: v, bottom: v, left: v };
                } else {
                    margin = { top: v.top || 0, right: v.right || 0, bottom: v.bottom || 0, left: v.left || 0 };
                }
            },
            needsMeasure: true
        })
        var padding = { top: 0, right: 0, bottom: 0, left: 0 };
        self.addProperty('padding', {
            get: function () { return padding; }, set: function (v) {
                // Padding can never be negative
                if (typeof v === 'number') {
                    if (v < 0) { v = 0; }
                    padding = { top: v, right: v, bottom: v, left: v };
                } else {
                    padding = { top: Math.max(0, v.top || 0), right: Math.max(0, v.right || 0), bottom: Math.max(0, v.bottom || 0), left: Math.max(0, v.left || 0) };
                }
            },
            needsMeasure: true
        })
        self.addProperty('isPointerOver', { get: true, set: true, 'default': false });

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
        return this;
    };


    StradusLayout.stackPanel = function () {
        var self = new StradusLayout.uiElement();
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


    //var fontHeightText,
    var fontHeightBlock, fontHeightDiv, fontHeightLastFont;//, fontHeightHasDefaultText;
    var fontHeightCache = {};
    StradusLayout.calculateFontDimensions = function (font, text) {
        // Modified from: http://stackoverflow.com/questions/1134586/how-can-you-find-the-height-of-text-on-an-html-canvas
        var start = window.performance.now();
        if (!fontHeightDiv) {// Cache elements, no need to recreate them everytime
            //fontHeightText = document.createElement('span');
            //fontHeightText.style.lineHeight = 1;
            //fontHeightText.textContent = text || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567890!?|';
            //fontHeightText.style.font = font;
            //fontHeightBlock = document.createElement('div');
            //fontHeightBlock.style.display = 'inline-block';
            //fontHeightBlock.style.width = '1px';
            //fontHeightBlock.style.height = '0px';            
            fontHeightDiv = document.createElement('div');
            fontHeightDiv.style.whiteSpace = 'nowrap';
            fontHeightDiv.textContent = '.';
            //fontHeightDiv.textContent = text || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567890!?|';
            //fontHeightDiv.appendChild(fontHeightText);
            //fontHeightDiv.appendChild(fontHeightBlock);
            document.body.appendChild(fontHeightDiv);
        } else {
            fontHeightDiv.style.display = 'block';
        }
        if (text !== undefined) {
            fontHeightDiv.textContent = text;
            //fontHeightHasDefaultText = false;
        }
        //else {
        //    if (!fontHeightHasDefaultText) {
        //        fontHeightText.textContent = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz01234567890!?|';
        //        fontHeightHasDefaultText = true;
        //    }
        //}
        fontHeightDiv.style.font = font;
        try {
            var result = {};

            //fontHeightBlock.style.verticalAlign = 'baseline';
            //var topPos = fontHeightBlock.offsetTop;
            //console.log(fontHeightText.offsetTop + ' - ' + fontHeightBlock.offsetTop);
            ////result.ascent = fontHeightBlock.offsetTop - fontHeightText.offsetTop;


            //fontHeightBlock.style.verticalAlign = 'text-bottom';
            //console.log(fontHeightText.offsetTop + ' - ' + fontHeightBlock.offsetTop);
            //result.height = fontHeightBlock.offsetTop - fontHeightText.offsetTop;
            result.height = fontHeightDiv.offsetHeight;


            //result.height = fontHeightBlock.offsetTop - fontHeightText.offsetTop;

            //result.descent = result.height - result.ascent;
        } finally {
            fontHeightDiv.style.display = 'none';
        }
        console.log('Font size found in: ' + (window.performance.now() - start));
        return result;
    };
    StradusLayout.getOrCalculateFontDimensions = function (font) {
        var cachedResult = fontHeightCache[font];
        if (cachedResult) {
            return cachedResult;
        }
        var result = StradusLayout.calculateFontDimensions(font);
        fontHeightCache[font] = result;
        return result;
    };

    var measureCanvas = document.createElement('canvas');
    var measureCanvasContext = measureCanvas.getContext('2d');
    StradusLayout.text = function () {
        var self = new StradusLayout.uiElement(0);
        self.type = 'text';
        self.addProperty('text', { needsMeasure: true, get: true, set: true, 'default': '' });
        self.addCssProperty('background', false, undefined);
        self.addCssProperty('color', false, undefined);
        self.addCssProperty('fontSize', true, '12px');
        self.addCssProperty('fontFamily', true, 'sans-serif');
        self.addProperty('selectable', { needsRender: true, get: true, set: true, 'default': true });
        self.addProperty('horizontalContentAlignment', { needsRender: true, get: true, set: true, 'default': 'left' });
        self.addProperty('verticalContentAlignment', { needsRender: true, get: true, set: true, 'default': 'top' });

        var lastText, lastFont, lastWidth, lastHeight, lastLineHeight, lastHorizontalContentAlignment, lastVerticalContentAlignment, lastPadding, lastFontOffset;
        self.measureSelf = function (availableSize) {
            var font = self.fontSize + ' ' + self.fontFamily;
            if (lastFont !== font) {
                var dimensions = StradusLayout.getOrCalculateFontDimensions(font);
                lastHeight = dimensions.height;
                lastFontOffset = 0;// =dimensions.height - dimensions.ascent;
            }
            if (lastWidth === undefined || lastText !== self.text || lastFont !== font) {
                lastText = self.text;
                measureCanvasContext.font = font;
                var textMetrics = measureCanvasContext.measureText(lastText);
                lastWidth = textMetrics.width;
                //if(lastHeight)
            }
            return { width: lastWidth + self.padding.left + self.padding.right, height: lastHeight + self.padding.top + self.padding.bottom };
        };
        //var lastFinalSize;
        self.arrangeSelf = function (finalSize) {
            //lastFinalSize = finalSize;
            return finalSize;// { x: finalSize.x, y: finalSize.y, width: Math.min(finalSize.width, self.desiredSize.width), height: Math.min(finalSize.height, self.desiredSize.height) };
        };
        var oldParent;
        var textSpan;

        self.createHtml = function () {
            if (!self.html) {
                self.html = document.createElement('div');
                self.html.style.boxSizing = 'border-box';
                textSpan = document.createElement('span');
                textSpan.style.display = 'block';
                textSpan.style.position = 'absolute';
                textSpan.style.whiteSpace = 'nowrap';
                self.html.appendChild(textSpan);
                return true
            }
            return false;
        };

        var lastRenderText;
        var lastRenderOffsetX, lastRenderOffsetY;
        var lastRenderSelectable;
        self.renderSelf = function (renderSize) {
            if (lastRenderText !== self.text) {
                textSpan.textContent = self.text;
                lastRenderText = self.text;
            }
            if (lastRenderSelectable !== self.selectable) {
                lastRenderSelectable = self.selectable;
                if (!lastRenderSelectable) {
                    textSpan.style.userSelect = 'none';
                    textSpan.style.mozUserSelect = 'none';
                    textSpan.style.webkitUserSelect = 'none';
                } else {
                    textSpan.style.userSelect = 'text';
                    textSpan.style.mozUserSelect = 'text';
                    textSpan.style.webkitUserSelect = 'text';
                }
            }

            var offsetX = self.padding.left;
            var offsetY = self.padding.top;
            if (self.horizontalContentAlignment === 'right') {
                offsetX = renderSize.width - lastWidth - self.padding.right;
            } else if (self.horizontalContentAlignment === 'center') {
                offsetX = (renderSize.width - lastWidth - self.padding.left - self.padding.right) / 2 + self.padding.left;
            }
            if (self.verticalContentAlignment === 'bottom') {
                offsetY = renderSize.height - lastHeight - self.padding.bottom;
            } else if (self.verticalContentAlignment === 'center') {
                offsetY = (renderSize.height - lastHeight - self.padding.top - self.padding.bottom) / 2 + self.padding.top;
            }
            offsetY += lastFontOffset;
            if (lastRenderOffsetX !== offsetX) {
                lastRenderOffsetX = offsetX;
                textSpan.style.left = offsetX + 'px';
            }
            if (lastRenderOffsetY !== offsetY) {
                lastRenderOffsetY = offsetY;
                textSpan.style.top = offsetY + 'px';
            }
        }

        return self;
    }

    StradusLayout.button = function () {
        var self = new StradusLayout.contentHost();
        self.type = 'button';
        //self.addCssProperty('pointerEvents', false, 'visible');        
        var state;
        self.addProperty('state', {
            get: function () {
                return state;
            },
            set: function (s) {
                state = s;
                console.log('state: ' + s);
            },
        });
        //var createHtml = self.createHtml;
        //self.createHtml = function () {
        //    var result = createHtml();//Call base function
        //    if (result) {
        //        self.html.addEventListener('click', function (e) {
        //            console.log('Hello click');
        //        });
        //        self.html.addEventListener('mouseenter', function(e){
        //            console.log('Mouse entered');    
        //        });
        //        self.html.addEventListener('mouseleave', function(e){
        //            console.log('Mouse left');    
        //        });
        //    }
        //    return result;
        //};

        return self;
    }

    StradusLayout.contentHost = function () {
        var self = new StradusLayout.uiElement(1);
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
                self.child.measure(self.protected.removeBorder(self.padding, availableSize));
                return self.protected.addBorder(self.padding, self.child.desiredSize);
            } else {
                return { width: self.padding.width, height: self.padding.height };
            }
        }
        self.arrangeSelf = function (finalSize) {
            if (self.child) {
                var childSize = self.protected.removeBorder(self.padding, finalSize);
                childSize.x += self.padding.left;
                childSize.y += self.padding.top;
                self.child.arrange(childSize);
                var selfSize = self.protected.addBorder(self.padding, self.child.actualSize);
                childSize.x -= self.padding.left;
                childSize.y -= self.padding.top;
                return selfSize;
            } else {
                return { x: 0, y: 0, width: Math.min(self.padding.width, finalSize.width), height: Math.min(self.padding.height, finalSize.height) };
            }
        }
        return self;
    }

})(StradusLayout || (StradusLayout = {}));