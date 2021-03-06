"use strict";
var Layout;
(function (Layout) {
    var templateHosts = [];
    Layout.create = function (definition, templateHost) {
        //try {
            if (templateHost) {
                templateHosts.push(templateHost);
            }
            var element;
            // Create self
            if (typeof definition === 'string') {
                element = new Layout.text();
                element.text = definition;
            } else {
                element = new Layout[definition.type]();
            }

            if (templateHost && definition.isContentHost) {
                templateHost.setLogicalDescendant(element);
            };

            // first apply template, and then the rest
            element.protected.applyTheme();
            for (var optionName in definition) {
                if (optionName === 'type' || optionName === 'children' || optionName === 'child'
                    || optionName === 'hoistProperties' ||
                    optionName === 'isContentHost' || optionName === 'behaviors') {
                    continue;// skip those special meaning fields
                }
                // detect bindings (bindings start iwth word 'bind' e.g. bindHorizontalAlignment
                if (optionName.length > 4 && optionName.lastIndexOf('bind') === 0) {
                    var propertyName = optionName[4].toLowerCase() + optionName.slice(5);
                    Layout.dataBind(element, propertyName, definition[optionName]);
                }
                else {
                    element[optionName] = definition[optionName];
                }
            }
            if (definition.hasOwnProperty('hoistProperties')) {
                definition.hoistProperties.forEach(function (name) {
                    Layout.connectProperties(element, name, templateHost, name, true);
                });
            }
            if (definition.hasOwnProperty('behaviors') ){
                var behaviors = definition.behaviors;
                for(var i = 0;i<behaviors.length;i++){
                    Layout[behaviors[i] + 'Behavior'](element);
                }                
            }
            if (definition.hasOwnProperty('child') &&
                definition.hasOwnProperty('children')) {
                throw "Element can not be defined with both child and children property."
            }

            var children = definition.children || (definition.child ? [definition.child] : undefined);
            if (!children) {
                return element; // No children so we are done
            }
            // Create children
            for (var i = 0; i < children.length; i++) {
                element.addChild(Layout.create(children[i]));
            }
        //}
        //catch (e) {
        //    console.log('Error while creating: ' + definition ? definition.type : undefined);
        //    throw e;
        //}
        
    //finally {
            templateHosts.pop(templateHost);
    //    }
        return element;
    }
    Layout.settings = {
        inspect: true,
        inspectFilter: function (event) {
            return event.ctrlKey
        }
    };
    var initializeThemes = function () {
        Layout.defineProperty(Layout, 'theme', {
            useOld: false,
            'default': tempTheme,
            filter: function (v) {
                if (typeof v === 'string') {
                    // Try to resolve theme name, (Can add extensible resolving of themes later if use case arises)
                    if (!LayoutThemes.hasOwnProperty(v)) {
                        throw "Could not find theme based on name (" + v + "), use Layout.themeData instead.";
                    }
                    cleanResources();
                    addStylesToResources(LayoutThemes[v].styles);
                    return LayoutThemes[v];

                }
                return v;
            }
        });
    }

    // Temporary theme property, before initialization of LayoutJS, makes it possible to call it first
    var tempTheme = 'bootstrapped';
    Object.defineProperty(Layout, 'theme', {
        get: function () { Layout.initialize(); return tempTheme; },
        set: function (v) { tempTheme = v; Layout.initialize(); }, configurable: true
    });

    var resources;
    var cleanResources = function () {
        resources = {
            byType: new Map()
        };
    }
    var addStylesToResources = function (styles) {
        if (!styles) {
            return;
        }
        if (!Array.isArray(styles)) {
            addStyleToResources(styles);
        }
        styles.forEach(addStyleToResources);
    };
    var addStyleToResources = function (style) {
        if (style.hasOwnProperty('targetType')) {
            var desc = Object.getOwnPropertyDescriptor(style, 'targetType');
            if (desc.configurable) {
                desc.enumerable = false;
                Object.defineProperty(style, 'targetType', desc);
            } else {
                console.warn('Could not set tartgetType to non-enumerable');
            }
            resources.byType.set(style.targetType, style);
            return;
        }
        throw "Style misses a target Type";
    };
    Layout.getThemeStyleForElement = function (element) {
        return resources.byType.get(element.type);
    }



    var isInitialized = false;
    //// Initialize whatever common state LayoutJS needs
    //// Does not need to be called explicitly, is called by host
    //// to make sure LayoutJS is initialized
    Layout.initialize = function () {
        if (isInitialized) {
            return;
        }
        cleanResources();
        initializeThemes();
        //createWindowEventHandler();

        isInitialized = true;
        return;
    };

    //Layout._needWebkitTransform = false;

    //var checkForTransform = function () {
    //    var div = document.createElement('div');

    //}

    var elementsWithEventHandlers = new WeakMap();
    Layout.initializeEventHandling = function (hostHtmlElement) {
        if (elementsWithEventHandlers.has(hostHtmlElement)) {
            console.log('evenet handlers where alredy created for the host element');
            return;
        }
        var propagateUp = function (element, propName, value, stopper) {
            do {
                element[propName] = value;
                element = element.parent;
            } while (element && element !== stopper);
        };
        var getLayoutElementParent = function (htmlElement) {
            while (!htmlElement.layoutElement) {
                if (htmlElement.parentElement === null) {
                    return undefined;
                }
                htmlElement = htmlElement.parentElement;
            }
            return htmlElement.layoutElement;
        }

        var lastMouseOverElement = undefined;
        var mouseOverFunc = function (e) {
            var target = getLayoutElementParent(e.target);
            if (lastMouseOverElement != target && lastMouseOverElement) {
                propagateUp(lastMouseOverElement, 'isPointerOver', false, target);
            }

            if (target) {
                propagateUp(target, 'isPointerOver', true);
                lastMouseOverElement = target;
                //console.log('Pointer over: ' + e.target.layoutElement.type);
            } else {
                lastMouseOverElement = undefined;
                //console.log('Unmanaged HTML element');
            }
        };
        hostHtmlElement.addEventListener('mouseover', mouseOverFunc);
        var lastPointerDownElement = undefined;
        var pointerDownFunc = function (e) {
            var target = getLayoutElementParent(e.target);
            if (lastPointerDownElement) {
                propagateUp(target, 'isPointerDown', false);
                if (e.touches) {
                    propagateUp(target, 'isPointerOver', false);
                }
                lastPointerDownElement = undefined;
            }

            if (target) {
                if (Layout.settings.inspect && Layout.settings.inspectFilter(e)) {
                    e.preventDefault();
                    Layout.inspect(target);
                    return false;
                }
                setPointerPositions(e, target);
                if (e.touches) {
                    propagateUp(target, 'isPointerOver', true);
                }
                propagateUp(target, 'isPointerDown', true);
                lastPointerDownElement = target;
                // Prevent selection unless element is selectable
                if (!target.selectable && !target.allowDefault) {
                    e.preventDefault();
                }
            }
        };
        hostHtmlElement.addEventListener('mousedown', pointerDownFunc);

        hostHtmlElement.addEventListener('touchstart', pointerDownFunc);

        // Needed when host element is not root in the document
        hostHtmlElement.addEventListener('mouseleave', mouseOverFunc);

        var pointerUpFunc = function (e) {
            var target = getLayoutElementParent(e.target);
            if (lastPointerDownElement) {
                propagateUp(lastPointerDownElement, 'isPointerDown', false);
                if (e.touches) {
                    propagateUp(target, 'isPointerOver', false);
                }
                lastPointerDownElement = undefined;
            }
            e.preventDefault();
        };
        hostHtmlElement.addEventListener('mouseup', pointerUpFunc);
        hostHtmlElement.addEventListener('touchend', pointerUpFunc);


        var setPointerPositions = function (event, element) {
            if (element.hasOwnProperty('pointerPosition')) {
                //var pos = { x: event.offsetX, y: event.offsetY };
                if (event.touches) {
                    var pos = { x: event.touches[0].screenX, y: event.touches[0].screenY };
                }
                else {
                    var pos = { x: event.screenX, y: event.screenY };
                }
                Object.freeze(pos); //Freezing to prevent accidents
                element.pointerPosition = pos;
            }
        }

        var pointerMoveFunc = function (e) {
            if (lastPointerDownElement) {
                //console.log("Moving in element");
                setPointerPositions(e, lastPointerDownElement);
            } else {
                //console.log("Moving without element");
            }
            //var target = getLayoutElementParent(e.target);
            //if (lastPointerDownElement) {
            //    propagateUp(lastPointerDownElement, 'isPointerDown', false);
            //    lastPointerDownElement = undefined;
            //}
            e.preventDefault();
        };
        hostHtmlElement.addEventListener('mousemove', pointerMoveFunc);
        hostHtmlElement.addEventListener('touchmove', pointerMoveFunc);

        hostHtmlElement.addEventListener('dragstart', function (e) {
            e.preventDefault();
            return false;
        });


        // Only add now, since an error might have occured earlier
        elementsWithEventHandlers.set(hostHtmlElement, true);
    };


})(Layout || (Layout = {}));