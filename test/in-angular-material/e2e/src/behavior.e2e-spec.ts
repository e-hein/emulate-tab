import { browser, element, by, Key, ElementFinder, promise } from 'protractor';

describe('equal behavior of simulated and real tab events', () => {
  beforeEach(async () => {
    browser.get('/');
    browser.waitForAngular();
  });

  it('should tab initially into the same element', async () => {
    focus(await element(by.css('body')));
    await sendRealTab();
    const elementAfterRealTab = await browser.driver.switchTo().activeElement();
    const idOfelementAfterRealTab = await elementAfterRealTab.getAttribute('id');
    const identOfElementAftaerRealTab = await getActiveElementIdent();

    focus(await element(by.css('body')));
    hoverEmulateTab();
    const identOfElementAfterEmulatedTab = await getActiveElementIdent();
    expect(identOfElementAfterEmulatedTab).toBe(identOfElementAftaerRealTab, 'same element');
    expect(idOfelementAfterRealTab).toBe('input-with-tab-index-2', 'expected first element');
  });

  [
    'first-input',
    'input-before-hidden-input',
    'input-after-hidden-input',
    'input-before-collapsed-input',
    'input-after-collapsed-input',
    'input-before-disabled-input',
    'input-after-disabled-input',
    'input-before-readonly-input',
    'input-before-mat-select',
    'input-before-button',
    'input-before-clickable-div',
    'input-before-link',
    'link-with-href',
    'input-before-hidden-child-input',
    'input-after-hidden-child-input',
    'input-before-collapsed-child-input',
    'input-after-collapsed-child-input',
    'input-with-tab-index-3',
    'input-with-tab-index-2',
    'input-with-tab-index-4',
    'last-input',
  ].forEach((start) => {
    describe(`after focus on "${start}"`, () => {
      it('should tab forward to the same element', async () => {
        focus(element(by.id(start)));
        await sendRealTab();
        const identOfElementAftaerRealTab = await getActiveElementIdent();

        focus(element(by.id(start)));
        await hoverEmulateTab();
        const identOfElementAfterEmulatedTab = await getActiveElementIdent();
        expect(identOfElementAfterEmulatedTab).toBe(identOfElementAftaerRealTab, 'same element');
      });

      it(`should tab backward to the same element`, async () => {
        focus(element(by.id(start)));
        await sendRealShiftTab();
        const identOfElementAftaerRealTab = await getActiveElementIdent();

        focus(element(by.id(start)));
        await hoverEmulateShiftTab();
        const identOfElementAfterEmulatedTab = await getActiveElementIdent();
        expect(identOfElementAfterEmulatedTab).toBe(identOfElementAftaerRealTab, 'same element');
      });
    });
  });
});

async function focus(target: ElementFinder) {
  function callFocus() {
    arguments[0].focus();
  }
  browser.executeScript(callFocus, target);
}

async function getActiveElementIdent() {
  return (await browser.switchTo().activeElement()).getId();
}

function sendRealTab() {
  return sendKeys(Key.TAB);
}
function sendRealShiftTab() {
  return sendKeys(Key.chord(Key.SHIFT, Key.TAB));
}
function sendKeys(...args: Array<string|number|promise.Promise<string|number>>): promise.Promise<void> {
  return browser.driver.switchTo().activeElement().sendKeys(...args);
}

async function mouseAway() {
  await browser.actions().mouseMove(element(by.tagName('body')), { x: 0, y: 0 });
}

async function hoverEmulateTab() {
  await mouseAway();
  await browser.actions().mouseMove(element(by.id('emulate-tab-button')));
  await mouseAway();
}

async function hoverEmulateShiftTab() {
  await mouseAway();
  await browser.actions().mouseMove(element(by.id('emulate-shift-tab-button')));
  await mouseAway();
}
