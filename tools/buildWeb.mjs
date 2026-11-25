import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'docs');
const riddles = {};

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
cpSync(path.join(root, 'renderer'), output, { recursive: true, force: true });
cpSync(path.join(root, 'riddles'), path.join(output, 'riddles'), { recursive: true, force: true });
cpSync(path.join(root, 'settings.json'), path.join(output, 'settings.json'));
for (const group of ['mole', 'other']) {
  riddles[group] = readdirSync(path.join(root, 'riddles', group))
    .filter(name => /\.(png|jpe?g|webp)$/i.test(name))
    .sort();
}
writeFileSync(path.join(output, 'riddles.json'), `${JSON.stringify(riddles, null, 2)}\n`);
writeFileSync(path.join(output, '.nojekyll'), '');
