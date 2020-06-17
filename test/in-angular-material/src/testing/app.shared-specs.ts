import { AppHarness } from './app.harness';
import { expectConsoleLog, expectNotToHaveThrownAnything } from './expect.function';
import { HarnessLoader } from '@angular/cdk/testing';

export function testApp(loaderProvider: () => HarnessLoader) {
  let app: AppHarness;

  beforeEach(async () => {
    app = await loaderProvider().getHarness(AppHarness);
  });

  async function expectFocusOn(id: string) {
    expect(await app.getActiveElementId()).toBe(id.replace(' ', '-'));
  }
  async function setFocusOn(id: string) {
    await app.focusInput({ selector: '#' + id.replace(' ', '-')});
  }

  async function describeAfterHoverEmulateTab(specDefinitions: () => void) {
    describe('after hover over emulate tab', () => {
      expectConsoleLog('emulate tab');
      beforeEach(() => app.moveMouseOverEmulateTabAndOutAgain());
      specDefinitions();
    });
  }

  it('should start', () => expect(app).toBeTruthy());

  it('should initially have no active element', async () => expect(await app.hasActiveElement()).toBe(false));

  describeAfterHoverEmulateTab(() => {
    it('should not thow', () => expectNotToHaveThrownAnything());

    it('should focus #input-with-tab-index-2', () => expectFocusOn('input-with-tab-index-2'));
  });

  describe('click into "first input"', () => {
    beforeEach(() => setFocusOn('first input'));

    it('should not thow', () => expectNotToHaveThrownAnything());

    it('should focus "first input"', () => expectFocusOn('first input'));

    describeAfterHoverEmulateTab(() => {
      it('should focus "second-input"', () => expectFocusOn('second input'));
    });
  });
}
