var possibleSizeAttributeKeys = new Array('offsetHeight', 'scrollHeight', 'clientHeight');
export function emulateTab() {
    var activeElement = document.activeElement;
    var source = activeElement instanceof HTMLElement ? activeElement : document.body;
    var nextElement = getNextElement(source);
    return emulateTabFrom(source).to(nextElement);
}
(function (emulateTab) {
    emulateTab.from = emulateTabFrom;
    emulateTab.to = function (target) { return emulateTabFrom(activeElement()).to(target); };
    emulateTab.toPreviousElement = function () { return emulateTab.to(getPreviousElement(activeElement())); };
    emulateTab.toNextElement = function () { return emulateTab(); };
    emulateTab.backwards = emulateTab.toPreviousElement;
    emulateTab.findSelectableElements = findAllElementsSelectableByTab;
})(emulateTab || (emulateTab = {}));
function activeElement() {
    var activeElement = document.activeElement;
    return activeElement instanceof HTMLElement ? activeElement : undefined;
}
function getPreviousElement(lastElement) {
    if (lastElement === void 0) { lastElement = document.body; }
    var selectableElements = findAllElementsSelectableByTab();
    if (selectableElements.length < 1) {
        throw new Error('no selectable elements found');
    }
    var currentIndex = selectableElements.indexOf(lastElement);
    var previousIndex = (currentIndex > 0 ? currentIndex : selectableElements.length) - 1;
    var previousElement = selectableElements[previousIndex];
    return previousElement;
}
function getNextElement(lastElement) {
    if (lastElement === void 0) { lastElement = document.body; }
    var selectableElements = findAllElementsSelectableByTab();
    if (selectableElements.length < 1) {
        throw new Error('no selectable elements found');
    }
    var currentIndex = selectableElements.indexOf(lastElement);
    var nextIndex = currentIndex + 1 < selectableElements.length ? currentIndex + 1 : 0;
    var nextElement = selectableElements[nextIndex];
    return nextElement;
}
function emulateTabFrom(source) {
    if (source === void 0) { source = document.body; }
    var toPreviousElement = function () { return emulateTabFromSourceToTarget(source, getPreviousElement()); };
    return {
        toPreviousElement: toPreviousElement,
        backwards: toPreviousElement,
        to: function (target) { return emulateTabFromSourceToTarget(source, target); },
        toNextElement: function () { return emulateTabFromSourceToTarget(source, getNextElement(source)); }
    };
}
function createTabEvent(type) {
    return new KeyboardEvent(type, {
        code: 'Tab',
        key: 'Tab',
        bubbles: true
    });
}
function emulateTabFromSourceToTarget(source, target) {
    return new Promise(function (done) {
        var tabKeydown = createTabEvent('keydown');
        var tabListener = function (ev) {
            document.body.removeEventListener('keydown', tabListener);
            if (ev === tabKeydown) {
                if (source instanceof HTMLElement) {
                    source.blur();
                    source.dispatchEvent(new FocusEvent('blur'));
                }
                emulateEventsAtTabTarget(target);
                done();
            }
        };
        document.body.addEventListener('keydown', tabListener);
        source.dispatchEvent(tabKeydown);
    });
}
function emulateEventsAtTabTarget(target) {
    target.focus();
    if (target instanceof HTMLInputElement) {
        target.selectionStart = 0;
    }
    target.dispatchEvent(new FocusEvent('focus'));
    var tabKeyup = createTabEvent('keyup');
    target.dispatchEvent(tabKeyup);
    try {
        document.activeElement = target;
    }
    catch (e) { }
}
export function findAllElementsSelectableByTab() {
    var allElements = Array.from(document.querySelectorAll('*')).filter(isHtmlElement);
    initIsVisibleOnce();
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
var isVisible;
var initIsVisibleOnce = function () {
    var sizeAttributeKey = findSizeAttributeKey();
    if (sizeAttributeKey) {
        // console.log('use isVisible by size attribute: ' + sizeAttributeKey);
        isVisible = isVisibleBySize(sizeAttributeKey);
    }
    else {
        // console.log('use isVisible by parents');
        isVisible = isVisibleByParents;
    }
    initIsVisibleOnce = function () { };
};
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
