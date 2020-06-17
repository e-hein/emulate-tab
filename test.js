const shell = require('shelljs');
const inAngular = { cwd: './test/in-angular-material' };
shell.exec('npm i', inAngular);
shell.exec('npm run coverage', inAngular);
shell.exec('npm run e2e -- --protractor-config e2e/protractor-headless.conf.js', inAngular)