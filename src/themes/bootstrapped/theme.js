"use strict";
var LayoutThemes;
(function (LayoutThemes) {
    LayoutThemes.bootstrapped = {
        name: 'bootstrapped',
        styles: [
        {
            targetType: 'button',
            background: 'white',
            border: 1,
            borderColor: '#ccc',
            cornerRadius: 4,
            margin: 5,
            horizontalAlignment: 'left',
            verticalAlignment: 'top',
            pointerOverStyle:{
                background: '#e6e6e6',
                borderColor: '#adadad'
            },
            buttonDownStyle: {
                background: '#e6e6e6',
                borderColor: '#adadad',
                boxShadow: 'inset 0 3px 5px rgba(0,0,0,.125)'
            },

            template: {
                type: 'text',
                color: '#333',
                selectable: false,
                margin: 10,
                horizontalAlignment: 'center',
                verticalAlignment: 'center',
                templateBindings: ['text']                
            }
        }
        ]
    };
})(LayoutThemes || (LayoutThemes = {}));