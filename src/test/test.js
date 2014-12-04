"use strict";
var LayoutTest;
(function (LayoutTest) {
    LayoutTest.test = function () {
        var staticText = 'Static Text';
        var dataBinding = {
            type: 'stack',
            orientation: 'vertical',
            horizontalALignment: 'left',
            children: [
            {
                type: 'text',
                bindText: 'textValue'
            },
            {
                type: 'text',
                dataSelector: 'sub',
                bindText: 'subValue'
            },
            {
                type: 'text',
                dataSelector: 'sub',
                bindText: function () { return staticText }
            },
            {
                type: 'text',
                dataSelector: 'sub',
                bindText: //'{{this.firstName}}, {{this.lastName}}'
                    {
                        expression: function () {
                            return (this.firstName || 'No first name') + ', ' + (this.lastName || 'No last name');
                        },
                        dependents: ['firstName', 'lastName']
                    }
            },
            {
                type: 'text',
                dataSelector: 'sub',
                bindText: //'First: {{this.firstName}}, Last: {{this.lastName}}'
                    {
                        expression: function () {
                            return 'First: ' + (this.firstName || 'No first name') + ', Last: ' + (this.lastName || 'No last name');
                        },
                        dependents: ['firstName', 'lastName']
                    }
            },
            {
                type: 'button',
                bindClick: 'updateDataHandler',
                text: "Change data"
            },
            {
                type: 'text',
                bindText: 'smartOne'
            },
            {
                type: 'button',
                id: 'inspectButton',
                text: 'Inspect Self',
                bindClick: 'inspectSelf',
            }
            //{ 
            //    type:'position',
            //    pointerEvents: 'none',
            //    children:
            //[{
            //    type: 'text',
            //    text: 'Text with move behavior'
            //},
            //{
            //    type: 'button',
            //    text: 'Button with move behavior'
            //}]
            //}
            ]
        };

        var buttonStack = {
            type: 'stack',
            horizontalAlignment: 'center',
            verticalAlignment: 'center',
            orientation: 'vertical',
            children: [{
                type: 'button',
                bindClick: 'clickHandler',
                text: "Button Text"
            }, {
                type: 'button',
                isDisabled: true,
                click: function () { console.log('click') },
                bindText: 'secondButtonText'
            }, {
                type: 'button',
                click: function () { console.log('click') },
                bindText: 'thirdButtonText'
            }, {
                type: 'button',
                click: function () { console.log('click') },
                text: "Fourth Button",
            }
            , {
                type: 'split',
                orientation: 'horizontal',
                background: 'gray',
                cornerRadius: 4,
                border: 1,
                children: [
                    {
                        type: 'contentHost',
                        background: 'green',
                        padding: 5,
                        horizontalAlignment: 'stretch'
                    },
                    {
                        type: 'contentHost',
                        background: 'red',
                        padding: 5,
                        horizontalAlignment: 'stretch'
                    },
                ]
            }, {
                type: 'file',
                text: 'Upload files...'
            }, {
                type: 'file',
                selectionMode: 'directory',
                text: 'Upload directory...'
            }
        //    , {
        //    type: 'button',
        //    click: function () { console.log('click') },
        //    text: "Last Button",
        //}

            ]
        };
        var definition = {
            type: 'host',
            children: [{
                type: 'contentHost',
                horizontalAlignment: 'stretch',
                verticalAlignment: 'stretch',
                children: [{
                    type: 'stack',
                    horzontalAlignment: 'center',
                    verticalAlignment: 'center',
                    orientation: 'horizontal',
                    children: [
                        buttonStack, dataBinding
                    ]
                }
                ]
            }]
        };

        var o = Layout.create(definition);
        var data = {
            secondButtonText: 'Data Bound Text for this Button',
            thirdButtonText: 'Should not be visible',
            clickHandler: function () { console.log('Clicked') },
            sub: { subValue: 'Hello submodel' },
            inspectSelf : function(){Layout.inspect(o.findElementById('inspectButton'))}
        };
        var smartValue = 'This should not show';
        Object.defineProperty(data, 'smartOne', { configurable: true, get: function () { return smartValue; }, set: function (v) { smartValue = v; } })
        o.data = data;
        data.thirdButtonText = 'Final text';
        data.textValue = 'Late binding';
        data.updateDataHandler = function () {
            data.sub.firstName = 'John';
            data.sub.lastName = 'Doe';
        }
        data.smartOne = "Correct";
        return o;

        //var definition = {
        //    type: 'host',
        //    children: [{
        //        type: 'button', background: 'gray', horizontalAlignment: 'left', verticalAlignment: 'top',
        //        children: ['Button Text']
        //    }]
        //};

        //var definition = {
        //    type: 'host',
        //    children: [{
        //        type: "text", text: "Button Text", userSelect: "none", margin: 5, horizontalAlignment: 'center', verticalAlignment: 'center'
        //    }]
        //};

        //var definition = {
        //    type: 'host',
        //    children: [{
        //        type: 'stack', background: 'gray', horizontalAlignment: 'left', verticalAlignment: 'top',
        //        children: [{
        //            type: "text", text: "Button Text", userSelect: "none", margin: 5, horizontalAlignment: 'center', verticalAlignment: 'center'
        //        }]
        //    }]
        //};

        //var definition = {
        //    type: 'host', children: [
        //        {
        //            type: 'stack', children: [
        //               { type: 'text', text: 'Hgello', background: 'gray', horizontalAlignment: 'center', verticalAlignment: 'center' },
        //               {
        //                   type: 'button', children: [
        //                       "Button Text"
        //                   ]
        //               }
        //            ]
        //        }
        //    ]
        //};


        //var definition =
        //    {
        //        type: 'host', children: [{
        //            type: 'stack', orientation: 'vertical', children: [
        //            {
        //                type: 'stack', orientation: 'vertical', background:'blue', children: [
        //                  { type: 'text', text: 'This is a long sentence' },
        //                  { type: 'text', text: 'This is shorter' },
        //                  {
        //                      type: 'stack', id: 'panel2', orientation: 'horizontal', children: [
        //                         { type: 'text', text: 'Horizontal 1' },
        //                         { type: 'text', text: 'Horizontal 2, but longer' }
        //                      ]
        //                  },
        //                  { type: 'text', text: 'After the stack panel',background:'yellow' }
        //                ]
        //            }]
        //        }]
        //    };


        //var definition =
        //    {
        //        type: 'stack', orientation: 'vertical', children: [
        //           { type: 'text', textContent: 'This is a long sentence' },
        //           { type: 'text', textContent: 'This is shorter' },
        //           {
        //               type: 'stack', id: 'panel2', orientation: 'horizontal', children: [
        //                  { type: 'text', textContent: 'Horizontal 1' },
        //                  { type: 'text', textContent: 'Horizontal 2, but longer' }
        //               ]
        //           },
        //           { type: 'text', textContent: 'After the stack panel' }
        //        ]
        //    };


        //var layout = Layout.create(definition);

        ////var l = Layout;
        ////var panel = new Layout.stack();
        ////panel.orientation = 'vertical';
        ////var text1 = new Layout.text();
        ////text1.textContent = 'This is a long sentence';
        ////panel.addChild(text1);
        ////var text2 = new Layout.text();
        ////text2.textContent = 'Short Text';
        ////panel.addChild(text2);

        ////var panel2 = new Layout.stack();
        ////panel2.orientation = 'horizontal';
        ////panel.addChild(panel2);
        ////var text3 = new Layout.text();
        ////text3.textContent = 'Horizontal 1';
        ////panel2.addChild(text3);
        ////var text4 = new Layout.text();
        ////text4.textContent = 'Horizontal 2';
        ////panel2.addChild(text4);
        ////var text5 = new Layout.text();
        ////text5.textContent = 'After horizontal';
        ////panel.addChild(text5);

        //var rect = { height: window.innerHeight, width: window.innerWidth };
        ////Layout.render(document.body, rect, panel);
        //var renderer = new Layout.renderer(document.body, rect);
        //renderer.addChild(layout);
        //return renderer;
    };
})(LayoutTest || (LayoutTest = {}));