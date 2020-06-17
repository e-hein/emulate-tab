import { ComponentHarness, TestElement } from '@angular/cdk/testing';
import { UnitTestElement } from '@angular/cdk/testing/testbed';
import { InputHarnessFilters, MatInputHarness } from '@angular/material/input/testing';

export class AppHarness extends ComponentHarness {
  public static hostSelector = 'app-root';

  private emulateTab = this.locatorFor('#emulate-tab-button');
  private title = this.locatorFor('h1');

  public async hoverEmulateTab(): Promise<void> {
    const emulateTab = await this.emulateTab();
    await emulateTab.hover();

    if (emulateTab instanceof UnitTestElement) {
      (emulateTab.element as HTMLElement).dispatchEvent(new MouseEvent('mouseover'));
    }
    await this.waitForTasksOutsideAngular();
    await this.forceStabilize();
  }

  public async mouseOutFromEmulateTab(): Promise<void> {
    const title = await this.title();
    await title.hover();
    await this.forceStabilize();
  }

  public async moveMouseOverEmulateTabAndOutAgain(): Promise<void> {
    await this.hoverEmulateTab();
    await this.mouseOutFromEmulateTab();
  }

  private getInput(filters: Omit<InputHarnessFilters, 'ancestor'>) {
    return this.locatorFor(MatInputHarness.with(filters))();
  }

  public async focusInput(filters: Omit<InputHarnessFilters, 'ancestor'>) {
    const input = (await (await this.getInput(filters)).host());
    await input.click();
  }
}
