import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  scanNetwork: (target) => ipcRenderer.invoke('run-scan', target),
  getLocalSubnet: () => ipcRenderer.invoke('get-local-subnet'),
  scanPorts: (ip) => ipcRenderer.invoke('scan-ports', ip)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}