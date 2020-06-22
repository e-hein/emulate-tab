const path = require('path');
const shelljs = require('shelljs');
const fs = require('fs');

const defaultOpts = {
  fatal: true,
}
const tmpDir = path.join(__dirname, 'tmp');
const inTmpDir = {
  cwd: tmpDir,
}

shelljs.exec(`npm pack ../ | tail -1`, { ...defaultOpts, ...inTmpDir });
const version = require('./package.json').version;
const packResultFile = path.join(tmpDir, `emulate-tab-${version}.tgz`);
const packLatestFile = path.join(tmpDir, 'emulate-tab.latest.tgz');
try {
  fs.unlinkSync(packLatestFile);
} catch(e) {}
shelljs.ln('-sf', packResultFile, path.join(tmpDir, 'emulate-tab.latest.tgz'));
