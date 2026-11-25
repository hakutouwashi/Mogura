import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'docs');
const riddles = {};

function filesIn(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap(entry => {
      const file = path.join(directory, entry.name);
      return entry.isDirectory() ? filesIn(file) : [file];
    })
    .sort();
}

const hash = createHash('sha256');
for (const file of [...filesIn(path.join(root, 'renderer')), ...filesIn(path.join(root, 'riddles')), path.join(root, 'settings.json')]) {
  hash.update(path.relative(root, file));
  hash.update(readFileSync(file));
}
const version = hash.digest('hex').slice(0, 12);
const assets = path.join(output, 'assets', version);

mkdirSync(output, { recursive: true });
for (const name of ['css', 'js', 'riddles']) {
  rmSync(path.join(output, name), { recursive: true, force: true });
}
cpSync(path.join(root, 'renderer'), output, { recursive: true, force: true });
mkdirSync(assets, { recursive: true });
cpSync(path.join(root, 'renderer', 'css'), path.join(assets, 'css'), { recursive: true });
cpSync(path.join(root, 'renderer', 'js'), path.join(assets, 'js'), { recursive: true });
const index = readFileSync(path.join(output, 'index.html'), 'utf8')
  .replace('./css/style.css', `./assets/${version}/css/style.css`)
  .replace('./js/app.js', `./assets/${version}/js/app.js`);
writeFileSync(path.join(output, 'index.html'), index);
cpSync(path.join(root, 'riddles'), path.join(output, 'riddles'), { recursive: true, force: true });
cpSync(path.join(root, 'settings.json'), path.join(output, 'settings.json'));
for (const group of ['mole', 'other']) {
  riddles[group] = readdirSync(path.join(root, 'riddles', group))
    .filter(name => /\.(png|jpe?g|webp)$/i.test(name))
    .sort();
}
writeFileSync(path.join(output, 'riddles.json'), `${JSON.stringify(riddles, null, 2)}\n`);
writeFileSync(path.join(output, '.nojekyll'), '');
console.log(`Web assets: ${version}`);
