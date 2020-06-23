// process.env.FORCE_COLOR = 2;
// process.stdout.isTTY = true;

const shelljs = require('shelljs');
const path = require('path');
const fs = require('fs');
const { W_OK } = require('constants');
const debug = require('debug');
const log = debug('demo-build');
const debugPrefix = 'demo-build-';

const defaultOpts = {
  fatal: true,
}
const rootDir = path.join(__dirname, '../');
const demoDest = path.join(__dirname, 'dist');
const examplesDest = path.join(demoDest, 'examples');

cleanUpDist();
copyDemoFiles();
copyLibs();
copyReadmeMd();
buildAngularSample();
copyPlainHtmlSample();
log('done');

function cleanUpDist() {
  try {
    fs.accessSync(demoDest, W_OK);
    log('clean up dist');
    shelljs.exec('rm -rf ' + demoDest, defaultOpts);
  } catch (e) {
    log('dist is clean');
  }
  log('mkdir: ' + examplesDest);
  shelljs.mkdir('-p', examplesDest);
  fs.accessSync(examplesDest, W_OK);
}

function copyLibs() {
  const log = debug(debugPrefix + 'libs');
  const libs = path.join(demoDest, 'libs');
  shelljs.mkdir('-p', libs);
  const addNodeModule = (name) => {
    const src = path.join(__dirname, 'node_modules', name);
    cp(log, src, libs);
  }
  addNodeModule('marked/marked.min.js');
  addNodeModule('prismjs/themes/prism-coy.css');
  addNodeModule('prismjs/prism.js');
  addNodeModule('prismjs/components/prism-javascript.min.js');
  addNodeModule('prismjs/components/prism-typescript.min.js');
  log('done');
}

function copyReadmeMd() {
  const log = debug(debugPrefix + 'readmeMd');
  const src = path.join(rootDir, 'README.md');
  const dest = path.join(__dirname, 'dist');
  log({ src, dest, });
  cp(log, src, dest);
  log('done');
}

function buildAngularSample() {
  const log = debug(debugPrefix + 'angular');
  log('start');
  const srcProjectDir = path.join(rootDir, 'test/in-angular-material');
  const inAngular = {
    ...defaultOpts,
    cwd: srcProjectDir,
  }

  const src = path.join(srcProjectDir, 'dist/emulate-tab-in-angular-material');
  const dest = path.join(examplesDest, 'angular');
  log({ srcProjectDir, src, dest, });
  try {
    fs.accessSync(src, W_OK);
    log('using existing build')
  } catch (e) {
    log('rebuild');
    shelljs.exec('npm i', inAngular);
    shelljs.exec('ng build --prod --base-href ./ --output-path dist/emulate-tab-in-angular-material', inAngular);
    fs.accessSync(src, W_OK);
  }

  cp(log, src, dest, true);
  log('done');
}

function cp(log, src, dest, clean = false) {
  if (clean) {
    try {
      fs.accessSync(dest, W_OK);
      log('clean up dest');
      shelljs.exec('rm -rf ' + dest);
    } catch (e) {
      log('dest is clean');
    }
  }
  log('copy files: ', path.basename(src));
  shelljs.cp('-r', src, dest);
}

function copyPlainHtmlSample() {
  const log = debug(debugPrefix + 'html');
  const src = path.join(rootDir, 'test/in-plain-html-js/www');
  const dest = path.join(examplesDest, 'plain-html');
  log({ src, dest, });
  cp(log, src, dest, true);
  log('done');
}

function copyDemoFiles() {
  const log = debug(debugPrefix + 'demo');
  const src = path.join(__dirname, 'src/*');
  const dest = path.join(__dirname, 'dist');
  log({ src, dest, });
  cp(log, src, dest);
  log('done');
}