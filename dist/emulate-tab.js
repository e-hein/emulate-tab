"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var possibleSizeAttributeKeys = new Array('offsetHeight', 'scrollHeight', 'clientHeight');
function emulateTab() {
    return new Promise(function (done) { return _emulateTab(done); });
}
exports.emulateTab = emulateTab;
function _emulateTab(done) {
    var activeElement = document.activeElement;
    var source = activeElement instanceof HTMLElement ? activeElement : document.body;
    var tabKeypress = new KeyboardEvent('keydown', {
        code: '13',
        bubbles: true,
    });
    var tabListener = function (ev) {
        document.body.removeEventListener('keydown', tabListener);
        if (ev === tabKeypress) {
            emulateUncatchedTabEvent(source, done);
        }
    };
    document.body.addEventListener('keydown', tabListener);
    source.dispatchEvent(tabKeypress);
}
function emulateUncatchedTabEvent(source, done) {
    source.blur();
    var selectableElements = findAllElementsSelectableByTab();
    if (selectableElements.length < 1) {
        console.warn('no selectable elements found');
        return done();
    }
    var currentIndex = selectableElements.indexOf(source);
    var nextIndex = currentIndex + 1 < selectableElements.length ? currentIndex + 1 : 0;
    var nextElement = selectableElements[nextIndex];
    nextElement.focus();
    try {
        document.activeElement = nextElement;
    }
    catch (e) { }
    done();
}
function findAllElementsSelectableByTab() {
    var allElements = Array.from(document.querySelectorAll('*')).filter(isHtmlElement);
    var tabGroups = allElements
        .filter(testAll(hasValidTabIndex, isVisible, isNotDisabledInput, isNotSkippableAnchor, isNotCollapsed))
        .reduce(function (grouped, element) {
        var tabIndex = element.tabIndex;
        var tabGroup = grouped['' + tabIndex] || { tabIndex: tabIndex, elements: [] };
        tabGroup.elements.push(element);
        grouped[tabIndex] = tabGroup;
        return grouped;
    }, {});
    var selectableElements = Object.values(tabGroups)
        .sort(byComparingTabIndex)
        .reduce(function (all, more) { return all.concat(more.elements); }, new Array());
    return selectableElements;
}
exports.findAllElementsSelectableByTab = findAllElementsSelectableByTab;
function hasValidTabIndex(element) {
    return typeof element.tabIndex === 'number' && element.tabIndex >= 0;
}
function testAll() {
    var elementFilter = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        elementFilter[_i] = arguments[_i];
    }
    return function (element) { return !elementFilter.some(function (f) { return !f(element); }); };
}
var isHtmlElement = function (element) { return element instanceof HTMLElement; };
var isVisible = lazyInitIsVisible;
function lazyInitIsVisible(element) {
    var sizeAttributeKey = findSizeAttributeKey();
    if (sizeAttributeKey) {
        isVisible = isVisibleBySize(sizeAttributeKey);
    }
    else {
        isVisible = isVisibleByParents;
    }
    return isVisible(element);
}
var isVisibleBySize = function (sizeAttribute) { return function (element) {
    var size = element[sizeAttribute];
    return !!size && typeof size === 'number' && size > 0;
}; };
function findSizeAttributeKey(element) {
    if (element === void 0) { element = document.body; }
    var htmlElement = element;
    var sizeAttributeKey = possibleSizeAttributeKeys
        .find(function (key) {
        var value = htmlElement[key];
        return value && typeof value === 'number' && value > 0;
    });
    if (sizeAttributeKey)
        return sizeAttributeKey;
    var childNodes = element.children;
    for (var _i = 0, _a = Array.from(childNodes); _i < _a.length; _i++) {
        var childNode = _a[_i];
        var childAttribute = findSizeAttributeKey(childNode);
        if (childAttribute)
            return childAttribute;
    }
    return undefined;
}
var isVisibleByParents = function (element) {
    if (!element.isConnected)
        return false;
    if (element.tagName === 'BODY')
        return true;
    var style = getComputedStyle(element);
    if (style.display === 'none')
        return false;
    if (style.visibility === 'collapse')
        return false;
    var parent = element.parentElement;
    if (!parent)
        return false;
    return isVisibleByParents(parent);
};
var isNotDisabledInput = function (element) { return !element.disabled; };
function isNotSkippableAnchor(element) {
    return !(element instanceof HTMLAnchorElement)
        || !!element.href
        || element.getAttribute('tabIndex') !== null;
}
var isNotCollapsed = function (element) { return getComputedStyle(element).visibility !== 'collapse'; };
function byComparingTabIndex(a, b) {
    if (a.tabIndex > 0 && b.tabIndex > 0) {
        return a.tabIndex - b.tabIndex;
    }
    if (a.tabIndex > 0)
        return -a.tabIndex;
    if (b.tabIndex > 0)
        return b.tabIndex;
    throw new Error('same tab index for two groups');
}
