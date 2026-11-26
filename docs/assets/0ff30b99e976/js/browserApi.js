import { normalizeSettings } from './core/DefaultSettings.js';

const settingsKey = 'mogura-settings';

async function loadJSON(path) {
  const response = await fetch(new URL(path, document.baseURI));
  if (!response.ok) throw new Error(`${path} を読み込めませんでした (${response.status})`);
  return response.json();
}

window.api = {
  async getRiddles() {
    const manifest = await loadJSON('./riddles.json');
    return Object.fromEntries(['mole', 'other'].map(group => [
      group,
      (manifest[group] || []).map(name => ({
        id: `${group}/${name}`,
        url: new URL(`./riddles/${group}/${encodeURIComponent(name)}`, document.baseURI).href
      }))
    ]));
  },
  async getSettings() {
    const defaults = await loadJSON('./settings.json');
    try {
      return normalizeSettings(JSON.parse(localStorage.getItem(settingsKey)) || defaults);
    } catch {
      return normalizeSettings(defaults);
    }
  },
  async saveSettings(value) {
    const settings = normalizeSettings(value);
    localStorage.setItem(settingsKey, JSON.stringify(settings));
    return settings;
  },
  quitApp() {}
};
