import { emulateTab } from 'emulate-tab';
import { waitFor } from './wait-for.model';

describe('sample form', () => {
  beforeAll(() => {
    fixture.setBase('src');
    document.body.appendChild(fixture.el);
  });

  beforeEach(() => {
    fixture.cleanup();
    fixture.load('sample-form.html');

    return waitFor('css', () => {
      const hiddenInput = document.getElementById('hidden-input');
      return !!hiddenInput && getComputedStyle(hiddenInput).display === 'none';
    });
  });

  it('should find expected inputs (and not hidden/disabled...)', () => {
    const selectableElementIds = emulateTab.findSelectableElements().map((e) => e.id || e.className);
    expect(selectableElementIds).toEqual([
      'input-with-tab-index-2',
      'input2-with-tab-index-2',
      'input-with-tab-index-3',
      'input-with-tab-index-4',
      'jasmine-title',
      'first-input',
      'second-input',
      'input-before-hidden-input',
      'input-after-hidden-input',
      'input-before-collapsed-input',
      'input-after-collapsed-input',
      'input-before-disabled-input',
      'input-after-disabled-input',
      'input-before-readonly-input',
      'readonly-input',
      'input-before-select',
      'select',
      'input-before-button',
      'button',
      'input-before-clickable-div',
      'clickable-div',
      'input-before-link',
      'link-with-href',
      'input-after-link-without-href',
      'input-before-hidden-child-input',
      'input-after-hidden-child-input',
      'input-before-collapsed-child-input',
      'input-after-collapsed-child-input',
      'last-input',
    ]);
  });

  itShouldTabFrom('first-input').to('second-input');
  itShouldTabFrom('input-before-hidden-input').to('input-after-hidden-input');

  describe('advanced api', () => {
    let firstInput: HTMLElement;
    let secondInput: HTMLElement;
    let lastInput: HTMLElement;
    let otherInput: HTMLElement;

    beforeEach(() => {
      firstInput = document.getElementById('first-input');
      secondInput = document.getElementById('second-input');
      lastInput = document.getElementById('last-input');
      otherInput = document.getElementById('button');

      if ([firstInput, secondInput, lastInput].includes(undefined)) {
        const msg = 'did not found all test inputs';
        console.error(msg, { firstInput, secondInput, lastInput, otherInput });
        throw new Error(msg);
      }
    });

    it('tab from given element to next element', async () => {
      // given
      otherInput.focus();
      const keySpy = jasmine.createSpy('keydown');
      const blurSpy = spyOn(firstInput, 'blur').and.callThrough();
      const secondFocusSpy = spyOn(secondInput, 'focus').and.callThrough();
      const keydownListener = (ev) => {
        expect(blurSpy).not.toHaveBeenCalled();
        expect(secondFocusSpy).not.toHaveBeenCalled();
        keySpy(ev);
      }
      firstInput.addEventListener('keydown', keydownListener);

      // when
      await emulateTab.from(firstInput).toNextElement();

      // then
      expect(keySpy).toHaveBeenCalled();
      expect(blurSpy).toHaveBeenCalled();
      expect(secondFocusSpy).toHaveBeenCalled();
      expect(document.activeElement).toBe(secondInput);

      // cleanup
      firstInput.removeEventListener('keydown', keydownListener);
    });

    it('tab from given element to given element', async () => {
      // given
      otherInput.focus();
      const keySpy = jasmine.createSpy('keydown');
      const blurSpy = spyOn(firstInput, 'blur').and.callThrough();
      const focusSpy = spyOn(lastInput, 'focus').and.callThrough();
      const keydownListener = (ev) => {
        expect(blurSpy).not.toHaveBeenCalled();
        expect(focusSpy).not.toHaveBeenCalled();
        keySpy(ev);
      }
      firstInput.addEventListener('keydown', keydownListener);

      // when
      await emulateTab.from(firstInput).to(lastInput);

      // then
      expect(keySpy).toHaveBeenCalled();
      expect(blurSpy).toHaveBeenCalled();
      expect(focusSpy).toHaveBeenCalled();
      expect(document.activeElement).toBe(lastInput);

      // cleanup
      firstInput.removeEventListener('keydown', keydownListener);
    });

    it('tab to next element', async () => {
      // given
      firstInput.focus();
      const keySpy = jasmine.createSpy('keydown');
      const blurSpy = spyOn(firstInput, 'blur').and.callThrough();
      const focusSpy = spyOn(secondInput, 'focus').and.callThrough();
      const keydownListener = (ev) => {
        expect(blurSpy).not.toHaveBeenCalled();
        expect(focusSpy).not.toHaveBeenCalled();
        keySpy(ev);
      }
      firstInput.addEventListener('keydown', keydownListener);

      // when
      await emulateTab.forwards();

      // then
      expect(keySpy).toHaveBeenCalled();
      expect(blurSpy).toHaveBeenCalled();
      expect(focusSpy).toHaveBeenCalled();
      expect(document.activeElement).toBe(secondInput);

      // cleanup
      firstInput.removeEventListener('keydown', keydownListener);
    });

    it('tab to given element', async () => {
      // given
      firstInput.focus();
      const keySpy = jasmine.createSpy('keydown');
      const blurSpy = spyOn(firstInput, 'blur').and.callThrough();
      const focusSpy = spyOn(lastInput, 'focus').and.callThrough();
      const keydownListener = (ev) => {
        expect(blurSpy).not.toHaveBeenCalled();
        expect(focusSpy).not.toHaveBeenCalled();
        keySpy(ev);
      }
      firstInput.addEventListener('keydown', keydownListener);

      // when
      await emulateTab.to(lastInput);

      // then
      expect(keySpy).toHaveBeenCalled();
      expect(blurSpy).toHaveBeenCalled();
      expect(focusSpy).toHaveBeenCalled();
      expect(document.activeElement).toBe(lastInput);

      // cleanup
      firstInput.removeEventListener('keydown', keydownListener);
    });

    it('tab backwards', async () => {
      // given
      secondInput.focus();
      const keySpy = jasmine.createSpy('keydown');
      const blurSpy = spyOn(secondInput, 'blur').and.callThrough();
      const focusSpy = spyOn(firstInput, 'focus').and.callThrough();
      const keydownListener = (ev) => {
        expect(blurSpy).not.toHaveBeenCalled();
        expect(focusSpy).not.toHaveBeenCalled();
        keySpy(ev);
      }
      secondInput.addEventListener('keydown', keydownListener);

      // when
      await emulateTab.backwards();

      // then
      expect(keySpy).toHaveBeenCalled();
      expect(blurSpy).toHaveBeenCalled();
      expect(focusSpy).toHaveBeenCalled();
      expect(document.activeElement).toBe(firstInput);

      // cleanup
      firstInput.removeEventListener('keydown', keydownListener);
    });

    it('tab previous element', async () => {
      // given
      secondInput.focus();
      const keySpy = jasmine.createSpy('keydown');
      const blurSpy = spyOn(secondInput, 'blur').and.callThrough();
      const focusSpy = spyOn(firstInput, 'focus').and.callThrough();
      const keydownListener = (ev) => {
        expect(blurSpy).not.toHaveBeenCalled();
        expect(focusSpy).not.toHaveBeenCalled();
        keySpy(ev);
      }
      secondInput.addEventListener('keydown', keydownListener);

      // when
      await emulateTab.backwards();

      // then
      expect(keySpy).toHaveBeenCalled();
      expect(blurSpy).toHaveBeenCalled();
      expect(document.activeElement).toBe(firstInput);
      expect(focusSpy).toHaveBeenCalled();

      // cleanup
      firstInput.removeEventListener('keydown', keydownListener);
    });
  });
});

function itShouldTabFrom(sourceId: string) {
  return {
    to: (targetId: string) => {
      it (`should tab from "${sourceId}" to "${targetId}"`, async () => {
        // given
        const source = document.getElementById(sourceId);
        if (!source) throw new Error(`could not find source element with id "${sourceId}"`)
        source.focus();

        const target = document.getElementById(targetId);
        if (!target) throw new Error(`could not find target element with id "${targetId}"`)
        
        // when
        await emulateTab();

        // then
        expect(document.activeElement!.id).toBe(target.id, 'element after emulateTab');
      })
    },
  };
}

