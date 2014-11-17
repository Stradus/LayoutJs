"use strict";
var Layout;
(function (Layout) {
    Layout.button = function (inheritor) {
        var self = Layout.contentHost(inheritor || this);
        self.type = 'button';      
        var state;
        self.addProperty('state', {
            get: true,set:true
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
        var self = Layout.uiElement(inheritor || this, 1);
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