const possibleSizeAttributeKeys = new Array<keyof HTMLElement>('offsetHeight', 'scrollHeight', 'clientHeight');

export function emulateTab(): Promise<void> {
  const activeElement = document.activeElement;
  const source: HTMLElement = activeElement instanceof HTMLElement ? activeElement : document.body;

  const nextElement = getNextElement(source);
  return emulateTabFrom(source).to(nextElement);
}

export namespace emulateTab {
  export const from = emulateTabFrom;
  export const to = (target: HTMLElement) => emulateTabFrom(activeElement()).to(target);
  export const toPreviousElement = () => to(getPreviousElement(activeElement()));
  export const toNextElement = () => emulateTab();
  export const backwards = toPreviousElement;
}

function activeElement(): HTMLElement | undefined {
  const activeElement = document.activeElement;
  return activeElement instanceof HTMLElement ? activeElement : undefined;
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

function emulateTabFrom(source: HTMLElement = document.body) {
  const toPreviousElement = () => emulateTabFromSourceToTarget(source, getPreviousElement());
  return {
    toPreviousElement,
    backwards: toPreviousElement,
    to: (target: HTMLElement) => emulateTabFromSourceToTarget(source, target),
    toNextElement: () => emulateTabFromSourceToTarget(source, getNextElement(source)),
  };
}

function createTabEvent(type: 'keydown' | 'keyup') {
  return new KeyboardEvent(type, {
    code: 'Tab',
    key: 'Tab',
    bubbles: true,
  });
}

function emulateTabFromSourceToTarget(source: HTMLElement, target: HTMLElement) {
  return new Promise<void>(done => {
    const tabKeydown = createTabEvent('keydown');

    const tabListener = (ev: KeyboardEvent) => {
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

function emulateEventsAtTabTarget(target: HTMLElement) {
  target.focus();
  target.dispatchEvent(new FocusEvent('focus'));

  const tabKeyup = createTabEvent('keyup');
  target.dispatchEvent(tabKeyup);
  try {
    (document as any).activeElement = target;
  } catch (e) {}
}

export function findAllElementsSelectableByTab() {
  const allElements = Array.from(document.querySelectorAll('*')).filter(isHtmlElement);
  initIsVisibleOnce();
  const tabGroups = allElements
    .filter(testAll(hasValidTabIndex, isVisible, isNotDisabledInput, isNotSkippableAnchor, isNotCollapsed))
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

interface HTMLElementWithValidTabIndex extends HTMLElement {
  tabIndex: number;
}

function hasValidTabIndex(element: HTMLElement): element is HTMLElementWithValidTabIndex {
  return typeof element.tabIndex === 'number' && element.tabIndex >= 0;
}

function testAll<T>(...elementFilter: Array<(element: T) => boolean>) {
  return (element: T) => !elementFilter.some((f) => !f(element));
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
  if (sizeAttributeKey) return sizeAttributeKey;

  const childNodes = element.children;

  for (const childNode of Array.from(childNodes)) {
    const childAttribute = findSizeAttributeKey(childNode);
    if (childAttribute) return childAttribute;
  }
  return undefined;
}

const isVisibleByParents = (element: Element): boolean => {
  if (!element.isConnected) return false;
  if (element.tagName === 'BODY') return true;

  const style = getComputedStyle(element);
  if (style.display === 'none') return false;
  if (style.visibility === 'collapse') return false;

  const parent = element.parentElement;
  if (!parent) return false;

  return isVisibleByParents(parent);
};

const isNotDisabledInput = (element: HTMLElement) => !(element as HTMLInputElement).disabled;
function isNotSkippableAnchor(element: HTMLElement) {
  return !(element instanceof HTMLAnchorElement)
    || !!element.href
    || element.getAttribute('tabIndex') !== null
  ;
}
const isNotCollapsed = (element: HTMLElement) => getComputedStyle(element).visibility !== 'collapse';

function byComparingTabIndex(a: { tabIndex: number }, b: { tabIndex: number }) {
  if (a.tabIndex > 0 && b.tabIndex > 0) {
    return a.tabIndex - b.tabIndex;
  }

  if (a.tabIndex > 0) return -a.tabIndex;
  if (b.tabIndex > 0) return b.tabIndex;

  throw new Error('same tab index for two groups');
}
