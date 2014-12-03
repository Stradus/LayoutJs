"use strict";
var LayoutThemes;
(function (LayoutThemes) {
    var fontFamily = 'UIMain, serif';
    var fontSize = '16px';

    var buttonStyle = {
        targetType: 'button',
        color: '#282828',
        background: '#d7d7d7',
        margin: 2,
        horizontalAlignment: 'stretch',
        verticalAlignment: 'stretch',
        padding: { top: 1, right: 3, bottom: 1, left: 3 },
        pointerOverStyle: {
            color: '#d7d7d7',
            background: '#282828'
        },
        //buttonDownStyle: {
        //    background: '#e6e6e6',
        //    borderColor: '#adadad',
        //    boxShadow: 'inset 0 3px 5px rgba(0,0,0,.125)'
        //},
        disabledStyle: {
            color: '#afafaf',
            background: '#d7d7d7'
        },
        template: {
            type: 'text',

            fontFamily: fontFamily, /*sans-serif;*/
            fontSize: fontSize,
            selectable: false,
            margin: 0,
            horizontalAlignment: 'center',
            verticalAlignment: 'center',
            hoistProperties: ['text', 'opacity', 'color']
        }
    };
    var fileStyle = {
        targetType: 'file',
        color: '#282828',
        background: '#d7d7d7',
        margin: 2,
        horizontalAlignment: 'stretch',
        verticalAlignment: 'stretch',
        padding: { top: 1, right: 3, bottom: 1, left: 3 },
        pointerOverStyle: {
            color: '#d7d7d7',
            background: '#282828'
        },
        //buttonDownStyle: {
        //    background: '#e6e6e6',
        //    borderColor: '#adadad',
        //    boxShadow: 'inset 0 3px 5px rgba(0,0,0,.125)'
        //},
        disabledStyle: {
            color: '#afafaf',
            background: '#d7d7d7'
        },
        template: {
            type: 'text',

            fontFamily: fontFamily, /*sans-serif;*/
            fontSize: fontSize,
            selectable: false,
            margin: 0,
            horizontalAlignment: 'center',
            verticalAlignment: 'center',
            hoistProperties: ['text', 'opacity', 'color']
        }
    };
    var textStyle = {
        targetType: 'text',
        fontFamily: fontFamily, 
        fontSize: fontSize,
        color:'#afafaf'
    }

    LayoutThemes.stradus = {
        name: 'stradus',
        styles: [
            buttonStyle, fileStyle, textStyle
        ]
    };
})(LayoutThemes || (LayoutThemes = {}));