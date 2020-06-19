import { emulateTab } from 'emulate-tab';

export class EventCheck {
  public view: {
    eventLog: HTMLPreElement,
    parentOfFirstInput: HTMLDivElement,
    firstInput: HTMLInputElement,
    parentOfSecondInput: HTMLDivElement,
    secondInput: HTMLInputElement,
    emulateTabButton: HTMLButtonElement,
  };

  private cleanupTasks = new Array<() => PromiseLike<any> | any>();
  
  constructor(
    private parent = document,
  ) {
    this.view = {
      eventLog: this.getElementById('event-log'),
      parentOfFirstInput: this.getElementById('parent-of-first-input'),
      firstInput: this.getElementById('first-input'),
      parentOfSecondInput: this.getElementById('parent-of-second-input'),
      secondInput: this.getElementById('second-input'),
      emulateTabButton: this.getElementById('emulate-tab-button'),
    };
  }

  private getElementById(id: string): any {
    const element = this.parent.getElementById(id);
    if (!element) {
      throw new Error(`element with id '${id}' not found`);
    }
    return element;
  }

  public init() {
    this.initEvents();
    this.initEmulateTabButton();
  }

  private initEvents() {
    this.logAllKeyboardEventsOF(this.view.secondInput);
    this.logAllKeyboardEventsOF(this.view.parentOfSecondInput);
    this.logAllKeyboardEventsOF(this.view.firstInput);
    this.logAllKeyboardEventsOF(this.view.parentOfFirstInput);
  }

  private logAllKeyboardEventsOF(element: HTMLElement) {
    const keyOfEvent = (ev: KeyboardEvent) => ev.code;
    this.logEvent('keydown', keyOfEvent).of(element);
    this.logEvent('keypress', keyOfEvent).of(element);
    this.logEvent('keyup', keyOfEvent).of(element);

    const keyOfFocusEvent = (ev: FocusEvent) => ev.type;
    this.logEvent('blur', keyOfFocusEvent).of(element);
    this.logEvent('focus', keyOfFocusEvent).of(element);
  }

  private logEvent = (eventType: string, getValue: (event: Event) => string) => ({ of: (element: HTMLElement) => {
    const listener = (event: Event) => {
      const msg = `${element.id} (${eventType}): ${getValue(event)}`;
      console.log(msg, event);
      this.view.eventLog.innerHTML += msg + '\n';
    };
    element.addEventListener(eventType, listener);
    this.cleanupTasks.push(() => element.removeEventListener(eventType, listener));
  }});

  private initEmulateTabButton() {
    this.view.emulateTabButton.onclick = () => {
      this.view.firstInput.focus();
      emulateTab();
      console.log('emulateTab');
    };
  }
}

export default "bla";