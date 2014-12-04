"use strict";
var Layout;
(function (Layout) {
    Layout.file = function (inheritor) {
        var self = Layout.button(inheritor || this);
        self.type = 'file';
        self.allowDefault = true;
        var fileInput, fileForm;
        var newSelectionEvent = self.addEvent('newSelection');
        self.createHtml = function () {
            if (!self.html) {
                self.html = document.createElement('div');
                self.htmlHost = self.html;
                fileForm = document.createElement('form'); // Neede to be able to reset the files selected
                // Since setting files on input element is not supported in IE
                // Other way is by recreating input lement every time
                // but this seems more effective
                self.html.appendChild(fileForm);
                fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.style.position = 'relative';
                fileInput.style.width = '0px';
                fileInput.style.height = '100%';
                fileInput.style.opacity = 0.0;
                //fileInput.style.visibility = 'hidden';
                fileForm.appendChild(fileInput);
                fileInput.onchange = function (e) {
                    console.log('New files set');
                    // make a copy, otherwise a new selection can break the old one
                    // and that is very confusing
                    self.files.splice(0);
                    // Note that files is not a real array...
                    for (var i = 0; i < fileInput.files.length; i++) {
                        self.files.push(fileInput.files[i]);
                    }
                    newSelectionEvent.run({ files: self.files });
                };
                applySelectionMode(self.selectionMode);
                return true
            }
            return false;
        };

        //self.renderPostChildren = function () {

        //};
        var clickHandler = function () {
            console.log('Clicking input');
            fileForm.reset();
            fileInput.click();
        };
        self.click = clickHandler;
        var applySelectionMode = function (v) {
            if(!fileInput){
                return;
            }
            if (v === 'directory') {
                fileInput.setAttribute('directory', '');
                fileInput.setAttribute('webkitdirectory', '');
                fileInput.setAttribute('mozdirectory', '');
            }else{
                fileInput.removeAttribute('directory');
                fileInput.removeAttribute('webkitdirectory');
                fileInput.removeAttribute('mozdirectory');
            }
            if (v === 'file') {
                fileInput.removeAttribute('multiple');
            } else {
                fileInput.setAttribute('multiple', '');
            }
        }

        self.addProperty('selectionMode', {
            get: true, set: true, 'default': 'files', validValues: ['file', 'files', 'directory'],
            changed: applySelectionMode
            }
        );        

        self.addProperty('files', {
            get:true, set:true, 'default':[]
        });

        

        //self.postRenderSelf = function (renderSize) {
        //    for (var i = 0; i < self.visualChildren.length; i++) {
        //        if (self.visualChildren[i].html) {
        //            self.visualChildren[i].html.onclick = clickHandler;
        //        }
        //    }
        //};


        //self.addProperty('isDisabled', { get: true, set: true, 'default': false })
        //self.addProperty('pointerOverStyle');
        //self.addProperty('buttonDownStyle');
        //self.addProperty('disabledStyle');

        //self.addTriggeredProperty('state', function (oldState) {
        //    var state = self.isDisabled ? 'disabled' : ((self.isPointerDown & self.isPointerOver) ? 'buttonDown' :
        //        (self.isPointerOver ? 'pointerOver' : 'default'));
        //    console.log('State: ' + state);
        //    self.applyStyle(state);
        //    return state;
        //});

        //var clickActivated = false;
        //self.addTriggeredEvent('click', function () {
        //    if (self.isDisabled) {
        //        clickActivated = false;
        //        return false;
        //    }
        //    // First state for click
        //    if (self.isPointerOver && self.isPointerDown) {
        //        clickActivated = true;
        //        return false;
        //    }
        //    //second state for click
        //    if (clickActivated && self.isPointerOver && !self.isPointerDown) {
        //        clickActivated = false;
        //        return true;
        //    }
        //    clickActivated = false;
        //    return false;
        //});

        return self;
    }
})(Layout || (Layout = {}));