const shell = require('shelljs');
const defaultOptions = {
  async: true,
  env: {
    ...process.env,
    FORCE_COLOR: 2,
  }
};
const inAngular = {
  ...defaultOptions,
  cwd: './test/in-angular-material',
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
  .then(() => run('tsc'))
  .then(() => run('npm i', inAngular))
  .then(() => run('npm run version', inAngular))
  .then(() => run('npm run coverage', inAngular))
  .then(() => run('npm run e2e -- --protractor-config e2e/protractor-headless.conf.js', inAngular))
  .then(
    () => process.exit(0),
    (error) => process.exit(error.code)
  )
;
