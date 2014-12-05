"use strict";
var Layout;
(function (Layout) {

    var propertyStore = new WeakMap();

    var addPropertyToStore = function (property) {
        var objectProperties = propertyStore.get(property.object);
        if (!objectProperties) {
            objectProperties = new Map();
            propertyStore.set(property.object, objectProperties);
        }
        objectProperties.set(property.name, property);
    }
    var getPropertyFromStore = function (object, name) {
        var objectProperties = propertyStore.get(object);
        if (!objectProperties) {
            return;
        }
        return objectProperties.get(name);
    }
    Layout.getObjectPropertyNames = function (object) {
        var objectProperties = propertyStore.get(object);
        if (!objectProperties) {
            return[];
        }
        var names = [];
        objectProperties.forEach(function (p) {
            names.push(p.name);
        });
        return names;
    }



    var propertyStack = [];
    var logReadAccess = false;
    var propertyReadAccessed = function (readProperty) {
        var activeProperty = propertyStack[propertyStack.length - 1];
        readProperty.subscribers.add(activeProperty);
        activeProperty.dependents.add(readProperty);
    };
    var logWriteAccess = false;
    var propertyWriteAccess = function (property) {

    }
    var calculateNewValue = function (property) {
        if (!property.expression) {
            return;
        }
        propertyStack.push(property);
        //property.subscribers.clear();
        var oldDependents = property.dependents;
        property.dependents = new Set();
        var oldAccess = logReadAccess;
        logReadAccess = true;
        try { // In try finally to not let bad expressions mess up dependency system completely
            property.object[property.name] = property.expression();
        } finally {
            logReadAccess = oldAccess;
            property.dependents.forEach(function (p) {
                oldDependents.delete(p);
            })
            oldDependents.forEach(function (p) {
                p.subscribers.delete(property);
            });
            propertyStack.pop();
        }
    }

    var getOrCreateLayoutProperty = function (object, name, useOld) {
        var property = getPropertyFromStore(object, name);
        if (property) {
            return property;
        }
        property = {
            object: object,
            name: name,
            currentValue: undefined,
            filter: undefined,
            get: undefined,
            set: undefined,
            subscribers: new Set(),
            callbacks: new Set(),
            dependents: new Set(),
            propertyChanged: calculateNewValue
        };
        if (useOld !== false && object.hasOwnProperty(name)) {
            console.log('Wrapping existing property: ' + name);
            // It already exists so we have to wrap it
            var definition = Object.getOwnPropertyDescriptor(object, name);
            if (!definition.configurable) {
                throw "Cannot change property: " + name
            }
            if (definition.get) {
                property.originalGet = definition.get;
            }
            if (definition.set) {
                property.originalSet = definition.set;
            }
            property.currentValue = object[name];
        }
        var oldGetInprogress = false;
        var getFunc;
        // Two separate functions, so that we dont suffer the non-optimiztion of try finally
        // when the code will never be used
        if (property.originalGet) {
           getFunc = function () {
                if (logReadAccess) {
                    propertyReadAccessed(property);
                }
                if (property.originalGet) {
                    oldGetInprogress = true;
                    try {
                        property.object[property.name] = property.originalGet();
                    }
                    finally {
                        oldGetInprogress = false;
                    }
                }
                return property.currentValue;
            }
        } else {
            getFunc = function () {
                if (logReadAccess) {
                    propertyReadAccessed(property);
                }
                return property.currentValue;
            }
        }

        Object.defineProperty(object, name, {
            configurable: true,
            set: function (newValue) {
                if (logWriteAccess) {
                    propertyWriteAccess(property);
                }
                if (property.validValues) {
                    if (!property.validValues.has(newValue)) {
                        throw "Invalid value (" + newValue + ") for property(" + property.name + ").";
                    }
                }
                if (property.filter) {
                    newValue = property.filter(newValue);
                }
                if (newValue === property.currentValue) {
                    return;
                }
                property.currentValue = newValue;
                if (!oldGetInprogress && property.originalSet) {
                    property.originalSet(property.currentValue);
                }
                property.subscribers.forEach(function (p) {
                    p.propertyChanged(p, property);
                });
                property.callbacks.forEach(function (c) {
                    c(property.currentValue);
                });
                if (property.needsMeasure) {
                    property.object.needsMeasure = true;
                }
                if (property.needsArrange) {
                    property.object.needsArrange = true;
                }
                if (property.needsRender) {
                    property.object.needsRender = true;
                }

                //if (property.cascade) {
                //    Layout.applyCascade(property)
                //}
            },
            get: getFunc
        });
        addPropertyToStore(property);
        return property;
    }

    Layout.isPropertyDefined = function (object, name) {
        return getPropertyFromStore(object, name);
    };

    Layout.getProperty = function (object, name) {
        return getPropertyFromStore(object, name);
    };

    Layout.defineProperty = function (object, name, options) {
        var property = getOrCreateLayoutProperty(object, name, options ? options.useOld : undefined);
        if (!options) {
            return property;
        }
        if (options.hasOwnProperty('filter')) {
            property.filter = options.filter;
        }
        if (options.hasOwnProperty('validValues')) {

            if (options.validValues) {
                //property.validValues = new Set(options.validValues); Not supported in IE 11
                property.validValues = new Set();
                for (var i = 0; i < options.validValues.length; i++) {
                    property.validValues.add(options.validValues[i]);
                }
            } else {
                property.validValues = undefined;
            }
        }

        if (options.hasOwnProperty('needsMeasure')) {
            property.needsMeasure = options.needsMeasure;
        }
        if (options.hasOwnProperty('needsArrange')) {
            property.needsArrange = options.needsArrange;
        }
        if (options.hasOwnProperty('needsRender')) {
            property.needsRender = options.needsRender;
        }
        if (options.hasOwnProperty('changed')) {
            if (property.changed) {
                // Remove old one
                property.callbacks.delete(property.changed);
            }
            property.changed = options.changed;
            property.callbacks.add(options.changed);
        }
        if (options.hasOwnProperty('default')) {
            property['default'] = options['default'];
            //property.currentValue = options['default'];
            property.object[property.name] = options['default'];
        }
        if (options.hasOwnProperty('expression')) {
            property.expression = options.expression;
            calculateNewValue(property);
        }
        //if (options.hasOwnProperty('cascade')) {
        //    property.cascade = options.cascade;
        //    Layout.applyCascade(object, name);
        //}
        return property;
    };

    Layout.connectProperties = function (objectA, nameA, objectB, nameB) {
        var propertyA = getOrCreateLayoutProperty(objectA, nameA);
        var propertyB = getOrCreateLayoutProperty(objectB, nameB);
        propertyA.callbacks.add(function (v) { objectB[nameB] = v; });
        propertyB.callbacks.add(function (v) { objectA[nameA] = v; });
        objectA[nameA] = objectB[nameB];
    };

    //Function.prototype.dependsOn = function (d) {
    //    this.__layoutDependencies = d;
    //    return this;
    //}

    Layout.dataBind = function (object, name, expression, dependents) {
        var property = getOrCreateLayoutProperty(object, name);
        var lastData;
        if (typeof expression === 'string') {
            // Make sure property exists

            property.expression = function () {
                var data = object.data;
                if (data) {
                    if (lastData !== data) {
                        lastData = data;
                        getOrCreateLayoutProperty(data, expression);
                    }
                    return data[expression];
                }
            };
        }
        else if (typeof expression === 'function') {
            property.expression = function () {
                return expression.call(object.data, object);
            };
        } else if (typeof expression === 'object') {
            expression.dependents = expression.dependents || [];
            var dataDependencies = [];
            for (var i = 0; i < expression.dependents.length; i++) {
                var dependent = expression.dependents[i];
                if (typeof dependent === 'string') {
                    dataDependencies.push(dependent);
                } else {
                    getOrCreateLayoutProperty(dependent.object, dependent.name);
                }
            }
            property.expression = function () {
                var data = object.data;
                if (data) {
                    if (lastData !== data) {
                        lastData = data;
                        dataDependencies.forEach(function (name) {
                            getOrCreateLayoutProperty(data, name);
                        });
                    }
                }
                return expression.expression.call(data || {}, object);
            }
        } else {
            throw "Inavlid expression type: " + (typeof expression);
        }
        // And now run it
        //object[name] = property.expression();
        calculateNewValue(property);
    };

    Layout.peekPropertyValue = function (object, name) {
        var property = getPropertyFromStore(object, name);
        if (!property) {
            return;
        }
        return property.currentValue;
    }



    Layout.defineEventProperty = function (object, name, autoTrigger, invert) {
        var property = Layout.defineProperty(object, name, {
            filter: function (v) {
                if (typeof v !== 'array') {
                    return [v];
                }
                return v;
            }
        });
        property.run = function (v) {
            if (property.currentValue) {
                property.currentValue.forEach(function (s) {
                    s(v);
                });
            }
        };
        var isFired = false;
        if (autoTrigger) {
            if (typeof autoTrigger === 'string') {
                autoTrigger = getPropertyFromStore(property.object, autoTrigger);
            }
            autoTrigger.callbacks.add(function (v) {
                var value = invert?!v:v;                
                if (value && !isFired) {
                    property.run();
                }
                if (!value) {
                    isFired = false;
                }
            });
        }
        return property;
    }

    //Layout.applyCascade = function () {

    //}

})(Layout || (Layout = {}));