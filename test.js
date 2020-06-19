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

Promise.resolve()
  .then(() => run('npm i'))
  .then(() => run('npm run build:all'))
  .then(() => run('npm i', inTypescriptRequireJs))
  .then(() => run('npm run test-node-module', inTypescriptRequireJs))
  .then(() => run('npm i', inAngular))
  .then(() => run('npm run version', inAngular))
  .then(() => run('npm run coverage', inAngular))
  .then(() => run('npm run e2e -- --protractor-config e2e/protractor-headless.conf.js', inAngular))
  .then(
    () => process.exit(0),
    (error) => process.exit(error.code)
  )
;
