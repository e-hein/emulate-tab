import { Component } from '@angular/core';
import { emulateTab } from 'emulate-tab';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  public emulateTab() {
    console.log('emulate tab');
    return emulateTab();
  }

  public divClicked() {
    console.log('clicked');
  }
}
