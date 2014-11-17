"use strict";
var Layout;
(function (Layout) {
    Layout.host = function (inheritor) {
        var hostHtmlElement; // Todo make properties of this
        var tootRect; // Todo make properties of this

        var self = Layout.uiElement(inheritor || this, 1);
        //createWindowEventHandler();
        Layout.initialize();
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
})(Layout || (Layout = {}));