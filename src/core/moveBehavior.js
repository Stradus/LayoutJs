"use strict";
var Layout;
(function (Layout) {
    Layout.moveBehavior = function (element) {
        var self = this;
        var targetElement;
        element.addProperty('moveTarget', {
            changed: function (v) {
                targetElement = element.findAncestorElementById(v)||element;
            }
        });
        var pointerStartPosition = undefined;
        var elementStartPosition = undefined;
        element.addAutoEvent('startMoving', 'isPointerDown' );
        element.startMoving = function () {
            //console.log('Move started');
            pointerStartPosition = element.pointerPosition;
            elementStartPosition = { x: targetElement.x, y: targetElement.y };
        };

        element.addAutoEvent('endMoving', 'isPointerDown', true);
        element.endMoving = function () { console.log('Move ended'); pointerStartPosition =undefined; };

        element.addProperty('pointerPosition', {
            changed: function (v) {
                
                if (pointerStartPosition && targetElement) {
                    //console.log('Pointe changed while moving');
                    targetElement.x = elementStartPosition.x + v.x - pointerStartPosition.x;
                    targetElement.y = elementStartPosition.y + v.y - pointerStartPosition.y;
                } else {
                    //console.log('Pointe changed whithout moving');
                }
            }
        });

        return self;
    };
})(Layout || (Layout = {}));