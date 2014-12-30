"use strict";
var Layout;
(function (Layout) {
    Layout.scrollBehavior = function (element) {
        var self = this;
        var originalMeasureSelf = element.measureSelf;
        var originalArrangeSelf = element.arrangeSelf;
        var originalCreateHtml = element.createHtml;
        var originalDesiredSize;
        element.measureSelf = function (availableSize) {
            var realAvailableSize = { width: availableSize.width, height: Infinity };
            originalDesiredSize = originalMeasureSelf(realAvailableSize);
            return { width: originalDesiredSize.width, height: Math.min(availableSize.height, originalDesiredSize.height) };
        };
        var originalArrangedSize;
        var renderSize;
        element.arrangeSelf = function (finalSize) {
            var realFinalSize = { width: finalSize.width, height: originalDesiredSize.height, x:finalSize.x, y:finalSize.y - element.verticalOffset };
            var originalArrangedSize = originalArrangeSelf(realFinalSize);
            renderSize ={ width: originalArrangedSize.width, height: finalSize.height, x: finalSize.x, y:finalSize.y };
            return renderSize;
        };

        element.addProperty('verticalOffset', {'default':0, needsArrange:true})
        element.createHtml = function () {
            var created = originalCreateHtml();
            if (created && element.html) {
                element.html.addEventListener('mousewheel', function (event) {
                    if (event.deltaY > 0) {
                        element.verticalOffset += renderSize.height;
                    }
                    if (event.deltaY < 0) {
                        element.verticalOffset -= renderSize.height;
                    }
                    console.log('Mouse wheel detected');
                });
            }
            return created;
        };

        //var targetElement;
        //element.addProperty('moveTarget', {
        //    changed: function (v) {
        //        targetElement = element.findAncestorElementById(v) || element;
        //    }
        //});
        //var pointerStartPosition = undefined;
        //var elementStartPosition = undefined;
        //element.addAutoEvent('startMoving', 'isPointerDown');
        //element.startMoving = function () {
        //    //console.log('Move started');
        //    pointerStartPosition = element.pointerPosition;
        //    elementStartPosition = { x: targetElement.x, y: targetElement.y };
        //};

        //element.addAutoEvent('endMoving', 'isPointerDown', true);
        //element.endMoving = function () { console.log('Move ended'); pointerStartPosition = undefined; };

        //element.addProperty('pointerPosition', {
        //    changed: function (v) {

        //        if (pointerStartPosition && targetElement) {
        //            //console.log('Pointe changed while moving');
        //            targetElement.x = elementStartPosition.x + v.x - pointerStartPosition.x;
        //            targetElement.y = elementStartPosition.y + v.y - pointerStartPosition.y;
        //        } else {
        //            //console.log('Pointe changed whithout moving');
        //        }
        //    }
        //});

        return self;
    };
})(Layout || (Layout = {}));