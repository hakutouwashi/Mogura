import { createHash } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { RIDDLE_GROUPS } from '../renderer/js/core/Modes.js';

const GROUPS = RIDDLE_GROUPS;
const IMAGE_NAME = /\.(png|jpe?g|webp)$/i;
const MANIFEST_NAME = 'bundled-riddles.json';

// Images copied by older installers before bundled images had a manifest.
// Remove only byte-for-byte matches; edited and user-added images stay intact.
const LEGACY_BUNDLED_IMAGES = {
  mole: {
    '01.png': '453f8da4de5523ff62a24893bc0d5a26555af46e2d02147e087d2c9c12ef832f',
    '02.png': 'de0d95c99b29ccb6309a0993c3ce9e663ba029315221ac77d93487a8b1b52e0b',
    '03.png': '624e5449a00998fbd6173ce72439a90a02454496dbe5ad0061fc7c3bbc6bd0f7',
    '04.png': '04bfae1006d5dee756c9b66e8bdf416de124e5ffc40b1fdac095d35b1c2835be',
    '05.png': 'ae051d07fb0afa57144e5a253fc82c2019e8ca56a58a08d2515d5b75b36bca90',
    '06.png': '7826b3aced7965f1191e05114715bbe676718cfeeac4cbd2727409a5ddd1e8a3',
  },
  other: {
    '01.png': 'dd6cf2ea7ebffa43d8d3102bdadc05c68aed267b259a356826389fddea21e55b',
    '02.png': '8a6202df8eb2cab4cf96f9fcee3e35fe2c9ef3d68fc8c406e89ab3139d468682',
    '03.png': '9d82bec07cc6378e7901662c55dc0aac2c8b35e26146d1e71c45a4287403096c',
    '04.png': '0f50a0542bec427d9e6fad23e1eba342ffc2448e67eaca02cd24ff5168a3cef5',
    '05.png': '174d55b73c715bf5891bf49849fd8cff269aedc6810f8ede9007ef4f34575a30',
    '06.png': 'aa8e140241673fa8dcc365c81138454ab4cd8cf77b1a8668c4dde757434b1074',
  },
};

const hash = file => createHash('sha256').update(readFileSync(file)).digest('hex');

function readManifest(file) {
  if (!existsSync(file)) return {};
  try {
    const data = JSON.parse(readFileSync(file, 'utf8'));
    return data.version === 1 && data.files && typeof data.files === 'object' ? data.files : {};
  } catch (error) {
    console.warn('Bundled riddle manifest could not be read:', error);
    return {};
  }
}

export function syncBundledRiddles(bundledRiddles, userDataPath, legacyHashes = LEGACY_BUNDLED_IMAGES) {
  const riddles = path.join(userDataPath, 'riddles');
  const manifestPath = path.join(userDataPath, MANIFEST_NAME);
  mkdirSync(riddles, { recursive: true });
  const previous = readManifest(manifestPath);
  const current = {};
  const bundled = new Set();

  for (const group of GROUPS) {
    const destination = path.join(riddles, group);
    const source = path.join(bundledRiddles, group);
    mkdirSync(destination, { recursive: true });
    for (const entry of readdirSync(source, { withFileTypes: true })) {
      if (!entry.isFile() || !IMAGE_NAME.test(entry.name)) continue;
      const name = entry.name;
      const key = `${group}/${name}`;
      const from = path.join(source, name);
      const to = path.join(destination, name);
      const bundledHash = hash(from);
      bundled.add(key);
      if (!existsSync(to) || previous[key] === hash(to)) copyFileSync(from, to);
      if (hash(to) === bundledHash) current[key] = bundledHash;
    }
  }

  for (const group of GROUPS) {
    for (const [name, oldHash] of Object.entries(legacyHashes[group] || {})) {
      const key = `${group}/${name}`;
      const file = path.join(riddles, group, name);
      if (!bundled.has(key) && existsSync(file) && hash(file) === oldHash) rmSync(file);
    }
  }

  for (const [key, oldHash] of Object.entries(previous)) {
    const [group, name, extra] = key.split('/');
    if (!GROUPS.includes(group) || extra || !IMAGE_NAME.test(name) || bundled.has(key)) continue;
    const file = path.join(riddles, group, name);
    if (existsSync(file) && hash(file) === oldHash) rmSync(file);
  }

  const temporary = `${manifestPath}.tmp`;
  writeFileSync(temporary, `${JSON.stringify({ version: 1, files: current }, null, 2)}\n`);
  renameSync(temporary, manifestPath);
}

// Packaged installers keep their assets in resources, while settings and editable
// riddles live in the user's data folder.
export function gameDataRoot({ isPackaged, projectRoot, resourcesPath, executablePath, userDataPath, platform }) {
  if (!isPackaged) return projectRoot;

  const bundledRiddles = path.join(resourcesPath, 'riddles');
  if (existsSync(bundledRiddles)) {
    mkdirSync(userDataPath, { recursive: true });
    syncBundledRiddles(bundledRiddles, userDataPath);
    const settings = path.join(userDataPath, 'settings.json');
    if (!existsSync(settings)) copyFileSync(path.join(resourcesPath, 'settings.json'), settings);
    return userDataPath;
  }

  // Existing build:app packages intentionally store editable data beside .app.
  return platform === 'darwin'
    ? path.resolve(path.dirname(executablePath), '../../..')
    : path.dirname(executablePath);
}
