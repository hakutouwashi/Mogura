const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getRiddles: () => ipcRenderer.invoke('riddles:get'),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: settings => ipcRenderer.invoke('settings:save', settings),
  quitApp: () => ipcRenderer.send('app:quit')
});
