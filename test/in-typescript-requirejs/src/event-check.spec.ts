import { EventCheck } from './event-check.model';

describe('event check', () => {
  let eventCheck: EventCheck;
  let origLog: any;
  let logSpy: jasmine.Spy;

  function getEventLog(): string {
    return eventCheck.view.eventLog.innerHTML;
  }
  
  beforeAll(() => {
    fixture.setBase('src');
    document.body.appendChild(fixture.el);
  });

  beforeEach(() => {
    origLog = console.log;
    logSpy = spyOn(console, 'log');
    fixture.cleanup();
    fixture.load('event-check.html');
    eventCheck = new EventCheck();
    eventCheck.init();
  });

  afterEach(() => {
    console.log = origLog;
  })

  it('should start', () => expect().nothing());

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

    it('should have triggered all events', () => {
      const actualEventLog = normalizeEventLog(getEventLog());
      const expectedEventLog = normalizeEventLog(`
        first-input (focus): focus
        first-input (keydown): Tab
        parent-of-first-input (keydown): Tab
        first-input (blur): blur
        second-input (focus): focus
        second-input (keyup): Tab
        parent-of-second-input (keyup): Tab
      `);
      expect(actualEventLog).toEqual(expectedEventLog);
      expect(eventCount(actualEventLog)).toEqual(eventCount(expectedEventLog));
    })
  });
});

function normalizeEventLog(log: string) {
  let normalized = log.split(/(\s*\n)+\s*/).join('');
  if (!normalized.startsWith('\n')) {
    normalized = '\n' + normalized;
  }
  return normalized;
}

function eventCount(normalizedLog: string) {
  return normalizedLog.split('\n').length - 1;
}