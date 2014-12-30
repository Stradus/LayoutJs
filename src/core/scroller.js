"use strict";
var Layout;
(function (Layout) {
    Layout.scroller = function (inheritor) {
        var self = Layout.contentHost(inheritor || this);
        self.type = 'scroller';

        self.addProperty('verticalOffset', { 'default': 0, needsArrange: true });

        var originalDesiredSize;
        self.measureSelf = function (availableSize) {
            var realAvailableSize = { width: availableSize.width, height: Infinity };
            self.child.measure(realAvailableSize);
            originalDesiredSize = self.child.desiredSize;
            return { width: originalDesiredSize.width, height: Math.min(availableSize.height, originalDesiredSize.height) };
        };
        var originalArrangedSize;
        var renderSize;
        
        self.arrangeSelf = function (finalSize) {
            var realFinalSize = { width: finalSize.width, height: originalDesiredSize.height, x: finalSize.x, y: - self.verticalOffset };
            self.child.arrange(realFinalSize);
            originalArrangedSize = self.child.actualSize;
            renderSize = { width: originalArrangedSize.width, height: finalSize.height, x: finalSize.x, y: finalSize.y };
            return renderSize;
        };
        var originalCreateHtml = self.createHtml;
        self.createHtml = function () {
            var created = originalCreateHtml();
            if (created && self.html) {
                self.html.addEventListener('wheel', function (event) {
                    //if (event.deltaY > 0) {
                    //    self.verticalOffset += renderSize.height;
                    //}
                    //if (event.deltaY < 0) {
                    //    self.verticalOffset -= renderSize.height;
                    //}
                    var verticalOffset = self.verticalOffset + event.deltaY;
                    self.verticalOffset = Math.max(0, Math.min( verticalOffset, originalArrangedSize.height -renderSize.height) );// event.deltaY;
                    console.log('Mouse wheel detected');
                });
            }
            return created;
        };

        return self;
    }
})(Layout || (Layout = {}));