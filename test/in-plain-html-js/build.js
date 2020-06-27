// process.env.FORCE_COLOR = 2;
// process.stdout.isTTY = true;

const shelljs = require('shelljs');
const path = require('path');
const fs = require('fs');
const { W_OK } = require('constants');
const debug = require('debug');
const log = debug('test-htmljs');
const debugPrefix = 'test-htmljs-';

const rootDir = path.join(__dirname, '../../');
const outDir = path.join(__dirname, 'www');

copyLibs();
log('done');

function copyLibs() {
  const log = debug(debugPrefix + 'libs');
  const libs = path.join(outDir, 'libs');
  clean(libs);
  cp(log, path.join(rootDir, 'dist', 'bundles', 'emulate-tab.js'), libs);
  cp(log, path.join(rootDir, 'dist', 'bundles', 'emulate-tab.min.js'), libs);
  log('done');
}

function clean(dest) {
  try {
    fs.accessSync(dest, W_OK);
    log('clean up dest');
    shelljs.exec('rm -rf ' + dest);
  } catch (e) {
    log('dest is clean');
  }
  shelljs.mkdir('-p', dest);
}

function cp(log, src, dest) {
  log('copy files: ', path.basename(src));
  shelljs.cp('-r', src, dest);
}
