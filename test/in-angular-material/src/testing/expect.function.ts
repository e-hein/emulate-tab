export function expectNotToHaveThrownAnything() {
  expect().nothing();
}

const isProtractor = (global as any).browser;

function expectConsoleLogProtractor() {
  /* not implemented yet */
}

function expectConsoleLogJasmine(...args: any[]) {
  let origConsoleLog: typeof console.log;
  let consoleLogSyp: jasmine.Spy;

  beforeEach(() => {
    origConsoleLog = console.log;
    consoleLogSyp = spyOn(console, 'log');
  });

  afterEach(() => {
    console.log = origConsoleLog;
    if (args && args.length > 0) {
      expect(consoleLogSyp).toHaveBeenCalledWith(...args);
    } else {
      expect(consoleLogSyp).toHaveBeenCalled();
    }
  });
}

export const expectConsoleLog: (...args: any[]) => void = isProtractor
  ? expectConsoleLogProtractor
  : expectConsoleLogJasmine
;
