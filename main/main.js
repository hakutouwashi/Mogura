import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import { watch } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadRiddles } from './riddleLoader.js';
import { SettingsStore } from './settingsStore.js';
import { gameDataRoot } from './gameData.js';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const preview = !app.isPackaged && process.argv.includes('--preview');

function watchPreviewFiles(window, externalRoot) {
  const watchers = [];
  let timer;
  let fullReload = false;
  const schedule = cssOnly => {
    fullReload ||= !cssOnly;
    clearTimeout(timer);
    timer = setTimeout(async () => {
      if (window.isDestroyed()) return;
      if (fullReload) window.webContents.reload();
      else {
        try { await window.webContents.executeJavaScript('window.__previewReloadCSS?.()'); }
        catch { window.webContents.reload(); }
      }
      fullReload = false;
    }, 150);
  };
  watchers.push(watch(path.join(projectRoot, 'renderer'), { recursive: true }, (_event, filename) => {
    schedule(Boolean(filename && filename.endsWith('.css')));
  }));
  watchers.push(watch(path.join(externalRoot, 'riddles'), { recursive: true }, () => schedule(false)));
  window.on('closed', () => {
    clearTimeout(timer);
    watchers.forEach(watcher => watcher.close());
  });
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const window = BrowserWindow.getAllWindows()[0];
    if (window) { window.show(); window.focus(); }
  });
  app.whenReady().then(() => {
    const externalRoot = gameDataRoot({
      isPackaged: app.isPackaged, projectRoot, resourcesPath: process.resourcesPath,
      executablePath: app.getPath('exe'), userDataPath: app.getPath('userData'),
      platform: process.platform
    });
    const settings = new SettingsStore(path.join(externalRoot, 'settings.json'));
    Menu.setApplicationMenu(null);
    settings.load();
    ipcMain.handle('riddles:get', () => loadRiddles(path.join(externalRoot, 'riddles')));
    ipcMain.handle('settings:get', () => settings.load());
    ipcMain.handle('settings:save', (_event, value) => settings.save(value));
    ipcMain.on('app:quit', () => app.quit());
    const window = new BrowserWindow({
      fullscreen: !preview, frame: preview, width: 1440, height: 900,
      show: false, backgroundColor: '#ffffff',
      webPreferences: {
        preload: path.join(projectRoot, 'main/preload.cjs'),
        contextIsolation: true, nodeIntegration: false, sandbox: false
      }
    });
    window.once('ready-to-show', () => window.show());
    window.loadFile(path.join(projectRoot, 'renderer/index.html'),
      preview ? { query: { preview: '1' } } : undefined);
    if (preview) watchPreviewFiles(window, externalRoot);
    if (process.argv.includes('--devtools') || process.env.MOGURA_DEV === '1') window.webContents.openDevTools();
  });
  app.on('window-all-closed', () => app.quit());
}
