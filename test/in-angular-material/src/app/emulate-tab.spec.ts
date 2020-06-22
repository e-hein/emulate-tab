import { ComponentHarness, HarnessLoader, TestElement } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { emulateTab as origEmulateTab, findAllElementsSelectableByTab } from 'emulate-tab';
import { AppComponent } from './app.component';
import { expectNotToHaveThrownAnything } from '@app/testing';

const invisibleInputs = [
  'collapsed-input', 'hidden-input', 'collapsed-child-input', 'hidden-child-input',
];

function beforeAllMockGetComputedStyle() {
  let origGetComputedStyle: typeof getComputedStyle;

  beforeAll(() => {
    origGetComputedStyle = global.getComputedStyle;
    global.getComputedStyle = (element) => {
      if (element.classList.contains('hidden')) {
        return { display: 'none' } as CSSStyleDeclaration;
      }
      if (element.classList.contains('collapsed')) {
        return { visibility: 'collapse' } as CSSStyleDeclaration;
      }
      return {} as CSSStyleDeclaration;
    };
  });

  afterAll(() => global.getComputedStyle = origGetComputedStyle);
}

function beforeAllMockHeightAttribute(attrName: string) {
  let origGetHeight;

  beforeAll(() => {
    const proto = HTMLElement.prototype;
    origGetHeight = Object.getOwnPropertyDescriptor(proto, attrName);
    Object.defineProperty(proto, attrName, {
      configurable: true,
      get() {
        const id = this.id;
        return id && invisibleInputs.includes(id) ? 0 : 20;
      }
    });
  });

  afterAll(() => {
    if (origGetHeight) {
      Object.defineProperty(HTMLElement.prototype, attrName, origGetHeight);
    } else {
      Object.defineProperty(HTMLElement.prototype, attrName, {});
    }
  });
}

function findAllSelectableIdents() {
  const selectableElements = findAllElementsSelectableByTab();
  const selectableElementIdents = selectableElements.map((e) => (e.id && '#' + e.id) || e.title || e.className);
  // console.log('selectableElements', selectableElementIdents);
  return selectableElementIdents;
}

describe('emulate tab', () => {
  let loader: HarnessLoader;
  let rootElement: HTMLElement;
  let emulateTab = origEmulateTab;

  function resetEmulateTab() {
    delete require.cache['emulate-tab'];
    emulateTab = require('emulate-tab').emulateTab;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        BrowserAnimationsModule,
      ],
      declarations: [AppComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    loader = TestbedHarnessEnvironment.loader(fixture);
    rootElement = fixture.debugElement.nativeElement;
  });

  it('should start', () => expectNotToHaveThrownAnything());

  function testTabNavigation(source: string, getSource: () => Promise<TestElement>, target: string, getTarget: () => Promise<TestElement>) {
    it(`should tab from ${source} to ${target}`, async () => {
      // given
      const sourceElement = await getSource();
      await sourceElement.focus();
      if (!(await sourceElement.isFocused()) || !document.activeElement) {
        throw new Error('failed to focus');
      }

      // when
      await emulateTab();

      // then
      const targetElement = await getTarget();
      if (!(await targetElement.isFocused())) {
        const msg = `expected ${target} to be focused`;
        console.error(msg, {
          isFocused: document.activeElement.id,
          shouldHaveBeenFocused: await targetElement.getAttribute('id'),
          selectableElements: findAllSelectableIdents(),
        });
        fail(msg);
      }
      expect(await sourceElement.isFocused()).not.toBe(true);
    });
  }

  const queryForTestElement = {
    then: <T>(then: (seletor: string, getter: () => Promise<TestElement>) => T) => {
      return {
        input: (selector: string) => then(selector, async () => (await loader.getHarness(MatInputHarness.with({ selector }))).host()),
        button: (selector: string) => then(selector, async () => (await loader.getHarness(MatButtonHarness.with({ selector }))).host()),
        element: (selector: string) => then(selector, async () => {
          class DynamicHarness extends ComponentHarness {
            static hostSelector = selector;
          }
          const dynamicHarness = await loader.getHarness(DynamicHarness);
          return dynamicHarness.host();
        }),
      };
    }
  };

  const test = {
    tabNavigation: {
      from: queryForTestElement.then((sourceSelector, getSource) => ({
        to: queryForTestElement.then((targetSelector, getTarget) =>
          testTabNavigation(sourceSelector, getSource, targetSelector, getTarget)
        )
      }))
    }
  };

  describe('in browser that supports offset height', () => {
    beforeAll(() => {
      resetEmulateTab();
    });
    // mockHeight('offsetHeight');
    // beforeAllMockGetComputedStyle();

    test.tabNavigation.from.input('#first-input').to.input('#second-input');
    test.tabNavigation.from.input('#input-with-tab-index-3').to.input('#input-with-tab-index-4');
    test.tabNavigation.from.input('#input-with-tab-index-2').to.input('#input2-with-tab-index-2');
    test.tabNavigation.from.input('#input2-with-tab-index-2').to.input('#input-with-tab-index-3');
    test.tabNavigation.from.input('#last-input').to.input('#input-with-tab-index-2');
    test.tabNavigation.from.input('#input-before-hidden-input').to.input('#input-after-hidden-input');
    test.tabNavigation.from.input('#input-before-disabled-input').to.input('#input-after-disabled-input');
    test.tabNavigation.from.input('#input-before-hidden-child-input').to.input('#input-after-hidden-child-input');
    test.tabNavigation.from.input('#input-before-collapsed-input').to.input('#input-after-collapsed-input');
    test.tabNavigation.from.input('#input-before-collapsed-child-input').to.input('#input-after-collapsed-child-input');
    test.tabNavigation.from.input('#input-before-button').to.button('#mat-raised-button');
    test.tabNavigation.from.input('#input-before-link').to.button('#link-with-href');
    test.tabNavigation.from.button('#link-with-href').to.button('#link-without-href');
    test.tabNavigation.from.button('#link-without-href').to.element('#plain-link-with-href');
    test.tabNavigation.from.input('#input-before-plain-link-without-href').to.input('#input-after-plain-link-without-href');

    it('should find selectable inputs', () => {
      const selectableElementIds = findAllSelectableIdents();
      expect(selectableElementIds).toEqual([
        '#input-with-tab-index-2',
        '#input2-with-tab-index-2',
        '#input-with-tab-index-3',
        '#input-with-tab-index-4',

        'jasmine-title',

        '#first-input',
        '#second-input',

        '#input-before-hidden-input', '#input-after-hidden-input',
        '#input-before-collapsed-input', '#input-after-collapsed-input',
        '#input-before-disabled-input', '#input-after-disabled-input',
        '#input-before-readonly-input', '#readonly-input',
        '#input-before-mat-select', '#mat-select',
        '#input-before-button', '#mat-raised-button',
        '#input-before-clickable-div', '#clickable-div',
        '#input-before-link', '#link-with-href', '#link-without-href', '#plain-link-with-href',
        '#input-before-plain-link-without-href', '#input-after-plain-link-without-href',
        '#input-before-hidden-child-input', '#input-after-hidden-child-input',
        '#input-before-collapsed-child-input', '#input-after-collapsed-child-input',

        '#last-input'
      ]);
    });

    it('backwards', async () => {
      // given
      const firstInput = await (await loader.getHarness(MatInputHarness.with({ selector: '#first-input' }))).host();
      const secondInput = await (await loader.getHarness(MatInputHarness.with({ selector: '#second-input' }))).host();
      await secondInput.focus();

      // when
      await emulateTab.backwards();

      // then
      expect(await firstInput.isFocused()).toBe(true);
    });
  });

  describe('in browsers which do support offsetHeight', () => {
    beforeAll(() => resetEmulateTab());
    beforeAllMockHeightAttribute('offsetHeight');
    describe('and scrollHeight', () => {
      beforeAllMockHeightAttribute('scrollHeight');
      describe('and clientHeight', () => {
        beforeAllMockHeightAttribute('clientHeight');
        beforeEach(() => resetEmulateTab());
        test.tabNavigation.from.input('#input-before-hidden-child-input').to.input('#input-after-hidden-child-input');
      });
    });
  });

  describe('in browsers which do support scrollHeight', () => {
    beforeAll(() => resetEmulateTab());
    beforeAllMockHeightAttribute('scrollHeight');
    test.tabNavigation.from.input('#input-before-hidden-child-input').to.input('#input-after-hidden-child-input');
  });

  describe('in browsers which do support clientHeight', () => {
    beforeAll(() => resetEmulateTab());
    beforeAllMockHeightAttribute('clientHeight');
    test.tabNavigation.from.input('#input-before-hidden-child-input').to.input('#input-after-hidden-child-input');
  });

  describe('in browsers which do not support offsetHeight nor scrollHeight or clientHeight', () => {
    beforeAllMockGetComputedStyle();
    test.tabNavigation.from.input('#input-before-hidden-child-input').to.input('#input-after-hidden-child-input');
  });
});
