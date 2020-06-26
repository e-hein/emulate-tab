export function waitFor(description: string, test: () => boolean, retryLimit = 20, milliseconsBetweenRetries = 200): Promise<void> {
  let currentTry = 1;
  const waitLonger = (done) => {
    const ready = test();
    if (ready) return done();
    if (currentTry > 3) {
      console.log(description + ' not ready (' + currentTry + ')');
    }
    if (++currentTry > retryLimit) {
      throw new Error('failed to wait for ' + description);
    }
    setTimeout(() => waitLonger(done), milliseconsBetweenRetries);
  }
  return new Promise(resolve => waitLonger(resolve));
}
