"use strict";
var Layout;
(function (Layout) {
    var inspectorRoot;
    var inspector;
    Layout.inspect = function (element) {
        console.log(element);
        console.layoutElement = element;
        if (!inspectorRoot) {
            inspectorRoot = Layout.create({
                type: 'host',
                children: [{
                    type: 'position',
                    pointerEvents: 'none'
                }]
            });
        }
        if (!inspector) {
            inspector = new Layout.inspector(inspectorRoot.child);
        }
        inspector.setElement(element);
    }

    var skipProperties = new Set();
    skipProperties.add('type');
    //skipProperties.add('needsArrange');
    //skipProperties.add('needsRender');

    Layout.inspector = function (parent) {
        this.setElement = function (element) {
            var props = [];
            // Should be redone once we have a working grid component
            var leftStack = ({
                type: 'stack',
                //border: { right: 1 },
                padding: 3,
                orientation: 'vertical',
                children: []
            });
            var rightStack = ({
                type: 'stack',
                border: { left: 1 },
                borderColor: 'gray',
                padding: 3,
                orientation: 'vertical',
                children: []
            });
            Layout.getObjectPropertyNames(element).sort().forEach(function (name) {
                if (skipProperties.has(name)) {
                    return;
                }
                var label = {
                    type: 'text',
                    text: name,
                    horizontalAlignment: 'left'
                };
                leftStack.children.push(label);
                var value = {
                    type: 'text',
                    bindText: name,
                    horizontalAlignment: 'left'
                }
                rightStack.children.push(value);
            });
            var container = {
                type: 'stack',
                orientation: 'horizontal',
                dataSelector: 'element',
                border: { top: 1 },
                borderColor: 'gray',
                horizontalAlignment: 'left',
                verticalAlignment: 'top',
                //data: element,
                children: [leftStack, rightStack]
            }
            var topBar = {
                type: 'stack',
                orientation: 'horizontal',
                background: '#e6e6e6',
                cornerRadius: { topLeft: 4, topRight: 4 },
                children:
                    [{
                        type: 'text',
                        padding: 3,
                        dataSelector: 'element',
                        horizontalAlignment: 'left',
                        verticalAlignment: 'center',
                        bindText: 'type',
                        fontSize: '16px',
                        selectable: false
                    },
                    {
                        type: 'button',
                        horzontalAlignment: 'left',
                        verticalAlignment: 'center',
                        fontSize: '16px',
                        bindClick: 'seeParent'
                    },
                    {
                        type: 'button',
                        border: 0,
                        background: undefined,
                        text: 'X',
                        fontSize: '16px',
                        bindClick: 'close'
                    }
                    ]
            }
            var panel = {
                type: 'stack',
                id: 'elementPanel',
                border: 1,
                borderColor: 'gray',
                cornerRadius: 4,
                orientation: 'vertical',
                horizontalAlignment: 'left',
                verticalAlignment: 'top',
                background: 'white',
                children: [
                    topBar,
                    container
                ]
            }
            parent.child = Layout.create(panel);
            Layout.moveBehavior(parent.child.child);
            parent.child.child.moveTarget = 'elementPanel';
            var data = {
                element: element,
                close: function () {
                    parent.removeAllChildren();
                },
                seeParent: function () {
                    if (data.element.parent) {
                        data.element = data.element.parent;
                    }
                }
            };

            parent.child.data = data;
        }
    };
})(Layout || (Layout = {}));