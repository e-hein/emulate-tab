const possibleSizeAttributeKeys = new Array<keyof HTMLElement>(
  'offsetHeight', 'scrollHeight', 'clientHeight',
);

const shiftModifier = true;
const selectableTypes = /text|password|search|tel|url/;

interface HTMLElementWithValidTabIndex extends HTMLElement {
  tabIndex: number;
}

/**
 * emulate tab keyboard events and default action (switch to next element)
 * 
 * fist:
 * - dispatch tab keydown event at active element
 * 
 * then emulate default action (if not prevented):
 * - blur on active element
 * - skip keypress action (it's between element switch so there is no target)
 * - find next element in selectable elemetns
 * - focus on next element
 * - tab keyup on next element
 * 
 * or (if default action is prevented):
 * - tab keypress on active element
 * - tab keyup on active elment
 * 
 * @returns true if switched elemenet and false if default action had been prevented
 */
export function emulateTab(): boolean {
  const source = activeElement() || document.body;
  const target = getNextElement(source);

  return emulateTabFromSourceToTarget(source, target);
}

export namespace emulateTab {
  /**
   * emulate tab from a given element (default is active element)
   * 
   * @returns methods to select tab target
   */
  export const from = emulateTabFrom;

  /**
   * emulate tab from active element to a given target
   * 
   * @param target element to switch to
   * @param sendKeyEventsWithShiftModifier like shift tab would do
   * @returns true if switched elemenet and false if default action had been prevented
   */
  export const to = (target: HTMLElement, sendKeyEventsWithShiftModifier = false) => emulateTabFrom(activeElement()).to(target, sendKeyEventsWithShiftModifier);

  /**
   * emulate tab to previous element
   * 
   * @returns true if switched elemenet and false if default action had been prevented
   */
  export const backwards = () => to(getPreviousElement(activeElement()), shiftModifier);

  /**
   * alias for emulateTab() that is more precise about it's direction
   * 
   * @returns true if switched elemenet and false if default action had been prevented
   */
  export const forwards = () => emulateTab();

  /**
   * find all elements that are selectable by tab
   */
  export const findSelectableElements: () => HTMLElement[] = findAllElementsSelectableByTab;
}

function emulateTabFrom(source: HTMLElement = document.body) {
  return {
    /**
     * emulate tab to the element before the starting element (which is the active element by default)
     * 
     * @returns true if switched elemenet and false if default action had been prevented
     */
    toPreviousElement: () => emulateTabFromSourceToTarget(source, getPreviousElement(), shiftModifier),

    /**
     * emulate tab to the element after the starting element (which is the active element by default)
     * 
     * @returns true if switched elemenet and false if default action had been prevented
     */
    toNextElement: () => emulateTabFromSourceToTarget(source, getNextElement(source)),

    /**
     * emulate tab to a custom given element
     * 
     * @param target element after tab
     * @param sendKeyEventsWithShiftModifier like shift tab would do
     * @returns true if switched elemenet and false if default action had been prevented
     */
    to: (target: HTMLElement, sendKeyEventsWithShiftModifier = false) => emulateTabFromSourceToTarget(source, target, sendKeyEventsWithShiftModifier),
  };
}

function emulateTabFromSourceToTarget(source: HTMLElement, target: HTMLElement, sendKeyEventsWithShiftModifier = false) {
  const executeDefaultAction = source.dispatchEvent(createTabEvent('keydown', sendKeyEventsWithShiftModifier));
  if (executeDefaultAction) {
    source.blur();
    target.focus();
    if (document.activeElement !== target) {
      try {
        (document as any).activeElement = target;
      } catch (e) {
        console.warn('could not switch active element');
      }  
    }
    if (target instanceof HTMLInputElement && selectableTypes.test(target.type)) {
      target.selectionStart = 0;
    }
  
    const tabKeyup = createTabEvent('keyup', sendKeyEventsWithShiftModifier);
    target.dispatchEvent(tabKeyup);
    return true;
  } else {
    source.dispatchEvent(createTabEvent('keypress', sendKeyEventsWithShiftModifier));
    source.dispatchEvent(createTabEvent('keyup', sendKeyEventsWithShiftModifier));
    return false;
  }
}

function createTabEvent(type: 'keydown' |  'keypress' | 'keyup', sendKeyEventsWithShiftModifier = false) {
  return new KeyboardEvent(type, {
    code: 'Tab',
    key: 'Tab',
    cancelable: true,
    bubbles: true,
    shiftKey: sendKeyEventsWithShiftModifier,
  });
}

function activeElement(): HTMLElement | undefined {
  const element = document.activeElement;
  return element instanceof HTMLElement ? element : undefined;
}

function getPreviousElement(lastElement: HTMLElement = document.body) {
  const selectableElements = findAllElementsSelectableByTab();
  if (selectableElements.length < 1) {
    throw new Error('no selectable elements found');
  }

  const currentIndex = selectableElements.indexOf(lastElement);
  const previousIndex = (currentIndex > 0 ? currentIndex : selectableElements.length) - 1;
  const previousElement = selectableElements[previousIndex];
  return previousElement;
}

function getNextElement(lastElement: HTMLElement = document.body) {
  const selectableElements = findAllElementsSelectableByTab();
  if (selectableElements.length < 1) {
    throw new Error('no selectable elements found');
  }

  const currentIndex = selectableElements.indexOf(lastElement);
  const nextIndex = currentIndex + 1 < selectableElements.length ? currentIndex + 1 : 0;
  const nextElement = selectableElements[nextIndex];
  return nextElement;
}

function findAllElementsSelectableByTab() {
  const allElements = Array.from(document.querySelectorAll('*')).filter(isHtmlElement);
  initIsVisibleOnce();
  const tabGroups = allElements
    .filter(testAll(
      hasValidTabIndex, isVisible, isNotDisabledInput, isNotSkippableAnchor, isNotCollapsed,
    ))
    .reduce((grouped, element) => {
      const tabIndex = element.tabIndex;
      const tabGroup = grouped['' + tabIndex] || { tabIndex, elements: [] };
      tabGroup.elements.push(element);
      grouped[tabIndex] = tabGroup;
      return grouped;
    }, {} as { [tabIndex: string]: { tabIndex: number, elements: HTMLElement[] } })
  ;
  const selectableElements = Object.values(tabGroups)
    .sort(byComparingTabIndex)
    .reduce((all, more) => all.concat(more.elements), new Array<HTMLElement>());
  return selectableElements;
}

const isHtmlElement = (element: any): element is HTMLElement => element instanceof HTMLElement;

let isVisible: (element: HTMLElement) => boolean;

let initIsVisibleOnce = () => {
  const sizeAttributeKey = findSizeAttributeKey();
  if (sizeAttributeKey) {
    // console.log('use isVisible by size attribute: ' + sizeAttributeKey);
    isVisible = isVisibleBySize(sizeAttributeKey);
  } else {
    // console.log('use isVisible by parents');
    isVisible = isVisibleByParents;
  }
  initIsVisibleOnce = () => {};
}

const isVisibleBySize = (sizeAttribute: keyof HTMLElement) => (element: HTMLElement) => {
  const size: any = element[sizeAttribute];
  return !!size && typeof size === 'number' && size > 0;
};

function findSizeAttributeKey(element: Element = document.body): keyof HTMLElement | undefined {
  const htmlElement = element as HTMLElement;
  const sizeAttributeKey = possibleSizeAttributeKeys
    .find((key) => {
      const value = htmlElement[key];
      return value && typeof value === 'number' && value > 0;
    })
  ;
  if (sizeAttributeKey) { return sizeAttributeKey; }

  const childNodes = element.children;

  for (const childNode of Array.from(childNodes)) {
    const childAttribute = findSizeAttributeKey(childNode);
    if (childAttribute) { return childAttribute; }
  }
  return undefined;
}

const isVisibleByParents = (element: Element): boolean => {
  if (!element.isConnected) { return false; }
  if (element.tagName === 'BODY') { return true; }

  const style = getComputedStyle(element);
  if (style.display === 'none') { return false; }
  if (style.visibility === 'collapse') { return false; }

  const parent = element.parentElement;
  if (!parent) { return false; }

  return isVisibleByParents(parent);
};

function testAll<T>(...elementFilter: ((element: T) => boolean)[]) {
  return (element: T) => !elementFilter.some((f) => !f(element));
}

function hasValidTabIndex(element: HTMLElement): element is HTMLElementWithValidTabIndex {
  return typeof element.tabIndex === 'number' && element.tabIndex >= 0;
}

const isNotDisabledInput = (element: HTMLElement) => !(element as HTMLInputElement).disabled;
function isNotSkippableAnchor(element: HTMLElement) {
  return !(element instanceof HTMLAnchorElement)
    || !!element.href
    || element.getAttribute('tabIndex') !== null
  ;
}

const isNotCollapsed = (element: HTMLElement) => {
  return getComputedStyle(element).visibility !== 'collapse';
}

function byComparingTabIndex(a: { tabIndex: number }, b: { tabIndex: number }) {
  if (a.tabIndex > 0 && b.tabIndex > 0) {
    return a.tabIndex - b.tabIndex;
  }

  if (a.tabIndex > 0) { return -a.tabIndex; }
  if (b.tabIndex > 0) { return b.tabIndex; }

  throw new Error('same tab index for two groups');
}
