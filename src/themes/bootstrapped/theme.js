"use strict";
var LayoutThemes;
(function (LayoutThemes) {

    var buttonStyle = {
        targetType: 'button',
        background: 'white',
        border: 1,
        borderColor: '#ccc',
        cornerRadius: 4,
        margin: 0,
        horizontalAlignment: 'stretch',
        verticalAlignment: 'stretch',
        pointerOverStyle: {
            background: '#e6e6e6',
            borderColor: '#adadad'
        },
        buttonDownStyle: {
            background: '#e6e6e6',
            borderColor: '#adadad',
            boxShadow: 'inset 0 3px 5px rgba(0,0,0,.125)'
        },
        disabledStyle: {
            opacity: 0.65
        },
        template: {
            type: 'text',
            color: '#333',
            selectable: false,
            margin: 10,
            horizontalAlignment: 'center',
            verticalAlignment: 'center',
            hoistProperties: ['text', 'opacity']
        }
    };

    var fileStyle = {
        targetType: 'file',
        background: 'white',
        border: 1,
        borderColor: '#ccc',
        cornerRadius: 4,
        margin: 0,
        horizontalAlignment: 'stretch',
        verticalAlignment: 'stretch',
        pointerOverStyle: {
            background: '#e6e6e6',
            borderColor: '#adadad'
        },
        buttonDownStyle: {
            background: '#e6e6e6',
            borderColor: '#adadad',
            boxShadow: 'inset 0 3px 5px rgba(0,0,0,.125)'
        },
        disabledStyle: {
            opacity: 0.65
        },
        template: {
            type: 'text',
            color: '#333',
            selectable: false,
            margin: 10,
            horizontalAlignment: 'center',
            verticalAlignment: 'center',
            hoistProperties: ['text', 'opacity']
        }
    };

    LayoutThemes.bootstrapped = {
        name: 'bootstrapped',
        styles: [
            buttonStyle, fileStyle  
        ]
    };
})(LayoutThemes || (LayoutThemes = {}));