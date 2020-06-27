const shelljs = require('shelljs');
const uglifyjs = require('uglify-js');
const fs = require('fs');
const path = require('path');

const defaultOpts = {
  fatal: true,
}

const bundlesDir = path.join(__dirname, 'dist/bundles');

build();
build(`tsconfig.es.json`);
shelljs.mkdir('-p', bundlesDir);
buildBundle('umd');
buildBundle('cjs');
buildBundle('amd');
buildDefaultBundle();
buildMinBundleFromDefault();

function build(tsconfig) {
  let cmd = 'node ./node_modules/.bin/tsc';
  if (tsconfig) cmd += ' -p ' + tsconfig;
  shelljs.exec(cmd, defaultOpts);
}

function buildBundle(type) {
//  build(`tsconfig.${type}.json`);
//  shelljs.cp(`tmp/${type}/emulate-tab.js`, path.join(bundlesDir, `emulate-tab.${type}.js`));
  shelljs.exec(`node node_modules/.bin/rollup tmp/es/emulate-tab.js --format ${type} --name "emulateTab" --output.exports "named" --file dist/bundles/emulate-tab.${type}.js`, defaultOpts);
}

function buildDefaultBundle() {
  shelljs.exec(`node node_modules/.bin/rollup tmp/es/default-only.js --format iife --name "emulateTab" --output.exports "default"  --file dist/bundles/emulate-tab.js`, defaultOpts);
}

function buildMinBundleFromDefault() {
  const code = fs.readFileSync(path.join(bundlesDir, 'emulate-tab.js'), 'utf-8');
  const result = uglifyjs.minify(code);
  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }
  fs.writeFileSync(path.join(bundlesDir, 'emulate-tab.min.js'), result.code);
}

