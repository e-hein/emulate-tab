import { EventCheck } from "./event-check.model";
import { waitFor } from './wait-for.model';

xdescribe('demo app', () => {
  let appFrame: HTMLIFrameElement;
  let eventCheck: EventCheck;

  function getEventLog(): string {
    return eventCheck.view.eventLog.innerHTML;
  }

  beforeEach((done) => {
    fixture.cleanup();
    document.body.removeChild(fixture.el);
    appFrame = document.createElement('iframe');
    appFrame.id = 'app-frame';
    appFrame.src = '/app/';
    appFrame.style.width = '100%';
    appFrame.style.height = '100vh';
    const loadedListener = () => {
      appFrame.removeEventListener('load', loadedListener);
      waitFor('event check', () => !!(eventCheck = appFrame.contentWindow['eventCheck']), 100, 20).then(done);
    };
    appFrame.addEventListener('load', loadedListener);
    fixture.el.appendChild(appFrame);
    document.body.appendChild(fixture.el);
  })

  it('should contain event check', () => expect(eventCheck).toBeTruthy());

  describe('initially', () => {
    it('log should be empty', () => expect(getEventLog()).toEqual(''));
  });

  describe('after write "a" into first input', () => {
    beforeEach(() => {
      const firstInput = eventCheck.view.firstInput;
      firstInput.value = 'a';
      const event = new KeyboardEvent('keydown', { code: 'keyA' });
      console.log('event', event);
      firstInput.dispatchEvent(event);
      return new Promise(done => setTimeout(done, 10));
    });

    it('log should contain entries', () => expect(getEventLog()).toContain('keyA'));
  });

  describe('after emulating tab', () => {
    beforeEach(() => {
      eventCheck.view.emulateTabButton.click();
    });

    it('should trigger all events', () => {
      expect(getEventLog().split(/\s*\n\s*/)).toEqual(`
        first-input (keydown): Tab
        parent-of-first-input (keydown): Tab
        first-input (blur): blur
        second-input (focus): focus
        second-input (keyup): Tab
        parent-of-second-input (keyup): Tab
      `.split(/\s*\n\s*/).slice(1));
    })
  });
});