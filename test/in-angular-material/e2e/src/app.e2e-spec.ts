import { ProtractorHarnessEnvironment } from '@angular/cdk/testing/protractor';
import { testApp } from '@app/testing/app.shared-specs';
import { browser, logging } from 'protractor';

describe('workspace-project App', () => {
  beforeEach(() => browser.get('/'));
  testApp(() => ProtractorHarnessEnvironment.loader());

  afterEach(async () => {
    // Assert that there are no errors emitted from the browser
    const logs = await browser.manage().logs().get(logging.Type.BROWSER);
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
