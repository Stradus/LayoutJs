"use strict";
var Layout;
(function (Layout) {

    

    Layout.create = function (definition) {
        var element;
        // Create self
        if (typeof definition === 'string') {
            element = new Layout.text();
            element.text = definition;
        } else {
            element = new Layout[definition.type]();
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
            element.addChild(Layout.create(definition.children[i]));
        }
        return element;
    }

    //// Initialize whatever common state LayoutJS needs
    //// Does not need to be called explicitly, is called by host
    //// to make sure LayoutJS is initialized
    Layout.initialize = function () {

    };

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
    Layout.host = function (inheritor) {
        var hostHtmlElement; // Todo make properties of this
        var tootRect; // Todo make properties of this

        var self = Layout.uiElement(inheritor||this, 1);
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

    

    


    //var fontHeightText,
    var fontHeightBlock, fontHeightDiv, fontHeightLastFont;//, fontHeightHasDefaultText;
    var fontHeightCache = {};
    Layout.calculateFontDimensions = function (font, text) {
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
    Layout.getOrCalculateFontDimensions = function (font) {
        var cachedResult = fontHeightCache[font];
        if (cachedResult) {
            return cachedResult;
        }
        var result = Layout.calculateFontDimensions(font);
        fontHeightCache[font] = result;
        return result;
    };

    var measureCanvas = document.createElement('canvas');
    var measureCanvasContext = measureCanvas.getContext('2d');
    Layout.text = function (inheritor) {
        var self = Layout.uiElement(inheritor||this, 0);
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
                var dimensions = Layout.getOrCalculateFontDimensions(font);
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

    Layout.button = function (inheritor) {
        var self = Layout.contentHost(inheritor||this);
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

    Layout.contentHost = function (inheritor) {
        var self = Layout.uiElement(inheritor||this, 1);
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

})(Layout || (Layout = {}));