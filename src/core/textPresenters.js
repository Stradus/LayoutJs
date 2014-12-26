"use strict";
var Layout;
(function (Layout) {
    var fontHeightBlock, fontHeightDiv, fontHeightLastFont;//, fontHeightHasDefaultText;
    var fontHeightCache = {};
    Layout.calculateFontDimensions = function (font, text, allowHTML) {
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
        }
        //else {
            fontHeightDiv.style.display = 'inline';
        //    fontHeightDiv.style.display = 'block';
        //}
        if (text !== undefined) {
            if (allowHTML) {
                fontHeightDiv.innerHTML = text;
            } else {
                fontHeightDiv.textContent = text;
            }
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
            result.width = fontHeightDiv.offsetWidth;

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
        var self = Layout.uiElement(inheritor || this, 0);
        self.type = 'text';
        self.addProperty('text', { needsMeasure: true, 'default': '' });
        self.addProperty('allowHTML', { needsMeasure: true, 'default': false });
        self.addCssProperty('background', false, undefined);
        self.addCssProperty('color', false, undefined);
        self.addCssProperty('fontSize', true, '12px');
        self.addCssProperty('fontFamily', true, 'sans-serif');
        self.addProperty('selectable', { needsRender: true, 'default': true });
        self.addProperty('horizontalContentAlignment', {
            needsRender: true, 'default': 'left',
            validValues: ['left', 'center', 'right', 'stretch']
        });
        self.addProperty('verticalContentAlignment', {
            needsRender: true, 'default': 'top',
            validValues: ['top', 'center', 'bottom', 'stretch']
        });

        var lastAllowHTML, lastText, lastFont, lastWidth, lastHeight, lastLineHeight, lastHorizontalContentAlignment, lastVerticalContentAlignment, lastPadding, lastFontOffset;
        self.measureSelf = function (availableSize) {
            var font = self.fontSize + ' ' + self.fontFamily;
            if (self.allowHTML) {
                if (lastAllowHTML !== self.allowHTML || lastText !== self.text || lastFont !== font) {
                    var lastText = self.text;
                    lastFont = font;
                    var sizes = Layout.calculateFontDimensions(font, lastText, true);
                    lastWidth = sizes.width;
                    lastHeight = sizes.height;
                }
            } else {
                if (lastFont !== font) {
                    var dimensions = Layout.getOrCalculateFontDimensions(font);
                    lastHeight = dimensions.height;
                    lastFontOffset = 0;// =dimensions.height - dimensions.ascent;
                    //console.log('Text width calculated');
                }
                if (lastWidth === undefined || lastText !== self.text || lastFont !== font) {
                    lastText = self.text;
                    measureCanvasContext.font = font;
                    var measuredText = lastText ? lastText : '';// Otherwise we for example measure the length of the word undefined
                    var textMetrics = measureCanvasContext.measureText(measuredText);
                    lastWidth = textMetrics.width;
                    lastFont = font;
                    //console.log('Text height calculated');
                    //if(lastHeight)
                }
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
                //self.html.style.boxSizing = 'border-box';
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
        var lastRenderAllowHTML;
        self.renderSelf = function (renderSize) {
            if (lastRenderText !== self.text || lastRenderAllowHTML !== self.allowHTML) {
                if (self.allowHTML) {
                    textSpan.innerHTML = self.text;
                } else {
                    textSpan.textContent = self.text;
                }
                lastRenderText = self.text;
                lastRenderAllowHTML = self.allowHTML;
            }

            //// Now handles in mouse down event
            //// by preventing default action
            if (lastRenderSelectable !== self.selectable) {
                lastRenderSelectable = self.selectable;
                if (!lastRenderSelectable) {
                    //        self.html.style.userSelect = 'none';
                    //        self.html.style.mozUserSelect = 'none';
                    //        self.html.style.webkitUserSelect = 'none';
                    //        self.html.style.msUserSelect = 'none';
                    //        textSpan.style.userSelect = 'none';
                    //        textSpan.style.mozUserSelect = 'none';
                    //        textSpan.style.webkitUserSelect = 'none';
                    //        textSpan.style.msUserSelect = 'none';
                    textSpan.style.cursor = 'default';
                } else {
                    //        self.html.style.userSelect = 'text';
                    //        self.html.style.mozUserSelect = 'text';
                    //        self.html.style.webkitUserSelect = 'text';
                    //        self.html.style.msUserSelect = 'text';
                    //        textSpan.style.userSelect = 'text';
                    //        textSpan.style.mozUserSelect = 'text';
                    //        textSpan.style.webkitUserSelect = 'text';
                    //        textSpan.style.msUserSelect = 'text';
                    textSpan.style.cursor = undefined;
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



})(Layout || (Layout = {}));