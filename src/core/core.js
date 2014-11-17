"use strict";
var Layout;
(function (Layout) {
    Layout.create = function (definition) {
        try {
            var element;
            // Create self
            if (typeof definition === 'string') {
                element = new Layout.text();
                element.text = definition;
            } else {
                element = new Layout[definition.type]();
            }
            for (var optionName in definition) {
                if (optionName === 'type' || optionName === 'children') {
                    continue;// skip those special meaning fields
                }
                element[optionName] = definition[optionName];
            }
            if (!definition.children) {
                return element; // No children so we are done
            }
            // Create children
            for (var i = 0; i < definition.children.length; i++) {
                element.addChild(Layout.create(definition.children[i]));
            }
        }
        catch (e) {
            console.log('Error while creating: ' + definition ? definition.type : undefined);
            throw e;
        }
        return element;
    }

    var isInitialized = false;
    //// Initialize whatever common state LayoutJS needs
    //// Does not need to be called explicitly, is called by host
    //// to make sure LayoutJS is initialized
    Layout.initialize = function () {
        if (isInitialized) {
            return;
        }
        createWindowEventHandler();

        isInitialized = true;
        return;
    };


    var propagateUp = function (element, propName, value, stopper) {
        do {
            element[propName] = value;
            element = element.parent;
        } while (element && element !== stopper);
    };
    var windowEventHandlerCreated = false;
    var createWindowEventHandler = function () {
        if (windowEventHandlerCreated) {
            return;
        }
        window.addEventListener('click', function (e) {
            if (e.target.layoutElement) {
                console.log('Created by: ' + e.target.layoutElement.type);
            } else {
                console.log('Unmanaged HTML element');
            }
        });
        var lastMouseOverElement = undefined;
        window.addEventListener('mouseover', function (e) {
            var target = e.target.layoutElement;
            if (lastMouseOverElement != target && lastMouseOverElement) {
                propagateUp(lastMouseOverElement, 'isPointerOver', false, target);
            }

            if (e.target.layoutElement) {
                propagateUp(target, 'isPointerOver', true);
                lastMouseOverElement = target;
                console.log('Pointer over: ' + e.target.layoutElement.type);
            } else {
                lastMouseOverElement = undefined;
                console.log('Unmanaged HTML element');
            }
        });
        windowEventHandlerCreated = true;
    };
})(Layout || (Layout = {}));