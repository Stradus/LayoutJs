"use strict";
var Layout;
(function (Layout) {
    var recordAccess = false;


    Layout.addProperty = function (element, name, options) {
        if (!options) {
            options = { get: true, set: true };
        }
        if(typeof options === 'function'){
            options = { get: true, set: true, onChange:options };
        }
        var property = {
            element: element,
            name: name,
            value: null, // Helps for debugging, this value shold never be observed
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
        return property;
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
            var value = property.compute(property.value);
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
            value: undefined,
            subscribers: new Set(),
            compute: compute,
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
        return property;
    };

    Layout.peekPropertyValue = function (element, name) {
        var state = recordAccess;
        recordAccess = false;
        try {
            var value = element[name];
        }
        finally {
            recordAccess = state;
        }
        return value;
    }

    Layout.addTriggeredEvent = function (element, name, trigger) {
        var property = {
            element: element,
            name: name,
            value: null,
            //subscribers: new Set(), //Triggered event properties are internal and can never have subscribers
            compute: trigger,
            handlers: new Set(),
            isTriggered: false,
            updateValue: function () {
                property.value = evaluateProperty(property);
                if (property.value && !property.isTriggered) {
                    runHandlers();
                    property.isTriggered = true;
                    return;
                }
                if (!property.value) {
                    property.isTriggered = false;
                }
            }
        };
        var runHandlers = function () {
            if (property.handlers.size > 0) {
                var event = {
                    element: property.element,
                    name: property.name
                };
                //Object.freeze(event);
                property.handlers.forEach(function (h) {
                    h(event);
                });
            }
        };
        var handlerManager = {
            addHandler: function (handler) {
                property.handlers.add(handler);
            },
            removeHandler: function (handler) {
                property.handlers.delete(handler);
            },
            removeAllHandlers: function () {
                property.handlers.clear();
            },
            triggerNow: function () {
                runHandlers();
            }
        };
        Object.freeze(handlerManager);
        Object.defineProperty(element, name, {
            get: function () { return handlerManager },
            set: function (v) {
                handlerManager.addHandler(v);
            }
        });
        property.updateValue();
        return property;
    };


})(Layout || (Layout = {}));