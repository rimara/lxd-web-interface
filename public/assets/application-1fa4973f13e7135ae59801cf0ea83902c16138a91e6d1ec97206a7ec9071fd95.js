(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Terminal = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CircularList_1 = require("./utils/CircularList");
var Buffer = (function () {
    function Buffer(_terminal) {
        this._terminal = _terminal;
        this.clear();
    }
    Object.defineProperty(Buffer.prototype, "lines", {
        get: function () {
            return this._lines;
        },
        enumerable: true,
        configurable: true
    });
    Buffer.prototype.fillViewportRows = function () {
        if (this._lines.length === 0) {
            var i = this._terminal.rows;
            while (i--) {
                this.lines.push(this._terminal.blankLine());
            }
        }
    };
    Buffer.prototype.clear = function () {
        this.ydisp = 0;
        this.ybase = 0;
        this.y = 0;
        this.x = 0;
        this.scrollBottom = 0;
        this.scrollTop = 0;
        this.tabs = {};
        this._lines = new CircularList_1.CircularList(this._terminal.scrollback);
        this.scrollBottom = this._terminal.rows - 1;
    };
    Buffer.prototype.resize = function (newCols, newRows) {
        if (this._lines.length === 0) {
            return;
        }
        if (this._terminal.cols < newCols) {
            var ch = [this._terminal.defAttr, ' ', 1];
            for (var i = 0; i < this._lines.length; i++) {
                if (this._lines.get(i) === undefined) {
                    this._lines.set(i, this._terminal.blankLine(undefined, undefined, newCols));
                }
                while (this._lines.get(i).length < newCols) {
                    this._lines.get(i).push(ch);
                }
            }
        }
        var addToY = 0;
        if (this._terminal.rows < newRows) {
            for (var y = this._terminal.rows; y < newRows; y++) {
                if (this._lines.length < newRows + this.ybase) {
                    if (this.ybase > 0 && this._lines.length <= this.ybase + this.y + addToY + 1) {
                        this.ybase--;
                        addToY++;
                        if (this.ydisp > 0) {
                            this.ydisp--;
                        }
                    }
                    else {
                        this._lines.push(this._terminal.blankLine(undefined, undefined, newCols));
                    }
                }
            }
        }
        else {
            for (var y = this._terminal.rows; y > newRows; y--) {
                if (this._lines.length > newRows + this.ybase) {
                    if (this._lines.length > this.ybase + this.y + 1) {
                        this._lines.pop();
                    }
                    else {
                        this.ybase++;
                        this.ydisp++;
                    }
                }
            }
        }
        if (this.y >= newRows) {
            this.y = newRows - 1;
        }
        if (addToY) {
            this.y += addToY;
        }
        if (this.x >= newCols) {
            this.x = newCols - 1;
        }
        this.scrollTop = 0;
        this.scrollBottom = newRows - 1;
    };
    return Buffer;
}());
exports.Buffer = Buffer;



},{"./utils/CircularList":18}],2:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Buffer_1 = require("./Buffer");
var EventEmitter_1 = require("./EventEmitter");
var BufferSet = (function (_super) {
    __extends(BufferSet, _super);
    function BufferSet(_terminal) {
        var _this = _super.call(this) || this;
        _this._terminal = _terminal;
        _this._normal = new Buffer_1.Buffer(_this._terminal);
        _this._normal.fillViewportRows();
        _this._alt = new Buffer_1.Buffer(_this._terminal);
        _this._activeBuffer = _this._normal;
        return _this;
    }
    Object.defineProperty(BufferSet.prototype, "alt", {
        get: function () {
            return this._alt;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BufferSet.prototype, "active", {
        get: function () {
            return this._activeBuffer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BufferSet.prototype, "normal", {
        get: function () {
            return this._normal;
        },
        enumerable: true,
        configurable: true
    });
    BufferSet.prototype.activateNormalBuffer = function () {
        this._alt.clear();
        this._activeBuffer = this._normal;
        this.emit('activate', this._normal);
    };
    BufferSet.prototype.activateAltBuffer = function () {
        this._alt.fillViewportRows();
        this._activeBuffer = this._alt;
        this.emit('activate', this._alt);
    };
    BufferSet.prototype.resize = function (newCols, newRows) {
        this._normal.resize(newCols, newRows);
        this._alt.resize(newCols, newRows);
    };
    return BufferSet;
}(EventEmitter_1.EventEmitter));
exports.BufferSet = BufferSet;



},{"./Buffer":1,"./EventEmitter":6}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHARSETS = {};
exports.DEFAULT_CHARSET = exports.CHARSETS['B'];
exports.CHARSETS['0'] = {
    '`': '\u25c6',
    'a': '\u2592',
    'b': '\u0009',
    'c': '\u000c',
    'd': '\u000d',
    'e': '\u000a',
    'f': '\u00b0',
    'g': '\u00b1',
    'h': '\u2424',
    'i': '\u000b',
    'j': '\u2518',
    'k': '\u2510',
    'l': '\u250c',
    'm': '\u2514',
    'n': '\u253c',
    'o': '\u23ba',
    'p': '\u23bb',
    'q': '\u2500',
    'r': '\u23bc',
    's': '\u23bd',
    't': '\u251c',
    'u': '\u2524',
    'v': '\u2534',
    'w': '\u252c',
    'x': '\u2502',
    'y': '\u2264',
    'z': '\u2265',
    '{': '\u03c0',
    '|': '\u2260',
    '}': '\u00a3',
    '~': '\u00b7'
};
exports.CHARSETS['A'] = {
    '#': '£'
};
exports.CHARSETS['B'] = null;
exports.CHARSETS['4'] = {
    '#': '£',
    '@': '¾',
    '[': 'ij',
    '\\': '½',
    ']': '|',
    '{': '¨',
    '|': 'f',
    '}': '¼',
    '~': '´'
};
exports.CHARSETS['C'] =
    exports.CHARSETS['5'] = {
        '[': 'Ä',
        '\\': 'Ö',
        ']': 'Å',
        '^': 'Ü',
        '`': 'é',
        '{': 'ä',
        '|': 'ö',
        '}': 'å',
        '~': 'ü'
    };
exports.CHARSETS['R'] = {
    '#': '£',
    '@': 'à',
    '[': '°',
    '\\': 'ç',
    ']': '§',
    '{': 'é',
    '|': 'ù',
    '}': 'è',
    '~': '¨'
};
exports.CHARSETS['Q'] = {
    '@': 'à',
    '[': 'â',
    '\\': 'ç',
    ']': 'ê',
    '^': 'î',
    '`': 'ô',
    '{': 'é',
    '|': 'ù',
    '}': 'è',
    '~': 'û'
};
exports.CHARSETS['K'] = {
    '@': '§',
    '[': 'Ä',
    '\\': 'Ö',
    ']': 'Ü',
    '{': 'ä',
    '|': 'ö',
    '}': 'ü',
    '~': 'ß'
};
exports.CHARSETS['Y'] = {
    '#': '£',
    '@': '§',
    '[': '°',
    '\\': 'ç',
    ']': 'é',
    '`': 'ù',
    '{': 'à',
    '|': 'ò',
    '}': 'è',
    '~': 'ì'
};
exports.CHARSETS['E'] =
    exports.CHARSETS['6'] = {
        '@': 'Ä',
        '[': 'Æ',
        '\\': 'Ø',
        ']': 'Å',
        '^': 'Ü',
        '`': 'ä',
        '{': 'æ',
        '|': 'ø',
        '}': 'å',
        '~': 'ü'
    };
exports.CHARSETS['Z'] = {
    '#': '£',
    '@': '§',
    '[': '¡',
    '\\': 'Ñ',
    ']': '¿',
    '{': '°',
    '|': 'ñ',
    '}': 'ç'
};
exports.CHARSETS['H'] =
    exports.CHARSETS['7'] = {
        '@': 'É',
        '[': 'Ä',
        '\\': 'Ö',
        ']': 'Å',
        '^': 'Ü',
        '`': 'é',
        '{': 'ä',
        '|': 'ö',
        '}': 'å',
        '~': 'ü'
    };
exports.CHARSETS['='] = {
    '#': 'ù',
    '@': 'à',
    '[': 'é',
    '\\': 'ç',
    ']': 'ê',
    '^': 'î',
    '_': 'è',
    '`': 'ô',
    '{': 'ä',
    '|': 'ö',
    '}': 'ü',
    '~': 'û'
};



},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CompositionHelper = (function () {
    function CompositionHelper(textarea, compositionView, terminal) {
        this.textarea = textarea;
        this.compositionView = compositionView;
        this.terminal = terminal;
        this.isComposing = false;
        this.isSendingComposition = false;
        this.compositionPosition = { start: null, end: null };
    }
    CompositionHelper.prototype.compositionstart = function () {
        this.isComposing = true;
        this.compositionPosition.start = this.textarea.value.length;
        this.compositionView.textContent = '';
        this.compositionView.classList.add('active');
    };
    CompositionHelper.prototype.compositionupdate = function (ev) {
        var _this = this;
        this.compositionView.textContent = ev.data;
        this.updateCompositionElements();
        setTimeout(function () {
            _this.compositionPosition.end = _this.textarea.value.length;
        }, 0);
    };
    CompositionHelper.prototype.compositionend = function () {
        this.finalizeComposition(true);
    };
    CompositionHelper.prototype.keydown = function (ev) {
        if (this.isComposing || this.isSendingComposition) {
            if (ev.keyCode === 229) {
                return false;
            }
            else if (ev.keyCode === 16 || ev.keyCode === 17 || ev.keyCode === 18) {
                return false;
            }
            else {
                this.finalizeComposition(false);
            }
        }
        if (ev.keyCode === 229) {
            this.handleAnyTextareaChanges();
            return false;
        }
        return true;
    };
    CompositionHelper.prototype.finalizeComposition = function (waitForPropogation) {
        var _this = this;
        this.compositionView.classList.remove('active');
        this.isComposing = false;
        this.clearTextareaPosition();
        if (!waitForPropogation) {
            this.isSendingComposition = false;
            var input = this.textarea.value.substring(this.compositionPosition.start, this.compositionPosition.end);
            this.terminal.handler(input);
        }
        else {
            var currentCompositionPosition_1 = {
                start: this.compositionPosition.start,
                end: this.compositionPosition.end,
            };
            this.isSendingComposition = true;
            setTimeout(function () {
                if (_this.isSendingComposition) {
                    _this.isSendingComposition = false;
                    var input = void 0;
                    if (_this.isComposing) {
                        input = _this.textarea.value.substring(currentCompositionPosition_1.start, currentCompositionPosition_1.end);
                    }
                    else {
                        input = _this.textarea.value.substring(currentCompositionPosition_1.start);
                    }
                    _this.terminal.handler(input);
                }
            }, 0);
        }
    };
    CompositionHelper.prototype.handleAnyTextareaChanges = function () {
        var _this = this;
        var oldValue = this.textarea.value;
        setTimeout(function () {
            if (!_this.isComposing) {
                var newValue = _this.textarea.value;
                var diff = newValue.replace(oldValue, '');
                if (diff.length > 0) {
                    _this.terminal.handler(diff);
                }
            }
        }, 0);
    };
    CompositionHelper.prototype.updateCompositionElements = function (dontRecurse) {
        var _this = this;
        if (!this.isComposing) {
            return;
        }
        var cursor = this.terminal.element.querySelector('.terminal-cursor');
        if (cursor) {
            var xtermRows = this.terminal.element.querySelector('.xterm-rows');
            var cursorTop = xtermRows.offsetTop + cursor.offsetTop;
            this.compositionView.style.left = cursor.offsetLeft + 'px';
            this.compositionView.style.top = cursorTop + 'px';
            this.compositionView.style.height = cursor.offsetHeight + 'px';
            this.compositionView.style.lineHeight = cursor.offsetHeight + 'px';
            var compositionViewBounds = this.compositionView.getBoundingClientRect();
            this.textarea.style.left = cursor.offsetLeft + 'px';
            this.textarea.style.top = cursorTop + 'px';
            this.textarea.style.width = compositionViewBounds.width + 'px';
            this.textarea.style.height = compositionViewBounds.height + 'px';
            this.textarea.style.lineHeight = compositionViewBounds.height + 'px';
        }
        if (!dontRecurse) {
            setTimeout(function () { return _this.updateCompositionElements(true); }, 0);
        }
    };
    ;
    CompositionHelper.prototype.clearTextareaPosition = function () {
        this.textarea.style.left = '';
        this.textarea.style.top = '';
    };
    ;
    return CompositionHelper;
}());
exports.CompositionHelper = CompositionHelper;



},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var C0;
(function (C0) {
    C0.NUL = '\x00';
    C0.SOH = '\x01';
    C0.STX = '\x02';
    C0.ETX = '\x03';
    C0.EOT = '\x04';
    C0.ENQ = '\x05';
    C0.ACK = '\x06';
    C0.BEL = '\x07';
    C0.BS = '\x08';
    C0.HT = '\x09';
    C0.LF = '\x0a';
    C0.VT = '\x0b';
    C0.FF = '\x0c';
    C0.CR = '\x0d';
    C0.SO = '\x0e';
    C0.SI = '\x0f';
    C0.DLE = '\x10';
    C0.DC1 = '\x11';
    C0.DC2 = '\x12';
    C0.DC3 = '\x13';
    C0.DC4 = '\x14';
    C0.NAK = '\x15';
    C0.SYN = '\x16';
    C0.ETB = '\x17';
    C0.CAN = '\x18';
    C0.EM = '\x19';
    C0.SUB = '\x1a';
    C0.ESC = '\x1b';
    C0.FS = '\x1c';
    C0.GS = '\x1d';
    C0.RS = '\x1e';
    C0.US = '\x1f';
    C0.SP = '\x20';
    C0.DEL = '\x7f';
})(C0 = exports.C0 || (exports.C0 = {}));
;



},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
var EventEmitter = (function () {
    function EventEmitter() {
        this._events = this._events || {};
    }
    EventEmitter.prototype.on = function (type, listener) {
        this._events[type] = this._events[type] || [];
        this._events[type].push(listener);
    };
    EventEmitter.prototype.off = function (type, listener) {
        if (!this._events[type]) {
            return;
        }
        var obj = this._events[type];
        var i = obj.length;
        while (i--) {
            if (obj[i] === listener || obj[i].listener === listener) {
                obj.splice(i, 1);
                return;
            }
        }
    };
    EventEmitter.prototype.removeAllListeners = function (type) {
        if (this._events[type]) {
            delete this._events[type];
        }
    };
    EventEmitter.prototype.once = function (type, listener) {
        function on() {
            var args = Array.prototype.slice.call(arguments);
            this.off(type, on);
            return listener.apply(this, args);
        }
        on.listener = listener;
        return this.on(type, on);
    };
    EventEmitter.prototype.emit = function (type) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (!this._events[type]) {
            return;
        }
        var obj = this._events[type];
        for (var i = 0; i < obj.length; i++) {
            obj[i].apply(this, args);
        }
    };
    EventEmitter.prototype.listeners = function (type) {
        return this._events[type] || [];
    };
    return EventEmitter;
}());
exports.EventEmitter = EventEmitter;



},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EscapeSequences_1 = require("./EscapeSequences");
var Charsets_1 = require("./Charsets");
var InputHandler = (function () {
    function InputHandler(_terminal) {
        this._terminal = _terminal;
    }
    InputHandler.prototype.addChar = function (char, code) {
        if (char >= ' ') {
            var ch_width = exports.wcwidth(code);
            if (this._terminal.charset && this._terminal.charset[char]) {
                char = this._terminal.charset[char];
            }
            var row = this._terminal.buffer.y + this._terminal.buffer.ybase;
            if (!ch_width && this._terminal.buffer.x) {
                if (this._terminal.buffer.lines.get(row)[this._terminal.buffer.x - 1]) {
                    if (!this._terminal.buffer.lines.get(row)[this._terminal.buffer.x - 1][2]) {
                        if (this._terminal.buffer.lines.get(row)[this._terminal.buffer.x - 2])
                            this._terminal.buffer.lines.get(row)[this._terminal.buffer.x - 2][1] += char;
                    }
                    else {
                        this._terminal.buffer.lines.get(row)[this._terminal.buffer.x - 1][1] += char;
                    }
                    this._terminal.updateRange(this._terminal.buffer.y);
                }
                return;
            }
            if (this._terminal.buffer.x + ch_width - 1 >= this._terminal.cols) {
                if (this._terminal.wraparoundMode) {
                    this._terminal.buffer.x = 0;
                    this._terminal.buffer.y++;
                    if (this._terminal.buffer.y > this._terminal.buffer.scrollBottom) {
                        this._terminal.buffer.y--;
                        this._terminal.scroll(true);
                    }
                    else {
                        this._terminal.buffer.lines.get(this._terminal.buffer.y).isWrapped = true;
                    }
                }
                else {
                    if (ch_width === 2)
                        return;
                }
            }
            row = this._terminal.buffer.y + this._terminal.buffer.ybase;
            if (this._terminal.insertMode) {
                for (var moves = 0; moves < ch_width; ++moves) {
                    var removed = this._terminal.buffer.lines.get(this._terminal.buffer.y + this._terminal.buffer.ybase).pop();
                    if (removed[2] === 0
                        && this._terminal.buffer.lines.get(row)[this._terminal.cols - 2]
                        && this._terminal.buffer.lines.get(row)[this._terminal.cols - 2][2] === 2) {
                        this._terminal.buffer.lines.get(row)[this._terminal.cols - 2] = [this._terminal.curAttr, ' ', 1];
                    }
                    this._terminal.buffer.lines.get(row).splice(this._terminal.buffer.x, 0, [this._terminal.curAttr, ' ', 1]);
                }
            }
            this._terminal.buffer.lines.get(row)[this._terminal.buffer.x] = [this._terminal.curAttr, char, ch_width];
            this._terminal.buffer.x++;
            this._terminal.updateRange(this._terminal.buffer.y);
            if (ch_width === 2) {
                this._terminal.buffer.lines.get(row)[this._terminal.buffer.x] = [this._terminal.curAttr, '', 0];
                this._terminal.buffer.x++;
            }
        }
    };
    InputHandler.prototype.bell = function () {
        var _this = this;
        if (!this._terminal.visualBell) {
            return;
        }
        this._terminal.element.style.borderColor = 'white';
        setTimeout(function () { return _this._terminal.element.style.borderColor = ''; }, 10);
        if (this._terminal.popOnBell) {
            this._terminal.focus();
        }
    };
    InputHandler.prototype.lineFeed = function () {
        if (this._terminal.convertEol) {
            this._terminal.buffer.x = 0;
        }
        this._terminal.buffer.y++;
        if (this._terminal.buffer.y > this._terminal.buffer.scrollBottom) {
            this._terminal.buffer.y--;
            this._terminal.scroll();
        }
        if (this._terminal.buffer.x >= this._terminal.cols) {
            this._terminal.buffer.x--;
        }
        this._terminal.emit('lineFeed');
    };
    InputHandler.prototype.carriageReturn = function () {
        this._terminal.buffer.x = 0;
    };
    InputHandler.prototype.backspace = function () {
        if (this._terminal.buffer.x > 0) {
            this._terminal.buffer.x--;
        }
    };
    InputHandler.prototype.tab = function () {
        this._terminal.buffer.x = this._terminal.nextStop();
    };
    InputHandler.prototype.shiftOut = function () {
        this._terminal.setgLevel(1);
    };
    InputHandler.prototype.shiftIn = function () {
        this._terminal.setgLevel(0);
    };
    InputHandler.prototype.insertChars = function (params) {
        var param, row, j, ch;
        param = params[0];
        if (param < 1)
            param = 1;
        row = this._terminal.buffer.y + this._terminal.buffer.ybase;
        j = this._terminal.buffer.x;
        ch = [this._terminal.eraseAttr(), ' ', 1];
        while (param-- && j < this._terminal.cols) {
            this._terminal.buffer.lines.get(row).splice(j++, 0, ch);
            this._terminal.buffer.lines.get(row).pop();
        }
    };
    InputHandler.prototype.cursorUp = function (params) {
        var param = params[0];
        if (param < 1) {
            param = 1;
        }
        this._terminal.buffer.y -= param;
        if (this._terminal.buffer.y < 0) {
            this._terminal.buffer.y = 0;
        }
    };
    InputHandler.prototype.cursorDown = function (params) {
        var param = params[0];
        if (param < 1) {
            param = 1;
        }
        this._terminal.buffer.y += param;
        if (this._terminal.buffer.y >= this._terminal.rows) {
            this._terminal.buffer.y = this._terminal.rows - 1;
        }
        if (this._terminal.buffer.x >= this._terminal.cols) {
            this._terminal.buffer.x--;
        }
    };
    InputHandler.prototype.cursorForward = function (params) {
        var param = params[0];
        if (param < 1) {
            param = 1;
        }
        this._terminal.buffer.x += param;
        if (this._terminal.buffer.x >= this._terminal.cols) {
            this._terminal.buffer.x = this._terminal.cols - 1;
        }
    };
    InputHandler.prototype.cursorBackward = function (params) {
        var param = params[0];
        if (param < 1) {
            param = 1;
        }
        if (this._terminal.buffer.x >= this._terminal.cols) {
            this._terminal.buffer.x--;
        }
        this._terminal.buffer.x -= param;
        if (this._terminal.buffer.x < 0) {
            this._terminal.buffer.x = 0;
        }
    };
    InputHandler.prototype.cursorNextLine = function (params) {
        var param = params[0];
        if (param < 1) {
            param = 1;
        }
        this._terminal.buffer.y += param;
        if (this._terminal.buffer.y >= this._terminal.rows) {
            this._terminal.buffer.y = this._terminal.rows - 1;
        }
        this._terminal.buffer.x = 0;
    };
    InputHandler.prototype.cursorPrecedingLine = function (params) {
        var param = params[0];
        if (param < 1) {
            param = 1;
        }
        this._terminal.buffer.y -= param;
        if (this._terminal.buffer.y < 0) {
            this._terminal.buffer.y = 0;
        }
        this._terminal.buffer.x = 0;
    };
    InputHandler.prototype.cursorCharAbsolute = function (params) {
        var param = params[0];
        if (param < 1) {
            param = 1;
        }
        this._terminal.buffer.x = param - 1;
    };
    InputHandler.prototype.cursorPosition = function (params) {
        var row, col;
        row = params[0] - 1;
        if (params.length >= 2) {
            col = params[1] - 1;
        }
        else {
            col = 0;
        }
        if (row < 0) {
            row = 0;
        }
        else if (row >= this._terminal.rows) {
            row = this._terminal.rows - 1;
        }
        if (col < 0) {
            col = 0;
        }
        else if (col >= this._terminal.cols) {
            col = this._terminal.cols - 1;
        }
        this._terminal.buffer.x = col;
        this._terminal.buffer.y = row;
    };
    InputHandler.prototype.cursorForwardTab = function (params) {
        var param = params[0] || 1;
        while (param--) {
            this._terminal.buffer.x = this._terminal.nextStop();
        }
    };
    InputHandler.prototype.eraseInDisplay = function (params) {
        var j;
        switch (params[0]) {
            case 0:
                this._terminal.eraseRight(this._terminal.buffer.x, this._terminal.buffer.y);
                j = this._terminal.buffer.y + 1;
                for (; j < this._terminal.rows; j++) {
                    this._terminal.eraseLine(j);
                }
                break;
            case 1:
                this._terminal.eraseLeft(this._terminal.buffer.x, this._terminal.buffer.y);
                j = this._terminal.buffer.y;
                while (j--) {
                    this._terminal.eraseLine(j);
                }
                break;
            case 2:
                j = this._terminal.rows;
                while (j--)
                    this._terminal.eraseLine(j);
                break;
            case 3:
                var scrollBackSize = this._terminal.buffer.lines.length - this._terminal.rows;
                if (scrollBackSize > 0) {
                    this._terminal.buffer.lines.trimStart(scrollBackSize);
                    this._terminal.buffer.ybase = Math.max(this._terminal.buffer.ybase - scrollBackSize, 0);
                    this._terminal.buffer.ydisp = Math.max(this._terminal.buffer.ydisp - scrollBackSize, 0);
                    this._terminal.emit('scroll', 0);
                }
                break;
        }
    };
    InputHandler.prototype.eraseInLine = function (params) {
        switch (params[0]) {
            case 0:
                this._terminal.eraseRight(this._terminal.buffer.x, this._terminal.buffer.y);
                break;
            case 1:
                this._terminal.eraseLeft(this._terminal.buffer.x, this._terminal.buffer.y);
                break;
            case 2:
                this._terminal.eraseLine(this._terminal.buffer.y);
                break;
        }
    };
    InputHandler.prototype.insertLines = function (params) {
        var param, row, j;
        param = params[0];
        if (param < 1) {
            param = 1;
        }
        row = this._terminal.buffer.y + this._terminal.buffer.ybase;
        j = this._terminal.rows - 1 - this._terminal.buffer.scrollBottom;
        j = this._terminal.rows - 1 + this._terminal.buffer.ybase - j + 1;
        while (param--) {
            if (this._terminal.buffer.lines.length === this._terminal.buffer.lines.maxLength) {
                this._terminal.buffer.lines.trimStart(1);
                this._terminal.buffer.ybase--;
                this._terminal.buffer.ydisp--;
                row--;
                j--;
            }
            this._terminal.buffer.lines.splice(row, 0, this._terminal.blankLine(true));
            this._terminal.buffer.lines.splice(j, 1);
        }
        this._terminal.updateRange(this._terminal.buffer.y);
        this._terminal.updateRange(this._terminal.buffer.scrollBottom);
    };
    InputHandler.prototype.deleteLines = function (params) {
        var param, row, j;
        param = params[0];
        if (param < 1) {
            param = 1;
        }
        row = this._terminal.buffer.y + this._terminal.buffer.ybase;
        j = this._terminal.rows - 1 - this._terminal.buffer.scrollBottom;
        j = this._terminal.rows - 1 + this._terminal.buffer.ybase - j;
        while (param--) {
            if (this._terminal.buffer.lines.length === this._terminal.buffer.lines.maxLength) {
                this._terminal.buffer.lines.trimStart(1);
                this._terminal.buffer.ybase -= 1;
                this._terminal.buffer.ydisp -= 1;
            }
            this._terminal.buffer.lines.splice(j + 1, 0, this._terminal.blankLine(true));
            this._terminal.buffer.lines.splice(row, 1);
        }
        this._terminal.updateRange(this._terminal.buffer.y);
        this._terminal.updateRange(this._terminal.buffer.scrollBottom);
    };
    InputHandler.prototype.deleteChars = function (params) {
        var param, row, ch;
        param = params[0];
        if (param < 1) {
            param = 1;
        }
        row = this._terminal.buffer.y + this._terminal.buffer.ybase;
        ch = [this._terminal.eraseAttr(), ' ', 1];
        while (param--) {
            this._terminal.buffer.lines.get(row).splice(this._terminal.buffer.x, 1);
            this._terminal.buffer.lines.get(row).push(ch);
        }
    };
    InputHandler.prototype.scrollUp = function (params) {
        var param = params[0] || 1;
        while (param--) {
            this._terminal.buffer.lines.splice(this._terminal.buffer.ybase + this._terminal.buffer.scrollTop, 1);
            this._terminal.buffer.lines.splice(this._terminal.buffer.ybase + this._terminal.buffer.scrollBottom, 0, this._terminal.blankLine());
        }
        this._terminal.updateRange(this._terminal.buffer.scrollTop);
        this._terminal.updateRange(this._terminal.buffer.scrollBottom);
    };
    InputHandler.prototype.scrollDown = function (params) {
        var param = params[0] || 1;
        while (param--) {
            this._terminal.buffer.lines.splice(this._terminal.buffer.ybase + this._terminal.buffer.scrollBottom, 1);
            this._terminal.buffer.lines.splice(this._terminal.buffer.ybase + this._terminal.buffer.scrollTop, 0, this._terminal.blankLine());
        }
        this._terminal.updateRange(this._terminal.buffer.scrollTop);
        this._terminal.updateRange(this._terminal.buffer.scrollBottom);
    };
    InputHandler.prototype.eraseChars = function (params) {
        var param, row, j, ch;
        param = params[0];
        if (param < 1) {
            param = 1;
        }
        row = this._terminal.buffer.y + this._terminal.buffer.ybase;
        j = this._terminal.buffer.x;
        ch = [this._terminal.eraseAttr(), ' ', 1];
        while (param-- && j < this._terminal.cols) {
            this._terminal.buffer.lines.get(row)[j++] = ch;
        }
    };
    InputHandler.prototype.cursorBackwardTab = function (params) {
        var param = params[0] || 1;
        while (param--) {
            this._terminal.buffer.x = this._terminal.prevStop();
        }
    };
    InputHandler.prototype.charPosAbsolute = function (params) {
        var param = params[0];
        if (param < 1) {
            param = 1;
        }
        this._terminal.buffer.x = param - 1;
        if (this._terminal.buffer.x >= this._terminal.cols) {
            this._terminal.buffer.x = this._terminal.cols - 1;
        }
    };
    InputHandler.prototype.HPositionRelative = function (params) {
        var param = params[0];
        if (param < 1) {
            param = 1;
        }
        this._terminal.buffer.x += param;
        if (this._terminal.buffer.x >= this._terminal.cols) {
            this._terminal.buffer.x = this._terminal.cols - 1;
        }
    };
    InputHandler.prototype.repeatPrecedingCharacter = function (params) {
        var param = params[0] || 1, line = this._terminal.buffer.lines.get(this._terminal.buffer.ybase + this._terminal.buffer.y), ch = line[this._terminal.buffer.x - 1] || [this._terminal.defAttr, ' ', 1];
        while (param--) {
            line[this._terminal.buffer.x++] = ch;
        }
    };
    InputHandler.prototype.sendDeviceAttributes = function (params) {
        if (params[0] > 0) {
            return;
        }
        if (!this._terminal.prefix) {
            if (this._terminal.is('xterm') || this._terminal.is('rxvt-unicode') || this._terminal.is('screen')) {
                this._terminal.send(EscapeSequences_1.C0.ESC + '[?1;2c');
            }
            else if (this._terminal.is('linux')) {
                this._terminal.send(EscapeSequences_1.C0.ESC + '[?6c');
            }
        }
        else if (this._terminal.prefix === '>') {
            if (this._terminal.is('xterm')) {
                this._terminal.send(EscapeSequences_1.C0.ESC + '[>0;276;0c');
            }
            else if (this._terminal.is('rxvt-unicode')) {
                this._terminal.send(EscapeSequences_1.C0.ESC + '[>85;95;0c');
            }
            else if (this._terminal.is('linux')) {
                this._terminal.send(params[0] + 'c');
            }
            else if (this._terminal.is('screen')) {
                this._terminal.send(EscapeSequences_1.C0.ESC + '[>83;40003;0c');
            }
        }
    };
    InputHandler.prototype.linePosAbsolute = function (params) {
        var param = params[0];
        if (param < 1) {
            param = 1;
        }
        this._terminal.buffer.y = param - 1;
        if (this._terminal.buffer.y >= this._terminal.rows) {
            this._terminal.buffer.y = this._terminal.rows - 1;
        }
    };
    InputHandler.prototype.VPositionRelative = function (params) {
        var param = params[0];
        if (param < 1) {
            param = 1;
        }
        this._terminal.buffer.y += param;
        if (this._terminal.buffer.y >= this._terminal.rows) {
            this._terminal.buffer.y = this._terminal.rows - 1;
        }
        if (this._terminal.buffer.x >= this._terminal.cols) {
            this._terminal.buffer.x--;
        }
    };
    InputHandler.prototype.HVPosition = function (params) {
        if (params[0] < 1)
            params[0] = 1;
        if (params[1] < 1)
            params[1] = 1;
        this._terminal.buffer.y = params[0] - 1;
        if (this._terminal.buffer.y >= this._terminal.rows) {
            this._terminal.buffer.y = this._terminal.rows - 1;
        }
        this._terminal.buffer.x = params[1] - 1;
        if (this._terminal.buffer.x >= this._terminal.cols) {
            this._terminal.buffer.x = this._terminal.cols - 1;
        }
    };
    InputHandler.prototype.tabClear = function (params) {
        var param = params[0];
        if (param <= 0) {
            delete this._terminal.buffer.tabs[this._terminal.buffer.x];
        }
        else if (param === 3) {
            this._terminal.buffer.tabs = {};
        }
    };
    InputHandler.prototype.setMode = function (params) {
        if (params.length > 1) {
            for (var i = 0; i < params.length; i++) {
                this.setMode([params[i]]);
            }
            return;
        }
        if (!this._terminal.prefix) {
            switch (params[0]) {
                case 4:
                    this._terminal.insertMode = true;
                    break;
                case 20:
                    break;
            }
        }
        else if (this._terminal.prefix === '?') {
            switch (params[0]) {
                case 1:
                    this._terminal.applicationCursor = true;
                    break;
                case 2:
                    this._terminal.setgCharset(0, Charsets_1.DEFAULT_CHARSET);
                    this._terminal.setgCharset(1, Charsets_1.DEFAULT_CHARSET);
                    this._terminal.setgCharset(2, Charsets_1.DEFAULT_CHARSET);
                    this._terminal.setgCharset(3, Charsets_1.DEFAULT_CHARSET);
                    break;
                case 3:
                    this._terminal.savedCols = this._terminal.cols;
                    this._terminal.resize(132, this._terminal.rows);
                    break;
                case 6:
                    this._terminal.originMode = true;
                    break;
                case 7:
                    this._terminal.wraparoundMode = true;
                    break;
                case 12:
                    break;
                case 66:
                    this._terminal.log('Serial port requested application keypad.');
                    this._terminal.applicationKeypad = true;
                    this._terminal.viewport.syncScrollArea();
                    break;
                case 9:
                case 1000:
                case 1002:
                case 1003:
                    this._terminal.x10Mouse = params[0] === 9;
                    this._terminal.vt200Mouse = params[0] === 1000;
                    this._terminal.normalMouse = params[0] > 1000;
                    this._terminal.mouseEvents = true;
                    this._terminal.element.classList.add('enable-mouse-events');
                    this._terminal.selectionManager.disable();
                    this._terminal.log('Binding to mouse events.');
                    break;
                case 1004:
                    this._terminal.sendFocus = true;
                    break;
                case 1005:
                    this._terminal.utfMouse = true;
                    break;
                case 1006:
                    this._terminal.sgrMouse = true;
                    break;
                case 1015:
                    this._terminal.urxvtMouse = true;
                    break;
                case 25:
                    this._terminal.cursorHidden = false;
                    break;
                case 1049:
                case 47:
                case 1047:
                    this._terminal.buffers.activateAltBuffer();
                    this._terminal.viewport.syncScrollArea();
                    this._terminal.showCursor();
                    break;
            }
        }
    };
    InputHandler.prototype.resetMode = function (params) {
        if (params.length > 1) {
            for (var i = 0; i < params.length; i++) {
                this.resetMode([params[i]]);
            }
            return;
        }
        if (!this._terminal.prefix) {
            switch (params[0]) {
                case 4:
                    this._terminal.insertMode = false;
                    break;
                case 20:
                    break;
            }
        }
        else if (this._terminal.prefix === '?') {
            switch (params[0]) {
                case 1:
                    this._terminal.applicationCursor = false;
                    break;
                case 3:
                    if (this._terminal.cols === 132 && this._terminal.savedCols) {
                        this._terminal.resize(this._terminal.savedCols, this._terminal.rows);
                    }
                    delete this._terminal.savedCols;
                    break;
                case 6:
                    this._terminal.originMode = false;
                    break;
                case 7:
                    this._terminal.wraparoundMode = false;
                    break;
                case 12:
                    break;
                case 66:
                    this._terminal.log('Switching back to normal keypad.');
                    this._terminal.applicationKeypad = false;
                    this._terminal.viewport.syncScrollArea();
                    break;
                case 9:
                case 1000:
                case 1002:
                case 1003:
                    this._terminal.x10Mouse = false;
                    this._terminal.vt200Mouse = false;
                    this._terminal.normalMouse = false;
                    this._terminal.mouseEvents = false;
                    this._terminal.element.classList.remove('enable-mouse-events');
                    this._terminal.selectionManager.enable();
                    break;
                case 1004:
                    this._terminal.sendFocus = false;
                    break;
                case 1005:
                    this._terminal.utfMouse = false;
                    break;
                case 1006:
                    this._terminal.sgrMouse = false;
                    break;
                case 1015:
                    this._terminal.urxvtMouse = false;
                    break;
                case 25:
                    this._terminal.cursorHidden = true;
                    break;
                case 1049:
                case 47:
                case 1047:
                    this._terminal.buffers.activateNormalBuffer();
                    this._terminal.selectionManager.setBuffer(this._terminal.buffer.lines);
                    this._terminal.refresh(0, this._terminal.rows - 1);
                    this._terminal.viewport.syncScrollArea();
                    this._terminal.showCursor();
                    break;
            }
        }
    };
    InputHandler.prototype.charAttributes = function (params) {
        if (params.length === 1 && params[0] === 0) {
            this._terminal.curAttr = this._terminal.defAttr;
            return;
        }
        var l = params.length, i = 0, flags = this._terminal.curAttr >> 18, fg = (this._terminal.curAttr >> 9) & 0x1ff, bg = this._terminal.curAttr & 0x1ff, p;
        for (; i < l; i++) {
            p = params[i];
            if (p >= 30 && p <= 37) {
                fg = p - 30;
            }
            else if (p >= 40 && p <= 47) {
                bg = p - 40;
            }
            else if (p >= 90 && p <= 97) {
                p += 8;
                fg = p - 90;
            }
            else if (p >= 100 && p <= 107) {
                p += 8;
                bg = p - 100;
            }
            else if (p === 0) {
                flags = this._terminal.defAttr >> 18;
                fg = (this._terminal.defAttr >> 9) & 0x1ff;
                bg = this._terminal.defAttr & 0x1ff;
            }
            else if (p === 1) {
                flags |= 1;
            }
            else if (p === 4) {
                flags |= 2;
            }
            else if (p === 5) {
                flags |= 4;
            }
            else if (p === 7) {
                flags |= 8;
            }
            else if (p === 8) {
                flags |= 16;
            }
            else if (p === 22) {
                flags &= ~1;
            }
            else if (p === 24) {
                flags &= ~2;
            }
            else if (p === 25) {
                flags &= ~4;
            }
            else if (p === 27) {
                flags &= ~8;
            }
            else if (p === 28) {
                flags &= ~16;
            }
            else if (p === 39) {
                fg = (this._terminal.defAttr >> 9) & 0x1ff;
            }
            else if (p === 49) {
                bg = this._terminal.defAttr & 0x1ff;
            }
            else if (p === 38) {
                if (params[i + 1] === 2) {
                    i += 2;
                    fg = this._terminal.matchColor(params[i] & 0xff, params[i + 1] & 0xff, params[i + 2] & 0xff);
                    if (fg === -1)
                        fg = 0x1ff;
                    i += 2;
                }
                else if (params[i + 1] === 5) {
                    i += 2;
                    p = params[i] & 0xff;
                    fg = p;
                }
            }
            else if (p === 48) {
                if (params[i + 1] === 2) {
                    i += 2;
                    bg = this._terminal.matchColor(params[i] & 0xff, params[i + 1] & 0xff, params[i + 2] & 0xff);
                    if (bg === -1)
                        bg = 0x1ff;
                    i += 2;
                }
                else if (params[i + 1] === 5) {
                    i += 2;
                    p = params[i] & 0xff;
                    bg = p;
                }
            }
            else if (p === 100) {
                fg = (this._terminal.defAttr >> 9) & 0x1ff;
                bg = this._terminal.defAttr & 0x1ff;
            }
            else {
                this._terminal.error('Unknown SGR attribute: %d.', p);
            }
        }
        this._terminal.curAttr = (flags << 18) | (fg << 9) | bg;
    };
    InputHandler.prototype.deviceStatus = function (params) {
        if (!this._terminal.prefix) {
            switch (params[0]) {
                case 5:
                    this._terminal.send(EscapeSequences_1.C0.ESC + '[0n');
                    break;
                case 6:
                    this._terminal.send(EscapeSequences_1.C0.ESC + '['
                        + (this._terminal.buffer.y + 1)
                        + ';'
                        + (this._terminal.buffer.x + 1)
                        + 'R');
                    break;
            }
        }
        else if (this._terminal.prefix === '?') {
            switch (params[0]) {
                case 6:
                    this._terminal.send(EscapeSequences_1.C0.ESC + '[?'
                        + (this._terminal.buffer.y + 1)
                        + ';'
                        + (this._terminal.buffer.x + 1)
                        + 'R');
                    break;
                case 15:
                    break;
                case 25:
                    break;
                case 26:
                    break;
                case 53:
                    break;
            }
        }
    };
    InputHandler.prototype.softReset = function (params) {
        this._terminal.cursorHidden = false;
        this._terminal.insertMode = false;
        this._terminal.originMode = false;
        this._terminal.wraparoundMode = true;
        this._terminal.applicationKeypad = false;
        this._terminal.viewport.syncScrollArea();
        this._terminal.applicationCursor = false;
        this._terminal.buffer.scrollTop = 0;
        this._terminal.buffer.scrollBottom = this._terminal.rows - 1;
        this._terminal.curAttr = this._terminal.defAttr;
        this._terminal.buffer.x = this._terminal.buffer.y = 0;
        this._terminal.charset = null;
        this._terminal.glevel = 0;
        this._terminal.charsets = [null];
    };
    InputHandler.prototype.setCursorStyle = function (params) {
        var param = params[0] < 1 ? 1 : params[0];
        switch (param) {
            case 1:
            case 2:
                this._terminal.setOption('cursorStyle', 'block');
                break;
            case 3:
            case 4:
                this._terminal.setOption('cursorStyle', 'underline');
                break;
            case 5:
            case 6:
                this._terminal.setOption('cursorStyle', 'bar');
                break;
        }
        var isBlinking = param % 2 === 1;
        this._terminal.setOption('cursorBlink', isBlinking);
    };
    InputHandler.prototype.setScrollRegion = function (params) {
        if (this._terminal.prefix)
            return;
        this._terminal.buffer.scrollTop = (params[0] || 1) - 1;
        this._terminal.buffer.scrollBottom = (params[1] && params[1] <= this._terminal.rows ? params[1] : this._terminal.rows) - 1;
        this._terminal.buffer.x = 0;
        this._terminal.buffer.y = 0;
    };
    InputHandler.prototype.saveCursor = function (params) {
        this._terminal.buffer.savedX = this._terminal.buffer.x;
        this._terminal.buffer.savedY = this._terminal.buffer.y;
    };
    InputHandler.prototype.restoreCursor = function (params) {
        this._terminal.buffer.x = this._terminal.buffer.savedX || 0;
        this._terminal.buffer.y = this._terminal.buffer.savedY || 0;
    };
    return InputHandler;
}());
exports.InputHandler = InputHandler;
exports.wcwidth = (function (opts) {
    var COMBINING_BMP = [
        [0x0300, 0x036F], [0x0483, 0x0486], [0x0488, 0x0489],
        [0x0591, 0x05BD], [0x05BF, 0x05BF], [0x05C1, 0x05C2],
        [0x05C4, 0x05C5], [0x05C7, 0x05C7], [0x0600, 0x0603],
        [0x0610, 0x0615], [0x064B, 0x065E], [0x0670, 0x0670],
        [0x06D6, 0x06E4], [0x06E7, 0x06E8], [0x06EA, 0x06ED],
        [0x070F, 0x070F], [0x0711, 0x0711], [0x0730, 0x074A],
        [0x07A6, 0x07B0], [0x07EB, 0x07F3], [0x0901, 0x0902],
        [0x093C, 0x093C], [0x0941, 0x0948], [0x094D, 0x094D],
        [0x0951, 0x0954], [0x0962, 0x0963], [0x0981, 0x0981],
        [0x09BC, 0x09BC], [0x09C1, 0x09C4], [0x09CD, 0x09CD],
        [0x09E2, 0x09E3], [0x0A01, 0x0A02], [0x0A3C, 0x0A3C],
        [0x0A41, 0x0A42], [0x0A47, 0x0A48], [0x0A4B, 0x0A4D],
        [0x0A70, 0x0A71], [0x0A81, 0x0A82], [0x0ABC, 0x0ABC],
        [0x0AC1, 0x0AC5], [0x0AC7, 0x0AC8], [0x0ACD, 0x0ACD],
        [0x0AE2, 0x0AE3], [0x0B01, 0x0B01], [0x0B3C, 0x0B3C],
        [0x0B3F, 0x0B3F], [0x0B41, 0x0B43], [0x0B4D, 0x0B4D],
        [0x0B56, 0x0B56], [0x0B82, 0x0B82], [0x0BC0, 0x0BC0],
        [0x0BCD, 0x0BCD], [0x0C3E, 0x0C40], [0x0C46, 0x0C48],
        [0x0C4A, 0x0C4D], [0x0C55, 0x0C56], [0x0CBC, 0x0CBC],
        [0x0CBF, 0x0CBF], [0x0CC6, 0x0CC6], [0x0CCC, 0x0CCD],
        [0x0CE2, 0x0CE3], [0x0D41, 0x0D43], [0x0D4D, 0x0D4D],
        [0x0DCA, 0x0DCA], [0x0DD2, 0x0DD4], [0x0DD6, 0x0DD6],
        [0x0E31, 0x0E31], [0x0E34, 0x0E3A], [0x0E47, 0x0E4E],
        [0x0EB1, 0x0EB1], [0x0EB4, 0x0EB9], [0x0EBB, 0x0EBC],
        [0x0EC8, 0x0ECD], [0x0F18, 0x0F19], [0x0F35, 0x0F35],
        [0x0F37, 0x0F37], [0x0F39, 0x0F39], [0x0F71, 0x0F7E],
        [0x0F80, 0x0F84], [0x0F86, 0x0F87], [0x0F90, 0x0F97],
        [0x0F99, 0x0FBC], [0x0FC6, 0x0FC6], [0x102D, 0x1030],
        [0x1032, 0x1032], [0x1036, 0x1037], [0x1039, 0x1039],
        [0x1058, 0x1059], [0x1160, 0x11FF], [0x135F, 0x135F],
        [0x1712, 0x1714], [0x1732, 0x1734], [0x1752, 0x1753],
        [0x1772, 0x1773], [0x17B4, 0x17B5], [0x17B7, 0x17BD],
        [0x17C6, 0x17C6], [0x17C9, 0x17D3], [0x17DD, 0x17DD],
        [0x180B, 0x180D], [0x18A9, 0x18A9], [0x1920, 0x1922],
        [0x1927, 0x1928], [0x1932, 0x1932], [0x1939, 0x193B],
        [0x1A17, 0x1A18], [0x1B00, 0x1B03], [0x1B34, 0x1B34],
        [0x1B36, 0x1B3A], [0x1B3C, 0x1B3C], [0x1B42, 0x1B42],
        [0x1B6B, 0x1B73], [0x1DC0, 0x1DCA], [0x1DFE, 0x1DFF],
        [0x200B, 0x200F], [0x202A, 0x202E], [0x2060, 0x2063],
        [0x206A, 0x206F], [0x20D0, 0x20EF], [0x302A, 0x302F],
        [0x3099, 0x309A], [0xA806, 0xA806], [0xA80B, 0xA80B],
        [0xA825, 0xA826], [0xFB1E, 0xFB1E], [0xFE00, 0xFE0F],
        [0xFE20, 0xFE23], [0xFEFF, 0xFEFF], [0xFFF9, 0xFFFB],
    ];
    var COMBINING_HIGH = [
        [0x10A01, 0x10A03], [0x10A05, 0x10A06], [0x10A0C, 0x10A0F],
        [0x10A38, 0x10A3A], [0x10A3F, 0x10A3F], [0x1D167, 0x1D169],
        [0x1D173, 0x1D182], [0x1D185, 0x1D18B], [0x1D1AA, 0x1D1AD],
        [0x1D242, 0x1D244], [0xE0001, 0xE0001], [0xE0020, 0xE007F],
        [0xE0100, 0xE01EF]
    ];
    function bisearch(ucs, data) {
        var min = 0;
        var max = data.length - 1;
        var mid;
        if (ucs < data[0][0] || ucs > data[max][1])
            return false;
        while (max >= min) {
            mid = (min + max) >> 1;
            if (ucs > data[mid][1])
                min = mid + 1;
            else if (ucs < data[mid][0])
                max = mid - 1;
            else
                return true;
        }
        return false;
    }
    function wcwidthBMP(ucs) {
        if (ucs === 0)
            return opts.nul;
        if (ucs < 32 || (ucs >= 0x7f && ucs < 0xa0))
            return opts.control;
        if (bisearch(ucs, COMBINING_BMP))
            return 0;
        if (isWideBMP(ucs)) {
            return 2;
        }
        return 1;
    }
    function isWideBMP(ucs) {
        return (ucs >= 0x1100 && (ucs <= 0x115f ||
            ucs === 0x2329 ||
            ucs === 0x232a ||
            (ucs >= 0x2e80 && ucs <= 0xa4cf && ucs !== 0x303f) ||
            (ucs >= 0xac00 && ucs <= 0xd7a3) ||
            (ucs >= 0xf900 && ucs <= 0xfaff) ||
            (ucs >= 0xfe10 && ucs <= 0xfe19) ||
            (ucs >= 0xfe30 && ucs <= 0xfe6f) ||
            (ucs >= 0xff00 && ucs <= 0xff60) ||
            (ucs >= 0xffe0 && ucs <= 0xffe6)));
    }
    function wcwidthHigh(ucs) {
        if (bisearch(ucs, COMBINING_HIGH))
            return 0;
        if ((ucs >= 0x20000 && ucs <= 0x2fffd) || (ucs >= 0x30000 && ucs <= 0x3fffd)) {
            return 2;
        }
        return 1;
    }
    var control = opts.control | 0;
    var table = null;
    function init_table() {
        var CODEPOINTS = 65536;
        var BITWIDTH = 2;
        var ITEMSIZE = 32;
        var CONTAINERSIZE = CODEPOINTS * BITWIDTH / ITEMSIZE;
        var CODEPOINTS_PER_ITEM = ITEMSIZE / BITWIDTH;
        table = (typeof Uint32Array === 'undefined')
            ? new Array(CONTAINERSIZE)
            : new Uint32Array(CONTAINERSIZE);
        for (var i = 0; i < CONTAINERSIZE; ++i) {
            var num = 0;
            var pos = CODEPOINTS_PER_ITEM;
            while (pos--)
                num = (num << 2) | wcwidthBMP(CODEPOINTS_PER_ITEM * i + pos);
            table[i] = num;
        }
        return table;
    }
    return function (num) {
        num = num | 0;
        if (num < 32)
            return control | 0;
        if (num < 127)
            return 1;
        var t = table || init_table();
        if (num < 65536)
            return t[num >> 4] >> ((num & 15) << 1) & 3;
        return wcwidthHigh(num);
    };
})({ nul: 0, control: 0 });



},{"./Charsets":3,"./EscapeSequences":5}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var INVALID_LINK_CLASS = 'xterm-invalid-link';
var protocolClause = '(https?:\\/\\/)';
var domainCharacterSet = '[\\da-z\\.-]+';
var negatedDomainCharacterSet = '[^\\da-z\\.-]+';
var domainBodyClause = '(' + domainCharacterSet + ')';
var tldClause = '([a-z\\.]{2,6})';
var ipClause = '((\\d{1,3}\\.){3}\\d{1,3})';
var localHostClause = '(localhost)';
var portClause = '(:\\d{1,5})';
var hostClause = '((' + domainBodyClause + '\\.' + tldClause + ')|' + ipClause + '|' + localHostClause + ')' + portClause + '?';
var pathClause = '(\\/[\\/\\w\\.\\-%~]*)*';
var queryStringHashFragmentCharacterSet = '[0-9\\w\\[\\]\\(\\)\\/\\?\\!#@$%&\'*+,:;~\\=\\.\\-]*';
var queryStringClause = '(\\?' + queryStringHashFragmentCharacterSet + ')?';
var hashFragmentClause = '(#' + queryStringHashFragmentCharacterSet + ')?';
var negatedPathCharacterSet = '[^\\/\\w\\.\\-%]+';
var bodyClause = hostClause + pathClause + queryStringClause + hashFragmentClause;
var start = '(?:^|' + negatedDomainCharacterSet + ')(';
var end = ')($|' + negatedPathCharacterSet + ')';
var strictUrlRegex = new RegExp(start + protocolClause + bodyClause + end);
var HYPERTEXT_LINK_MATCHER_ID = 0;
var Linkifier = (function () {
    function Linkifier() {
        this._nextLinkMatcherId = HYPERTEXT_LINK_MATCHER_ID;
        this._rowTimeoutIds = [];
        this._linkMatchers = [];
        this.registerLinkMatcher(strictUrlRegex, null, { matchIndex: 1 });
    }
    Linkifier.prototype.attachToDom = function (document, rows) {
        this._document = document;
        this._rows = rows;
    };
    Linkifier.prototype.linkifyRow = function (rowIndex) {
        if (!this._document) {
            return;
        }
        var timeoutId = this._rowTimeoutIds[rowIndex];
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        this._rowTimeoutIds[rowIndex] = setTimeout(this._linkifyRow.bind(this, rowIndex), Linkifier.TIME_BEFORE_LINKIFY);
    };
    Linkifier.prototype.setHypertextLinkHandler = function (handler) {
        this._linkMatchers[HYPERTEXT_LINK_MATCHER_ID].handler = handler;
    };
    Linkifier.prototype.setHypertextValidationCallback = function (callback) {
        this._linkMatchers[HYPERTEXT_LINK_MATCHER_ID].validationCallback = callback;
    };
    Linkifier.prototype.registerLinkMatcher = function (regex, handler, options) {
        if (options === void 0) { options = {}; }
        if (this._nextLinkMatcherId !== HYPERTEXT_LINK_MATCHER_ID && !handler) {
            throw new Error('handler must be defined');
        }
        var matcher = {
            id: this._nextLinkMatcherId++,
            regex: regex,
            handler: handler,
            matchIndex: options.matchIndex,
            validationCallback: options.validationCallback,
            priority: options.priority || 0
        };
        this._addLinkMatcherToList(matcher);
        return matcher.id;
    };
    Linkifier.prototype._addLinkMatcherToList = function (matcher) {
        if (this._linkMatchers.length === 0) {
            this._linkMatchers.push(matcher);
            return;
        }
        for (var i = this._linkMatchers.length - 1; i >= 0; i--) {
            if (matcher.priority <= this._linkMatchers[i].priority) {
                this._linkMatchers.splice(i + 1, 0, matcher);
                return;
            }
        }
        this._linkMatchers.splice(0, 0, matcher);
    };
    Linkifier.prototype.deregisterLinkMatcher = function (matcherId) {
        for (var i = 1; i < this._linkMatchers.length; i++) {
            if (this._linkMatchers[i].id === matcherId) {
                this._linkMatchers.splice(i, 1);
                return true;
            }
        }
        return false;
    };
    Linkifier.prototype._linkifyRow = function (rowIndex) {
        var row = this._rows[rowIndex];
        if (!row) {
            return;
        }
        var text = row.textContent;
        for (var i = 0; i < this._linkMatchers.length; i++) {
            var matcher = this._linkMatchers[i];
            var linkElements = this._doLinkifyRow(row, matcher);
            if (linkElements.length > 0) {
                if (matcher.validationCallback) {
                    var _loop_1 = function (j) {
                        var element = linkElements[j];
                        matcher.validationCallback(element.textContent, element, function (isValid) {
                            if (!isValid) {
                                element.classList.add(INVALID_LINK_CLASS);
                            }
                        });
                    };
                    for (var j = 0; j < linkElements.length; j++) {
                        _loop_1(j);
                    }
                }
                return;
            }
        }
    };
    Linkifier.prototype._doLinkifyRow = function (row, matcher) {
        var result = [];
        var isHttpLinkMatcher = matcher.id === HYPERTEXT_LINK_MATCHER_ID;
        var nodes = row.childNodes;
        var match = row.textContent.match(matcher.regex);
        if (!match || match.length === 0) {
            return result;
        }
        var uri = match[typeof matcher.matchIndex !== 'number' ? 0 : matcher.matchIndex];
        var rowStartIndex = match.index + uri.length;
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            var searchIndex = node.textContent.indexOf(uri);
            if (searchIndex >= 0) {
                var linkElement = this._createAnchorElement(uri, matcher.handler, isHttpLinkMatcher);
                if (node.textContent.length === uri.length) {
                    if (node.nodeType === 3) {
                        this._replaceNode(node, linkElement);
                    }
                    else {
                        var element = node;
                        if (element.nodeName === 'A') {
                            return result;
                        }
                        element.innerHTML = '';
                        element.appendChild(linkElement);
                    }
                }
                else if (node.childNodes.length > 1) {
                    for (var j = 0; j < node.childNodes.length; j++) {
                        var childNode = node.childNodes[j];
                        var childSearchIndex = childNode.textContent.indexOf(uri);
                        if (childSearchIndex !== -1) {
                            this._replaceNodeSubstringWithNode(childNode, linkElement, uri, childSearchIndex);
                            break;
                        }
                    }
                }
                else {
                    var nodesAdded = this._replaceNodeSubstringWithNode(node, linkElement, uri, searchIndex);
                    i += nodesAdded;
                }
                result.push(linkElement);
                match = row.textContent.substring(rowStartIndex).match(matcher.regex);
                if (!match || match.length === 0) {
                    return result;
                }
                uri = match[typeof matcher.matchIndex !== 'number' ? 0 : matcher.matchIndex];
                rowStartIndex += match.index + uri.length;
            }
        }
        return result;
    };
    Linkifier.prototype._createAnchorElement = function (uri, handler, isHypertextLinkHandler) {
        var element = this._document.createElement('a');
        element.textContent = uri;
        element.draggable = false;
        if (isHypertextLinkHandler) {
            element.href = uri;
            element.target = '_blank';
            element.addEventListener('click', function (event) {
                if (handler) {
                    return handler(event, uri);
                }
            });
        }
        else {
            element.addEventListener('click', function (event) {
                if (element.classList.contains(INVALID_LINK_CLASS)) {
                    return;
                }
                return handler(event, uri);
            });
        }
        return element;
    };
    Linkifier.prototype._replaceNode = function (oldNode) {
        var newNodes = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            newNodes[_i - 1] = arguments[_i];
        }
        var parent = oldNode.parentNode;
        for (var i = 0; i < newNodes.length; i++) {
            parent.insertBefore(newNodes[i], oldNode);
        }
        parent.removeChild(oldNode);
    };
    Linkifier.prototype._replaceNodeSubstringWithNode = function (targetNode, newNode, substring, substringIndex) {
        if (targetNode.childNodes.length === 1) {
            targetNode = targetNode.childNodes[0];
        }
        if (targetNode.nodeType !== 3) {
            throw new Error('targetNode must be a text node or only contain a single text node');
        }
        var fullText = targetNode.textContent;
        if (substringIndex === 0) {
            var rightText_1 = fullText.substring(substring.length);
            var rightTextNode_1 = this._document.createTextNode(rightText_1);
            this._replaceNode(targetNode, newNode, rightTextNode_1);
            return 0;
        }
        if (substringIndex === targetNode.textContent.length - substring.length) {
            var leftText_1 = fullText.substring(0, substringIndex);
            var leftTextNode_1 = this._document.createTextNode(leftText_1);
            this._replaceNode(targetNode, leftTextNode_1, newNode);
            return 0;
        }
        var leftText = fullText.substring(0, substringIndex);
        var leftTextNode = this._document.createTextNode(leftText);
        var rightText = fullText.substring(substringIndex + substring.length);
        var rightTextNode = this._document.createTextNode(rightText);
        this._replaceNode(targetNode, leftTextNode, newNode, rightTextNode);
        return 1;
    };
    return Linkifier;
}());
Linkifier.TIME_BEFORE_LINKIFY = 200;
exports.Linkifier = Linkifier;



},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EscapeSequences_1 = require("./EscapeSequences");
var Charsets_1 = require("./Charsets");
var normalStateHandler = {};
normalStateHandler[EscapeSequences_1.C0.BEL] = function (parser, handler) { return handler.bell(); };
normalStateHandler[EscapeSequences_1.C0.LF] = function (parser, handler) { return handler.lineFeed(); };
normalStateHandler[EscapeSequences_1.C0.VT] = normalStateHandler[EscapeSequences_1.C0.LF];
normalStateHandler[EscapeSequences_1.C0.FF] = normalStateHandler[EscapeSequences_1.C0.LF];
normalStateHandler[EscapeSequences_1.C0.CR] = function (parser, handler) { return handler.carriageReturn(); };
normalStateHandler[EscapeSequences_1.C0.BS] = function (parser, handler) { return handler.backspace(); };
normalStateHandler[EscapeSequences_1.C0.HT] = function (parser, handler) { return handler.tab(); };
normalStateHandler[EscapeSequences_1.C0.SO] = function (parser, handler) { return handler.shiftOut(); };
normalStateHandler[EscapeSequences_1.C0.SI] = function (parser, handler) { return handler.shiftIn(); };
normalStateHandler[EscapeSequences_1.C0.ESC] = function (parser, handler) { return parser.setState(ParserState.ESCAPED); };
var escapedStateHandler = {};
escapedStateHandler['['] = function (parser, terminal) {
    terminal.params = [];
    terminal.currentParam = 0;
    parser.setState(ParserState.CSI_PARAM);
};
escapedStateHandler[']'] = function (parser, terminal) {
    terminal.params = [];
    terminal.currentParam = 0;
    parser.setState(ParserState.OSC);
};
escapedStateHandler['P'] = function (parser, terminal) {
    terminal.params = [];
    terminal.currentParam = 0;
    parser.setState(ParserState.DCS);
};
escapedStateHandler['_'] = function (parser, terminal) {
    parser.setState(ParserState.IGNORE);
};
escapedStateHandler['^'] = function (parser, terminal) {
    parser.setState(ParserState.IGNORE);
};
escapedStateHandler['c'] = function (parser, terminal) {
    terminal.reset();
};
escapedStateHandler['E'] = function (parser, terminal) {
    terminal.buffer.x = 0;
    terminal.index();
    parser.setState(ParserState.NORMAL);
};
escapedStateHandler['D'] = function (parser, terminal) {
    terminal.index();
    parser.setState(ParserState.NORMAL);
};
escapedStateHandler['M'] = function (parser, terminal) {
    terminal.reverseIndex();
    parser.setState(ParserState.NORMAL);
};
escapedStateHandler['%'] = function (parser, terminal) {
    terminal.setgLevel(0);
    terminal.setgCharset(0, Charsets_1.DEFAULT_CHARSET);
    parser.setState(ParserState.NORMAL);
    parser.skipNextChar();
};
escapedStateHandler[EscapeSequences_1.C0.CAN] = function (parser) { return parser.setState(ParserState.NORMAL); };
var csiParamStateHandler = {};
csiParamStateHandler['?'] = function (parser) { return parser.setPrefix('?'); };
csiParamStateHandler['>'] = function (parser) { return parser.setPrefix('>'); };
csiParamStateHandler['!'] = function (parser) { return parser.setPrefix('!'); };
csiParamStateHandler['0'] = function (parser) { return parser.setParam(parser.getParam() * 10); };
csiParamStateHandler['1'] = function (parser) { return parser.setParam(parser.getParam() * 10 + 1); };
csiParamStateHandler['2'] = function (parser) { return parser.setParam(parser.getParam() * 10 + 2); };
csiParamStateHandler['3'] = function (parser) { return parser.setParam(parser.getParam() * 10 + 3); };
csiParamStateHandler['4'] = function (parser) { return parser.setParam(parser.getParam() * 10 + 4); };
csiParamStateHandler['5'] = function (parser) { return parser.setParam(parser.getParam() * 10 + 5); };
csiParamStateHandler['6'] = function (parser) { return parser.setParam(parser.getParam() * 10 + 6); };
csiParamStateHandler['7'] = function (parser) { return parser.setParam(parser.getParam() * 10 + 7); };
csiParamStateHandler['8'] = function (parser) { return parser.setParam(parser.getParam() * 10 + 8); };
csiParamStateHandler['9'] = function (parser) { return parser.setParam(parser.getParam() * 10 + 9); };
csiParamStateHandler['$'] = function (parser) { return parser.setPostfix('$'); };
csiParamStateHandler['"'] = function (parser) { return parser.setPostfix('"'); };
csiParamStateHandler[' '] = function (parser) { return parser.setPostfix(' '); };
csiParamStateHandler['\''] = function (parser) { return parser.setPostfix('\''); };
csiParamStateHandler[';'] = function (parser) { return parser.finalizeParam(); };
csiParamStateHandler[EscapeSequences_1.C0.CAN] = function (parser) { return parser.setState(ParserState.NORMAL); };
var csiStateHandler = {};
csiStateHandler['@'] = function (handler, params, prefix) { return handler.insertChars(params); };
csiStateHandler['A'] = function (handler, params, prefix) { return handler.cursorUp(params); };
csiStateHandler['B'] = function (handler, params, prefix) { return handler.cursorDown(params); };
csiStateHandler['C'] = function (handler, params, prefix) { return handler.cursorForward(params); };
csiStateHandler['D'] = function (handler, params, prefix) { return handler.cursorBackward(params); };
csiStateHandler['E'] = function (handler, params, prefix) { return handler.cursorNextLine(params); };
csiStateHandler['F'] = function (handler, params, prefix) { return handler.cursorPrecedingLine(params); };
csiStateHandler['G'] = function (handler, params, prefix) { return handler.cursorCharAbsolute(params); };
csiStateHandler['H'] = function (handler, params, prefix) { return handler.cursorPosition(params); };
csiStateHandler['I'] = function (handler, params, prefix) { return handler.cursorForwardTab(params); };
csiStateHandler['J'] = function (handler, params, prefix) { return handler.eraseInDisplay(params); };
csiStateHandler['K'] = function (handler, params, prefix) { return handler.eraseInLine(params); };
csiStateHandler['L'] = function (handler, params, prefix) { return handler.insertLines(params); };
csiStateHandler['M'] = function (handler, params, prefix) { return handler.deleteLines(params); };
csiStateHandler['P'] = function (handler, params, prefix) { return handler.deleteChars(params); };
csiStateHandler['S'] = function (handler, params, prefix) { return handler.scrollUp(params); };
csiStateHandler['T'] = function (handler, params, prefix) {
    if (params.length < 2 && !prefix) {
        handler.scrollDown(params);
    }
};
csiStateHandler['X'] = function (handler, params, prefix) { return handler.eraseChars(params); };
csiStateHandler['Z'] = function (handler, params, prefix) { return handler.cursorBackwardTab(params); };
csiStateHandler['`'] = function (handler, params, prefix) { return handler.charPosAbsolute(params); };
csiStateHandler['a'] = function (handler, params, prefix) { return handler.HPositionRelative(params); };
csiStateHandler['b'] = function (handler, params, prefix) { return handler.repeatPrecedingCharacter(params); };
csiStateHandler['c'] = function (handler, params, prefix) { return handler.sendDeviceAttributes(params); };
csiStateHandler['d'] = function (handler, params, prefix) { return handler.linePosAbsolute(params); };
csiStateHandler['e'] = function (handler, params, prefix) { return handler.VPositionRelative(params); };
csiStateHandler['f'] = function (handler, params, prefix) { return handler.HVPosition(params); };
csiStateHandler['g'] = function (handler, params, prefix) { return handler.tabClear(params); };
csiStateHandler['h'] = function (handler, params, prefix) { return handler.setMode(params); };
csiStateHandler['l'] = function (handler, params, prefix) { return handler.resetMode(params); };
csiStateHandler['m'] = function (handler, params, prefix) { return handler.charAttributes(params); };
csiStateHandler['n'] = function (handler, params, prefix) { return handler.deviceStatus(params); };
csiStateHandler['p'] = function (handler, params, prefix) {
    switch (prefix) {
        case '!':
            handler.softReset(params);
            break;
    }
};
csiStateHandler['q'] = function (handler, params, prefix, postfix) {
    if (postfix === ' ') {
        handler.setCursorStyle(params);
    }
};
csiStateHandler['r'] = function (handler, params) { return handler.setScrollRegion(params); };
csiStateHandler['s'] = function (handler, params) { return handler.saveCursor(params); };
csiStateHandler['u'] = function (handler, params) { return handler.restoreCursor(params); };
csiStateHandler[EscapeSequences_1.C0.CAN] = function (handler, params, prefix, postfix, parser) { return parser.setState(ParserState.NORMAL); };
var ParserState;
(function (ParserState) {
    ParserState[ParserState["NORMAL"] = 0] = "NORMAL";
    ParserState[ParserState["ESCAPED"] = 1] = "ESCAPED";
    ParserState[ParserState["CSI_PARAM"] = 2] = "CSI_PARAM";
    ParserState[ParserState["CSI"] = 3] = "CSI";
    ParserState[ParserState["OSC"] = 4] = "OSC";
    ParserState[ParserState["CHARSET"] = 5] = "CHARSET";
    ParserState[ParserState["DCS"] = 6] = "DCS";
    ParserState[ParserState["IGNORE"] = 7] = "IGNORE";
})(ParserState || (ParserState = {}));
var Parser = (function () {
    function Parser(_inputHandler, _terminal) {
        this._inputHandler = _inputHandler;
        this._terminal = _terminal;
        this._state = ParserState.NORMAL;
    }
    Parser.prototype.parse = function (data) {
        var l = data.length, j, cs, ch, code, low;
        if (this._terminal.debug) {
            this._terminal.log('data: ' + data);
        }
        this._position = 0;
        if (this._terminal.surrogate_high) {
            data = this._terminal.surrogate_high + data;
            this._terminal.surrogate_high = '';
        }
        for (; this._position < l; this._position++) {
            ch = data[this._position];
            code = data.charCodeAt(this._position);
            if (0xD800 <= code && code <= 0xDBFF) {
                low = data.charCodeAt(this._position + 1);
                if (isNaN(low)) {
                    this._terminal.surrogate_high = ch;
                    continue;
                }
                code = ((code - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
                ch += data.charAt(this._position + 1);
            }
            if (0xDC00 <= code && code <= 0xDFFF)
                continue;
            switch (this._state) {
                case ParserState.NORMAL:
                    if (ch in normalStateHandler) {
                        normalStateHandler[ch](this, this._inputHandler);
                    }
                    else {
                        this._inputHandler.addChar(ch, code);
                    }
                    break;
                case ParserState.ESCAPED:
                    if (ch in escapedStateHandler) {
                        escapedStateHandler[ch](this, this._terminal);
                        break;
                    }
                    switch (ch) {
                        case '(':
                        case ')':
                        case '*':
                        case '+':
                        case '-':
                        case '.':
                            switch (ch) {
                                case '(':
                                    this._terminal.gcharset = 0;
                                    break;
                                case ')':
                                    this._terminal.gcharset = 1;
                                    break;
                                case '*':
                                    this._terminal.gcharset = 2;
                                    break;
                                case '+':
                                    this._terminal.gcharset = 3;
                                    break;
                                case '-':
                                    this._terminal.gcharset = 1;
                                    break;
                                case '.':
                                    this._terminal.gcharset = 2;
                                    break;
                            }
                            this._state = ParserState.CHARSET;
                            break;
                        case '/':
                            this._terminal.gcharset = 3;
                            this._state = ParserState.CHARSET;
                            this._position--;
                            break;
                        case 'N':
                            break;
                        case 'O':
                            break;
                        case 'n':
                            this._terminal.setgLevel(2);
                            break;
                        case 'o':
                            this._terminal.setgLevel(3);
                            break;
                        case '|':
                            this._terminal.setgLevel(3);
                            break;
                        case '}':
                            this._terminal.setgLevel(2);
                            break;
                        case '~':
                            this._terminal.setgLevel(1);
                            break;
                        case '7':
                            this._inputHandler.saveCursor();
                            this._state = ParserState.NORMAL;
                            break;
                        case '8':
                            this._inputHandler.restoreCursor();
                            this._state = ParserState.NORMAL;
                            break;
                        case '#':
                            this._state = ParserState.NORMAL;
                            this._position++;
                            break;
                        case 'H':
                            this._terminal.tabSet();
                            this._state = ParserState.NORMAL;
                            break;
                        case '=':
                            this._terminal.log('Serial port requested application keypad.');
                            this._terminal.applicationKeypad = true;
                            this._terminal.viewport.syncScrollArea();
                            this._state = ParserState.NORMAL;
                            break;
                        case '>':
                            this._terminal.log('Switching back to normal keypad.');
                            this._terminal.applicationKeypad = false;
                            this._terminal.viewport.syncScrollArea();
                            this._state = ParserState.NORMAL;
                            break;
                        default:
                            this._state = ParserState.NORMAL;
                            this._terminal.error('Unknown ESC control: %s.', ch);
                            break;
                    }
                    break;
                case ParserState.CHARSET:
                    if (ch in Charsets_1.CHARSETS) {
                        cs = Charsets_1.CHARSETS[ch];
                        if (ch === '/') {
                            this.skipNextChar();
                        }
                    }
                    else {
                        cs = Charsets_1.DEFAULT_CHARSET;
                    }
                    this._terminal.setgCharset(this._terminal.gcharset, cs);
                    this._terminal.gcharset = null;
                    this._state = ParserState.NORMAL;
                    break;
                case ParserState.OSC:
                    if (ch === EscapeSequences_1.C0.ESC || ch === EscapeSequences_1.C0.BEL) {
                        if (ch === EscapeSequences_1.C0.ESC)
                            this._position++;
                        this._terminal.params.push(this._terminal.currentParam);
                        switch (this._terminal.params[0]) {
                            case 0:
                            case 1:
                            case 2:
                                if (this._terminal.params[1]) {
                                    this._terminal.title = this._terminal.params[1];
                                    this._terminal.handleTitle(this._terminal.title);
                                }
                                break;
                            case 3:
                                break;
                            case 4:
                            case 5:
                                break;
                            case 10:
                            case 11:
                            case 12:
                            case 13:
                            case 14:
                            case 15:
                            case 16:
                            case 17:
                            case 18:
                            case 19:
                                break;
                            case 46:
                                break;
                            case 50:
                                break;
                            case 51:
                                break;
                            case 52:
                                break;
                            case 104:
                            case 105:
                            case 110:
                            case 111:
                            case 112:
                            case 113:
                            case 114:
                            case 115:
                            case 116:
                            case 117:
                            case 118:
                                break;
                        }
                        this._terminal.params = [];
                        this._terminal.currentParam = 0;
                        this._state = ParserState.NORMAL;
                    }
                    else {
                        if (!this._terminal.params.length) {
                            if (ch >= '0' && ch <= '9') {
                                this._terminal.currentParam =
                                    this._terminal.currentParam * 10 + ch.charCodeAt(0) - 48;
                            }
                            else if (ch === ';') {
                                this._terminal.params.push(this._terminal.currentParam);
                                this._terminal.currentParam = '';
                            }
                        }
                        else {
                            this._terminal.currentParam += ch;
                        }
                    }
                    break;
                case ParserState.CSI_PARAM:
                    if (ch in csiParamStateHandler) {
                        csiParamStateHandler[ch](this);
                        break;
                    }
                    this.finalizeParam();
                    this._state = ParserState.CSI;
                case ParserState.CSI:
                    if (ch in csiStateHandler) {
                        if (this._terminal.debug) {
                            this._terminal.log("CSI " + (this._terminal.prefix ? this._terminal.prefix : '') + " " + (this._terminal.params ? this._terminal.params.join(';') : '') + " " + (this._terminal.postfix ? this._terminal.postfix : '') + " " + ch);
                        }
                        csiStateHandler[ch](this._inputHandler, this._terminal.params, this._terminal.prefix, this._terminal.postfix, this);
                    }
                    else {
                        this._terminal.error('Unknown CSI code: %s.', ch);
                    }
                    this._state = ParserState.NORMAL;
                    this._terminal.prefix = '';
                    this._terminal.postfix = '';
                    break;
                case ParserState.DCS:
                    if (ch === EscapeSequences_1.C0.ESC || ch === EscapeSequences_1.C0.BEL) {
                        if (ch === EscapeSequences_1.C0.ESC)
                            this._position++;
                        var pt = void 0;
                        var valid = void 0;
                        switch (this._terminal.prefix) {
                            case '':
                                break;
                            case '$q':
                                pt = this._terminal.currentParam;
                                valid = false;
                                switch (pt) {
                                    case '"q':
                                        pt = '0"q';
                                        break;
                                    case '"p':
                                        pt = '61"p';
                                        break;
                                    case 'r':
                                        pt = ''
                                            + (this._terminal.buffer.scrollTop + 1)
                                            + ';'
                                            + (this._terminal.buffer.scrollBottom + 1)
                                            + 'r';
                                        break;
                                    case 'm':
                                        pt = '0m';
                                        break;
                                    default:
                                        this._terminal.error('Unknown DCS Pt: %s.', pt);
                                        pt = '';
                                        break;
                                }
                                this._terminal.send(EscapeSequences_1.C0.ESC + 'P' + +valid + '$r' + pt + EscapeSequences_1.C0.ESC + '\\');
                                break;
                            case '+p':
                                break;
                            case '+q':
                                pt = this._terminal.currentParam;
                                valid = false;
                                this._terminal.send(EscapeSequences_1.C0.ESC + 'P' + +valid + '+r' + pt + EscapeSequences_1.C0.ESC + '\\');
                                break;
                            default:
                                this._terminal.error('Unknown DCS prefix: %s.', this._terminal.prefix);
                                break;
                        }
                        this._terminal.currentParam = 0;
                        this._terminal.prefix = '';
                        this._state = ParserState.NORMAL;
                    }
                    else if (!this._terminal.currentParam) {
                        if (!this._terminal.prefix && ch !== '$' && ch !== '+') {
                            this._terminal.currentParam = ch;
                        }
                        else if (this._terminal.prefix.length === 2) {
                            this._terminal.currentParam = ch;
                        }
                        else {
                            this._terminal.prefix += ch;
                        }
                    }
                    else {
                        this._terminal.currentParam += ch;
                    }
                    break;
                case ParserState.IGNORE:
                    if (ch === EscapeSequences_1.C0.ESC || ch === EscapeSequences_1.C0.BEL) {
                        if (ch === EscapeSequences_1.C0.ESC)
                            this._position++;
                        this._state = ParserState.NORMAL;
                    }
                    break;
            }
        }
        return this._state;
    };
    Parser.prototype.setState = function (state) {
        this._state = state;
    };
    Parser.prototype.setPrefix = function (prefix) {
        this._terminal.prefix = prefix;
    };
    Parser.prototype.setPostfix = function (postfix) {
        this._terminal.postfix = postfix;
    };
    Parser.prototype.setParam = function (param) {
        this._terminal.currentParam = param;
    };
    Parser.prototype.getParam = function () {
        return this._terminal.currentParam;
    };
    Parser.prototype.finalizeParam = function () {
        this._terminal.params.push(this._terminal.currentParam);
        this._terminal.currentParam = 0;
    };
    Parser.prototype.skipNextChar = function () {
        this._position++;
    };
    return Parser;
}());
exports.Parser = Parser;



},{"./Charsets":3,"./EscapeSequences":5}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DomElementObjectPool_1 = require("./utils/DomElementObjectPool");
var MAX_REFRESH_FRAME_SKIP = 5;
var FLAGS;
(function (FLAGS) {
    FLAGS[FLAGS["BOLD"] = 1] = "BOLD";
    FLAGS[FLAGS["UNDERLINE"] = 2] = "UNDERLINE";
    FLAGS[FLAGS["BLINK"] = 4] = "BLINK";
    FLAGS[FLAGS["INVERSE"] = 8] = "INVERSE";
    FLAGS[FLAGS["INVISIBLE"] = 16] = "INVISIBLE";
})(FLAGS || (FLAGS = {}));
;
var brokenBold = null;
var Renderer = (function () {
    function Renderer(_terminal) {
        this._terminal = _terminal;
        this._refreshRowsQueue = [];
        this._refreshFramesSkipped = 0;
        this._refreshAnimationFrame = null;
        this._spanElementObjectPool = new DomElementObjectPool_1.DomElementObjectPool('span');
        if (brokenBold === null) {
            brokenBold = checkBoldBroken(this._terminal.element);
        }
        this._spanElementObjectPool = new DomElementObjectPool_1.DomElementObjectPool('span');
    }
    Renderer.prototype.queueRefresh = function (start, end) {
        this._refreshRowsQueue.push({ start: start, end: end });
        if (!this._refreshAnimationFrame) {
            this._refreshAnimationFrame = window.requestAnimationFrame(this._refreshLoop.bind(this));
        }
    };
    Renderer.prototype._refreshLoop = function () {
        var skipFrame = this._terminal.writeBuffer.length > 0 && this._refreshFramesSkipped++ <= MAX_REFRESH_FRAME_SKIP;
        if (skipFrame) {
            this._refreshAnimationFrame = window.requestAnimationFrame(this._refreshLoop.bind(this));
            return;
        }
        this._refreshFramesSkipped = 0;
        var start;
        var end;
        if (this._refreshRowsQueue.length > 4) {
            start = 0;
            end = this._terminal.rows - 1;
        }
        else {
            start = this._refreshRowsQueue[0].start;
            end = this._refreshRowsQueue[0].end;
            for (var i = 1; i < this._refreshRowsQueue.length; i++) {
                if (this._refreshRowsQueue[i].start < start) {
                    start = this._refreshRowsQueue[i].start;
                }
                if (this._refreshRowsQueue[i].end > end) {
                    end = this._refreshRowsQueue[i].end;
                }
            }
        }
        this._refreshRowsQueue = [];
        this._refreshAnimationFrame = null;
        this._refresh(start, end);
    };
    Renderer.prototype._refresh = function (start, end) {
        var parent;
        if (end - start >= this._terminal.rows / 2) {
            parent = this._terminal.element.parentNode;
            if (parent) {
                this._terminal.element.removeChild(this._terminal.rowContainer);
            }
        }
        var width = this._terminal.cols;
        var y = start;
        if (end >= this._terminal.rows) {
            this._terminal.log('`end` is too large. Most likely a bad CSR.');
            end = this._terminal.rows - 1;
        }
        for (; y <= end; y++) {
            var row = y + this._terminal.buffer.ydisp;
            var line = this._terminal.buffer.lines.get(row);
            var x = void 0;
            if (this._terminal.buffer.y === y - (this._terminal.buffer.ybase - this._terminal.buffer.ydisp) &&
                this._terminal.cursorState &&
                !this._terminal.cursorHidden) {
                x = this._terminal.buffer.x;
            }
            else {
                x = -1;
            }
            var attr = this._terminal.defAttr;
            var documentFragment = document.createDocumentFragment();
            var innerHTML = '';
            var currentElement = void 0;
            while (this._terminal.children[y].children.length) {
                var child = this._terminal.children[y].children[0];
                this._terminal.children[y].removeChild(child);
                this._spanElementObjectPool.release(child);
            }
            for (var i = 0; i < width; i++) {
                var data = line[i][0];
                var ch = line[i][1];
                var ch_width = line[i][2];
                var isCursor = i === x;
                if (!ch_width) {
                    continue;
                }
                if (data !== attr || isCursor) {
                    if (attr !== this._terminal.defAttr && !isCursor) {
                        if (innerHTML) {
                            currentElement.innerHTML = innerHTML;
                            innerHTML = '';
                        }
                        documentFragment.appendChild(currentElement);
                        currentElement = null;
                    }
                    if (data !== this._terminal.defAttr || isCursor) {
                        if (innerHTML && !currentElement) {
                            currentElement = this._spanElementObjectPool.acquire();
                        }
                        if (currentElement) {
                            if (innerHTML) {
                                currentElement.innerHTML = innerHTML;
                                innerHTML = '';
                            }
                            documentFragment.appendChild(currentElement);
                        }
                        currentElement = this._spanElementObjectPool.acquire();
                        var bg = data & 0x1ff;
                        var fg = (data >> 9) & 0x1ff;
                        var flags = data >> 18;
                        if (isCursor) {
                            currentElement.classList.add('reverse-video');
                            currentElement.classList.add('terminal-cursor');
                        }
                        if (flags & FLAGS.BOLD) {
                            if (!brokenBold) {
                                currentElement.classList.add('xterm-bold');
                            }
                            if (fg < 8) {
                                fg += 8;
                            }
                        }
                        if (flags & FLAGS.UNDERLINE) {
                            currentElement.classList.add('xterm-underline');
                        }
                        if (flags & FLAGS.BLINK) {
                            currentElement.classList.add('xterm-blink');
                        }
                        if (flags & FLAGS.INVERSE) {
                            var temp = bg;
                            bg = fg;
                            fg = temp;
                            if ((flags & 1) && fg < 8) {
                                fg += 8;
                            }
                        }
                        if (flags & FLAGS.INVISIBLE && !isCursor) {
                            currentElement.classList.add('xterm-hidden');
                        }
                        if (flags & FLAGS.INVERSE) {
                            if (bg === 257) {
                                bg = 15;
                            }
                            if (fg === 256) {
                                fg = 0;
                            }
                        }
                        if (bg < 256) {
                            currentElement.classList.add("xterm-bg-color-" + bg);
                        }
                        if (fg < 256) {
                            currentElement.classList.add("xterm-color-" + fg);
                        }
                    }
                }
                if (ch_width === 2) {
                    innerHTML += "<span class=\"xterm-wide-char\">" + ch + "</span>";
                }
                else if (ch.charCodeAt(0) > 255) {
                    innerHTML += "<span class=\"xterm-normal-char\">" + ch + "</span>";
                }
                else {
                    switch (ch) {
                        case '&':
                            innerHTML += '&amp;';
                            break;
                        case '<':
                            innerHTML += '&lt;';
                            break;
                        case '>':
                            innerHTML += '&gt;';
                            break;
                        default:
                            if (ch <= ' ') {
                                innerHTML += '&nbsp;';
                            }
                            else {
                                innerHTML += ch;
                            }
                            break;
                    }
                }
                attr = isCursor ? -1 : data;
            }
            if (innerHTML && !currentElement) {
                currentElement = this._spanElementObjectPool.acquire();
            }
            if (currentElement) {
                if (innerHTML) {
                    currentElement.innerHTML = innerHTML;
                    innerHTML = '';
                }
                documentFragment.appendChild(currentElement);
                currentElement = null;
            }
            this._terminal.children[y].appendChild(documentFragment);
        }
        if (parent) {
            this._terminal.element.appendChild(this._terminal.rowContainer);
        }
        this._terminal.emit('refresh', { element: this._terminal.element, start: start, end: end });
    };
    ;
    Renderer.prototype.refreshSelection = function (start, end) {
        while (this._terminal.selectionContainer.children.length) {
            this._terminal.selectionContainer.removeChild(this._terminal.selectionContainer.children[0]);
        }
        if (!start || !end) {
            return;
        }
        var viewportStartRow = start[1] - this._terminal.buffer.ydisp;
        var viewportEndRow = end[1] - this._terminal.buffer.ydisp;
        var viewportCappedStartRow = Math.max(viewportStartRow, 0);
        var viewportCappedEndRow = Math.min(viewportEndRow, this._terminal.rows - 1);
        if (viewportCappedStartRow >= this._terminal.rows || viewportCappedEndRow < 0) {
            return;
        }
        var documentFragment = document.createDocumentFragment();
        var startCol = viewportStartRow === viewportCappedStartRow ? start[0] : 0;
        var endCol = viewportCappedStartRow === viewportCappedEndRow ? end[0] : this._terminal.cols;
        documentFragment.appendChild(this._createSelectionElement(viewportCappedStartRow, startCol, endCol));
        var middleRowsCount = viewportCappedEndRow - viewportCappedStartRow - 1;
        documentFragment.appendChild(this._createSelectionElement(viewportCappedStartRow + 1, 0, this._terminal.cols, middleRowsCount));
        if (viewportCappedStartRow !== viewportCappedEndRow) {
            var endCol_1 = viewportEndRow === viewportCappedEndRow ? end[0] : this._terminal.cols;
            documentFragment.appendChild(this._createSelectionElement(viewportCappedEndRow, 0, endCol_1));
        }
        this._terminal.selectionContainer.appendChild(documentFragment);
    };
    Renderer.prototype._createSelectionElement = function (row, colStart, colEnd, rowCount) {
        if (rowCount === void 0) { rowCount = 1; }
        var element = document.createElement('div');
        element.style.height = rowCount * this._terminal.charMeasure.height + "px";
        element.style.top = row * this._terminal.charMeasure.height + "px";
        element.style.left = colStart * this._terminal.charMeasure.width + "px";
        element.style.width = this._terminal.charMeasure.width * (colEnd - colStart) + "px";
        return element;
    };
    return Renderer;
}());
exports.Renderer = Renderer;
function checkBoldBroken(terminal) {
    var document = terminal.ownerDocument;
    var el = document.createElement('span');
    el.innerHTML = 'hello world';
    terminal.appendChild(el);
    var w1 = el.offsetWidth;
    var h1 = el.offsetHeight;
    el.style.fontWeight = 'bold';
    var w2 = el.offsetWidth;
    var h2 = el.offsetHeight;
    terminal.removeChild(el);
    return w1 !== w2 || h1 !== h2;
}



},{"./utils/DomElementObjectPool":19}],11:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Mouse = require("./utils/Mouse");
var Browser = require("./utils/Browser");
var EventEmitter_1 = require("./EventEmitter");
var SelectionModel_1 = require("./SelectionModel");
var BufferLine_1 = require("./utils/BufferLine");
var DRAG_SCROLL_MAX_THRESHOLD = 50;
var DRAG_SCROLL_MAX_SPEED = 15;
var DRAG_SCROLL_INTERVAL = 50;
var WORD_SEPARATORS = ' ()[]{}\'"';
var LINE_DATA_CHAR_INDEX = 1;
var LINE_DATA_WIDTH_INDEX = 2;
var NON_BREAKING_SPACE_CHAR = String.fromCharCode(160);
var ALL_NON_BREAKING_SPACE_REGEX = new RegExp(NON_BREAKING_SPACE_CHAR, 'g');
var SelectionMode;
(function (SelectionMode) {
    SelectionMode[SelectionMode["NORMAL"] = 0] = "NORMAL";
    SelectionMode[SelectionMode["WORD"] = 1] = "WORD";
    SelectionMode[SelectionMode["LINE"] = 2] = "LINE";
})(SelectionMode || (SelectionMode = {}));
var SelectionManager = (function (_super) {
    __extends(SelectionManager, _super);
    function SelectionManager(_terminal, _buffer, _rowContainer, _charMeasure) {
        var _this = _super.call(this) || this;
        _this._terminal = _terminal;
        _this._buffer = _buffer;
        _this._rowContainer = _rowContainer;
        _this._charMeasure = _charMeasure;
        _this._enabled = true;
        _this._initListeners();
        _this.enable();
        _this._model = new SelectionModel_1.SelectionModel(_terminal);
        _this._activeSelectionMode = SelectionMode.NORMAL;
        return _this;
    }
    SelectionManager.prototype._initListeners = function () {
        var _this = this;
        this._mouseMoveListener = function (event) { return _this._onMouseMove(event); };
        this._mouseUpListener = function (event) { return _this._onMouseUp(event); };
        this._rowContainer.addEventListener('mousedown', function (event) { return _this._onMouseDown(event); });
        this._buffer.on('trim', function (amount) { return _this._onTrim(amount); });
    };
    SelectionManager.prototype.disable = function () {
        this.clearSelection();
        this._enabled = false;
    };
    SelectionManager.prototype.enable = function () {
        this._enabled = true;
    };
    SelectionManager.prototype.setBuffer = function (buffer) {
        this._buffer = buffer;
        this.clearSelection();
    };
    Object.defineProperty(SelectionManager.prototype, "selectionStart", {
        get: function () { return this._model.finalSelectionStart; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SelectionManager.prototype, "selectionEnd", {
        get: function () { return this._model.finalSelectionEnd; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SelectionManager.prototype, "hasSelection", {
        get: function () {
            var start = this._model.finalSelectionStart;
            var end = this._model.finalSelectionEnd;
            if (!start || !end) {
                return false;
            }
            return start[0] !== end[0] || start[1] !== end[1];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SelectionManager.prototype, "selectionText", {
        get: function () {
            var start = this._model.finalSelectionStart;
            var end = this._model.finalSelectionEnd;
            if (!start || !end) {
                return '';
            }
            var startRowEndCol = start[1] === end[1] ? end[0] : null;
            var result = [];
            result.push(BufferLine_1.translateBufferLineToString(this._buffer.get(start[1]), true, start[0], startRowEndCol));
            for (var i = start[1] + 1; i <= end[1] - 1; i++) {
                var bufferLine = this._buffer.get(i);
                var lineText = BufferLine_1.translateBufferLineToString(bufferLine, true);
                if (bufferLine.isWrapped) {
                    result[result.length - 1] += lineText;
                }
                else {
                    result.push(lineText);
                }
            }
            if (start[1] !== end[1]) {
                var bufferLine = this._buffer.get(end[1]);
                var lineText = BufferLine_1.translateBufferLineToString(bufferLine, true, 0, end[0]);
                if (bufferLine.isWrapped) {
                    result[result.length - 1] += lineText;
                }
                else {
                    result.push(lineText);
                }
            }
            var formattedResult = result.map(function (line) {
                return line.replace(ALL_NON_BREAKING_SPACE_REGEX, ' ');
            }).join(Browser.isMSWindows ? '\r\n' : '\n');
            return formattedResult;
        },
        enumerable: true,
        configurable: true
    });
    SelectionManager.prototype.clearSelection = function () {
        this._model.clearSelection();
        this._removeMouseDownListeners();
        this.refresh();
    };
    SelectionManager.prototype.refresh = function (isNewSelection) {
        var _this = this;
        if (!this._refreshAnimationFrame) {
            this._refreshAnimationFrame = window.requestAnimationFrame(function () { return _this._refresh(); });
        }
        if (Browser.isLinux && isNewSelection) {
            var selectionText = this.selectionText;
            if (selectionText.length) {
                this.emit('newselection', this.selectionText);
            }
        }
    };
    SelectionManager.prototype._refresh = function () {
        this._refreshAnimationFrame = null;
        this.emit('refresh', { start: this._model.finalSelectionStart, end: this._model.finalSelectionEnd });
    };
    SelectionManager.prototype.selectAll = function () {
        this._model.isSelectAllActive = true;
        this.refresh();
    };
    SelectionManager.prototype._onTrim = function (amount) {
        var needsRefresh = this._model.onTrim(amount);
        if (needsRefresh) {
            this.refresh();
        }
    };
    SelectionManager.prototype._getMouseBufferCoords = function (event) {
        var coords = Mouse.getCoords(event, this._rowContainer, this._charMeasure, this._terminal.cols, this._terminal.rows, true);
        if (!coords) {
            return null;
        }
        coords[0]--;
        coords[1]--;
        coords[1] += this._terminal.buffer.ydisp;
        return coords;
    };
    SelectionManager.prototype._getMouseEventScrollAmount = function (event) {
        var offset = Mouse.getCoordsRelativeToElement(event, this._rowContainer)[1];
        var terminalHeight = this._terminal.rows * this._charMeasure.height;
        if (offset >= 0 && offset <= terminalHeight) {
            return 0;
        }
        if (offset > terminalHeight) {
            offset -= terminalHeight;
        }
        offset = Math.min(Math.max(offset, -DRAG_SCROLL_MAX_THRESHOLD), DRAG_SCROLL_MAX_THRESHOLD);
        offset /= DRAG_SCROLL_MAX_THRESHOLD;
        return (offset / Math.abs(offset)) + Math.round(offset * (DRAG_SCROLL_MAX_SPEED - 1));
    };
    SelectionManager.prototype._onMouseDown = function (event) {
        if (event.button === 2 && this.hasSelection) {
            event.stopPropagation();
            return;
        }
        if (event.button !== 0) {
            return;
        }
        if (!this._enabled) {
            var shouldForceSelection = Browser.isMac && event.altKey;
            if (!shouldForceSelection) {
                return;
            }
            event.stopPropagation();
        }
        event.preventDefault();
        this._dragScrollAmount = 0;
        if (this._enabled && event.shiftKey) {
            this._onIncrementalClick(event);
        }
        else {
            if (event.detail === 1) {
                this._onSingleClick(event);
            }
            else if (event.detail === 2) {
                this._onDoubleClick(event);
            }
            else if (event.detail === 3) {
                this._onTripleClick(event);
            }
        }
        this._addMouseDownListeners();
        this.refresh(true);
    };
    SelectionManager.prototype._addMouseDownListeners = function () {
        var _this = this;
        this._rowContainer.ownerDocument.addEventListener('mousemove', this._mouseMoveListener);
        this._rowContainer.ownerDocument.addEventListener('mouseup', this._mouseUpListener);
        this._dragScrollIntervalTimer = setInterval(function () { return _this._dragScroll(); }, DRAG_SCROLL_INTERVAL);
    };
    SelectionManager.prototype._removeMouseDownListeners = function () {
        this._rowContainer.ownerDocument.removeEventListener('mousemove', this._mouseMoveListener);
        this._rowContainer.ownerDocument.removeEventListener('mouseup', this._mouseUpListener);
        clearInterval(this._dragScrollIntervalTimer);
        this._dragScrollIntervalTimer = null;
    };
    SelectionManager.prototype._onIncrementalClick = function (event) {
        if (this._model.selectionStart) {
            this._model.selectionEnd = this._getMouseBufferCoords(event);
        }
    };
    SelectionManager.prototype._onSingleClick = function (event) {
        this._model.selectionStartLength = 0;
        this._model.isSelectAllActive = false;
        this._activeSelectionMode = SelectionMode.NORMAL;
        this._model.selectionStart = this._getMouseBufferCoords(event);
        if (!this._model.selectionStart) {
            return;
        }
        this._model.selectionEnd = null;
        var line = this._buffer.get(this._model.selectionStart[1]);
        if (!line) {
            return;
        }
        var char = line[this._model.selectionStart[0]];
        if (char[LINE_DATA_WIDTH_INDEX] === 0) {
            this._model.selectionStart[0]++;
        }
    };
    SelectionManager.prototype._onDoubleClick = function (event) {
        var coords = this._getMouseBufferCoords(event);
        if (coords) {
            this._activeSelectionMode = SelectionMode.WORD;
            this._selectWordAt(coords);
        }
    };
    SelectionManager.prototype._onTripleClick = function (event) {
        var coords = this._getMouseBufferCoords(event);
        if (coords) {
            this._activeSelectionMode = SelectionMode.LINE;
            this._selectLineAt(coords[1]);
        }
    };
    SelectionManager.prototype._onMouseMove = function (event) {
        var previousSelectionEnd = this._model.selectionEnd ? [this._model.selectionEnd[0], this._model.selectionEnd[1]] : null;
        this._model.selectionEnd = this._getMouseBufferCoords(event);
        if (!this._model.selectionEnd) {
            this.refresh(true);
            return;
        }
        if (this._activeSelectionMode === SelectionMode.LINE) {
            if (this._model.selectionEnd[1] < this._model.selectionStart[1]) {
                this._model.selectionEnd[0] = 0;
            }
            else {
                this._model.selectionEnd[0] = this._terminal.cols;
            }
        }
        else if (this._activeSelectionMode === SelectionMode.WORD) {
            this._selectToWordAt(this._model.selectionEnd);
        }
        this._dragScrollAmount = this._getMouseEventScrollAmount(event);
        if (this._dragScrollAmount > 0) {
            this._model.selectionEnd[0] = this._terminal.cols - 1;
        }
        else if (this._dragScrollAmount < 0) {
            this._model.selectionEnd[0] = 0;
        }
        if (this._model.selectionEnd[1] < this._buffer.length) {
            var char = this._buffer.get(this._model.selectionEnd[1])[this._model.selectionEnd[0]];
            if (char && char[2] === 0) {
                this._model.selectionEnd[0]++;
            }
        }
        if (!previousSelectionEnd ||
            previousSelectionEnd[0] !== this._model.selectionEnd[0] ||
            previousSelectionEnd[1] !== this._model.selectionEnd[1]) {
            this.refresh(true);
        }
    };
    SelectionManager.prototype._dragScroll = function () {
        if (this._dragScrollAmount) {
            this._terminal.scrollDisp(this._dragScrollAmount, false);
            if (this._dragScrollAmount > 0) {
                this._model.selectionEnd = [this._terminal.cols - 1, this._terminal.buffer.ydisp + this._terminal.rows];
            }
            else {
                this._model.selectionEnd = [0, this._terminal.buffer.ydisp];
            }
            this.refresh();
        }
    };
    SelectionManager.prototype._onMouseUp = function (event) {
        this._removeMouseDownListeners();
    };
    SelectionManager.prototype._convertViewportColToCharacterIndex = function (bufferLine, coords) {
        var charIndex = coords[0];
        for (var i = 0; coords[0] >= i; i++) {
            var char = bufferLine[i];
            if (char[LINE_DATA_WIDTH_INDEX] === 0) {
                charIndex--;
            }
        }
        return charIndex;
    };
    SelectionManager.prototype.setSelection = function (col, row, length) {
        this._model.clearSelection();
        this._removeMouseDownListeners();
        this._model.selectionStart = [col, row];
        this._model.selectionStartLength = length;
        this.refresh();
    };
    SelectionManager.prototype._getWordAt = function (coords) {
        var bufferLine = this._buffer.get(coords[1]);
        if (!bufferLine) {
            return null;
        }
        var line = BufferLine_1.translateBufferLineToString(bufferLine, false);
        var endIndex = this._convertViewportColToCharacterIndex(bufferLine, coords);
        var startIndex = endIndex;
        var charOffset = coords[0] - startIndex;
        var leftWideCharCount = 0;
        var rightWideCharCount = 0;
        if (line.charAt(startIndex) === ' ') {
            while (startIndex > 0 && line.charAt(startIndex - 1) === ' ') {
                startIndex--;
            }
            while (endIndex < line.length && line.charAt(endIndex + 1) === ' ') {
                endIndex++;
            }
        }
        else {
            var startCol = coords[0];
            var endCol = coords[0];
            if (bufferLine[startCol][LINE_DATA_WIDTH_INDEX] === 0) {
                leftWideCharCount++;
                startCol--;
            }
            if (bufferLine[endCol][LINE_DATA_WIDTH_INDEX] === 2) {
                rightWideCharCount++;
                endCol++;
            }
            while (startIndex > 0 && !this._isCharWordSeparator(line.charAt(startIndex - 1))) {
                if (bufferLine[startCol - 1][LINE_DATA_WIDTH_INDEX] === 0) {
                    leftWideCharCount++;
                    startCol--;
                }
                startIndex--;
                startCol--;
            }
            while (endIndex + 1 < line.length && !this._isCharWordSeparator(line.charAt(endIndex + 1))) {
                if (bufferLine[endCol + 1][LINE_DATA_WIDTH_INDEX] === 2) {
                    rightWideCharCount++;
                    endCol++;
                }
                endIndex++;
                endCol++;
            }
        }
        var start = startIndex + charOffset - leftWideCharCount;
        var length = Math.min(endIndex - startIndex + leftWideCharCount + rightWideCharCount + 1, this._terminal.cols);
        return { start: start, length: length };
    };
    SelectionManager.prototype._selectWordAt = function (coords) {
        var wordPosition = this._getWordAt(coords);
        if (wordPosition) {
            this._model.selectionStart = [wordPosition.start, coords[1]];
            this._model.selectionStartLength = wordPosition.length;
        }
    };
    SelectionManager.prototype._selectToWordAt = function (coords) {
        var wordPosition = this._getWordAt(coords);
        if (wordPosition) {
            this._model.selectionEnd = [this._model.areSelectionValuesReversed() ? wordPosition.start : (wordPosition.start + wordPosition.length), coords[1]];
        }
    };
    SelectionManager.prototype._isCharWordSeparator = function (char) {
        return WORD_SEPARATORS.indexOf(char) >= 0;
    };
    SelectionManager.prototype._selectLineAt = function (line) {
        this._model.selectionStart = [0, line];
        this._model.selectionStartLength = this._terminal.cols;
    };
    return SelectionManager;
}(EventEmitter_1.EventEmitter));
exports.SelectionManager = SelectionManager;



},{"./EventEmitter":6,"./SelectionModel":12,"./utils/Browser":15,"./utils/BufferLine":16,"./utils/Mouse":21}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SelectionModel = (function () {
    function SelectionModel(_terminal) {
        this._terminal = _terminal;
        this.clearSelection();
    }
    SelectionModel.prototype.clearSelection = function () {
        this.selectionStart = null;
        this.selectionEnd = null;
        this.isSelectAllActive = false;
        this.selectionStartLength = 0;
    };
    Object.defineProperty(SelectionModel.prototype, "finalSelectionStart", {
        get: function () {
            if (this.isSelectAllActive) {
                return [0, 0];
            }
            if (!this.selectionEnd || !this.selectionStart) {
                return this.selectionStart;
            }
            return this.areSelectionValuesReversed() ? this.selectionEnd : this.selectionStart;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SelectionModel.prototype, "finalSelectionEnd", {
        get: function () {
            if (this.isSelectAllActive) {
                return [this._terminal.cols, this._terminal.buffer.ybase + this._terminal.rows - 1];
            }
            if (!this.selectionStart) {
                return null;
            }
            if (!this.selectionEnd || this.areSelectionValuesReversed()) {
                return [this.selectionStart[0] + this.selectionStartLength, this.selectionStart[1]];
            }
            if (this.selectionStartLength) {
                if (this.selectionEnd[1] === this.selectionStart[1]) {
                    return [Math.max(this.selectionStart[0] + this.selectionStartLength, this.selectionEnd[0]), this.selectionEnd[1]];
                }
            }
            return this.selectionEnd;
        },
        enumerable: true,
        configurable: true
    });
    SelectionModel.prototype.areSelectionValuesReversed = function () {
        var start = this.selectionStart;
        var end = this.selectionEnd;
        return start[1] > end[1] || (start[1] === end[1] && start[0] > end[0]);
    };
    SelectionModel.prototype.onTrim = function (amount) {
        if (this.selectionStart) {
            this.selectionStart[1] -= amount;
        }
        if (this.selectionEnd) {
            this.selectionEnd[1] -= amount;
        }
        if (this.selectionEnd && this.selectionEnd[1] < 0) {
            this.clearSelection();
            return true;
        }
        if (this.selectionStart && this.selectionStart[1] < 0) {
            this.selectionStart[1] = 0;
        }
        return false;
    };
    return SelectionModel;
}());
exports.SelectionModel = SelectionModel;



},{}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Viewport = (function () {
    function Viewport(terminal, viewportElement, scrollArea, charMeasure) {
        var _this = this;
        this.terminal = terminal;
        this.viewportElement = viewportElement;
        this.scrollArea = scrollArea;
        this.charMeasure = charMeasure;
        this.currentRowHeight = 0;
        this.lastRecordedBufferLength = 0;
        this.lastRecordedViewportHeight = 0;
        this.terminal.on('scroll', this.syncScrollArea.bind(this));
        this.terminal.on('resize', this.syncScrollArea.bind(this));
        this.viewportElement.addEventListener('scroll', this.onScroll.bind(this));
        setTimeout(function () { return _this.syncScrollArea(); }, 0);
    }
    Viewport.prototype.refresh = function () {
        if (this.charMeasure.height > 0) {
            var rowHeightChanged = this.charMeasure.height !== this.currentRowHeight;
            if (rowHeightChanged) {
                this.currentRowHeight = this.charMeasure.height;
                this.viewportElement.style.lineHeight = this.charMeasure.height + 'px';
                this.terminal.rowContainer.style.lineHeight = this.charMeasure.height + 'px';
            }
            var viewportHeightChanged = this.lastRecordedViewportHeight !== this.terminal.rows;
            if (rowHeightChanged || viewportHeightChanged) {
                this.lastRecordedViewportHeight = this.terminal.rows;
                this.viewportElement.style.height = this.charMeasure.height * this.terminal.rows + 'px';
                this.terminal.selectionContainer.style.height = this.viewportElement.style.height;
            }
            this.scrollArea.style.height = (this.charMeasure.height * this.lastRecordedBufferLength) + 'px';
        }
    };
    Viewport.prototype.syncScrollArea = function () {
        if (this.lastRecordedBufferLength !== this.terminal.buffer.lines.length) {
            this.lastRecordedBufferLength = this.terminal.buffer.lines.length;
            this.refresh();
        }
        else if (this.lastRecordedViewportHeight !== this.terminal.rows) {
            this.refresh();
        }
        else {
            if (this.charMeasure.height !== this.currentRowHeight) {
                this.refresh();
            }
        }
        var scrollTop = this.terminal.buffer.ydisp * this.currentRowHeight;
        if (this.viewportElement.scrollTop !== scrollTop) {
            this.viewportElement.scrollTop = scrollTop;
        }
    };
    Viewport.prototype.onScroll = function (ev) {
        var newRow = Math.round(this.viewportElement.scrollTop / this.currentRowHeight);
        var diff = newRow - this.terminal.buffer.ydisp;
        this.terminal.scrollDisp(diff, true);
    };
    Viewport.prototype.onWheel = function (ev) {
        if (ev.deltaY === 0) {
            return;
        }
        var multiplier = 1;
        if (ev.deltaMode === WheelEvent.DOM_DELTA_LINE) {
            multiplier = this.currentRowHeight;
        }
        else if (ev.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
            multiplier = this.currentRowHeight * this.terminal.rows;
        }
        this.viewportElement.scrollTop += ev.deltaY * multiplier;
        ev.preventDefault();
    };
    ;
    Viewport.prototype.onTouchStart = function (ev) {
        this.lastTouchY = ev.touches[0].pageY;
    };
    ;
    Viewport.prototype.onTouchMove = function (ev) {
        var deltaY = this.lastTouchY - ev.touches[0].pageY;
        this.lastTouchY = ev.touches[0].pageY;
        if (deltaY === 0) {
            return;
        }
        this.viewportElement.scrollTop += deltaY;
        ev.preventDefault();
    };
    ;
    return Viewport;
}());
exports.Viewport = Viewport;



},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function prepareTextForTerminal(text, isMSWindows) {
    if (isMSWindows) {
        return text.replace(/\r?\n/g, '\r');
    }
    return text;
}
exports.prepareTextForTerminal = prepareTextForTerminal;
function copyHandler(ev, term, selectionManager) {
    if (term.browser.isMSIE) {
        window.clipboardData.setData('Text', selectionManager.selectionText);
    }
    else {
        ev.clipboardData.setData('text/plain', selectionManager.selectionText);
    }
    ev.preventDefault();
}
exports.copyHandler = copyHandler;
function pasteHandler(ev, term) {
    ev.stopPropagation();
    var text;
    var dispatchPaste = function (text) {
        text = prepareTextForTerminal(text, term.browser.isMSWindows);
        term.handler(text);
        term.textarea.value = '';
        term.emit('paste', text);
        return term.cancel(ev);
    };
    if (term.browser.isMSIE) {
        if (window.clipboardData) {
            text = window.clipboardData.getData('Text');
            dispatchPaste(text);
        }
    }
    else {
        if (ev.clipboardData) {
            text = ev.clipboardData.getData('text/plain');
            dispatchPaste(text);
        }
    }
}
exports.pasteHandler = pasteHandler;
function moveTextAreaUnderMouseCursor(ev, textarea) {
    textarea.style.position = 'fixed';
    textarea.style.width = '20px';
    textarea.style.height = '20px';
    textarea.style.left = (ev.clientX - 10) + 'px';
    textarea.style.top = (ev.clientY - 10) + 'px';
    textarea.style.zIndex = '1000';
    textarea.focus();
    setTimeout(function () {
        textarea.style.position = null;
        textarea.style.width = null;
        textarea.style.height = null;
        textarea.style.left = null;
        textarea.style.top = null;
        textarea.style.zIndex = null;
    }, 4);
}
exports.moveTextAreaUnderMouseCursor = moveTextAreaUnderMouseCursor;
function rightClickHandler(ev, textarea, selectionManager) {
    moveTextAreaUnderMouseCursor(ev, textarea);
    textarea.value = selectionManager.selectionText;
    textarea.select();
}
exports.rightClickHandler = rightClickHandler;



},{}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Generic_1 = require("./Generic");
var isNode = (typeof navigator === 'undefined') ? true : false;
var userAgent = (isNode) ? 'node' : navigator.userAgent;
var platform = (isNode) ? 'node' : navigator.platform;
exports.isFirefox = !!~userAgent.indexOf('Firefox');
exports.isMSIE = !!~userAgent.indexOf('MSIE') || !!~userAgent.indexOf('Trident');
exports.isMac = Generic_1.contains(['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'], platform);
exports.isIpad = platform === 'iPad';
exports.isIphone = platform === 'iPhone';
exports.isMSWindows = Generic_1.contains(['Windows', 'Win16', 'Win32', 'WinCE'], platform);
exports.isLinux = platform.indexOf('Linux') >= 0;



},{"./Generic":20}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LINE_DATA_CHAR_INDEX = 1;
var LINE_DATA_WIDTH_INDEX = 2;
function translateBufferLineToString(line, trimRight, startCol, endCol) {
    if (startCol === void 0) { startCol = 0; }
    if (endCol === void 0) { endCol = null; }
    var lineString = '';
    var widthAdjustedStartCol = startCol;
    var widthAdjustedEndCol = endCol;
    for (var i = 0; i < line.length; i++) {
        var char = line[i];
        lineString += char[LINE_DATA_CHAR_INDEX];
        if (char[LINE_DATA_WIDTH_INDEX] === 0) {
            if (startCol >= i) {
                widthAdjustedStartCol--;
            }
            if (endCol >= i) {
                widthAdjustedEndCol--;
            }
        }
    }
    var finalEndCol = widthAdjustedEndCol || line.length;
    if (trimRight) {
        var rightWhitespaceIndex = lineString.search(/\s+$/);
        if (rightWhitespaceIndex !== -1) {
            finalEndCol = Math.min(finalEndCol, rightWhitespaceIndex);
        }
        if (finalEndCol <= widthAdjustedStartCol) {
            return '';
        }
    }
    return lineString.substring(widthAdjustedStartCol, finalEndCol);
}
exports.translateBufferLineToString = translateBufferLineToString;



},{}],17:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var EventEmitter_js_1 = require("../EventEmitter.js");
var CharMeasure = (function (_super) {
    __extends(CharMeasure, _super);
    function CharMeasure(document, parentElement) {
        var _this = _super.call(this) || this;
        _this._document = document;
        _this._parentElement = parentElement;
        return _this;
    }
    Object.defineProperty(CharMeasure.prototype, "width", {
        get: function () {
            return this._width;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CharMeasure.prototype, "height", {
        get: function () {
            return this._height;
        },
        enumerable: true,
        configurable: true
    });
    CharMeasure.prototype.measure = function () {
        var _this = this;
        if (!this._measureElement) {
            this._measureElement = this._document.createElement('span');
            this._measureElement.style.position = 'absolute';
            this._measureElement.style.top = '0';
            this._measureElement.style.left = '-9999em';
            this._measureElement.textContent = 'W';
            this._measureElement.setAttribute('aria-hidden', 'true');
            this._parentElement.appendChild(this._measureElement);
            setTimeout(function () { return _this._doMeasure(); }, 0);
        }
        else {
            this._doMeasure();
        }
    };
    CharMeasure.prototype._doMeasure = function () {
        var geometry = this._measureElement.getBoundingClientRect();
        if (geometry.width === 0 || geometry.height === 0) {
            return;
        }
        if (this._width !== geometry.width || this._height !== geometry.height) {
            this._width = geometry.width;
            this._height = geometry.height;
            this.emit('charsizechanged');
        }
    };
    return CharMeasure;
}(EventEmitter_js_1.EventEmitter));
exports.CharMeasure = CharMeasure;



},{"../EventEmitter.js":6}],18:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var EventEmitter_1 = require("../EventEmitter");
var CircularList = (function (_super) {
    __extends(CircularList, _super);
    function CircularList(maxLength) {
        var _this = _super.call(this) || this;
        _this._array = new Array(maxLength);
        _this._startIndex = 0;
        _this._length = 0;
        return _this;
    }
    Object.defineProperty(CircularList.prototype, "maxLength", {
        get: function () {
            return this._array.length;
        },
        set: function (newMaxLength) {
            var newArray = new Array(newMaxLength);
            for (var i = 0; i < Math.min(newMaxLength, this.length); i++) {
                newArray[i] = this._array[this._getCyclicIndex(i)];
            }
            this._array = newArray;
            this._startIndex = 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CircularList.prototype, "length", {
        get: function () {
            return this._length;
        },
        set: function (newLength) {
            if (newLength > this._length) {
                for (var i = this._length; i < newLength; i++) {
                    this._array[i] = undefined;
                }
            }
            this._length = newLength;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CircularList.prototype, "forEach", {
        get: function () {
            var _this = this;
            return function (callbackfn) {
                var i = 0;
                var length = _this.length;
                for (var i_1 = 0; i_1 < length; i_1++) {
                    callbackfn(_this.get(i_1), i_1);
                }
            };
        },
        enumerable: true,
        configurable: true
    });
    CircularList.prototype.get = function (index) {
        return this._array[this._getCyclicIndex(index)];
    };
    CircularList.prototype.set = function (index, value) {
        this._array[this._getCyclicIndex(index)] = value;
    };
    CircularList.prototype.push = function (value) {
        this._array[this._getCyclicIndex(this._length)] = value;
        if (this._length === this.maxLength) {
            this._startIndex++;
            if (this._startIndex === this.maxLength) {
                this._startIndex = 0;
            }
            this.emit('trim', 1);
        }
        else {
            this._length++;
        }
    };
    CircularList.prototype.pop = function () {
        return this._array[this._getCyclicIndex(this._length-- - 1)];
    };
    CircularList.prototype.splice = function (start, deleteCount) {
        var items = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            items[_i - 2] = arguments[_i];
        }
        if (deleteCount) {
            for (var i = start; i < this._length - deleteCount; i++) {
                this._array[this._getCyclicIndex(i)] = this._array[this._getCyclicIndex(i + deleteCount)];
            }
            this._length -= deleteCount;
        }
        if (items && items.length) {
            for (var i = this._length - 1; i >= start; i--) {
                this._array[this._getCyclicIndex(i + items.length)] = this._array[this._getCyclicIndex(i)];
            }
            for (var i = 0; i < items.length; i++) {
                this._array[this._getCyclicIndex(start + i)] = items[i];
            }
            if (this._length + items.length > this.maxLength) {
                var countToTrim = (this._length + items.length) - this.maxLength;
                this._startIndex += countToTrim;
                this._length = this.maxLength;
                this.emit('trim', countToTrim);
            }
            else {
                this._length += items.length;
            }
        }
    };
    CircularList.prototype.trimStart = function (count) {
        if (count > this._length) {
            count = this._length;
        }
        this._startIndex += count;
        this._length -= count;
        this.emit('trim', count);
    };
    CircularList.prototype.shiftElements = function (start, count, offset) {
        if (count <= 0) {
            return;
        }
        if (start < 0 || start >= this._length) {
            throw new Error('start argument out of range');
        }
        if (start + offset < 0) {
            throw new Error('Cannot shift elements in list beyond index 0');
        }
        if (offset > 0) {
            for (var i = count - 1; i >= 0; i--) {
                this.set(start + i + offset, this.get(start + i));
            }
            var expandListBy = (start + count + offset) - this._length;
            if (expandListBy > 0) {
                this._length += expandListBy;
                while (this._length > this.maxLength) {
                    this._length--;
                    this._startIndex++;
                    this.emit('trim', 1);
                }
            }
        }
        else {
            for (var i = 0; i < count; i++) {
                this.set(start + i + offset, this.get(start + i));
            }
        }
    };
    CircularList.prototype._getCyclicIndex = function (index) {
        return (this._startIndex + index) % this.maxLength;
    };
    return CircularList;
}(EventEmitter_1.EventEmitter));
exports.CircularList = CircularList;



},{"../EventEmitter":6}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DomElementObjectPool = (function () {
    function DomElementObjectPool(type) {
        this.type = type;
        this._type = type;
        this._pool = [];
        this._inUse = {};
    }
    DomElementObjectPool.prototype.acquire = function () {
        var element;
        if (this._pool.length === 0) {
            element = this._createNew();
        }
        else {
            element = this._pool.pop();
        }
        this._inUse[element.getAttribute(DomElementObjectPool.OBJECT_ID_ATTRIBUTE)] = element;
        return element;
    };
    DomElementObjectPool.prototype.release = function (element) {
        if (!this._inUse[element.getAttribute(DomElementObjectPool.OBJECT_ID_ATTRIBUTE)]) {
            throw new Error('Could not release an element not yet acquired');
        }
        delete this._inUse[element.getAttribute(DomElementObjectPool.OBJECT_ID_ATTRIBUTE)];
        this._cleanElement(element);
        this._pool.push(element);
    };
    DomElementObjectPool.prototype._createNew = function () {
        var element = document.createElement(this._type);
        var id = DomElementObjectPool._objectCount++;
        element.setAttribute(DomElementObjectPool.OBJECT_ID_ATTRIBUTE, id.toString(10));
        return element;
    };
    DomElementObjectPool.prototype._cleanElement = function (element) {
        element.className = '';
        element.innerHTML = '';
    };
    return DomElementObjectPool;
}());
DomElementObjectPool.OBJECT_ID_ATTRIBUTE = 'data-obj-id';
DomElementObjectPool._objectCount = 0;
exports.DomElementObjectPool = DomElementObjectPool;



},{}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function contains(arr, el) {
    return arr.indexOf(el) >= 0;
}
exports.contains = contains;
;



},{}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getCoordsRelativeToElement(event, element) {
    if (event.pageX == null) {
        return null;
    }
    var x = event.pageX;
    var y = event.pageY;
    while (element && element !== self.document.documentElement) {
        x -= element.offsetLeft;
        y -= element.offsetTop;
        element = 'offsetParent' in element ? element.offsetParent : element.parentElement;
    }
    return [x, y];
}
exports.getCoordsRelativeToElement = getCoordsRelativeToElement;
function getCoords(event, rowContainer, charMeasure, colCount, rowCount, isSelection) {
    if (!charMeasure.width || !charMeasure.height) {
        return null;
    }
    var coords = getCoordsRelativeToElement(event, rowContainer);
    if (!coords) {
        return null;
    }
    coords[0] = Math.ceil((coords[0] + (isSelection ? charMeasure.width / 2 : 0)) / charMeasure.width);
    coords[1] = Math.ceil(coords[1] / charMeasure.height);
    coords[0] = Math.min(Math.max(coords[0], 1), colCount + 1);
    coords[1] = Math.min(Math.max(coords[1], 1), rowCount + 1);
    return coords;
}
exports.getCoords = getCoords;
function getRawByteCoords(event, rowContainer, charMeasure, colCount, rowCount) {
    var coords = getCoords(event, rowContainer, charMeasure, colCount, rowCount);
    var x = coords[0];
    var y = coords[1];
    x += 32;
    y += 32;
    return { x: x, y: y };
}
exports.getRawByteCoords = getRawByteCoords;



},{}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BufferSet_1 = require("./BufferSet");
var CompositionHelper_1 = require("./CompositionHelper");
var EventEmitter_1 = require("./EventEmitter");
var Viewport_1 = require("./Viewport");
var Clipboard_1 = require("./handlers/Clipboard");
var EscapeSequences_1 = require("./EscapeSequences");
var InputHandler_1 = require("./InputHandler");
var Parser_1 = require("./Parser");
var Renderer_1 = require("./Renderer");
var Linkifier_1 = require("./Linkifier");
var SelectionManager_1 = require("./SelectionManager");
var CharMeasure_1 = require("./utils/CharMeasure");
var Browser = require("./utils/Browser");
var Mouse_1 = require("./utils/Mouse");
var BufferLine_1 = require("./utils/BufferLine");
var document = (typeof window != 'undefined') ? window.document : null;
var WRITE_BUFFER_PAUSE_THRESHOLD = 5;
var WRITE_BATCH_SIZE = 300;
var CURSOR_BLINK_INTERVAL = 600;
function Terminal(options) {
    var self = this;
    if (!(this instanceof Terminal)) {
        return new Terminal(arguments[0], arguments[1], arguments[2]);
    }
    self.browser = Browser;
    self.cancel = Terminal.cancel;
    EventEmitter_1.EventEmitter.call(this);
    if (typeof options === 'number') {
        options = {
            cols: arguments[0],
            rows: arguments[1],
            handler: arguments[2]
        };
    }
    options = options || {};
    Object.keys(Terminal.defaults).forEach(function (key) {
        if (options[key] == null) {
            options[key] = Terminal.options[key];
            if (Terminal[key] !== Terminal.defaults[key]) {
                options[key] = Terminal[key];
            }
        }
        self[key] = options[key];
    });
    if (options.colors.length === 8) {
        options.colors = options.colors.concat(Terminal._colors.slice(8));
    }
    else if (options.colors.length === 16) {
        options.colors = options.colors.concat(Terminal._colors.slice(16));
    }
    else if (options.colors.length === 10) {
        options.colors = options.colors.slice(0, -2).concat(Terminal._colors.slice(8, -2), options.colors.slice(-2));
    }
    else if (options.colors.length === 18) {
        options.colors = options.colors.concat(Terminal._colors.slice(16, -2), options.colors.slice(-2));
    }
    this.colors = options.colors;
    this.options = options;
    this.parent = options.body || options.parent || (document ? document.getElementsByTagName('body')[0] : null);
    this.cols = options.cols || options.geometry[0];
    this.rows = options.rows || options.geometry[1];
    this.geometry = [this.cols, this.rows];
    if (options.handler) {
        this.on('data', options.handler);
    }
    this.cursorState = 0;
    this.cursorHidden = false;
    this.convertEol;
    this.queue = '';
    this.customKeyEventHandler = null;
    this.cursorBlinkInterval = null;
    this.applicationKeypad = false;
    this.applicationCursor = false;
    this.originMode = false;
    this.insertMode = false;
    this.wraparoundMode = true;
    this.charset = null;
    this.gcharset = null;
    this.glevel = 0;
    this.charsets = [null];
    this.decLocator;
    this.x10Mouse;
    this.vt200Mouse;
    this.vt300Mouse;
    this.normalMouse;
    this.mouseEvents;
    this.sendFocus;
    this.utfMouse;
    this.sgrMouse;
    this.urxvtMouse;
    this.element;
    this.children;
    this.refreshStart;
    this.refreshEnd;
    this.savedX;
    this.savedY;
    this.savedCols;
    this.readable = true;
    this.writable = true;
    this.defAttr = (0 << 18) | (257 << 9) | (256 << 0);
    this.curAttr = this.defAttr;
    this.params = [];
    this.currentParam = 0;
    this.prefix = '';
    this.postfix = '';
    this.inputHandler = new InputHandler_1.InputHandler(this);
    this.parser = new Parser_1.Parser(this.inputHandler, this);
    this.renderer = this.renderer || null;
    this.selectionManager = this.selectionManager || null;
    this.linkifier = this.linkifier || new Linkifier_1.Linkifier();
    this.writeBuffer = [];
    this.writeInProgress = false;
    this.xoffSentToCatchUp = false;
    this.writeStopped = false;
    this.surrogate_high = '';
    this.buffers = new BufferSet_1.BufferSet(this);
    this.buffer = this.buffers.active;
    this.buffers.on('activate', function (buffer) {
        this._terminal.buffer = buffer;
    });
    if (this.selectionManager) {
        this.selectionManager.setBuffer(this.buffer.lines);
    }
    this.setupStops();
    this.userScrolling = false;
}
inherits(Terminal, EventEmitter_1.EventEmitter);
Terminal.prototype.eraseAttr = function () {
    return (this.defAttr & ~0x1ff) | (this.curAttr & 0x1ff);
};
Terminal.tangoColors = [
    '#2e3436',
    '#cc0000',
    '#4e9a06',
    '#c4a000',
    '#3465a4',
    '#75507b',
    '#06989a',
    '#d3d7cf',
    '#555753',
    '#ef2929',
    '#8ae234',
    '#fce94f',
    '#729fcf',
    '#ad7fa8',
    '#34e2e2',
    '#eeeeec'
];
Terminal.colors = (function () {
    var colors = Terminal.tangoColors.slice(), r = [0x00, 0x5f, 0x87, 0xaf, 0xd7, 0xff], i;
    i = 0;
    for (; i < 216; i++) {
        out(r[(i / 36) % 6 | 0], r[(i / 6) % 6 | 0], r[i % 6]);
    }
    i = 0;
    for (; i < 24; i++) {
        r = 8 + i * 10;
        out(r, r, r);
    }
    function out(r, g, b) {
        colors.push('#' + hex(r) + hex(g) + hex(b));
    }
    function hex(c) {
        c = c.toString(16);
        return c.length < 2 ? '0' + c : c;
    }
    return colors;
})();
Terminal._colors = Terminal.colors.slice();
Terminal.vcolors = (function () {
    var out = [], colors = Terminal.colors, i = 0, color;
    for (; i < 256; i++) {
        color = parseInt(colors[i].substring(1), 16);
        out.push([
            (color >> 16) & 0xff,
            (color >> 8) & 0xff,
            color & 0xff
        ]);
    }
    return out;
})();
Terminal.defaults = {
    colors: Terminal.colors,
    theme: 'default',
    convertEol: false,
    termName: 'xterm',
    geometry: [80, 24],
    cursorBlink: false,
    cursorStyle: 'block',
    visualBell: false,
    popOnBell: false,
    scrollback: 1000,
    screenKeys: false,
    debug: false,
    cancelEvents: false,
    disableStdin: false,
    useFlowControl: false,
    tabStopWidth: 8
};
Terminal.options = {};
Terminal.focus = null;
each(keys(Terminal.defaults), function (key) {
    Terminal[key] = Terminal.defaults[key];
    Terminal.options[key] = Terminal.defaults[key];
});
Terminal.prototype.focus = function () {
    return this.textarea.focus();
};
Terminal.prototype.getOption = function (key) {
    if (!(key in Terminal.defaults)) {
        throw new Error('No option with key "' + key + '"');
    }
    if (typeof this.options[key] !== 'undefined') {
        return this.options[key];
    }
    return this[key];
};
Terminal.prototype.setOption = function (key, value) {
    if (!(key in Terminal.defaults)) {
        throw new Error('No option with key "' + key + '"');
    }
    switch (key) {
        case 'scrollback':
            if (value < this.rows) {
                var msg = 'Setting the scrollback value less than the number of rows ';
                msg += "(" + this.rows + ") is not allowed.";
                console.warn(msg);
                return false;
            }
            if (this.options[key] !== value) {
                if (this.buffer.lines.length > value) {
                    var amountToTrim = this.buffer.lines.length - value;
                    var needsRefresh = (this.buffer.ydisp - amountToTrim < 0);
                    this.buffer.lines.trimStart(amountToTrim);
                    this.buffer.ybase = Math.max(this.buffer.ybase - amountToTrim, 0);
                    this.buffer.ydisp = Math.max(this.buffer.ydisp - amountToTrim, 0);
                    if (needsRefresh) {
                        this.refresh(0, this.rows - 1);
                    }
                }
                this.buffer.lines.maxLength = value;
                this.viewport.syncScrollArea();
            }
            break;
    }
    this[key] = value;
    this.options[key] = value;
    switch (key) {
        case 'cursorBlink':
            this.setCursorBlinking(value);
            break;
        case 'cursorStyle':
            this.element.classList.toggle("xterm-cursor-style-block", value === 'block');
            this.element.classList.toggle("xterm-cursor-style-underline", value === 'underline');
            this.element.classList.toggle("xterm-cursor-style-bar", value === 'bar');
            break;
        case 'tabStopWidth':
            this.setupStops();
            break;
    }
};
Terminal.prototype.restartCursorBlinking = function () {
    this.setCursorBlinking(this.options.cursorBlink);
};
Terminal.prototype.setCursorBlinking = function (enabled) {
    this.element.classList.toggle('xterm-cursor-blink', enabled);
    this.clearCursorBlinkingInterval();
    if (enabled) {
        var self = this;
        this.cursorBlinkInterval = setInterval(function () {
            self.element.classList.toggle('xterm-cursor-blink-on');
        }, CURSOR_BLINK_INTERVAL);
    }
};
Terminal.prototype.clearCursorBlinkingInterval = function () {
    this.element.classList.remove('xterm-cursor-blink-on');
    if (this.cursorBlinkInterval) {
        clearInterval(this.cursorBlinkInterval);
        this.cursorBlinkInterval = null;
    }
};
Terminal.bindFocus = function (term) {
    on(term.textarea, 'focus', function (ev) {
        if (term.sendFocus) {
            term.send(EscapeSequences_1.C0.ESC + '[I');
        }
        term.element.classList.add('focus');
        term.showCursor();
        term.restartCursorBlinking.apply(term);
        Terminal.focus = term;
        term.emit('focus', { terminal: term });
    });
};
Terminal.prototype.blur = function () {
    return this.textarea.blur();
};
Terminal.bindBlur = function (term) {
    on(term.textarea, 'blur', function (ev) {
        term.refresh(term.buffer.y, term.buffer.y);
        if (term.sendFocus) {
            term.send(EscapeSequences_1.C0.ESC + '[O');
        }
        term.element.classList.remove('focus');
        term.clearCursorBlinkingInterval.apply(term);
        Terminal.focus = null;
        term.emit('blur', { terminal: term });
    });
};
Terminal.prototype.initGlobal = function () {
    var _this = this;
    var term = this;
    Terminal.bindKeys(this);
    Terminal.bindFocus(this);
    Terminal.bindBlur(this);
    on(this.element, 'copy', function (event) {
        if (!term.hasSelection()) {
            return;
        }
        Clipboard_1.copyHandler(event, term, _this.selectionManager);
    });
    var pasteHandlerWrapper = function (event) { return Clipboard_1.pasteHandler(event, term); };
    on(this.textarea, 'paste', pasteHandlerWrapper);
    on(this.element, 'paste', pasteHandlerWrapper);
    if (term.browser.isFirefox) {
        on(this.element, 'mousedown', function (event) {
            if (event.button == 2) {
                Clipboard_1.rightClickHandler(event, _this.textarea, _this.selectionManager);
            }
        });
    }
    else {
        on(this.element, 'contextmenu', function (event) {
            Clipboard_1.rightClickHandler(event, _this.textarea, _this.selectionManager);
        });
    }
    if (term.browser.isLinux) {
        on(this.element, 'auxclick', function (event) {
            if (event.button === 1) {
                Clipboard_1.moveTextAreaUnderMouseCursor(event, _this.textarea, _this.selectionManager);
            }
        });
    }
};
Terminal.bindKeys = function (term) {
    on(term.element, 'keydown', function (ev) {
        if (document.activeElement != this) {
            return;
        }
        term.keyDown(ev);
    }, true);
    on(term.element, 'keypress', function (ev) {
        if (document.activeElement != this) {
            return;
        }
        term.keyPress(ev);
    }, true);
    on(term.element, 'keyup', function (ev) {
        if (!wasMondifierKeyOnlyEvent(ev)) {
            term.focus(term);
        }
    }, true);
    on(term.textarea, 'keydown', function (ev) {
        term.keyDown(ev);
    }, true);
    on(term.textarea, 'keypress', function (ev) {
        term.keyPress(ev);
        this.value = '';
    }, true);
    on(term.textarea, 'compositionstart', term.compositionHelper.compositionstart.bind(term.compositionHelper));
    on(term.textarea, 'compositionupdate', term.compositionHelper.compositionupdate.bind(term.compositionHelper));
    on(term.textarea, 'compositionend', term.compositionHelper.compositionend.bind(term.compositionHelper));
    term.on('refresh', term.compositionHelper.updateCompositionElements.bind(term.compositionHelper));
    term.on('refresh', function (data) {
        term.queueLinkification(data.start, data.end);
    });
};
Terminal.prototype.insertRow = function (row) {
    if (typeof row != 'object') {
        row = document.createElement('div');
    }
    this.rowContainer.appendChild(row);
    this.children.push(row);
    return row;
};
Terminal.prototype.open = function (parent, focus) {
    var _this = this;
    var self = this, i = 0, div;
    this.parent = parent || this.parent;
    if (!this.parent) {
        throw new Error('Terminal requires a parent element.');
    }
    this.context = this.parent.ownerDocument.defaultView;
    this.document = this.parent.ownerDocument;
    this.body = this.document.getElementsByTagName('body')[0];
    this.element = this.document.createElement('div');
    this.element.classList.add('terminal');
    this.element.classList.add('xterm');
    this.element.classList.add('xterm-theme-' + this.theme);
    this.element.classList.add("xterm-cursor-style-" + this.options.cursorStyle);
    this.setCursorBlinking(this.options.cursorBlink);
    this.element.setAttribute('tabindex', 0);
    this.viewportElement = document.createElement('div');
    this.viewportElement.classList.add('xterm-viewport');
    this.element.appendChild(this.viewportElement);
    this.viewportScrollArea = document.createElement('div');
    this.viewportScrollArea.classList.add('xterm-scroll-area');
    this.viewportElement.appendChild(this.viewportScrollArea);
    this.selectionContainer = document.createElement('div');
    this.selectionContainer.classList.add('xterm-selection');
    this.element.appendChild(this.selectionContainer);
    this.rowContainer = document.createElement('div');
    this.rowContainer.classList.add('xterm-rows');
    this.element.appendChild(this.rowContainer);
    this.children = [];
    this.linkifier.attachToDom(document, this.children);
    this.helperContainer = document.createElement('div');
    this.helperContainer.classList.add('xterm-helpers');
    this.element.appendChild(this.helperContainer);
    this.textarea = document.createElement('textarea');
    this.textarea.classList.add('xterm-helper-textarea');
    this.textarea.setAttribute('autocorrect', 'off');
    this.textarea.setAttribute('autocapitalize', 'off');
    this.textarea.setAttribute('spellcheck', 'false');
    this.textarea.tabIndex = 0;
    this.textarea.addEventListener('focus', function () {
        self.emit('focus', { terminal: self });
    });
    this.textarea.addEventListener('blur', function () {
        self.emit('blur', { terminal: self });
    });
    this.helperContainer.appendChild(this.textarea);
    this.compositionView = document.createElement('div');
    this.compositionView.classList.add('composition-view');
    this.compositionHelper = new CompositionHelper_1.CompositionHelper(this.textarea, this.compositionView, this);
    this.helperContainer.appendChild(this.compositionView);
    this.charSizeStyleElement = document.createElement('style');
    this.helperContainer.appendChild(this.charSizeStyleElement);
    for (; i < this.rows; i++) {
        this.insertRow();
    }
    this.parent.appendChild(this.element);
    this.charMeasure = new CharMeasure_1.CharMeasure(document, this.helperContainer);
    this.charMeasure.on('charsizechanged', function () {
        self.updateCharSizeStyles();
    });
    this.charMeasure.measure();
    this.viewport = new Viewport_1.Viewport(this, this.viewportElement, this.viewportScrollArea, this.charMeasure);
    this.renderer = new Renderer_1.Renderer(this);
    this.selectionManager = new SelectionManager_1.SelectionManager(this, this.buffer.lines, this.rowContainer, this.charMeasure);
    this.selectionManager.on('refresh', function (data) {
        _this.renderer.refreshSelection(data.start, data.end);
    });
    this.selectionManager.on('newselection', function (text) {
        _this.textarea.value = text;
        _this.textarea.focus();
        _this.textarea.select();
    });
    this.on('scroll', function () { return _this.selectionManager.refresh(); });
    this.viewportElement.addEventListener('scroll', function () { return _this.selectionManager.refresh(); });
    this.refresh(0, this.rows - 1);
    this.initGlobal();
    if (typeof focus == 'undefined') {
        var message = 'You did not pass the `focus` argument in `Terminal.prototype.open()`.\n';
        message += 'The `focus` argument now defaults to `true` but starting with xterm.js 3.0 ';
        message += 'it will default to `false`.';
        console.warn(message);
        focus = true;
    }
    if (focus) {
        this.focus();
    }
    this.bindMouse();
    this.emit('open');
};
Terminal.loadAddon = function (addon, callback) {
    if (typeof exports === 'object' && typeof module === 'object') {
        return require('./addons/' + addon + '/' + addon);
    }
    else if (typeof define == 'function') {
        return require(['./addons/' + addon + '/' + addon], callback);
    }
    else {
        console.error('Cannot load a module without a CommonJS or RequireJS environment.');
        return false;
    }
};
Terminal.prototype.updateCharSizeStyles = function () {
    this.charSizeStyleElement.textContent =
        ".xterm-wide-char{width:" + this.charMeasure.width * 2 + "px;}" +
            (".xterm-normal-char{width:" + this.charMeasure.width + "px;}") +
            (".xterm-rows > div{height:" + this.charMeasure.height + "px;}");
};
Terminal.prototype.bindMouse = function () {
    var el = this.element, self = this, pressed = 32;
    function sendButton(ev) {
        var button, pos;
        button = getButton(ev);
        pos = Mouse_1.getRawByteCoords(ev, self.rowContainer, self.charMeasure, self.cols, self.rows);
        if (!pos)
            return;
        sendEvent(button, pos);
        switch (ev.overrideType || ev.type) {
            case 'mousedown':
                pressed = button;
                break;
            case 'mouseup':
                pressed = 32;
                break;
            case 'wheel':
                break;
        }
    }
    function sendMove(ev) {
        var button = pressed, pos;
        pos = Mouse_1.getRawByteCoords(ev, self.rowContainer, self.charMeasure, self.cols, self.rows);
        if (!pos)
            return;
        button += 32;
        sendEvent(button, pos);
    }
    function encode(data, ch) {
        if (!self.utfMouse) {
            if (ch === 255)
                return data.push(0);
            if (ch > 127)
                ch = 127;
            data.push(ch);
        }
        else {
            if (ch === 2047)
                return data.push(0);
            if (ch < 127) {
                data.push(ch);
            }
            else {
                if (ch > 2047)
                    ch = 2047;
                data.push(0xC0 | (ch >> 6));
                data.push(0x80 | (ch & 0x3F));
            }
        }
    }
    function sendEvent(button, pos) {
        if (self.vt300Mouse) {
            button &= 3;
            pos.x -= 32;
            pos.y -= 32;
            var data = EscapeSequences_1.C0.ESC + '[24';
            if (button === 0)
                data += '1';
            else if (button === 1)
                data += '3';
            else if (button === 2)
                data += '5';
            else if (button === 3)
                return;
            else
                data += '0';
            data += '~[' + pos.x + ',' + pos.y + ']\r';
            self.send(data);
            return;
        }
        if (self.decLocator) {
            button &= 3;
            pos.x -= 32;
            pos.y -= 32;
            if (button === 0)
                button = 2;
            else if (button === 1)
                button = 4;
            else if (button === 2)
                button = 6;
            else if (button === 3)
                button = 3;
            self.send(EscapeSequences_1.C0.ESC + '['
                + button
                + ';'
                + (button === 3 ? 4 : 0)
                + ';'
                + pos.y
                + ';'
                + pos.x
                + ';'
                + (pos.page || 0)
                + '&w');
            return;
        }
        if (self.urxvtMouse) {
            pos.x -= 32;
            pos.y -= 32;
            pos.x++;
            pos.y++;
            self.send(EscapeSequences_1.C0.ESC + '[' + button + ';' + pos.x + ';' + pos.y + 'M');
            return;
        }
        if (self.sgrMouse) {
            pos.x -= 32;
            pos.y -= 32;
            self.send(EscapeSequences_1.C0.ESC + '[<'
                + (((button & 3) === 3 ? button & ~3 : button) - 32)
                + ';'
                + pos.x
                + ';'
                + pos.y
                + ((button & 3) === 3 ? 'm' : 'M'));
            return;
        }
        var data = [];
        encode(data, button);
        encode(data, pos.x);
        encode(data, pos.y);
        self.send(EscapeSequences_1.C0.ESC + '[M' + String.fromCharCode.apply(String, data));
    }
    function getButton(ev) {
        var button, shift, meta, ctrl, mod;
        switch (ev.overrideType || ev.type) {
            case 'mousedown':
                button = ev.button != null
                    ? +ev.button
                    : ev.which != null
                        ? ev.which - 1
                        : null;
                if (self.browser.isMSIE) {
                    button = button === 1 ? 0 : button === 4 ? 1 : button;
                }
                break;
            case 'mouseup':
                button = 3;
                break;
            case 'DOMMouseScroll':
                button = ev.detail < 0
                    ? 64
                    : 65;
                break;
            case 'wheel':
                button = ev.wheelDeltaY > 0
                    ? 64
                    : 65;
                break;
        }
        shift = ev.shiftKey ? 4 : 0;
        meta = ev.metaKey ? 8 : 0;
        ctrl = ev.ctrlKey ? 16 : 0;
        mod = shift | meta | ctrl;
        if (self.vt200Mouse) {
            mod &= ctrl;
        }
        else if (!self.normalMouse) {
            mod = 0;
        }
        button = (32 + (mod << 2)) + button;
        return button;
    }
    on(el, 'mousedown', function (ev) {
        ev.preventDefault();
        self.focus();
        if (!self.mouseEvents)
            return;
        sendButton(ev);
        if (self.vt200Mouse) {
            ev.overrideType = 'mouseup';
            sendButton(ev);
            return self.cancel(ev);
        }
        if (self.normalMouse)
            on(self.document, 'mousemove', sendMove);
        if (!self.x10Mouse) {
            on(self.document, 'mouseup', function up(ev) {
                sendButton(ev);
                if (self.normalMouse)
                    off(self.document, 'mousemove', sendMove);
                off(self.document, 'mouseup', up);
                return self.cancel(ev);
            });
        }
        return self.cancel(ev);
    });
    on(el, 'wheel', function (ev) {
        if (!self.mouseEvents)
            return;
        if (self.x10Mouse
            || self.vt300Mouse
            || self.decLocator)
            return;
        sendButton(ev);
        return self.cancel(ev);
    });
    on(el, 'wheel', function (ev) {
        if (self.mouseEvents)
            return;
        self.viewport.onWheel(ev);
        return self.cancel(ev);
    });
    on(el, 'touchstart', function (ev) {
        if (self.mouseEvents)
            return;
        self.viewport.onTouchStart(ev);
        return self.cancel(ev);
    });
    on(el, 'touchmove', function (ev) {
        if (self.mouseEvents)
            return;
        self.viewport.onTouchMove(ev);
        return self.cancel(ev);
    });
};
Terminal.prototype.destroy = function () {
    this.readable = false;
    this.writable = false;
    this._events = {};
    this.handler = function () { };
    this.write = function () { };
    if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
    }
};
Terminal.prototype.refresh = function (start, end) {
    if (this.renderer) {
        this.renderer.queueRefresh(start, end);
    }
};
Terminal.prototype.queueLinkification = function (start, end) {
    if (this.linkifier) {
        for (var i = start; i <= end; i++) {
            this.linkifier.linkifyRow(i);
        }
    }
};
Terminal.prototype.showCursor = function () {
    if (!this.cursorState) {
        this.cursorState = 1;
        this.refresh(this.buffer.y, this.buffer.y);
    }
};
Terminal.prototype.scroll = function (isWrapped) {
    var row;
    if (this.buffer.lines.length === this.buffer.lines.maxLength) {
        this.buffer.lines.trimStart(1);
        this.buffer.ybase--;
        if (this.buffer.ydisp !== 0) {
            this.buffer.ydisp--;
        }
    }
    this.buffer.ybase++;
    if (!this.userScrolling) {
        this.buffer.ydisp = this.buffer.ybase;
    }
    row = this.buffer.ybase + this.rows - 1;
    row -= this.rows - 1 - this.buffer.scrollBottom;
    if (row === this.buffer.lines.length) {
        this.buffer.lines.push(this.blankLine(undefined, isWrapped));
    }
    else {
        this.buffer.lines.splice(row, 0, this.blankLine(undefined, isWrapped));
    }
    if (this.buffer.scrollTop !== 0) {
        if (this.buffer.ybase !== 0) {
            this.buffer.ybase--;
            if (!this.userScrolling) {
                this.buffer.ydisp = this.buffer.ybase;
            }
        }
        this.buffer.lines.splice(this.buffer.ybase + this.buffer.scrollTop, 1);
    }
    this.updateRange(this.buffer.scrollTop);
    this.updateRange(this.buffer.scrollBottom);
    this.emit('scroll', this.buffer.ydisp);
};
Terminal.prototype.scrollDisp = function (disp, suppressScrollEvent) {
    if (disp < 0) {
        if (this.buffer.ydisp === 0) {
            return;
        }
        this.userScrolling = true;
    }
    else if (disp + this.buffer.ydisp >= this.buffer.ybase) {
        this.userScrolling = false;
    }
    var oldYdisp = this.buffer.ydisp;
    this.buffer.ydisp = Math.max(Math.min(this.buffer.ydisp + disp, this.buffer.ybase), 0);
    if (oldYdisp === this.buffer.ydisp) {
        return;
    }
    if (!suppressScrollEvent) {
        this.emit('scroll', this.buffer.ydisp);
    }
    this.refresh(0, this.rows - 1);
};
Terminal.prototype.scrollPages = function (pageCount) {
    this.scrollDisp(pageCount * (this.rows - 1));
};
Terminal.prototype.scrollToTop = function () {
    this.scrollDisp(-this.buffer.ydisp);
};
Terminal.prototype.scrollToBottom = function () {
    this.scrollDisp(this.buffer.ybase - this.buffer.ydisp);
};
Terminal.prototype.write = function (data) {
    this.writeBuffer.push(data);
    if (this.options.useFlowControl && !this.xoffSentToCatchUp && this.writeBuffer.length >= WRITE_BUFFER_PAUSE_THRESHOLD) {
        this.send(EscapeSequences_1.C0.DC3);
        this.xoffSentToCatchUp = true;
    }
    if (!this.writeInProgress && this.writeBuffer.length > 0) {
        this.writeInProgress = true;
        var self = this;
        setTimeout(function () {
            self.innerWrite();
        });
    }
};
Terminal.prototype.innerWrite = function () {
    var writeBatch = this.writeBuffer.splice(0, WRITE_BATCH_SIZE);
    while (writeBatch.length > 0) {
        var data = writeBatch.shift();
        var l = data.length, i = 0, j, cs, ch, code, low, ch_width, row;
        if (this.xoffSentToCatchUp && writeBatch.length === 0 && this.writeBuffer.length === 0) {
            this.send(EscapeSequences_1.C0.DC1);
            this.xoffSentToCatchUp = false;
        }
        this.refreshStart = this.buffer.y;
        this.refreshEnd = this.buffer.y;
        var state = this.parser.parse(data);
        this.parser.setState(state);
        this.updateRange(this.buffer.y);
        this.refresh(this.refreshStart, this.refreshEnd);
    }
    if (this.writeBuffer.length > 0) {
        var self = this;
        setTimeout(function () {
            self.innerWrite();
        }, 0);
    }
    else {
        this.writeInProgress = false;
    }
};
Terminal.prototype.writeln = function (data) {
    this.write(data + '\r\n');
};
Terminal.prototype.attachCustomKeydownHandler = function (customKeydownHandler) {
    var message = 'attachCustomKeydownHandler() is DEPRECATED and will be removed soon. Please use attachCustomKeyEventHandler() instead.';
    console.warn(message);
    this.attachCustomKeyEventHandler(customKeydownHandler);
};
Terminal.prototype.attachCustomKeyEventHandler = function (customKeyEventHandler) {
    this.customKeyEventHandler = customKeyEventHandler;
};
Terminal.prototype.setHypertextLinkHandler = function (handler) {
    if (!this.linkifier) {
        throw new Error('Cannot attach a hypertext link handler before Terminal.open is called');
    }
    this.linkifier.setHypertextLinkHandler(handler);
    this.refresh(0, this.rows - 1);
};
Terminal.prototype.setHypertextValidationCallback = function (callback) {
    if (!this.linkifier) {
        throw new Error('Cannot attach a hypertext validation callback before Terminal.open is called');
    }
    this.linkifier.setHypertextValidationCallback(callback);
    this.refresh(0, this.rows - 1);
};
Terminal.prototype.registerLinkMatcher = function (regex, handler, options) {
    if (this.linkifier) {
        var matcherId = this.linkifier.registerLinkMatcher(regex, handler, options);
        this.refresh(0, this.rows - 1);
        return matcherId;
    }
};
Terminal.prototype.deregisterLinkMatcher = function (matcherId) {
    if (this.linkifier) {
        if (this.linkifier.deregisterLinkMatcher(matcherId)) {
            this.refresh(0, this.rows - 1);
        }
    }
};
Terminal.prototype.hasSelection = function () {
    return this.selectionManager ? this.selectionManager.hasSelection : false;
};
Terminal.prototype.getSelection = function () {
    return this.selectionManager ? this.selectionManager.selectionText : '';
};
Terminal.prototype.clearSelection = function () {
    if (this.selectionManager) {
        this.selectionManager.clearSelection();
    }
};
Terminal.prototype.selectAll = function () {
    if (this.selectionManager) {
        this.selectionManager.selectAll();
    }
};
Terminal.prototype.keyDown = function (ev) {
    if (this.customKeyEventHandler && this.customKeyEventHandler(ev) === false) {
        return false;
    }
    this.restartCursorBlinking();
    if (!this.compositionHelper.keydown.bind(this.compositionHelper)(ev)) {
        if (this.buffer.ybase !== this.buffer.ydisp) {
            this.scrollToBottom();
        }
        return false;
    }
    var self = this;
    var result = this.evaluateKeyEscapeSequence(ev);
    if (result.key === EscapeSequences_1.C0.DC3) {
        this.writeStopped = true;
    }
    else if (result.key === EscapeSequences_1.C0.DC1) {
        this.writeStopped = false;
    }
    if (result.scrollDisp) {
        this.scrollDisp(result.scrollDisp);
        return this.cancel(ev, true);
    }
    if (isThirdLevelShift(this, ev)) {
        return true;
    }
    if (result.cancel) {
        this.cancel(ev, true);
    }
    if (!result.key) {
        return true;
    }
    this.emit('keydown', ev);
    this.emit('key', result.key, ev);
    this.showCursor();
    this.handler(result.key);
    return this.cancel(ev, true);
};
Terminal.prototype.evaluateKeyEscapeSequence = function (ev) {
    var result = {
        cancel: false,
        key: undefined,
        scrollDisp: undefined
    };
    var modifiers = ev.shiftKey << 0 | ev.altKey << 1 | ev.ctrlKey << 2 | ev.metaKey << 3;
    switch (ev.keyCode) {
        case 8:
            if (ev.shiftKey) {
                result.key = EscapeSequences_1.C0.BS;
                break;
            }
            result.key = EscapeSequences_1.C0.DEL;
            break;
        case 9:
            if (ev.shiftKey) {
                result.key = EscapeSequences_1.C0.ESC + '[Z';
                break;
            }
            result.key = EscapeSequences_1.C0.HT;
            result.cancel = true;
            break;
        case 13:
            result.key = EscapeSequences_1.C0.CR;
            result.cancel = true;
            break;
        case 27:
            result.key = EscapeSequences_1.C0.ESC;
            result.cancel = true;
            break;
        case 37:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[1;' + (modifiers + 1) + 'D';
                if (result.key == EscapeSequences_1.C0.ESC + '[1;3D') {
                    result.key = (this.browser.isMac) ? EscapeSequences_1.C0.ESC + 'b' : EscapeSequences_1.C0.ESC + '[1;5D';
                }
            }
            else if (this.applicationCursor) {
                result.key = EscapeSequences_1.C0.ESC + 'OD';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[D';
            }
            break;
        case 39:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[1;' + (modifiers + 1) + 'C';
                if (result.key == EscapeSequences_1.C0.ESC + '[1;3C') {
                    result.key = (this.browser.isMac) ? EscapeSequences_1.C0.ESC + 'f' : EscapeSequences_1.C0.ESC + '[1;5C';
                }
            }
            else if (this.applicationCursor) {
                result.key = EscapeSequences_1.C0.ESC + 'OC';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[C';
            }
            break;
        case 38:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[1;' + (modifiers + 1) + 'A';
                if (result.key == EscapeSequences_1.C0.ESC + '[1;3A') {
                    result.key = EscapeSequences_1.C0.ESC + '[1;5A';
                }
            }
            else if (this.applicationCursor) {
                result.key = EscapeSequences_1.C0.ESC + 'OA';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[A';
            }
            break;
        case 40:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[1;' + (modifiers + 1) + 'B';
                if (result.key == EscapeSequences_1.C0.ESC + '[1;3B') {
                    result.key = EscapeSequences_1.C0.ESC + '[1;5B';
                }
            }
            else if (this.applicationCursor) {
                result.key = EscapeSequences_1.C0.ESC + 'OB';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[B';
            }
            break;
        case 45:
            if (!ev.shiftKey && !ev.ctrlKey) {
                result.key = EscapeSequences_1.C0.ESC + '[2~';
            }
            break;
        case 46:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[3;' + (modifiers + 1) + '~';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[3~';
            }
            break;
        case 36:
            if (modifiers)
                result.key = EscapeSequences_1.C0.ESC + '[1;' + (modifiers + 1) + 'H';
            else if (this.applicationCursor)
                result.key = EscapeSequences_1.C0.ESC + 'OH';
            else
                result.key = EscapeSequences_1.C0.ESC + '[H';
            break;
        case 35:
            if (modifiers)
                result.key = EscapeSequences_1.C0.ESC + '[1;' + (modifiers + 1) + 'F';
            else if (this.applicationCursor)
                result.key = EscapeSequences_1.C0.ESC + 'OF';
            else
                result.key = EscapeSequences_1.C0.ESC + '[F';
            break;
        case 33:
            if (ev.shiftKey) {
                result.scrollDisp = -(this.rows - 1);
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[5~';
            }
            break;
        case 34:
            if (ev.shiftKey) {
                result.scrollDisp = this.rows - 1;
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[6~';
            }
            break;
        case 112:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[1;' + (modifiers + 1) + 'P';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + 'OP';
            }
            break;
        case 113:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[1;' + (modifiers + 1) + 'Q';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + 'OQ';
            }
            break;
        case 114:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[1;' + (modifiers + 1) + 'R';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + 'OR';
            }
            break;
        case 115:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[1;' + (modifiers + 1) + 'S';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + 'OS';
            }
            break;
        case 116:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[15;' + (modifiers + 1) + '~';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[15~';
            }
            break;
        case 117:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[17;' + (modifiers + 1) + '~';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[17~';
            }
            break;
        case 118:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[18;' + (modifiers + 1) + '~';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[18~';
            }
            break;
        case 119:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[19;' + (modifiers + 1) + '~';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[19~';
            }
            break;
        case 120:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[20;' + (modifiers + 1) + '~';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[20~';
            }
            break;
        case 121:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[21;' + (modifiers + 1) + '~';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[21~';
            }
            break;
        case 122:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[23;' + (modifiers + 1) + '~';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[23~';
            }
            break;
        case 123:
            if (modifiers) {
                result.key = EscapeSequences_1.C0.ESC + '[24;' + (modifiers + 1) + '~';
            }
            else {
                result.key = EscapeSequences_1.C0.ESC + '[24~';
            }
            break;
        default:
            if (ev.ctrlKey && !ev.shiftKey && !ev.altKey && !ev.metaKey) {
                if (ev.keyCode >= 65 && ev.keyCode <= 90) {
                    result.key = String.fromCharCode(ev.keyCode - 64);
                }
                else if (ev.keyCode === 32) {
                    result.key = String.fromCharCode(0);
                }
                else if (ev.keyCode >= 51 && ev.keyCode <= 55) {
                    result.key = String.fromCharCode(ev.keyCode - 51 + 27);
                }
                else if (ev.keyCode === 56) {
                    result.key = String.fromCharCode(127);
                }
                else if (ev.keyCode === 219) {
                    result.key = String.fromCharCode(27);
                }
                else if (ev.keyCode === 220) {
                    result.key = String.fromCharCode(28);
                }
                else if (ev.keyCode === 221) {
                    result.key = String.fromCharCode(29);
                }
            }
            else if (!this.browser.isMac && ev.altKey && !ev.ctrlKey && !ev.metaKey) {
                if (ev.keyCode >= 65 && ev.keyCode <= 90) {
                    result.key = EscapeSequences_1.C0.ESC + String.fromCharCode(ev.keyCode + 32);
                }
                else if (ev.keyCode === 192) {
                    result.key = EscapeSequences_1.C0.ESC + '`';
                }
                else if (ev.keyCode >= 48 && ev.keyCode <= 57) {
                    result.key = EscapeSequences_1.C0.ESC + (ev.keyCode - 48);
                }
            }
            else if (this.browser.isMac && !ev.altKey && !ev.ctrlKey && ev.metaKey) {
                if (ev.keyCode === 65) {
                    this.selectAll();
                }
            }
            break;
    }
    return result;
};
Terminal.prototype.setgLevel = function (g) {
    this.glevel = g;
    this.charset = this.charsets[g];
};
Terminal.prototype.setgCharset = function (g, charset) {
    this.charsets[g] = charset;
    if (this.glevel === g) {
        this.charset = charset;
    }
};
Terminal.prototype.keyPress = function (ev) {
    var key;
    if (this.customKeyEventHandler && this.customKeyEventHandler(ev) === false) {
        return false;
    }
    this.cancel(ev);
    if (ev.charCode) {
        key = ev.charCode;
    }
    else if (ev.which == null) {
        key = ev.keyCode;
    }
    else if (ev.which !== 0 && ev.charCode !== 0) {
        key = ev.which;
    }
    else {
        return false;
    }
    if (!key || ((ev.altKey || ev.ctrlKey || ev.metaKey) && !isThirdLevelShift(this, ev))) {
        return false;
    }
    key = String.fromCharCode(key);
    this.emit('keypress', key, ev);
    this.emit('key', key, ev);
    this.showCursor();
    this.handler(key);
    return true;
};
Terminal.prototype.send = function (data) {
    var self = this;
    if (!this.queue) {
        setTimeout(function () {
            self.handler(self.queue);
            self.queue = '';
        }, 1);
    }
    this.queue += data;
};
Terminal.prototype.bell = function () {
    if (!this.visualBell)
        return;
    var self = this;
    this.element.style.borderColor = 'white';
    setTimeout(function () {
        self.element.style.borderColor = '';
    }, 10);
    if (this.popOnBell)
        this.focus();
};
Terminal.prototype.log = function () {
    if (!this.debug)
        return;
    if (!this.context.console || !this.context.console.log)
        return;
    var args = Array.prototype.slice.call(arguments);
    this.context.console.log.apply(this.context.console, args);
};
Terminal.prototype.error = function () {
    if (!this.debug)
        return;
    if (!this.context.console || !this.context.console.error)
        return;
    var args = Array.prototype.slice.call(arguments);
    this.context.console.error.apply(this.context.console, args);
};
Terminal.prototype.resize = function (x, y) {
    if (isNaN(x) || isNaN(y)) {
        return;
    }
    if (y > this.getOption('scrollback')) {
        this.setOption('scrollback', y);
    }
    var line, el, i, j, ch, addToY;
    if (x === this.cols && y === this.rows) {
        if (!this.charMeasure.width || !this.charMeasure.height) {
            this.charMeasure.measure();
        }
        return;
    }
    if (x < 1)
        x = 1;
    if (y < 1)
        y = 1;
    this.buffers.resize(x, y);
    while (this.children.length < y) {
        this.insertRow();
    }
    while (this.children.length > y) {
        el = this.children.shift();
        if (!el)
            continue;
        el.parentNode.removeChild(el);
    }
    this.cols = x;
    this.rows = y;
    this.setupStops(this.cols);
    this.charMeasure.measure();
    this.refresh(0, this.rows - 1);
    this.geometry = [this.cols, this.rows];
    this.emit('resize', { terminal: this, cols: x, rows: y });
};
Terminal.prototype.updateRange = function (y) {
    if (y < this.refreshStart)
        this.refreshStart = y;
    if (y > this.refreshEnd)
        this.refreshEnd = y;
};
Terminal.prototype.maxRange = function () {
    this.refreshStart = 0;
    this.refreshEnd = this.rows - 1;
};
Terminal.prototype.setupStops = function (i) {
    if (i != null) {
        if (!this.buffer.tabs[i]) {
            i = this.prevStop(i);
        }
    }
    else {
        this.buffer.tabs = {};
        i = 0;
    }
    for (; i < this.cols; i += this.getOption('tabStopWidth')) {
        this.buffer.tabs[i] = true;
    }
};
Terminal.prototype.prevStop = function (x) {
    if (x == null)
        x = this.buffer.x;
    while (!this.buffer.tabs[--x] && x > 0)
        ;
    return x >= this.cols
        ? this.cols - 1
        : x < 0 ? 0 : x;
};
Terminal.prototype.nextStop = function (x) {
    if (x == null)
        x = this.buffer.x;
    while (!this.buffer.tabs[++x] && x < this.cols)
        ;
    return x >= this.cols
        ? this.cols - 1
        : x < 0 ? 0 : x;
};
Terminal.prototype.eraseRight = function (x, y) {
    var line = this.buffer.lines.get(this.buffer.ybase + y);
    if (!line) {
        return;
    }
    var ch = [this.eraseAttr(), ' ', 1];
    for (; x < this.cols; x++) {
        line[x] = ch;
    }
    this.updateRange(y);
};
Terminal.prototype.eraseLeft = function (x, y) {
    var line = this.buffer.lines.get(this.buffer.ybase + y);
    if (!line) {
        return;
    }
    var ch = [this.eraseAttr(), ' ', 1];
    x++;
    while (x--) {
        line[x] = ch;
    }
    this.updateRange(y);
};
Terminal.prototype.clear = function () {
    if (this.buffer.ybase === 0 && this.buffer.y === 0) {
        return;
    }
    this.buffer.lines.set(0, this.buffer.lines.get(this.buffer.ybase + this.buffer.y));
    this.buffer.lines.length = 1;
    this.buffer.ydisp = 0;
    this.buffer.ybase = 0;
    this.buffer.y = 0;
    for (var i = 1; i < this.rows; i++) {
        this.buffer.lines.push(this.blankLine());
    }
    this.refresh(0, this.rows - 1);
    this.emit('scroll', this.buffer.ydisp);
};
Terminal.prototype.eraseLine = function (y) {
    this.eraseRight(0, y);
};
Terminal.prototype.blankLine = function (cur, isWrapped, cols) {
    var attr = cur
        ? this.eraseAttr()
        : this.defAttr;
    var ch = [attr, ' ', 1], line = [], i = 0;
    if (isWrapped) {
        line.isWrapped = isWrapped;
    }
    cols = cols || this.cols;
    for (; i < cols; i++) {
        line[i] = ch;
    }
    return line;
};
Terminal.prototype.ch = function (cur) {
    return cur
        ? [this.eraseAttr(), ' ', 1]
        : [this.defAttr, ' ', 1];
};
Terminal.prototype.is = function (term) {
    var name = this.termName;
    return (name + '').indexOf(term) === 0;
};
Terminal.prototype.handler = function (data) {
    if (this.options.disableStdin) {
        return;
    }
    if (this.selectionManager && this.selectionManager.hasSelection) {
        this.selectionManager.clearSelection();
    }
    if (this.buffer.ybase !== this.buffer.ydisp) {
        this.scrollToBottom();
    }
    this.emit('data', data);
};
Terminal.prototype.handleTitle = function (title) {
    this.emit('title', title);
};
Terminal.prototype.index = function () {
    this.buffer.y++;
    if (this.buffer.y > this.buffer.scrollBottom) {
        this.buffer.y--;
        this.scroll();
    }
    if (this.buffer.x >= this.cols) {
        this.buffer.x--;
    }
};
Terminal.prototype.reverseIndex = function () {
    var j;
    if (this.buffer.y === this.buffer.scrollTop) {
        this.buffer.lines.shiftElements(this.buffer.y + this.buffer.ybase, this.rows - 1, 1);
        this.buffer.lines.set(this.buffer.y + this.buffer.ybase, this.blankLine(true));
        this.updateRange(this.buffer.scrollTop);
        this.updateRange(this.buffer.scrollBottom);
    }
    else {
        this.buffer.y--;
    }
};
Terminal.prototype.reset = function () {
    this.options.rows = this.rows;
    this.options.cols = this.cols;
    var customKeyEventHandler = this.customKeyEventHandler;
    var cursorBlinkInterval = this.cursorBlinkInterval;
    var inputHandler = this.inputHandler;
    Terminal.call(this, this.options);
    this.customKeyEventHandler = customKeyEventHandler;
    this.cursorBlinkInterval = cursorBlinkInterval;
    this.inputHandler = inputHandler;
    this.refresh(0, this.rows - 1);
    this.viewport.syncScrollArea();
};
Terminal.prototype.tabSet = function () {
    this.buffer.tabs[this.buffer.x] = true;
};
function on(el, type, handler, capture) {
    if (!Array.isArray(el)) {
        el = [el];
    }
    el.forEach(function (element) {
        element.addEventListener(type, handler, capture || false);
    });
}
function off(el, type, handler, capture) {
    el.removeEventListener(type, handler, capture || false);
}
function cancel(ev, force) {
    if (!this.cancelEvents && !force) {
        return;
    }
    ev.preventDefault();
    ev.stopPropagation();
    return false;
}
function inherits(child, parent) {
    function f() {
        this.constructor = child;
    }
    f.prototype = parent.prototype;
    child.prototype = new f;
}
function indexOf(obj, el) {
    var i = obj.length;
    while (i--) {
        if (obj[i] === el)
            return i;
    }
    return -1;
}
function isThirdLevelShift(term, ev) {
    var thirdLevelKey = (term.browser.isMac && ev.altKey && !ev.ctrlKey && !ev.metaKey) ||
        (term.browser.isMSWindows && ev.altKey && ev.ctrlKey && !ev.metaKey);
    if (ev.type == 'keypress') {
        return thirdLevelKey;
    }
    return thirdLevelKey && (!ev.keyCode || ev.keyCode > 47);
}
Terminal.prototype.matchColor = matchColor;
function matchColor(r1, g1, b1) {
    var hash = (r1 << 16) | (g1 << 8) | b1;
    if (matchColor._cache[hash] != null) {
        return matchColor._cache[hash];
    }
    var ldiff = Infinity, li = -1, i = 0, c, r2, g2, b2, diff;
    for (; i < Terminal.vcolors.length; i++) {
        c = Terminal.vcolors[i];
        r2 = c[0];
        g2 = c[1];
        b2 = c[2];
        diff = matchColor.distance(r1, g1, b1, r2, g2, b2);
        if (diff === 0) {
            li = i;
            break;
        }
        if (diff < ldiff) {
            ldiff = diff;
            li = i;
        }
    }
    return matchColor._cache[hash] = li;
}
matchColor._cache = {};
matchColor.distance = function (r1, g1, b1, r2, g2, b2) {
    return Math.pow(30 * (r1 - r2), 2)
        + Math.pow(59 * (g1 - g2), 2)
        + Math.pow(11 * (b1 - b2), 2);
};
function each(obj, iter, con) {
    if (obj.forEach)
        return obj.forEach(iter, con);
    for (var i = 0; i < obj.length; i++) {
        iter.call(con, obj[i], i, obj);
    }
}
function wasMondifierKeyOnlyEvent(ev) {
    return ev.keyCode === 16 ||
        ev.keyCode === 17 ||
        ev.keyCode === 18;
}
function keys(obj) {
    if (Object.keys)
        return Object.keys(obj);
    var key, keys = [];
    for (key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            keys.push(key);
        }
    }
    return keys;
}
Terminal.translateBufferLineToString = BufferLine_1.translateBufferLineToString;
Terminal.EventEmitter = EventEmitter_1.EventEmitter;
Terminal.inherits = inherits;
Terminal.on = on;
Terminal.off = off;
Terminal.cancel = cancel;
module.exports = Terminal;



},{"./BufferSet":2,"./CompositionHelper":4,"./EscapeSequences":5,"./EventEmitter":6,"./InputHandler":7,"./Linkifier":8,"./Parser":9,"./Renderer":10,"./SelectionManager":11,"./Viewport":13,"./handlers/Clipboard":14,"./utils/Browser":15,"./utils/BufferLine":16,"./utils/CharMeasure":17,"./utils/Mouse":21}]},{},[22])(22)
});
//# sourceMappingURL=xterm.js.map
;
/*
Unobtrusive JavaScript
https://github.com/rails/rails/blob/master/actionview/app/assets/javascripts
Released under the MIT license
 */


;

(function() {
  (function() {
    (function() {
      this.Rails = {
        linkClickSelector: 'a[data-confirm], a[data-method], a[data-remote]:not([disabled]), a[data-disable-with], a[data-disable]',
        buttonClickSelector: {
          selector: 'button[data-remote]:not([form]), button[data-confirm]:not([form])',
          exclude: 'form button'
        },
        inputChangeSelector: 'select[data-remote], input[data-remote], textarea[data-remote]',
        formSubmitSelector: 'form',
        formInputClickSelector: 'form input[type=submit], form input[type=image], form button[type=submit], form button:not([type]), input[type=submit][form], input[type=image][form], button[type=submit][form], button[form]:not([type])',
        formDisableSelector: 'input[data-disable-with]:enabled, button[data-disable-with]:enabled, textarea[data-disable-with]:enabled, input[data-disable]:enabled, button[data-disable]:enabled, textarea[data-disable]:enabled',
        formEnableSelector: 'input[data-disable-with]:disabled, button[data-disable-with]:disabled, textarea[data-disable-with]:disabled, input[data-disable]:disabled, button[data-disable]:disabled, textarea[data-disable]:disabled',
        fileInputSelector: 'input[name][type=file]:not([disabled])',
        linkDisableSelector: 'a[data-disable-with], a[data-disable]',
        buttonDisableSelector: 'button[data-remote][data-disable-with], button[data-remote][data-disable]'
      };

    }).call(this);
  }).call(this);

  var Rails = this.Rails;

  (function() {
    (function() {
      var expando, m;

      m = Element.prototype.matches || Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector;

      Rails.matches = function(element, selector) {
        if (selector.exclude != null) {
          return m.call(element, selector.selector) && !m.call(element, selector.exclude);
        } else {
          return m.call(element, selector);
        }
      };

      expando = '_ujsData';

      Rails.getData = function(element, key) {
        var ref;
        return (ref = element[expando]) != null ? ref[key] : void 0;
      };

      Rails.setData = function(element, key, value) {
        if (element[expando] == null) {
          element[expando] = {};
        }
        return element[expando][key] = value;
      };

      Rails.$ = function(selector) {
        return Array.prototype.slice.call(document.querySelectorAll(selector));
      };

    }).call(this);
    (function() {
      var $, csrfParam, csrfToken;

      $ = Rails.$;

      csrfToken = Rails.csrfToken = function() {
        var meta;
        meta = document.querySelector('meta[name=csrf-token]');
        return meta && meta.content;
      };

      csrfParam = Rails.csrfParam = function() {
        var meta;
        meta = document.querySelector('meta[name=csrf-param]');
        return meta && meta.content;
      };

      Rails.CSRFProtection = function(xhr) {
        var token;
        token = csrfToken();
        if (token != null) {
          return xhr.setRequestHeader('X-CSRF-Token', token);
        }
      };

      Rails.refreshCSRFTokens = function() {
        var param, token;
        token = csrfToken();
        param = csrfParam();
        if ((token != null) && (param != null)) {
          return $('form input[name="' + param + '"]').forEach(function(input) {
            return input.value = token;
          });
        }
      };

    }).call(this);
    (function() {
      var CustomEvent, fire, matches;

      matches = Rails.matches;

      CustomEvent = window.CustomEvent;

      if (typeof CustomEvent !== 'function') {
        CustomEvent = function(event, params) {
          var evt;
          evt = document.createEvent('CustomEvent');
          evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
          return evt;
        };
        CustomEvent.prototype = window.Event.prototype;
      }

      fire = Rails.fire = function(obj, name, data) {
        var event;
        event = new CustomEvent(name, {
          bubbles: true,
          cancelable: true,
          detail: data
        });
        obj.dispatchEvent(event);
        return !event.defaultPrevented;
      };

      Rails.stopEverything = function(e) {
        fire(e.target, 'ujs:everythingStopped');
        e.preventDefault();
        e.stopPropagation();
        return e.stopImmediatePropagation();
      };

      Rails.delegate = function(element, selector, eventType, handler) {
        return element.addEventListener(eventType, function(e) {
          var target;
          target = e.target;
          while (!(!(target instanceof Element) || matches(target, selector))) {
            target = target.parentNode;
          }
          if (target instanceof Element && handler.call(target, e) === false) {
            e.preventDefault();
            return e.stopPropagation();
          }
        });
      };

    }).call(this);
    (function() {
      var AcceptHeaders, CSRFProtection, createXHR, fire, prepareOptions, processResponse;

      CSRFProtection = Rails.CSRFProtection, fire = Rails.fire;

      AcceptHeaders = {
        '*': '*/*',
        text: 'text/plain',
        html: 'text/html',
        xml: 'application/xml, text/xml',
        json: 'application/json, text/javascript',
        script: 'text/javascript, application/javascript, application/ecmascript, application/x-ecmascript'
      };

      Rails.ajax = function(options) {
        var xhr;
        options = prepareOptions(options);
        xhr = createXHR(options, function() {
          var response;
          response = processResponse(xhr.response, xhr.getResponseHeader('Content-Type'));
          if (Math.floor(xhr.status / 100) === 2) {
            if (typeof options.success === "function") {
              options.success(response, xhr.statusText, xhr);
            }
          } else {
            if (typeof options.error === "function") {
              options.error(response, xhr.statusText, xhr);
            }
          }
          return typeof options.complete === "function" ? options.complete(xhr, xhr.statusText) : void 0;
        });
        if (typeof options.beforeSend === "function") {
          options.beforeSend(xhr, options);
        }
        if (xhr.readyState === XMLHttpRequest.OPENED) {
          return xhr.send(options.data);
        } else {
          return fire(document, 'ajaxStop');
        }
      };

      prepareOptions = function(options) {
        options.url = options.url || location.href;
        options.type = options.type.toUpperCase();
        if (options.type === 'GET' && options.data) {
          if (options.url.indexOf('?') < 0) {
            options.url += '?' + options.data;
          } else {
            options.url += '&' + options.data;
          }
        }
        if (AcceptHeaders[options.dataType] == null) {
          options.dataType = '*';
        }
        options.accept = AcceptHeaders[options.dataType];
        if (options.dataType !== '*') {
          options.accept += ', */*; q=0.01';
        }
        return options;
      };

      createXHR = function(options, done) {
        var xhr;
        xhr = new XMLHttpRequest();
        xhr.open(options.type, options.url, true);
        xhr.setRequestHeader('Accept', options.accept);
        if (typeof options.data === 'string') {
          xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        }
        if (!options.crossDomain) {
          xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        }
        CSRFProtection(xhr);
        xhr.withCredentials = !!options.withCredentials;
        xhr.onreadystatechange = function() {
          if (xhr.readyState === XMLHttpRequest.DONE) {
            return done(xhr);
          }
        };
        return xhr;
      };

      processResponse = function(response, type) {
        var parser, script;
        if (typeof response === 'string' && typeof type === 'string') {
          if (type.match(/\bjson\b/)) {
            try {
              response = JSON.parse(response);
            } catch (error) {}
          } else if (type.match(/\b(?:java|ecma)script\b/)) {
            script = document.createElement('script');
            script.text = response;
            document.head.appendChild(script).parentNode.removeChild(script);
          } else if (type.match(/\b(xml|html|svg)\b/)) {
            parser = new DOMParser();
            type = type.replace(/;.+/, '');
            try {
              response = parser.parseFromString(response, type);
            } catch (error) {}
          }
        }
        return response;
      };

      Rails.href = function(element) {
        return element.href;
      };

      Rails.isCrossDomain = function(url) {
        var e, originAnchor, urlAnchor;
        originAnchor = document.createElement('a');
        originAnchor.href = location.href;
        urlAnchor = document.createElement('a');
        try {
          urlAnchor.href = url;
          return !(((!urlAnchor.protocol || urlAnchor.protocol === ':') && !urlAnchor.host) || (originAnchor.protocol + '//' + originAnchor.host === urlAnchor.protocol + '//' + urlAnchor.host));
        } catch (error) {
          e = error;
          return true;
        }
      };

    }).call(this);
    (function() {
      var matches, toArray;

      matches = Rails.matches;

      toArray = function(e) {
        return Array.prototype.slice.call(e);
      };

      Rails.serializeElement = function(element, additionalParam) {
        var inputs, params;
        inputs = [element];
        if (matches(element, 'form')) {
          inputs = toArray(element.elements);
        }
        params = [];
        inputs.forEach(function(input) {
          if (!input.name) {
            return;
          }
          if (matches(input, 'select')) {
            return toArray(input.options).forEach(function(option) {
              if (option.selected) {
                return params.push({
                  name: input.name,
                  value: option.value
                });
              }
            });
          } else if (input.checked || ['radio', 'checkbox', 'submit'].indexOf(input.type) === -1) {
            return params.push({
              name: input.name,
              value: input.value
            });
          }
        });
        if (additionalParam) {
          params.push(additionalParam);
        }
        return params.map(function(param) {
          if (param.name != null) {
            return (encodeURIComponent(param.name)) + "=" + (encodeURIComponent(param.value));
          } else {
            return param;
          }
        }).join('&');
      };

      Rails.formElements = function(form, selector) {
        if (matches(form, 'form')) {
          return toArray(form.elements).filter(function(el) {
            return matches(el, selector);
          });
        } else {
          return toArray(form.querySelectorAll(selector));
        }
      };

    }).call(this);
    (function() {
      var allowAction, fire, stopEverything;

      fire = Rails.fire, stopEverything = Rails.stopEverything;

      Rails.handleConfirm = function(e) {
        if (!allowAction(this)) {
          return stopEverything(e);
        }
      };

      allowAction = function(element) {
        var answer, callback, message;
        message = element.getAttribute('data-confirm');
        if (!message) {
          return true;
        }
        answer = false;
        if (fire(element, 'confirm')) {
          try {
            answer = confirm(message);
          } catch (error) {}
          callback = fire(element, 'confirm:complete', [answer]);
        }
        return answer && callback;
      };

    }).call(this);
    (function() {
      var disableFormElement, disableFormElements, disableLinkElement, enableFormElement, enableFormElements, enableLinkElement, formElements, getData, matches, setData, stopEverything;

      matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, stopEverything = Rails.stopEverything, formElements = Rails.formElements;

      Rails.handleDisabledElement = function(e) {
        var element;
        element = this;
        if (element.disabled) {
          return stopEverything(e);
        }
      };

      Rails.enableElement = function(e) {
        var element;
        element = e instanceof Event ? e.target : e;
        if (matches(element, Rails.linkDisableSelector)) {
          return enableLinkElement(element);
        } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formEnableSelector)) {
          return enableFormElement(element);
        } else if (matches(element, Rails.formSubmitSelector)) {
          return enableFormElements(element);
        }
      };

      Rails.disableElement = function(e) {
        var element;
        element = e instanceof Event ? e.target : e;
        if (matches(element, Rails.linkDisableSelector)) {
          return disableLinkElement(element);
        } else if (matches(element, Rails.buttonDisableSelector) || matches(element, Rails.formDisableSelector)) {
          return disableFormElement(element);
        } else if (matches(element, Rails.formSubmitSelector)) {
          return disableFormElements(element);
        }
      };

      disableLinkElement = function(element) {
        var replacement;
        replacement = element.getAttribute('data-disable-with');
        if (replacement != null) {
          setData(element, 'ujs:enable-with', element.innerHTML);
          element.innerHTML = replacement;
        }
        element.addEventListener('click', stopEverything);
        return setData(element, 'ujs:disabled', true);
      };

      enableLinkElement = function(element) {
        var originalText;
        originalText = getData(element, 'ujs:enable-with');
        if (originalText != null) {
          element.innerHTML = originalText;
          setData(element, 'ujs:enable-with', null);
        }
        element.removeEventListener('click', stopEverything);
        return setData(element, 'ujs:disabled', null);
      };

      disableFormElements = function(form) {
        return formElements(form, Rails.formDisableSelector).forEach(disableFormElement);
      };

      disableFormElement = function(element) {
        var replacement;
        replacement = element.getAttribute('data-disable-with');
        if (replacement != null) {
          if (matches(element, 'button')) {
            setData(element, 'ujs:enable-with', element.innerHTML);
            element.innerHTML = replacement;
          } else {
            setData(element, 'ujs:enable-with', element.value);
            element.value = replacement;
          }
        }
        element.disabled = true;
        return setData(element, 'ujs:disabled', true);
      };

      enableFormElements = function(form) {
        return formElements(form, Rails.formEnableSelector).forEach(enableFormElement);
      };

      enableFormElement = function(element) {
        var originalText;
        originalText = getData(element, 'ujs:enable-with');
        if (originalText != null) {
          if (matches(element, 'button')) {
            element.innerHTML = originalText;
          } else {
            element.value = originalText;
          }
          setData(element, 'ujs:enable-with', null);
        }
        element.disabled = false;
        return setData(element, 'ujs:disabled', null);
      };

    }).call(this);
    (function() {
      var stopEverything;

      stopEverything = Rails.stopEverything;

      Rails.handleMethod = function(e) {
        var csrfParam, csrfToken, form, formContent, href, link, method;
        link = this;
        method = link.getAttribute('data-method');
        if (!method) {
          return;
        }
        href = Rails.href(link);
        csrfToken = Rails.csrfToken();
        csrfParam = Rails.csrfParam();
        form = document.createElement('form');
        formContent = "<input name='_method' value='" + method + "' type='hidden' />";
        if ((csrfParam != null) && (csrfToken != null) && !Rails.isCrossDomain(href)) {
          formContent += "<input name='" + csrfParam + "' value='" + csrfToken + "' type='hidden' />";
        }
        formContent += '<input type="submit" />';
        form.method = 'post';
        form.action = href;
        form.target = link.target;
        form.innerHTML = formContent;
        form.style.display = 'none';
        document.body.appendChild(form);
        form.querySelector('[type="submit"]').click();
        return stopEverything(e);
      };

    }).call(this);
    (function() {
      var ajax, fire, getData, isCrossDomain, isRemote, matches, serializeElement, setData, stopEverything,
        slice = [].slice;

      matches = Rails.matches, getData = Rails.getData, setData = Rails.setData, fire = Rails.fire, stopEverything = Rails.stopEverything, ajax = Rails.ajax, isCrossDomain = Rails.isCrossDomain, serializeElement = Rails.serializeElement;

      isRemote = function(element) {
        var value;
        value = element.getAttribute('data-remote');
        return (value != null) && value !== 'false';
      };

      Rails.handleRemote = function(e) {
        var button, data, dataType, element, method, url, withCredentials;
        element = this;
        if (!isRemote(element)) {
          return true;
        }
        if (!fire(element, 'ajax:before')) {
          fire(element, 'ajax:stopped');
          return false;
        }
        withCredentials = element.getAttribute('data-with-credentials');
        dataType = element.getAttribute('data-type') || 'script';
        if (matches(element, Rails.formSubmitSelector)) {
          button = getData(element, 'ujs:submit-button');
          method = getData(element, 'ujs:submit-button-formmethod') || element.method;
          url = getData(element, 'ujs:submit-button-formaction') || element.getAttribute('action') || location.href;
          if (method.toUpperCase() === 'GET') {
            url = url.replace(/\?.*$/, '');
          }
          if (element.enctype === 'multipart/form-data') {
            data = new FormData(element);
            if (button != null) {
              data.append(button.name, button.value);
            }
          } else {
            data = serializeElement(element, button);
          }
          setData(element, 'ujs:submit-button', null);
          setData(element, 'ujs:submit-button-formmethod', null);
          setData(element, 'ujs:submit-button-formaction', null);
        } else if (matches(element, Rails.buttonClickSelector) || matches(element, Rails.inputChangeSelector)) {
          method = element.getAttribute('data-method');
          url = element.getAttribute('data-url');
          data = serializeElement(element, element.getAttribute('data-params'));
        } else {
          method = element.getAttribute('data-method');
          url = Rails.href(element);
          data = element.getAttribute('data-params');
        }
        ajax({
          type: method || 'GET',
          url: url,
          data: data,
          dataType: dataType,
          beforeSend: function(xhr, options) {
            if (fire(element, 'ajax:beforeSend', [xhr, options])) {
              return fire(element, 'ajax:send', [xhr]);
            } else {
              fire(element, 'ajax:stopped');
              return xhr.abort();
            }
          },
          success: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:success', args);
          },
          error: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:error', args);
          },
          complete: function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            return fire(element, 'ajax:complete', args);
          },
          crossDomain: isCrossDomain(url),
          withCredentials: (withCredentials != null) && withCredentials !== 'false'
        });
        return stopEverything(e);
      };

      Rails.formSubmitButtonClick = function(e) {
        var button, form;
        button = this;
        form = button.form;
        if (!form) {
          return;
        }
        if (button.name) {
          setData(form, 'ujs:submit-button', {
            name: button.name,
            value: button.value
          });
        }
        setData(form, 'ujs:formnovalidate-button', button.formNoValidate);
        setData(form, 'ujs:submit-button-formaction', button.getAttribute('formaction'));
        return setData(form, 'ujs:submit-button-formmethod', button.getAttribute('formmethod'));
      };

      Rails.handleMetaClick = function(e) {
        var data, link, metaClick, method;
        link = this;
        method = (link.getAttribute('data-method') || 'GET').toUpperCase();
        data = link.getAttribute('data-params');
        metaClick = e.metaKey || e.ctrlKey;
        if (metaClick && method === 'GET' && !data) {
          return e.stopImmediatePropagation();
        }
      };

    }).call(this);
    (function() {
      var $, CSRFProtection, delegate, disableElement, enableElement, fire, formSubmitButtonClick, getData, handleConfirm, handleDisabledElement, handleMetaClick, handleMethod, handleRemote, refreshCSRFTokens;

      fire = Rails.fire, delegate = Rails.delegate, getData = Rails.getData, $ = Rails.$, refreshCSRFTokens = Rails.refreshCSRFTokens, CSRFProtection = Rails.CSRFProtection, enableElement = Rails.enableElement, disableElement = Rails.disableElement, handleDisabledElement = Rails.handleDisabledElement, handleConfirm = Rails.handleConfirm, handleRemote = Rails.handleRemote, formSubmitButtonClick = Rails.formSubmitButtonClick, handleMetaClick = Rails.handleMetaClick, handleMethod = Rails.handleMethod;

      if ((typeof jQuery !== "undefined" && jQuery !== null) && (jQuery.ajax != null) && !jQuery.rails) {
        jQuery.rails = Rails;
        jQuery.ajaxPrefilter(function(options, originalOptions, xhr) {
          if (!options.crossDomain) {
            return CSRFProtection(xhr);
          }
        });
      }

      Rails.start = function() {
        if (window._rails_loaded) {
          throw new Error('rails-ujs has already been loaded!');
        }
        window.addEventListener('pageshow', function() {
          $(Rails.formEnableSelector).forEach(function(el) {
            if (getData(el, 'ujs:disabled')) {
              return enableElement(el);
            }
          });
          return $(Rails.linkDisableSelector).forEach(function(el) {
            if (getData(el, 'ujs:disabled')) {
              return enableElement(el);
            }
          });
        });
        delegate(document, Rails.linkDisableSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.linkDisableSelector, 'ajax:stopped', enableElement);
        delegate(document, Rails.buttonDisableSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.buttonDisableSelector, 'ajax:stopped', enableElement);
        delegate(document, Rails.linkClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.linkClickSelector, 'click', handleConfirm);
        delegate(document, Rails.linkClickSelector, 'click', handleMetaClick);
        delegate(document, Rails.linkClickSelector, 'click', disableElement);
        delegate(document, Rails.linkClickSelector, 'click', handleRemote);
        delegate(document, Rails.linkClickSelector, 'click', handleMethod);
        delegate(document, Rails.buttonClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.buttonClickSelector, 'click', handleConfirm);
        delegate(document, Rails.buttonClickSelector, 'click', disableElement);
        delegate(document, Rails.buttonClickSelector, 'click', handleRemote);
        delegate(document, Rails.inputChangeSelector, 'change', handleDisabledElement);
        delegate(document, Rails.inputChangeSelector, 'change', handleConfirm);
        delegate(document, Rails.inputChangeSelector, 'change', handleRemote);
        delegate(document, Rails.formSubmitSelector, 'submit', handleDisabledElement);
        delegate(document, Rails.formSubmitSelector, 'submit', handleConfirm);
        delegate(document, Rails.formSubmitSelector, 'submit', handleRemote);
        delegate(document, Rails.formSubmitSelector, 'submit', function(e) {
          return setTimeout((function() {
            return disableElement(e);
          }), 13);
        });
        delegate(document, Rails.formSubmitSelector, 'ajax:send', disableElement);
        delegate(document, Rails.formSubmitSelector, 'ajax:complete', enableElement);
        delegate(document, Rails.formInputClickSelector, 'click', handleDisabledElement);
        delegate(document, Rails.formInputClickSelector, 'click', handleConfirm);
        delegate(document, Rails.formInputClickSelector, 'click', formSubmitButtonClick);
        document.addEventListener('DOMContentLoaded', refreshCSRFTokens);
        return window._rails_loaded = true;
      };

      if (window.Rails === Rails && fire(document, 'rails:attachBindings')) {
        Rails.start();
      }

    }).call(this);
  }).call(this);

  if (typeof module === "object" && module.exports) {
    module.exports = Rails;
  } else if (typeof define === "function" && define.amd) {
    define(Rails);
  }
}).call(this);
/*
Turbolinks 5.0.3
Copyright © 2017 Basecamp, LLC
 */

(function(){(function(){(function(){this.Turbolinks={supported:function(){return null!=window.history.pushState&&null!=window.requestAnimationFrame&&null!=window.addEventListener}(),visit:function(e,r){return t.controller.visit(e,r)},clearCache:function(){return t.controller.clearCache()}}}).call(this)}).call(this);var t=this.Turbolinks;(function(){(function(){var e,r,n=[].slice;t.copyObject=function(t){var e,r,n;r={};for(e in t)n=t[e],r[e]=n;return r},t.closest=function(t,r){return e.call(t,r)},e=function(){var t,e;return t=document.documentElement,null!=(e=t.closest)?e:function(t){var e;for(e=this;e;){if(e.nodeType===Node.ELEMENT_NODE&&r.call(e,t))return e;e=e.parentNode}}}(),t.defer=function(t){return setTimeout(t,1)},t.throttle=function(t){var e;return e=null,function(){var r;return r=1<=arguments.length?n.call(arguments,0):[],null!=e?e:e=requestAnimationFrame(function(n){return function(){return e=null,t.apply(n,r)}}(this))}},t.dispatch=function(t,e){var r,n,o,i,s;return i=null!=e?e:{},s=i.target,r=i.cancelable,n=i.data,o=document.createEvent("Events"),o.initEvent(t,!0,r===!0),o.data=null!=n?n:{},(null!=s?s:document).dispatchEvent(o),o},t.match=function(t,e){return r.call(t,e)},r=function(){var t,e,r,n;return t=document.documentElement,null!=(e=null!=(r=null!=(n=t.matchesSelector)?n:t.webkitMatchesSelector)?r:t.msMatchesSelector)?e:t.mozMatchesSelector}(),t.uuid=function(){var t,e,r;for(r="",t=e=1;36>=e;t=++e)r+=9===t||14===t||19===t||24===t?"-":15===t?"4":20===t?(Math.floor(4*Math.random())+8).toString(16):Math.floor(15*Math.random()).toString(16);return r}}).call(this),function(){t.Location=function(){function t(t){var e,r;null==t&&(t=""),r=document.createElement("a"),r.href=t.toString(),this.absoluteURL=r.href,e=r.hash.length,2>e?this.requestURL=this.absoluteURL:(this.requestURL=this.absoluteURL.slice(0,-e),this.anchor=r.hash.slice(1))}var e,r,n,o;return t.wrap=function(t){return t instanceof this?t:new this(t)},t.prototype.getOrigin=function(){return this.absoluteURL.split("/",3).join("/")},t.prototype.getPath=function(){var t,e;return null!=(t=null!=(e=this.absoluteURL.match(/\/\/[^\/]*(\/[^?;]*)/))?e[1]:void 0)?t:"/"},t.prototype.getPathComponents=function(){return this.getPath().split("/").slice(1)},t.prototype.getLastPathComponent=function(){return this.getPathComponents().slice(-1)[0]},t.prototype.getExtension=function(){var t,e;return null!=(t=null!=(e=this.getLastPathComponent().match(/\.[^.]*$/))?e[0]:void 0)?t:""},t.prototype.isHTML=function(){return this.getExtension().match(/^(?:|\.(?:htm|html|xhtml))$/)},t.prototype.isPrefixedBy=function(t){var e;return e=r(t),this.isEqualTo(t)||o(this.absoluteURL,e)},t.prototype.isEqualTo=function(t){return this.absoluteURL===(null!=t?t.absoluteURL:void 0)},t.prototype.toCacheKey=function(){return this.requestURL},t.prototype.toJSON=function(){return this.absoluteURL},t.prototype.toString=function(){return this.absoluteURL},t.prototype.valueOf=function(){return this.absoluteURL},r=function(t){return e(t.getOrigin()+t.getPath())},e=function(t){return n(t,"/")?t:t+"/"},o=function(t,e){return t.slice(0,e.length)===e},n=function(t,e){return t.slice(-e.length)===e},t}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.HttpRequest=function(){function r(r,n,o){this.delegate=r,this.requestCanceled=e(this.requestCanceled,this),this.requestTimedOut=e(this.requestTimedOut,this),this.requestFailed=e(this.requestFailed,this),this.requestLoaded=e(this.requestLoaded,this),this.requestProgressed=e(this.requestProgressed,this),this.url=t.Location.wrap(n).requestURL,this.referrer=t.Location.wrap(o).absoluteURL,this.createXHR()}return r.NETWORK_FAILURE=0,r.TIMEOUT_FAILURE=-1,r.timeout=60,r.prototype.send=function(){var t;return this.xhr&&!this.sent?(this.notifyApplicationBeforeRequestStart(),this.setProgress(0),this.xhr.send(),this.sent=!0,"function"==typeof(t=this.delegate).requestStarted?t.requestStarted():void 0):void 0},r.prototype.cancel=function(){return this.xhr&&this.sent?this.xhr.abort():void 0},r.prototype.requestProgressed=function(t){return t.lengthComputable?this.setProgress(t.loaded/t.total):void 0},r.prototype.requestLoaded=function(){return this.endRequest(function(t){return function(){var e;return 200<=(e=t.xhr.status)&&300>e?t.delegate.requestCompletedWithResponse(t.xhr.responseText,t.xhr.getResponseHeader("Turbolinks-Location")):(t.failed=!0,t.delegate.requestFailedWithStatusCode(t.xhr.status,t.xhr.responseText))}}(this))},r.prototype.requestFailed=function(){return this.endRequest(function(t){return function(){return t.failed=!0,t.delegate.requestFailedWithStatusCode(t.constructor.NETWORK_FAILURE)}}(this))},r.prototype.requestTimedOut=function(){return this.endRequest(function(t){return function(){return t.failed=!0,t.delegate.requestFailedWithStatusCode(t.constructor.TIMEOUT_FAILURE)}}(this))},r.prototype.requestCanceled=function(){return this.endRequest()},r.prototype.notifyApplicationBeforeRequestStart=function(){return t.dispatch("turbolinks:request-start",{data:{url:this.url,xhr:this.xhr}})},r.prototype.notifyApplicationAfterRequestEnd=function(){return t.dispatch("turbolinks:request-end",{data:{url:this.url,xhr:this.xhr}})},r.prototype.createXHR=function(){return this.xhr=new XMLHttpRequest,this.xhr.open("GET",this.url,!0),this.xhr.timeout=1e3*this.constructor.timeout,this.xhr.setRequestHeader("Accept","text/html, application/xhtml+xml"),this.xhr.setRequestHeader("Turbolinks-Referrer",this.referrer),this.xhr.onprogress=this.requestProgressed,this.xhr.onload=this.requestLoaded,this.xhr.onerror=this.requestFailed,this.xhr.ontimeout=this.requestTimedOut,this.xhr.onabort=this.requestCanceled},r.prototype.endRequest=function(t){return this.xhr?(this.notifyApplicationAfterRequestEnd(),null!=t&&t.call(this),this.destroy()):void 0},r.prototype.setProgress=function(t){var e;return this.progress=t,"function"==typeof(e=this.delegate).requestProgressed?e.requestProgressed(this.progress):void 0},r.prototype.destroy=function(){var t;return this.setProgress(1),"function"==typeof(t=this.delegate).requestFinished&&t.requestFinished(),this.delegate=null,this.xhr=null},r}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.ProgressBar=function(){function t(){this.trickle=e(this.trickle,this),this.stylesheetElement=this.createStylesheetElement(),this.progressElement=this.createProgressElement()}var r;return r=300,t.defaultCSS=".turbolinks-progress-bar {\n  position: fixed;\n  display: block;\n  top: 0;\n  left: 0;\n  height: 3px;\n  background: #0076ff;\n  z-index: 9999;\n  transition: width "+r+"ms ease-out, opacity "+r/2+"ms "+r/2+"ms ease-in;\n  transform: translate3d(0, 0, 0);\n}",t.prototype.show=function(){return this.visible?void 0:(this.visible=!0,this.installStylesheetElement(),this.installProgressElement(),this.startTrickling())},t.prototype.hide=function(){return this.visible&&!this.hiding?(this.hiding=!0,this.fadeProgressElement(function(t){return function(){return t.uninstallProgressElement(),t.stopTrickling(),t.visible=!1,t.hiding=!1}}(this))):void 0},t.prototype.setValue=function(t){return this.value=t,this.refresh()},t.prototype.installStylesheetElement=function(){return document.head.insertBefore(this.stylesheetElement,document.head.firstChild)},t.prototype.installProgressElement=function(){return this.progressElement.style.width=0,this.progressElement.style.opacity=1,document.documentElement.insertBefore(this.progressElement,document.body),this.refresh()},t.prototype.fadeProgressElement=function(t){return this.progressElement.style.opacity=0,setTimeout(t,1.5*r)},t.prototype.uninstallProgressElement=function(){return this.progressElement.parentNode?document.documentElement.removeChild(this.progressElement):void 0},t.prototype.startTrickling=function(){return null!=this.trickleInterval?this.trickleInterval:this.trickleInterval=setInterval(this.trickle,r)},t.prototype.stopTrickling=function(){return clearInterval(this.trickleInterval),this.trickleInterval=null},t.prototype.trickle=function(){return this.setValue(this.value+Math.random()/100)},t.prototype.refresh=function(){return requestAnimationFrame(function(t){return function(){return t.progressElement.style.width=10+90*t.value+"%"}}(this))},t.prototype.createStylesheetElement=function(){var t;return t=document.createElement("style"),t.type="text/css",t.textContent=this.constructor.defaultCSS,t},t.prototype.createProgressElement=function(){var t;return t=document.createElement("div"),t.className="turbolinks-progress-bar",t},t}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.BrowserAdapter=function(){function r(r){this.controller=r,this.showProgressBar=e(this.showProgressBar,this),this.progressBar=new t.ProgressBar}var n,o,i,s;return s=t.HttpRequest,n=s.NETWORK_FAILURE,i=s.TIMEOUT_FAILURE,o=500,r.prototype.visitProposedToLocationWithAction=function(t,e){return this.controller.startVisitToLocationWithAction(t,e)},r.prototype.visitStarted=function(t){return t.issueRequest(),t.changeHistory(),t.loadCachedSnapshot()},r.prototype.visitRequestStarted=function(t){return this.progressBar.setValue(0),t.hasCachedSnapshot()||"restore"!==t.action?this.showProgressBarAfterDelay():this.showProgressBar()},r.prototype.visitRequestProgressed=function(t){return this.progressBar.setValue(t.progress)},r.prototype.visitRequestCompleted=function(t){return t.loadResponse()},r.prototype.visitRequestFailedWithStatusCode=function(t,e){switch(e){case n:case i:return this.reload();default:return t.loadResponse()}},r.prototype.visitRequestFinished=function(t){return this.hideProgressBar()},r.prototype.visitCompleted=function(t){return t.followRedirect()},r.prototype.pageInvalidated=function(){return this.reload()},r.prototype.showProgressBarAfterDelay=function(){return this.progressBarTimeout=setTimeout(this.showProgressBar,o)},r.prototype.showProgressBar=function(){return this.progressBar.show()},r.prototype.hideProgressBar=function(){return this.progressBar.hide(),clearTimeout(this.progressBarTimeout)},r.prototype.reload=function(){return window.location.reload()},r}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.History=function(){function r(t){this.delegate=t,this.onPageLoad=e(this.onPageLoad,this),this.onPopState=e(this.onPopState,this)}return r.prototype.start=function(){return this.started?void 0:(addEventListener("popstate",this.onPopState,!1),addEventListener("load",this.onPageLoad,!1),this.started=!0)},r.prototype.stop=function(){return this.started?(removeEventListener("popstate",this.onPopState,!1),removeEventListener("load",this.onPageLoad,!1),this.started=!1):void 0},r.prototype.push=function(e,r){return e=t.Location.wrap(e),this.update("push",e,r)},r.prototype.replace=function(e,r){return e=t.Location.wrap(e),this.update("replace",e,r)},r.prototype.onPopState=function(e){var r,n,o,i;return this.shouldHandlePopState()&&(i=null!=(n=e.state)?n.turbolinks:void 0)?(r=t.Location.wrap(window.location),o=i.restorationIdentifier,this.delegate.historyPoppedToLocationWithRestorationIdentifier(r,o)):void 0},r.prototype.onPageLoad=function(e){return t.defer(function(t){return function(){return t.pageLoaded=!0}}(this))},r.prototype.shouldHandlePopState=function(){return this.pageIsLoaded()},r.prototype.pageIsLoaded=function(){return this.pageLoaded||"complete"===document.readyState},r.prototype.update=function(t,e,r){var n;return n={turbolinks:{restorationIdentifier:r}},history[t+"State"](n,null,e)},r}()}.call(this),function(){t.Snapshot=function(){function e(t){var e,r;r=t.head,e=t.body,this.head=null!=r?r:document.createElement("head"),this.body=null!=e?e:document.createElement("body")}return e.wrap=function(t){return t instanceof this?t:this.fromHTML(t)},e.fromHTML=function(t){var e;return e=document.createElement("html"),e.innerHTML=t,this.fromElement(e)},e.fromElement=function(t){return new this({head:t.querySelector("head"),body:t.querySelector("body")})},e.prototype.clone=function(){return new e({head:this.head.cloneNode(!0),body:this.body.cloneNode(!0)})},e.prototype.getRootLocation=function(){var e,r;return r=null!=(e=this.getSetting("root"))?e:"/",new t.Location(r)},e.prototype.getCacheControlValue=function(){return this.getSetting("cache-control")},e.prototype.hasAnchor=function(t){try{return null!=this.body.querySelector("[id='"+t+"']")}catch(e){}},e.prototype.isPreviewable=function(){return"no-preview"!==this.getCacheControlValue()},e.prototype.isCacheable=function(){return"no-cache"!==this.getCacheControlValue()},e.prototype.getSetting=function(t){var e,r;return r=this.head.querySelectorAll("meta[name='turbolinks-"+t+"']"),e=r[r.length-1],null!=e?e.getAttribute("content"):void 0},e}()}.call(this),function(){var e=[].slice;t.Renderer=function(){function t(){}var r;return t.render=function(){var t,r,n,o;return n=arguments[0],r=arguments[1],t=3<=arguments.length?e.call(arguments,2):[],o=function(t,e,r){r.prototype=t.prototype;var n=new r,o=t.apply(n,e);return Object(o)===o?o:n}(this,t,function(){}),o.delegate=n,o.render(r),o},t.prototype.renderView=function(t){return this.delegate.viewWillRender(this.newBody),t(),this.delegate.viewRendered(this.newBody)},t.prototype.invalidateView=function(){return this.delegate.viewInvalidated()},t.prototype.createScriptElement=function(t){var e;return"false"===t.getAttribute("data-turbolinks-eval")?t:(e=document.createElement("script"),e.textContent=t.textContent,r(e,t),e)},r=function(t,e){var r,n,o,i,s,a,u;for(i=e.attributes,a=[],r=0,n=i.length;n>r;r++)s=i[r],o=s.name,u=s.value,a.push(t.setAttribute(o,u));return a},t}()}.call(this),function(){t.HeadDetails=function(){function t(t){var e,r,i,s,a,u,l;for(this.element=t,this.elements={},l=this.element.childNodes,s=0,u=l.length;u>s;s++)i=l[s],i.nodeType===Node.ELEMENT_NODE&&(a=i.outerHTML,r=null!=(e=this.elements)[a]?e[a]:e[a]={type:o(i),tracked:n(i),elements:[]},r.elements.push(i))}var e,r,n,o;return t.prototype.hasElementWithKey=function(t){return t in this.elements},t.prototype.getTrackedElementSignature=function(){var t,e;return function(){var r,n;r=this.elements,n=[];for(t in r)e=r[t].tracked,e&&n.push(t);return n}.call(this).join("")},t.prototype.getScriptElementsNotInDetails=function(t){return this.getElementsMatchingTypeNotInDetails("script",t)},t.prototype.getStylesheetElementsNotInDetails=function(t){return this.getElementsMatchingTypeNotInDetails("stylesheet",t)},t.prototype.getElementsMatchingTypeNotInDetails=function(t,e){var r,n,o,i,s,a;o=this.elements,s=[];for(n in o)i=o[n],a=i.type,r=i.elements,a!==t||e.hasElementWithKey(n)||s.push(r[0]);return s},t.prototype.getProvisionalElements=function(){var t,e,r,n,o,i,s;r=[],n=this.elements;for(e in n)o=n[e],s=o.type,i=o.tracked,t=o.elements,null!=s||i?t.length>1&&r.push.apply(r,t.slice(1)):r.push.apply(r,t);return r},o=function(t){return e(t)?"script":r(t)?"stylesheet":void 0},n=function(t){return"reload"===t.getAttribute("data-turbolinks-track")},e=function(t){var e;return e=t.tagName.toLowerCase(),"script"===e},r=function(t){var e;return e=t.tagName.toLowerCase(),"style"===e||"link"===e&&"stylesheet"===t.getAttribute("rel")},t}()}.call(this),function(){var e=function(t,e){function n(){this.constructor=t}for(var o in e)r.call(e,o)&&(t[o]=e[o]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},r={}.hasOwnProperty;t.SnapshotRenderer=function(r){function n(e,r){this.currentSnapshot=e,this.newSnapshot=r,this.currentHeadDetails=new t.HeadDetails(this.currentSnapshot.head),this.newHeadDetails=new t.HeadDetails(this.newSnapshot.head),this.newBody=this.newSnapshot.body}return e(n,r),n.prototype.render=function(t){return this.trackedElementsAreIdentical()?(this.mergeHead(),this.renderView(function(e){return function(){return e.replaceBody(),e.focusFirstAutofocusableElement(),t()}}(this))):this.invalidateView()},n.prototype.mergeHead=function(){return this.copyNewHeadStylesheetElements(),this.copyNewHeadScriptElements(),this.removeCurrentHeadProvisionalElements(),this.copyNewHeadProvisionalElements()},n.prototype.replaceBody=function(){return this.activateBodyScriptElements(),this.importBodyPermanentElements(),this.assignNewBody()},n.prototype.trackedElementsAreIdentical=function(){return this.currentHeadDetails.getTrackedElementSignature()===this.newHeadDetails.getTrackedElementSignature()},n.prototype.copyNewHeadStylesheetElements=function(){var t,e,r,n,o;for(n=this.getNewHeadStylesheetElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(t));return o},n.prototype.copyNewHeadScriptElements=function(){var t,e,r,n,o;for(n=this.getNewHeadScriptElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(this.createScriptElement(t)));return o},n.prototype.removeCurrentHeadProvisionalElements=function(){var t,e,r,n,o;for(n=this.getCurrentHeadProvisionalElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.removeChild(t));return o},n.prototype.copyNewHeadProvisionalElements=function(){var t,e,r,n,o;for(n=this.getNewHeadProvisionalElements(),o=[],e=0,r=n.length;r>e;e++)t=n[e],o.push(document.head.appendChild(t));return o},n.prototype.importBodyPermanentElements=function(){var t,e,r,n,o,i;for(n=this.getNewBodyPermanentElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],(t=this.findCurrentBodyPermanentElement(o))?i.push(o.parentNode.replaceChild(t,o)):i.push(void 0);return i},n.prototype.activateBodyScriptElements=function(){var t,e,r,n,o,i;for(n=this.getNewBodyScriptElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],t=this.createScriptElement(o),i.push(o.parentNode.replaceChild(t,o));return i},n.prototype.assignNewBody=function(){return document.body=this.newBody},n.prototype.focusFirstAutofocusableElement=function(){var t;return null!=(t=this.findFirstAutofocusableElement())?t.focus():void 0},n.prototype.getNewHeadStylesheetElements=function(){return this.newHeadDetails.getStylesheetElementsNotInDetails(this.currentHeadDetails)},n.prototype.getNewHeadScriptElements=function(){return this.newHeadDetails.getScriptElementsNotInDetails(this.currentHeadDetails)},n.prototype.getCurrentHeadProvisionalElements=function(){return this.currentHeadDetails.getProvisionalElements()},n.prototype.getNewHeadProvisionalElements=function(){return this.newHeadDetails.getProvisionalElements()},n.prototype.getNewBodyPermanentElements=function(){return this.newBody.querySelectorAll("[id][data-turbolinks-permanent]")},n.prototype.findCurrentBodyPermanentElement=function(t){return document.body.querySelector("#"+t.id+"[data-turbolinks-permanent]")},n.prototype.getNewBodyScriptElements=function(){return this.newBody.querySelectorAll("script")},n.prototype.findFirstAutofocusableElement=function(){return document.body.querySelector("[autofocus]")},n}(t.Renderer)}.call(this),function(){var e=function(t,e){function n(){this.constructor=t}for(var o in e)r.call(e,o)&&(t[o]=e[o]);return n.prototype=e.prototype,t.prototype=new n,t.__super__=e.prototype,t},r={}.hasOwnProperty;t.ErrorRenderer=function(t){function r(t){this.html=t}return e(r,t),r.prototype.render=function(t){return this.renderView(function(e){return function(){return e.replaceDocumentHTML(),e.activateBodyScriptElements(),t()}}(this))},r.prototype.replaceDocumentHTML=function(){return document.documentElement.innerHTML=this.html},r.prototype.activateBodyScriptElements=function(){var t,e,r,n,o,i;for(n=this.getScriptElements(),i=[],e=0,r=n.length;r>e;e++)o=n[e],t=this.createScriptElement(o),i.push(o.parentNode.replaceChild(t,o));return i},r.prototype.getScriptElements=function(){return document.documentElement.querySelectorAll("script")},r}(t.Renderer)}.call(this),function(){t.View=function(){function e(t){this.delegate=t,this.element=document.documentElement}return e.prototype.getRootLocation=function(){return this.getSnapshot().getRootLocation()},e.prototype.getSnapshot=function(){return t.Snapshot.fromElement(this.element)},e.prototype.render=function(t,e){var r,n,o;return o=t.snapshot,r=t.error,n=t.isPreview,this.markAsPreview(n),null!=o?this.renderSnapshot(o,e):this.renderError(r,e)},e.prototype.markAsPreview=function(t){return t?this.element.setAttribute("data-turbolinks-preview",""):this.element.removeAttribute("data-turbolinks-preview")},e.prototype.renderSnapshot=function(e,r){return t.SnapshotRenderer.render(this.delegate,r,this.getSnapshot(),t.Snapshot.wrap(e))},e.prototype.renderError=function(e,r){return t.ErrorRenderer.render(this.delegate,r,e)},e}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.ScrollManager=function(){function r(r){this.delegate=r,this.onScroll=e(this.onScroll,this),this.onScroll=t.throttle(this.onScroll)}return r.prototype.start=function(){return this.started?void 0:(addEventListener("scroll",this.onScroll,!1),this.onScroll(),this.started=!0)},r.prototype.stop=function(){return this.started?(removeEventListener("scroll",this.onScroll,!1),this.started=!1):void 0},r.prototype.scrollToElement=function(t){return t.scrollIntoView()},r.prototype.scrollToPosition=function(t){var e,r;return e=t.x,r=t.y,window.scrollTo(e,r)},r.prototype.onScroll=function(t){return this.updatePosition({x:window.pageXOffset,y:window.pageYOffset})},r.prototype.updatePosition=function(t){var e;return this.position=t,null!=(e=this.delegate)?e.scrollPositionChanged(this.position):void 0},r}()}.call(this),function(){t.SnapshotCache=function(){function e(t){this.size=t,this.keys=[],this.snapshots={}}var r;return e.prototype.has=function(t){var e;return e=r(t),e in this.snapshots},e.prototype.get=function(t){var e;if(this.has(t))return e=this.read(t),this.touch(t),e},e.prototype.put=function(t,e){return this.write(t,e),this.touch(t),e},e.prototype.read=function(t){var e;return e=r(t),this.snapshots[e]},e.prototype.write=function(t,e){var n;return n=r(t),this.snapshots[n]=e},e.prototype.touch=function(t){var e,n;return n=r(t),e=this.keys.indexOf(n),e>-1&&this.keys.splice(e,1),this.keys.unshift(n),this.trim()},e.prototype.trim=function(){var t,e,r,n,o;for(n=this.keys.splice(this.size),o=[],t=0,r=n.length;r>t;t++)e=n[t],o.push(delete this.snapshots[e]);return o},r=function(e){return t.Location.wrap(e).toCacheKey()},e}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.Visit=function(){function r(r,n,o){this.controller=r,this.action=o,this.performScroll=e(this.performScroll,this),this.identifier=t.uuid(),this.location=t.Location.wrap(n),this.adapter=this.controller.adapter,this.state="initialized",this.timingMetrics={}}var n;return r.prototype.start=function(){return"initialized"===this.state?(this.recordTimingMetric("visitStart"),this.state="started",this.adapter.visitStarted(this)):void 0},r.prototype.cancel=function(){var t;return"started"===this.state?(null!=(t=this.request)&&t.cancel(),this.cancelRender(),this.state="canceled"):void 0},r.prototype.complete=function(){var t;return"started"===this.state?(this.recordTimingMetric("visitEnd"),this.state="completed","function"==typeof(t=this.adapter).visitCompleted&&t.visitCompleted(this),this.controller.visitCompleted(this)):void 0},r.prototype.fail=function(){var t;return"started"===this.state?(this.state="failed","function"==typeof(t=this.adapter).visitFailed?t.visitFailed(this):void 0):void 0},r.prototype.changeHistory=function(){var t,e;return this.historyChanged?void 0:(t=this.location.isEqualTo(this.referrer)?"replace":this.action,e=n(t),this.controller[e](this.location,this.restorationIdentifier),this.historyChanged=!0)},r.prototype.issueRequest=function(){return this.shouldIssueRequest()&&null==this.request?(this.progress=0,this.request=new t.HttpRequest(this,this.location,this.referrer),this.request.send()):void 0},r.prototype.getCachedSnapshot=function(){var t;return!(t=this.controller.getCachedSnapshotForLocation(this.location))||null!=this.location.anchor&&!t.hasAnchor(this.location.anchor)||"restore"!==this.action&&!t.isPreviewable()?void 0:t},r.prototype.hasCachedSnapshot=function(){return null!=this.getCachedSnapshot()},r.prototype.loadCachedSnapshot=function(){var t,e;return(e=this.getCachedSnapshot())?(t=this.shouldIssueRequest(),this.render(function(){var r;return this.cacheSnapshot(),this.controller.render({snapshot:e,isPreview:t},this.performScroll),"function"==typeof(r=this.adapter).visitRendered&&r.visitRendered(this),t?void 0:this.complete()})):void 0},r.prototype.loadResponse=function(){return null!=this.response?this.render(function(){var t,e;return this.cacheSnapshot(),this.request.failed?(this.controller.render({error:this.response},this.performScroll),"function"==typeof(t=this.adapter).visitRendered&&t.visitRendered(this),this.fail()):(this.controller.render({snapshot:this.response},this.performScroll),"function"==typeof(e=this.adapter).visitRendered&&e.visitRendered(this),this.complete())}):void 0},r.prototype.followRedirect=function(){return this.redirectedToLocation&&!this.followedRedirect?(this.location=this.redirectedToLocation,this.controller.replaceHistoryWithLocationAndRestorationIdentifier(this.redirectedToLocation,this.restorationIdentifier),this.followedRedirect=!0):void 0},r.prototype.requestStarted=function(){var t;return this.recordTimingMetric("requestStart"),"function"==typeof(t=this.adapter).visitRequestStarted?t.visitRequestStarted(this):void 0},r.prototype.requestProgressed=function(t){var e;return this.progress=t,"function"==typeof(e=this.adapter).visitRequestProgressed?e.visitRequestProgressed(this):void 0},r.prototype.requestCompletedWithResponse=function(e,r){return this.response=e,null!=r&&(this.redirectedToLocation=t.Location.wrap(r)),this.adapter.visitRequestCompleted(this)},r.prototype.requestFailedWithStatusCode=function(t,e){return this.response=e,this.adapter.visitRequestFailedWithStatusCode(this,t)},r.prototype.requestFinished=function(){var t;return this.recordTimingMetric("requestEnd"),"function"==typeof(t=this.adapter).visitRequestFinished?t.visitRequestFinished(this):void 0},r.prototype.performScroll=function(){return this.scrolled?void 0:("restore"===this.action?this.scrollToRestoredPosition()||this.scrollToTop():this.scrollToAnchor()||this.scrollToTop(),this.scrolled=!0)},r.prototype.scrollToRestoredPosition=function(){var t,e;return t=null!=(e=this.restorationData)?e.scrollPosition:void 0,null!=t?(this.controller.scrollToPosition(t),!0):void 0},r.prototype.scrollToAnchor=function(){return null!=this.location.anchor?(this.controller.scrollToAnchor(this.location.anchor),!0):void 0},r.prototype.scrollToTop=function(){return this.controller.scrollToPosition({x:0,y:0})},r.prototype.recordTimingMetric=function(t){var e;return null!=(e=this.timingMetrics)[t]?e[t]:e[t]=(new Date).getTime()},r.prototype.getTimingMetrics=function(){return t.copyObject(this.timingMetrics)},n=function(t){switch(t){case"replace":return"replaceHistoryWithLocationAndRestorationIdentifier";case"advance":case"restore":return"pushHistoryWithLocationAndRestorationIdentifier"}},r.prototype.shouldIssueRequest=function(){return"restore"===this.action?!this.hasCachedSnapshot():!0},r.prototype.cacheSnapshot=function(){return this.snapshotCached?void 0:(this.controller.cacheSnapshot(),this.snapshotCached=!0)},r.prototype.render=function(t){return this.cancelRender(),this.frame=requestAnimationFrame(function(e){return function(){return e.frame=null,t.call(e)}}(this))},r.prototype.cancelRender=function(){return this.frame?cancelAnimationFrame(this.frame):void 0},r}()}.call(this),function(){var e=function(t,e){return function(){return t.apply(e,arguments)}};t.Controller=function(){function r(){this.clickBubbled=e(this.clickBubbled,this),this.clickCaptured=e(this.clickCaptured,this),this.pageLoaded=e(this.pageLoaded,this),this.history=new t.History(this),this.view=new t.View(this),this.scrollManager=new t.ScrollManager(this),this.restorationData={},this.clearCache()}return r.prototype.start=function(){return t.supported&&!this.started?(addEventListener("click",this.clickCaptured,!0),addEventListener("DOMContentLoaded",this.pageLoaded,!1),this.scrollManager.start(),this.startHistory(),this.started=!0,this.enabled=!0):void 0},r.prototype.disable=function(){return this.enabled=!1},r.prototype.stop=function(){return this.started?(removeEventListener("click",this.clickCaptured,!0),removeEventListener("DOMContentLoaded",this.pageLoaded,!1),this.scrollManager.stop(),this.stopHistory(),this.started=!1):void 0},r.prototype.clearCache=function(){return this.cache=new t.SnapshotCache(10)},r.prototype.visit=function(e,r){var n,o;return null==r&&(r={}),e=t.Location.wrap(e),this.applicationAllowsVisitingLocation(e)?this.locationIsVisitable(e)?(n=null!=(o=r.action)?o:"advance",this.adapter.visitProposedToLocationWithAction(e,n)):window.location=e:void 0},r.prototype.startVisitToLocationWithAction=function(e,r,n){var o;return t.supported?(o=this.getRestorationDataForIdentifier(n),this.startVisit(e,r,{restorationData:o})):window.location=e},r.prototype.startHistory=function(){return this.location=t.Location.wrap(window.location),this.restorationIdentifier=t.uuid(),this.history.start(),this.history.replace(this.location,this.restorationIdentifier)},r.prototype.stopHistory=function(){return this.history.stop()},r.prototype.pushHistoryWithLocationAndRestorationIdentifier=function(e,r){return this.restorationIdentifier=r,this.location=t.Location.wrap(e),this.history.push(this.location,this.restorationIdentifier)},r.prototype.replaceHistoryWithLocationAndRestorationIdentifier=function(e,r){return this.restorationIdentifier=r,this.location=t.Location.wrap(e),this.history.replace(this.location,this.restorationIdentifier)},r.prototype.historyPoppedToLocationWithRestorationIdentifier=function(e,r){var n;return this.restorationIdentifier=r,this.enabled?(n=this.getRestorationDataForIdentifier(this.restorationIdentifier),this.startVisit(e,"restore",{restorationIdentifier:this.restorationIdentifier,restorationData:n,historyChanged:!0}),this.location=t.Location.wrap(e)):this.adapter.pageInvalidated()},r.prototype.getCachedSnapshotForLocation=function(t){var e;return e=this.cache.get(t),e?e.clone():void 0},r.prototype.shouldCacheSnapshot=function(){return this.view.getSnapshot().isCacheable()},r.prototype.cacheSnapshot=function(){var t;return this.shouldCacheSnapshot()?(this.notifyApplicationBeforeCachingSnapshot(),t=this.view.getSnapshot(),this.cache.put(this.lastRenderedLocation,t.clone())):void 0},r.prototype.scrollToAnchor=function(t){var e;return(e=document.getElementById(t))?this.scrollToElement(e):this.scrollToPosition({x:0,y:0})},r.prototype.scrollToElement=function(t){return this.scrollManager.scrollToElement(t)},r.prototype.scrollToPosition=function(t){return this.scrollManager.scrollToPosition(t)},r.prototype.scrollPositionChanged=function(t){var e;return e=this.getCurrentRestorationData(),e.scrollPosition=t},r.prototype.render=function(t,e){return this.view.render(t,e)},r.prototype.viewInvalidated=function(){return this.adapter.pageInvalidated()},r.prototype.viewWillRender=function(t){return this.notifyApplicationBeforeRender(t)},r.prototype.viewRendered=function(){return this.lastRenderedLocation=this.currentVisit.location,this.notifyApplicationAfterRender()},r.prototype.pageLoaded=function(){return this.lastRenderedLocation=this.location,this.notifyApplicationAfterPageLoad()},r.prototype.clickCaptured=function(){return removeEventListener("click",this.clickBubbled,!1),addEventListener("click",this.clickBubbled,!1)},r.prototype.clickBubbled=function(t){var e,r,n;return this.enabled&&this.clickEventIsSignificant(t)&&(r=this.getVisitableLinkForNode(t.target))&&(n=this.getVisitableLocationForLink(r))&&this.applicationAllowsFollowingLinkToLocation(r,n)?(t.preventDefault(),e=this.getActionForLink(r),this.visit(n,{action:e})):void 0},r.prototype.applicationAllowsFollowingLinkToLocation=function(t,e){var r;return r=this.notifyApplicationAfterClickingLinkToLocation(t,e),!r.defaultPrevented},r.prototype.applicationAllowsVisitingLocation=function(t){var e;return e=this.notifyApplicationBeforeVisitingLocation(t),!e.defaultPrevented},r.prototype.notifyApplicationAfterClickingLinkToLocation=function(e,r){return t.dispatch("turbolinks:click",{target:e,data:{url:r.absoluteURL},cancelable:!0})},r.prototype.notifyApplicationBeforeVisitingLocation=function(e){return t.dispatch("turbolinks:before-visit",{data:{url:e.absoluteURL},cancelable:!0})},r.prototype.notifyApplicationAfterVisitingLocation=function(e){return t.dispatch("turbolinks:visit",{data:{url:e.absoluteURL}})},r.prototype.notifyApplicationBeforeCachingSnapshot=function(){return t.dispatch("turbolinks:before-cache")},r.prototype.notifyApplicationBeforeRender=function(e){
return t.dispatch("turbolinks:before-render",{data:{newBody:e}})},r.prototype.notifyApplicationAfterRender=function(){return t.dispatch("turbolinks:render")},r.prototype.notifyApplicationAfterPageLoad=function(e){return null==e&&(e={}),t.dispatch("turbolinks:load",{data:{url:this.location.absoluteURL,timing:e}})},r.prototype.startVisit=function(t,e,r){var n;return null!=(n=this.currentVisit)&&n.cancel(),this.currentVisit=this.createVisit(t,e,r),this.currentVisit.start(),this.notifyApplicationAfterVisitingLocation(t)},r.prototype.createVisit=function(e,r,n){var o,i,s,a,u;return i=null!=n?n:{},a=i.restorationIdentifier,s=i.restorationData,o=i.historyChanged,u=new t.Visit(this,e,r),u.restorationIdentifier=null!=a?a:t.uuid(),u.restorationData=t.copyObject(s),u.historyChanged=o,u.referrer=this.location,u},r.prototype.visitCompleted=function(t){return this.notifyApplicationAfterPageLoad(t.getTimingMetrics())},r.prototype.clickEventIsSignificant=function(t){return!(t.defaultPrevented||t.target.isContentEditable||t.which>1||t.altKey||t.ctrlKey||t.metaKey||t.shiftKey)},r.prototype.getVisitableLinkForNode=function(e){return this.nodeIsVisitable(e)?t.closest(e,"a[href]:not([target]):not([download])"):void 0},r.prototype.getVisitableLocationForLink=function(e){var r;return r=new t.Location(e.getAttribute("href")),this.locationIsVisitable(r)?r:void 0},r.prototype.getActionForLink=function(t){var e;return null!=(e=t.getAttribute("data-turbolinks-action"))?e:"advance"},r.prototype.nodeIsVisitable=function(e){var r;return(r=t.closest(e,"[data-turbolinks]"))?"false"!==r.getAttribute("data-turbolinks"):!0},r.prototype.locationIsVisitable=function(t){return t.isPrefixedBy(this.view.getRootLocation())&&t.isHTML()},r.prototype.getCurrentRestorationData=function(){return this.getRestorationDataForIdentifier(this.restorationIdentifier)},r.prototype.getRestorationDataForIdentifier=function(t){var e;return null!=(e=this.restorationData)[t]?e[t]:e[t]={}},r}()}.call(this),function(){var e,r,n;t.start=function(){return r()?(null==t.controller&&(t.controller=e()),t.controller.start()):void 0},r=function(){return null==window.Turbolinks&&(window.Turbolinks=t),n()},e=function(){var e;return e=new t.Controller,e.adapter=new t.BrowserAdapter(e),e},n=function(){return window.Turbolinks===t},n()&&t.start()}.call(this)}).call(this),"object"==typeof module&&module.exports?module.exports=t:"function"==typeof define&&define.amd&&define(t)}).call(this);
(function() {
  (function() {
    (function() {
      var slice = [].slice;

      this.ActionCable = {
        INTERNAL: {
          "message_types": {
            "welcome": "welcome",
            "ping": "ping",
            "confirmation": "confirm_subscription",
            "rejection": "reject_subscription"
          },
          "default_mount_path": "/cable",
          "protocols": ["actioncable-v1-json", "actioncable-unsupported"]
        },
        WebSocket: window.WebSocket,
        logger: window.console,
        createConsumer: function(url) {
          var ref;
          if (url == null) {
            url = (ref = this.getConfig("url")) != null ? ref : this.INTERNAL.default_mount_path;
          }
          return new ActionCable.Consumer(this.createWebSocketURL(url));
        },
        getConfig: function(name) {
          var element;
          element = document.head.querySelector("meta[name='action-cable-" + name + "']");
          return element != null ? element.getAttribute("content") : void 0;
        },
        createWebSocketURL: function(url) {
          var a;
          if (url && !/^wss?:/i.test(url)) {
            a = document.createElement("a");
            a.href = url;
            a.href = a.href;
            a.protocol = a.protocol.replace("http", "ws");
            return a.href;
          } else {
            return url;
          }
        },
        startDebugging: function() {
          return this.debugging = true;
        },
        stopDebugging: function() {
          return this.debugging = null;
        },
        log: function() {
          var messages, ref;
          messages = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          if (this.debugging) {
            messages.push(Date.now());
            return (ref = this.logger).log.apply(ref, ["[ActionCable]"].concat(slice.call(messages)));
          }
        }
      };

    }).call(this);
  }).call(this);

  var ActionCable = this.ActionCable;

  (function() {
    (function() {
      var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

      ActionCable.ConnectionMonitor = (function() {
        var clamp, now, secondsSince;

        ConnectionMonitor.pollInterval = {
          min: 3,
          max: 30
        };

        ConnectionMonitor.staleThreshold = 6;

        function ConnectionMonitor(connection) {
          this.connection = connection;
          this.visibilityDidChange = bind(this.visibilityDidChange, this);
          this.reconnectAttempts = 0;
        }

        ConnectionMonitor.prototype.start = function() {
          if (!this.isRunning()) {
            this.startedAt = now();
            delete this.stoppedAt;
            this.startPolling();
            document.addEventListener("visibilitychange", this.visibilityDidChange);
            return ActionCable.log("ConnectionMonitor started. pollInterval = " + (this.getPollInterval()) + " ms");
          }
        };

        ConnectionMonitor.prototype.stop = function() {
          if (this.isRunning()) {
            this.stoppedAt = now();
            this.stopPolling();
            document.removeEventListener("visibilitychange", this.visibilityDidChange);
            return ActionCable.log("ConnectionMonitor stopped");
          }
        };

        ConnectionMonitor.prototype.isRunning = function() {
          return (this.startedAt != null) && (this.stoppedAt == null);
        };

        ConnectionMonitor.prototype.recordPing = function() {
          return this.pingedAt = now();
        };

        ConnectionMonitor.prototype.recordConnect = function() {
          this.reconnectAttempts = 0;
          this.recordPing();
          delete this.disconnectedAt;
          return ActionCable.log("ConnectionMonitor recorded connect");
        };

        ConnectionMonitor.prototype.recordDisconnect = function() {
          this.disconnectedAt = now();
          return ActionCable.log("ConnectionMonitor recorded disconnect");
        };

        ConnectionMonitor.prototype.startPolling = function() {
          this.stopPolling();
          return this.poll();
        };

        ConnectionMonitor.prototype.stopPolling = function() {
          return clearTimeout(this.pollTimeout);
        };

        ConnectionMonitor.prototype.poll = function() {
          return this.pollTimeout = setTimeout((function(_this) {
            return function() {
              _this.reconnectIfStale();
              return _this.poll();
            };
          })(this), this.getPollInterval());
        };

        ConnectionMonitor.prototype.getPollInterval = function() {
          var interval, max, min, ref;
          ref = this.constructor.pollInterval, min = ref.min, max = ref.max;
          interval = 5 * Math.log(this.reconnectAttempts + 1);
          return Math.round(clamp(interval, min, max) * 1000);
        };

        ConnectionMonitor.prototype.reconnectIfStale = function() {
          if (this.connectionIsStale()) {
            ActionCable.log("ConnectionMonitor detected stale connection. reconnectAttempts = " + this.reconnectAttempts + ", pollInterval = " + (this.getPollInterval()) + " ms, time disconnected = " + (secondsSince(this.disconnectedAt)) + " s, stale threshold = " + this.constructor.staleThreshold + " s");
            this.reconnectAttempts++;
            if (this.disconnectedRecently()) {
              return ActionCable.log("ConnectionMonitor skipping reopening recent disconnect");
            } else {
              ActionCable.log("ConnectionMonitor reopening");
              return this.connection.reopen();
            }
          }
        };

        ConnectionMonitor.prototype.connectionIsStale = function() {
          var ref;
          return secondsSince((ref = this.pingedAt) != null ? ref : this.startedAt) > this.constructor.staleThreshold;
        };

        ConnectionMonitor.prototype.disconnectedRecently = function() {
          return this.disconnectedAt && secondsSince(this.disconnectedAt) < this.constructor.staleThreshold;
        };

        ConnectionMonitor.prototype.visibilityDidChange = function() {
          if (document.visibilityState === "visible") {
            return setTimeout((function(_this) {
              return function() {
                if (_this.connectionIsStale() || !_this.connection.isOpen()) {
                  ActionCable.log("ConnectionMonitor reopening stale connection on visibilitychange. visbilityState = " + document.visibilityState);
                  return _this.connection.reopen();
                }
              };
            })(this), 200);
          }
        };

        now = function() {
          return new Date().getTime();
        };

        secondsSince = function(time) {
          return (now() - time) / 1000;
        };

        clamp = function(number, min, max) {
          return Math.max(min, Math.min(max, number));
        };

        return ConnectionMonitor;

      })();

    }).call(this);
    (function() {
      var i, message_types, protocols, ref, supportedProtocols, unsupportedProtocol,
        slice = [].slice,
        bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
        indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

      ref = ActionCable.INTERNAL, message_types = ref.message_types, protocols = ref.protocols;

      supportedProtocols = 2 <= protocols.length ? slice.call(protocols, 0, i = protocols.length - 1) : (i = 0, []), unsupportedProtocol = protocols[i++];

      ActionCable.Connection = (function() {
        Connection.reopenDelay = 500;

        function Connection(consumer) {
          this.consumer = consumer;
          this.open = bind(this.open, this);
          this.subscriptions = this.consumer.subscriptions;
          this.monitor = new ActionCable.ConnectionMonitor(this);
          this.disconnected = true;
        }

        Connection.prototype.send = function(data) {
          if (this.isOpen()) {
            this.webSocket.send(JSON.stringify(data));
            return true;
          } else {
            return false;
          }
        };

        Connection.prototype.open = function() {
          if (this.isActive()) {
            ActionCable.log("Attempted to open WebSocket, but existing socket is " + (this.getState()));
            return false;
          } else {
            ActionCable.log("Opening WebSocket, current state is " + (this.getState()) + ", subprotocols: " + protocols);
            if (this.webSocket != null) {
              this.uninstallEventHandlers();
            }
            this.webSocket = new ActionCable.WebSocket(this.consumer.url, protocols);
            this.installEventHandlers();
            this.monitor.start();
            return true;
          }
        };

        Connection.prototype.close = function(arg) {
          var allowReconnect, ref1;
          allowReconnect = (arg != null ? arg : {
            allowReconnect: true
          }).allowReconnect;
          if (!allowReconnect) {
            this.monitor.stop();
          }
          if (this.isActive()) {
            return (ref1 = this.webSocket) != null ? ref1.close() : void 0;
          }
        };

        Connection.prototype.reopen = function() {
          var error;
          ActionCable.log("Reopening WebSocket, current state is " + (this.getState()));
          if (this.isActive()) {
            try {
              return this.close();
            } catch (error1) {
              error = error1;
              return ActionCable.log("Failed to reopen WebSocket", error);
            } finally {
              ActionCable.log("Reopening WebSocket in " + this.constructor.reopenDelay + "ms");
              setTimeout(this.open, this.constructor.reopenDelay);
            }
          } else {
            return this.open();
          }
        };

        Connection.prototype.getProtocol = function() {
          var ref1;
          return (ref1 = this.webSocket) != null ? ref1.protocol : void 0;
        };

        Connection.prototype.isOpen = function() {
          return this.isState("open");
        };

        Connection.prototype.isActive = function() {
          return this.isState("open", "connecting");
        };

        Connection.prototype.isProtocolSupported = function() {
          var ref1;
          return ref1 = this.getProtocol(), indexOf.call(supportedProtocols, ref1) >= 0;
        };

        Connection.prototype.isState = function() {
          var ref1, states;
          states = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          return ref1 = this.getState(), indexOf.call(states, ref1) >= 0;
        };

        Connection.prototype.getState = function() {
          var ref1, state, value;
          for (state in WebSocket) {
            value = WebSocket[state];
            if (value === ((ref1 = this.webSocket) != null ? ref1.readyState : void 0)) {
              return state.toLowerCase();
            }
          }
          return null;
        };

        Connection.prototype.installEventHandlers = function() {
          var eventName, handler;
          for (eventName in this.events) {
            handler = this.events[eventName].bind(this);
            this.webSocket["on" + eventName] = handler;
          }
        };

        Connection.prototype.uninstallEventHandlers = function() {
          var eventName;
          for (eventName in this.events) {
            this.webSocket["on" + eventName] = function() {};
          }
        };

        Connection.prototype.events = {
          message: function(event) {
            var identifier, message, ref1, type;
            if (!this.isProtocolSupported()) {
              return;
            }
            ref1 = JSON.parse(event.data), identifier = ref1.identifier, message = ref1.message, type = ref1.type;
            switch (type) {
              case message_types.welcome:
                this.monitor.recordConnect();
                return this.subscriptions.reload();
              case message_types.ping:
                return this.monitor.recordPing();
              case message_types.confirmation:
                return this.subscriptions.notify(identifier, "connected");
              case message_types.rejection:
                return this.subscriptions.reject(identifier);
              default:
                return this.subscriptions.notify(identifier, "received", message);
            }
          },
          open: function() {
            ActionCable.log("WebSocket onopen event, using '" + (this.getProtocol()) + "' subprotocol");
            this.disconnected = false;
            if (!this.isProtocolSupported()) {
              ActionCable.log("Protocol is unsupported. Stopping monitor and disconnecting.");
              return this.close({
                allowReconnect: false
              });
            }
          },
          close: function(event) {
            ActionCable.log("WebSocket onclose event");
            if (this.disconnected) {
              return;
            }
            this.disconnected = true;
            this.monitor.recordDisconnect();
            return this.subscriptions.notifyAll("disconnected", {
              willAttemptReconnect: this.monitor.isRunning()
            });
          },
          error: function() {
            return ActionCable.log("WebSocket onerror event");
          }
        };

        return Connection;

      })();

    }).call(this);
    (function() {
      var slice = [].slice;

      ActionCable.Subscriptions = (function() {
        function Subscriptions(consumer) {
          this.consumer = consumer;
          this.subscriptions = [];
        }

        Subscriptions.prototype.create = function(channelName, mixin) {
          var channel, params, subscription;
          channel = channelName;
          params = typeof channel === "object" ? channel : {
            channel: channel
          };
          subscription = new ActionCable.Subscription(this.consumer, params, mixin);
          return this.add(subscription);
        };

        Subscriptions.prototype.add = function(subscription) {
          this.subscriptions.push(subscription);
          this.consumer.ensureActiveConnection();
          this.notify(subscription, "initialized");
          this.sendCommand(subscription, "subscribe");
          return subscription;
        };

        Subscriptions.prototype.remove = function(subscription) {
          this.forget(subscription);
          if (!this.findAll(subscription.identifier).length) {
            this.sendCommand(subscription, "unsubscribe");
          }
          return subscription;
        };

        Subscriptions.prototype.reject = function(identifier) {
          var i, len, ref, results, subscription;
          ref = this.findAll(identifier);
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            this.forget(subscription);
            this.notify(subscription, "rejected");
            results.push(subscription);
          }
          return results;
        };

        Subscriptions.prototype.forget = function(subscription) {
          var s;
          this.subscriptions = (function() {
            var i, len, ref, results;
            ref = this.subscriptions;
            results = [];
            for (i = 0, len = ref.length; i < len; i++) {
              s = ref[i];
              if (s !== subscription) {
                results.push(s);
              }
            }
            return results;
          }).call(this);
          return subscription;
        };

        Subscriptions.prototype.findAll = function(identifier) {
          var i, len, ref, results, s;
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            s = ref[i];
            if (s.identifier === identifier) {
              results.push(s);
            }
          }
          return results;
        };

        Subscriptions.prototype.reload = function() {
          var i, len, ref, results, subscription;
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            results.push(this.sendCommand(subscription, "subscribe"));
          }
          return results;
        };

        Subscriptions.prototype.notifyAll = function() {
          var args, callbackName, i, len, ref, results, subscription;
          callbackName = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
          ref = this.subscriptions;
          results = [];
          for (i = 0, len = ref.length; i < len; i++) {
            subscription = ref[i];
            results.push(this.notify.apply(this, [subscription, callbackName].concat(slice.call(args))));
          }
          return results;
        };

        Subscriptions.prototype.notify = function() {
          var args, callbackName, i, len, results, subscription, subscriptions;
          subscription = arguments[0], callbackName = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
          if (typeof subscription === "string") {
            subscriptions = this.findAll(subscription);
          } else {
            subscriptions = [subscription];
          }
          results = [];
          for (i = 0, len = subscriptions.length; i < len; i++) {
            subscription = subscriptions[i];
            results.push(typeof subscription[callbackName] === "function" ? subscription[callbackName].apply(subscription, args) : void 0);
          }
          return results;
        };

        Subscriptions.prototype.sendCommand = function(subscription, command) {
          var identifier;
          identifier = subscription.identifier;
          return this.consumer.send({
            command: command,
            identifier: identifier
          });
        };

        return Subscriptions;

      })();

    }).call(this);
    (function() {
      ActionCable.Subscription = (function() {
        var extend;

        function Subscription(consumer, params, mixin) {
          this.consumer = consumer;
          if (params == null) {
            params = {};
          }
          this.identifier = JSON.stringify(params);
          extend(this, mixin);
        }

        Subscription.prototype.perform = function(action, data) {
          if (data == null) {
            data = {};
          }
          data.action = action;
          return this.send(data);
        };

        Subscription.prototype.send = function(data) {
          return this.consumer.send({
            command: "message",
            identifier: this.identifier,
            data: JSON.stringify(data)
          });
        };

        Subscription.prototype.unsubscribe = function() {
          return this.consumer.subscriptions.remove(this);
        };

        extend = function(object, properties) {
          var key, value;
          if (properties != null) {
            for (key in properties) {
              value = properties[key];
              object[key] = value;
            }
          }
          return object;
        };

        return Subscription;

      })();

    }).call(this);
    (function() {
      ActionCable.Consumer = (function() {
        function Consumer(url) {
          this.url = url;
          this.subscriptions = new ActionCable.Subscriptions(this);
          this.connection = new ActionCable.Connection(this);
        }

        Consumer.prototype.send = function(data) {
          return this.connection.send(data);
        };

        Consumer.prototype.connect = function() {
          return this.connection.open();
        };

        Consumer.prototype.disconnect = function() {
          return this.connection.close({
            allowReconnect: false
          });
        };

        Consumer.prototype.ensureActiveConnection = function() {
          if (!this.connection.isActive()) {
            return this.connection.open();
          }
        };

        return Consumer;

      })();

    }).call(this);
  }).call(this);

  if (typeof module === "object" && module.exports) {
    module.exports = ActionCable;
  } else if (typeof define === "function" && define.amd) {
    define(ActionCable);
  }
}).call(this);
// Action Cable provides the framework to deal with WebSockets in Rails.
// You can generate new channels where WebSocket features live using the `rails generate channel` command.
//




(function() {
  this.App || (this.App = {});

  App.cable = ActionCable.createConsumer();

}).call(this);
(function() {


}).call(this);
(function() {


}).call(this);
(function() {


}).call(this);
// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, or any plugin's
// vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//




;
