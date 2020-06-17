const possibleSizeAttributeKeys = new Array<keyof HTMLElement>('offsetHeight', 'scrollHeight', 'clientHeight');

export function emulateTab(): Promise<void> {
  return new Promise(done => _emulateTab(done));
}

function _emulateTab(done: () => void) {
  const activeElement = document.activeElement;
  const source: HTMLElement = activeElement instanceof HTMLElement ? activeElement : document.body;

  const tabKeypress = new KeyboardEvent('keydown', {
    code: '13',
    bubbles: true,
  });

  const tabListener = (ev: KeyboardEvent) => {
    document.body.removeEventListener('keydown', tabListener);
    if (ev === tabKeypress) {
      emulateUncatchedTabEvent(source, done);
    }
  };

  document.body.addEventListener('keydown', tabListener);
  source.dispatchEvent(tabKeypress);
}

function emulateUncatchedTabEvent(source: HTMLElement, done: () => void) {
  source.blur();

  const selectableElements = findAllElementsSelectableByTab();
  if (selectableElements.length < 1) {
    console.warn('no selectable elements found');
    return done();
  }
  const currentIndex = selectableElements.indexOf(source);
  const nextIndex = currentIndex + 1 < selectableElements.length ? currentIndex + 1 : 0;
  const nextElement = selectableElements[nextIndex];

  nextElement.focus();
  try {
    (document as any).activeElement = nextElement;
  } catch (e) {}
  done();
}

export function findAllElementsSelectableByTab() {
  const allElements = Array.from(document.querySelectorAll('*')).filter(isHtmlElement);
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

let isVisible: (element: HTMLElement) => boolean = lazyInitIsVisible;

function lazyInitIsVisible(element: HTMLElement): boolean {
  const sizeAttributeKey = findSizeAttributeKey();
  if (sizeAttributeKey) {
    isVisible = isVisibleBySize(sizeAttributeKey);
  } else {
    isVisible = isVisibleByParents;
  }
  return isVisible(element);
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
