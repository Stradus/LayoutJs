"use strict";
var Layout;
(function (Layout) {
    var recordAccess = false;
    var accessedForRead = function (property) {

    };
    var accessedForWrite = function (property) {

    };

    Layout.addProperty = function (element, name, options) {
        var property = {
            element: element,
            name: name,
            value: options.default,
            onChange: options.onChange,
            needsMeasure: options.needsMeasure,
            needsArrange: options.needsArrange,
            needsRender: options.needsRender
        };
        var o = {};
        if (options.get) {
            o.get = function () {
                if (recordAccess) {
                    accessedForRead(property);
                }
                return property.value;
            };
        };
        if (options.set) {
            // If there is a perf bottleneck, one could pre-create separate functions for 
            // all these cases
            o.set = function (v) {
                if (recordAccess) {
                    accessedForWrite(property);
                }
                if (property.onChange) {
                    property.value = property.onChange(v);
                } else {
                    property.value = v;
                }
                if (property.needsMeasure) {
                    property.element.needsMeasure = true;
                }
                if (property.needsArrange) {
                    property.element.needsArrange = true;
                }
                if (property.needsRender) {
                    property.element.needsRender = true;
                }
                
            }
        };
        Object.defineProperty(element, name, o);
    };


})(Layout || (Layout = {}));