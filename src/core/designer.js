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
                padding:3,
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
                border: { top: 1 },
                borderColor: 'gray',
                horizontalAlignment: 'left',
                verticalAlignment: 'top', 
                //data: element,
                children: [leftStack, rightStack]
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
                    {
                        type: 'text',
                        padding: 3,
                        //horizontalAlignment: 'left',
                        background: '#e6e6e6',
                        bindText: 'type',
                        fontSize: '16px',
                        cornerRadius: { topLeft: 4, topRight: 4 },
                        selectable:false
                    },
                    container
                ]
            }            
            parent.child = Layout.create(panel);
            Layout.moveBehavior(parent.child.child);
            parent.child.child.moveTarget = 'elementPanel';

            parent.child.data = element;
        }
    };
})(Layout || (Layout = {}));