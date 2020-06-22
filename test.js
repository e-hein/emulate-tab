const chalk = require('chalk');
const shell = require('shelljs');
const defaultOptions = {
  async: true,
  env: {
    ...process.env,
    FORCE_COLOR: 2,
  }
};
const inAngular = {
  cwd: './test/in-angular-material',
};
const inPlainHtmlJs = {
  cwd: './test/in-plain-html-js',
};
const inTypescriptRequireJs = {
  cwd: './test/in-typescript-requirejs',
};

function run(cmd, options = {}) {
  return new Promise((resolve, reject) => {
    shell.exec(cmd, { ...defaultOptions, ...options}, (error, stdout, stderr) => {
      if (error > 0) {
        reject({ code: error, stderr });
      } else {
        resolve(stdout);
      }
    })
  })
}

function logPartHeader(title) {
  const titleLine = '== ' + title + ' ==';
  const hr = Array.from(titleLine).map(() => '=').join('');
  // const log = (text) => console.log(text);
  const log = (text) => console.log(chalk.bgGreen(chalk.bold(' ' + text + ' ')));
  const emptyLine = () => console.log();

  emptyLine();
  emptyLine();
  log(hr);
  log(titleLine);
  log(hr);
  emptyLine();
}

Promise.resolve()
  .then(() => run('npm i'))
  .then(() => run('npm run build:all'))
  .then(() => logPartHeader('test in plain html js'))
  .then(() => run('npm i', inPlainHtmlJs))
  .then(() => run('npm run test:once', inPlainHtmlJs))
  .then(() => logPartHeader('test in typescript requirejs'))
  .then(() => run('npm i', inTypescriptRequireJs))
  .then(() => run('npm run test-node-module', inTypescriptRequireJs))
  .then(() => logPartHeader('test in angular material'))
  .then(() => run('npm i', inAngular))
  .then(() => run('npm run version', inAngular))
  .then(() => run('npm run coverage', inAngular))
  .then(() => run('npm run e2e -- --protractor-config e2e/protractor-headless.conf.js', inAngular))
  .then(
    () => process.exit(0),
    (error) => process.exit(error.code)
  )
;
