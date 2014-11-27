"use strict";
var Layout;
(function (Layout) {
    Layout.host = function (inheritor) {
        var hostHtmlElement; 
        var rootRect; 

        var self = Layout.uiElement(inheritor || this, 1);
        Layout.initialize();
        self.type = 'host';

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
        });

        Object.defineProperty(self, 'needsArrange', {
            get: function () { return arrangeScheduled; },
            set: function (v) {
                arrangeScheduled = arrangeScheduled || v;
                if (arrangeScheduled) {
                    requestAnimationFrame();
                }
            }
        });

        Object.defineProperty(self, 'needsRender', {
            get: function () { return renderScheduled; },
            set: function (v) {
                renderScheduled = renderScheduled || v;
                if (renderScheduled) {
                    requestAnimationFrame();
                }
            }
        });
        var resizeHandler = function () {
            rootRect = { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
            self.needsMeasure = true;
        };
        //var resizeState = undefined;
        self.addProperty('rerenderOnResize', {
            get: true,
            set: true,
            changed: function (resize) {
                //if (v != resizeState) {
                  //  resizeState = v;
                    if (resize) {
                        window.addEventListener('resize', resizeHandler);
                    } else {
                        window.removeEventListener('resize', resizeHandler);
                    }
                //}
                //return v;
            },
            'default': true
        });

        var render = function () {
            var start = window.performance.now();
            if (self.visualChildren.length < 1) {
                // No children so nothing to render
                return;
            }

            if (currentHostElementId !== self.hostElementId) {
                setHostElement();
                currentHostElementId = self.hostElementId;
            }

            var child = self.visualChild;
            var hasMeasured, hasArranged, hasRendered;
            if (measureScheduled) {
                child.measure(rootRect);
                measureScheduled = false;
                arrangeScheduled = true;
                hasMeasured = true;
            }
            if (arrangeScheduled) {
                child.arrange({ x: 0, y: 0, width: rootRect.width, height: rootRect.height });
                arrangeScheduled = false;
                renderScheduled = true;
                hasArranged = true;
            }
            if (renderScheduled) {
                child.render(hostHtmlElement);
                renderScheduled = false;
                hasRendered = true;
            }
            // To allow new scheduling
            requestAnimationFrameID = undefined;
            console.log('Rendered in: ' + (window.performance.now() - start)
                + '(' + (hasMeasured ? 'measured,' : '') + (hasArranged ? 'arranged,' : '') + (hasRendered ? 'rendered' : '') + ')');
        };
        var requestAnimationFrameID = undefined;
        var requestAnimationFrame = function () {
            if (!requestAnimationFrameID) {
                requestAnimationFrameID = window.requestAnimationFrame(render);
            }
        };

        var currentHostElementId = null;



        var setHostElement = function () {
            if (!self.hostElementId) {
                hostHtmlElement = document.body;
                if (!rootRect) {
                    rootRect = { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
                }
            } else {
                hostHtmlElement = window.document.getElementById(self.hostElementId);
            }
            hostHtmlElement.position = 'absolute';
            hostHtmlElement.display = 'block';
            hostHtmlElement.width = '100%';
            hostHtmlElement.height = '100%';
            hostHtmlElement.margin = '0px';
            if (!rootRect) {
                rootRect = hostHtmlElement.getBoundingClientRect();
                //rootRect = { x: rect.left, y: rect.top, left:rect.left, top:rect.top, width: rect.width, height: rect.height };
                //rootRect = rect;
            }
            //rootRect.width = rootRect.width === 0 ? Infinity : rootRect.width;
            //rootRect.height = rootRect.height === 0 ? Infinity : rootRect.height;
            //rootRect.x = rootRect.x || 0;
            //rootRect.y = rootRect.y || 0;
            Layout.initializeEventHandling(hostHtmlElement);
        }

        // Last property sinceit might trigger a render and everything should be initialized
        self.addProperty('hostElementId', {
            get: true,
            set: true,
            needsMeasure: true
        });

        // Should always remain last call
        requestAnimationFrame();// To force initial render
        return self;
    };
})(Layout || (Layout = {}));