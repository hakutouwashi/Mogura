import { readdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export function loadRiddles(root) {
  const result = { mole: [], other: [] };
  for (const group of Object.keys(result)) {
    try {
      result[group] = readdirSync(path.join(root, group), { withFileTypes: true })
        .filter(entry => entry.isFile() && /\.(png|jpe?g|webp)$/i.test(entry.name))
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(entry => ({
          id: `${group}/${entry.name}`,
          url: pathToFileURL(path.join(root, group, entry.name)).href
        }));
    } catch (error) {
      if (error.code !== 'ENOENT') console.error(`Cannot read ${group} riddles:`, error);
    }
  }
  return result;
}
