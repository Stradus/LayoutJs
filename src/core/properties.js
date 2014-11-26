"use strict";
var Layout;
(function (Layout) {
    var recordAccess = false;
    var cascadingProperties = new Set();
    var bindings = new WeakMap();

    Layout.dataBind = function (element, elementPropertyName, bindingExpression) {
        //if (element.data.hasOwnProperty(bindingExpression)) {
        //    Layout.connectWithProperty(element, elementPropertyName, element.data, false);
        //}
        var binding = {
            element: element,
            elementPropertyName: elementPropertyName,
            bindingExpression: bindingExpression,
            data: undefined
        }
        if (!bindings.has(element)) {
            var elementBindings = new Map();
            bindings.set(element, elementBindings);
        } else {
            elementBindings = bindings.get(element);
        }
        elementBindings.set(elementPropertyName, binding);

    };

    var updateBinding = function (binding) {
        if (binding.data !== binding.element.data) {
            Layout.connectWithProperty(binding.element,
                binding.elementPropertyName, binding.element.data, binding.bindingExpression, false);
            binding.data = binding.element.data;
        }
    };

    Layout.updateBindings = function (element) {
        if (element.data && bindings.has(element)) {
            bindings.get(element).forEach(updateBinding);
        }
    };


    var activeBindingProperty = undefined;
    Layout.connectWithProperty = function (element, elementPropertyName, object, objectPropertyName, createObjectProperty) {
        var elementProperty = getProperty(element, elementPropertyName);
        if (!elementProperty) {
            throw "Element has no property: " + elementPropertyName;
        }
        // Can be done nicer by integrating with code below, but now we did not have to change the code,
        // Needs optimization later
        if (createObjectProperty && !object.hasOwnProperty(objectPropertyName)) {
            object[objectPropertyName] = undefined;
        }

        if (object.hasOwnProperty(objectPropertyName)) {
            var property = getProperty(object, objectPropertyName);
            if (!property) {
                var desc = Object.getOwnPropertyDescriptor(object, objectPropertyName);
                if (!desc) {
                    throw "Can not bind to non-existing property: " + objectPropertyName;
                }
                if (desc.configurable === false) {
                    throw "Can not create two way binding. This property cannot be configured: " + objectPropertyName;
                }
                var property = {
                    element: object,
                    name: objectPropertyName,
                    isForeign: true,
                    value: object[objectPropertyName],
                    valueSet: true,
                    partners: new Set(),
                    subscribers: new Set(),
                    originalGet: desc.get,
                    originalSet: desc.set
                }
                var o = {
                    get: function () {
                        if (recordAccess) {
                            accessedForRead(property);
                        }
                        if (property.originalGet) {
                            // Call get function, since it might calculate values only on demand
                            // and not use set at all,this would however probably cause problems
                            // to automatic two-way binding
                            property.value = property.originalGet();
                        }
                        return property.value;
                    },
                    set: function (v) {
                        if (recordAccess) {
                            accessedForWrite(property);
                        }
                        var originalValue = property.value;
                        if (property.originalSet) {
                            property.originalSet(v);
                            if (property.originalGet) {
                                property.value = property.originalGet();
                            } else {
                                property.value = v;
                            }
                        } else {
                            property.value = v;
                        }

                        if (originalValue !== property.value) {
                            handlePartners(property);
                            handleSubscribers(property);
                        }
                    },
                    configurable: true
                }
                Object.defineProperty(object, objectPropertyName, o);
                addElementPropertyToMap(property);
                console.log("New property wrapper created for: " + objectPropertyName);
            }
        } else {
            throw "Non-existing property name on object: " + objectPropertyName;
        }
        property.partners.add(elementProperty);
        elementProperty.partners.add(property);
        elementProperty.element[elementProperty.name] = property.element[property.name];
    };

    var propertyMap = new WeakMap();
    var addElementPropertyToMap = function (property) {
        addObjectPropertyToMap(property.element, property.name, property);
    };
    var addObjectPropertyToMap = function (object, name, property) {
        var v = propertyMap.get(object);
        if (!v) {
            v = new Map();
            propertyMap.set(object, v);
        }
        v.set(name, property);
    }

    var getProperty = function (element, propertyName) {
        var map = propertyMap.get(element);
        if (!map) {
            return map;
        }
        return map.get(propertyName);
    }
    var handlePartners = function (property) {
        activeBindingProperty = activeBindingProperty || property;
        try {
            property.partners.forEach(function (p) {
                if (p !== activeBindingProperty) {
                    p.element[p.name] = property.value;
                }
            });
        }
        finally {
            activeBindingProperty = undefined;
        }
    }

    var handleSubscribers = function (property) {
        property.subscribers.forEach(function (p) {
            p.updateValue();
        });
    };

    Layout.applyCascade = function (element) {
        if (!element.parent) {
            return;
        }
        cascadingProperties.forEach(function (name) {
            element[name] = element.parent[name];
        })
    }

    Layout.addProperty = function (element, name, options) {
        if (!options) {
            options = { get: true, set: true };
        }
        if (typeof options === 'function') {
            options = { get: true, set: true, changed: options };
        }
        if (options.cascading) {
            cascadingProperties.add(name);
        }
        var property = {
            element: element,
            name: name,
            value: null, // Helps for debugging, this value shold never be observed
            valueSet: false,
            changed: options.changed,
            filter: options.filter,
            subscribers: new Set(),
            partners: new Set(),
            needsMeasure: options.needsMeasure,
            needsArrange: options.needsArrange,
            needsRender: options.needsRender,
            cascade: options.cascade
        };

        if (Layout.performance.checkValidPropertyValues && options.validValues) {
            property.validValues = new Set();
            for (var i = 0; i < options.validValues.length; i++) {
                property.validValues.add(options.validValues[i]);
            }
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
                if (property.validValues) {
                    if (!property.validValues.has(v)) {
                        throw "Incorrect value(" + v + ") for property: " + property.name;
                    }
                }
                if (recordAccess) {
                    accessedForWrite(property);
                }
                //if (property.valueSet && v === property.value) {
                //    return;
                //}
                property.valueSet = true;
                if (property.filter) {
                    var newValue = property.filter(v);
                } else {
                    newValue = v;
                }
                if (newValue === property.value) {
                    return;
                }
                property.value = newValue;
                if (property.changed) {
                    property.changed(property.value);
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
                if (property.cascade) {
                    property.element.visualChildren.forEach(function (c) {
                        c[property.name] = property.value;
                    });
                }
                handlePartners(property);
                handleSubscribers(property);

            };
        }
        Object.defineProperty(element, name, o);
        o.set(options.default);
        addElementPropertyToMap(property);
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
                handleSubscribers(property);
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
        addElementPropertyToMap(property);
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