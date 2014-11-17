"use strict";
var Layout;
(function (Layout) {
    var recordAccess = false;


    Layout.addProperty = function (element, name, options) {
        var property = {
            element: element,
            name: name,
            value: null, // Helps for debugging, this value shold never be observde
            valueSet: false,
            onChange: options.onChange,
            subscribers: new Set(),
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
                if (property.valueSet && v === property.value) {
                    return;
                }
                property.valueSet = true;
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
                property.subscribers.forEach(function (p) {
                    p.updateValue();
                });
            }
        };
        Object.defineProperty(element, name, o);
        o.set(options.default);
    };

    var targetProperty;
    var subscribers = new Set();
    var accessedForRead = function (property) {
        if (property === targetProperty) {
            //Nothing to do, we dont subscribe to ourself!
            return;
        }
        property.subscribers.add(targetProperty);
        subscribers.add(property);
    };
    var writeAccessSet;
    var accessedForWrite = function (property) {

    };
    var evaluateProperty = function (property) {
        recordAccess = true;
        subscribers.clear();
        try {
            targetProperty = property;
            var value = property.compute();
        }
        finally {
            recordAccess = false;
        }
        return value;
    };
    Layout.addTriggeredProperty = function (element, name, compute) {
        var property = {
            element: element,
            name: name,
            value: null,
            subscribers: new Set(),
            compute:compute,
            updateValue: function () {
                property.value = evaluateProperty(property);
                property.subscribers.forEach(function (p) {
                    p.updateValue();
                });
            }
        };
        var o = {};
        o.get = function () {
            if (recordAccess) {
                accessedForRead(property);
            }
            return property.value;
        };
        Object.defineProperty(element, name, o);
        property.updateValue();
    };

})(Layout || (Layout = {}));