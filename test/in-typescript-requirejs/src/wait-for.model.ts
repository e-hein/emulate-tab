export function waitFor(description: string, test: () => boolean, retryLimit = 10, milliseconsBetweenRetries = 10): Promise<void> {
  let currentTry = 0;
  const waitLonger = (done) => {
    const ready = test();
    if (ready) return done();
    if (currentTry++ > retryLimit) {
      throw new Error('failed to wait for ' + description);
    }
    setTimeout(() => waitLonger(done), milliseconsBetweenRetries);
  }
  return new Promise(waitLonger);
}
