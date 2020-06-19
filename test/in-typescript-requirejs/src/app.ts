import * as express from 'express';
import * as path from 'path';
import * as tsNode from 'ts-node';
import * as fs from 'fs';
import * as emulateTab from '../../../dist';

if (!emulateTab) {
  throw new Error('no emulate tab???');
}

const compiler = tsNode.create({
  compilerOptions: {
    module: 'amd',
    target: 'es3',
    importHelpers: true,
    removeComments: true,
  },
});

export const app = express();
const port = 4300;

function isValidFilename(filename: string) {
  return filename.match(/[a-zA-Z0-9\-\.]{3,}/) && !filename.includes('..')
}

function getFullPathWith(extension: string) {
  return (req: express.Request): Promise<string> => {
    const filename = req.params.filename;
    if (!isValidFilename(filename)) {
      return Promise.reject(403);
    }
    const completeFilename = path.join(__dirname, [filename, extension].join('.'));
    return Promise.resolve(completeFilename);
  }
}

function serveFiles(extension: string, mimeType: string) {
  const getFullPath = getFullPathWith(extension);
  return (req: express.Request, res: express.Response) =>
    getFullPath(req).then(
      (filename) => {
        console.log('send file', filename, 'type:', mimeType);
        res.sendFile(filename, {
        headers: {
          'Content-Type': mimeType + '; charset=utf-8',
        },
      });},
      (error) => res.sendStatus(error),
    )
  ;
}

function sendTypescript(sourceName: string, res: express.Response) {
  const code = fs.readFileSync(sourceName, 'utf-8');
  const js = compiler.compile(code, sourceName);
  res.setHeader('Content-Type', 'application/javascript');
  res.send(js);
}

app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/alive', (_req, res) => res.send('ok'));
app.get('/styles/:filename.css', serveFiles('css', 'text/css'));

app.get('/scripts/require.js', (_req, res) => res.sendFile(require.resolve('requirejs')));
app.get('/emulate-tab.js', (_req, res) => res.sendFile(path.resolve(__dirname, '../../../dist/amd/emulate-tab.js')));
app.get('/tslib.js', (_req, res) => res.sendFile(require.resolve('tslib')));

app.get('/:filename.html.js', (req, res) => {
  console.log('req html as js', req.params.filename);
  const filename = req.params.filename;
  if (!isValidFilename(filename)) return res.sendStatus(403);
  const htmlPath = path.join(__dirname, [filename, 'html'].join('.'));
  const html = fs.readFileSync(htmlPath, 'utf-8');
  res.setHeader('Content-Type', 'application/javascript');
  res.send(`define(["exports"], function (exports) { exports.html = ${JSON.stringify(html)}; });`);
});

const getScriptPath = getFullPathWith('js');
app.get('/scripts/:filename.js', (req, res) => {
  getScriptPath(req).then(
    (jsPath) => {
      const sourceName = jsPath.replace(/\.js$/, '.ts');
      sendTypescript(sourceName, res);
    },
    (error) => res.sendStatus(error),
  );
});
app.get('/:filename.html', serveFiles('html', 'text/html'));
app.get('/favicon.ico',
  (_req, res) => res.sendFile(path.join(__dirname, 'favicon.ico')),
);
app.get('/:filename', serveFiles('html', 'text/html'));

export const server = app.listen(port);
console.log('app running on ' + port);
