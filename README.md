[![npm (tag)](https://img.shields.io/npm/v/emulate-tab/latest)](https://www.npmjs.com/package/emulate-tab)
[![Travis (.org)](https://img.shields.io/travis/e-hein/emulate-tab?label=travis)](https://travis-ci.org/e-hein/emulate-tab)

emulate tab
===========
Tries to emulate a tab key press of a real user.

Ever triggered the tab-key-event by javascript? Tab is usually handled by browser and will not get handle if you trigger the event by javascript. This is for security resons to prevent a script to tab e.g. into the browser's menu or into another frame or dev-tools ...  
This script has an heuristic to find the next element to stop. It will trigger the keypress-Event and blur event on the active element and the focus-Event on the next element.

Interactive demo: https://emulate-tab.net-root.de

Installation
------------
```npm i emulate-tab```  
or download unpackaged javascript files from our [releases](https://github.com/e-hein/emulate-tab/releases)

Usage
-----
#### typescript
```ts
import { emulateTab } from 'emulate-tab';

emulateTab();
emulateTab.backwards();
```
[-> complete angular material example project](test/in-angular-material/src/app/app.component.ts)

#### javascript
```html
<script src="emulate-tab.min.js">
<script>
  emulateTab();
  emulateTab.backwards();
</script>
```
[-> complete plain html example project](test/in-plain-html-js/www/sample-form.html)

Dependencies
------------
none.

Browser compatibility:
----------------------
Automated tests for current Chrome and Firefox: 
[![Travis (.org)](https://img.shields.io/travis/e-hein/emulate-tab?label=travis)](https://travis-ci.org/e-hein/emulate-tab)

License:
--------
[MIT License](LICENSE)